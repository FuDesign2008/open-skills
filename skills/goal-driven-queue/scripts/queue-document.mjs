// Queue document rendering: parses the queue's Markdown records (cards,
// triage, progress, verification, engine reports) into the shared shell with
// queue-specific meta chips, KPI rows, and section styling.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  escapeHtml,
  renderBlocks,
  renderInline,
  renderMarkdown,
  renderShell,
  writeRenderedFile,
} from "./core-bridge.mjs";
import { kindLabel, shellOptionsFor } from "./queue-labels.mjs";

const SKILL_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function slugifyStatus(value) {
  return String(value).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9一-龥-]/g, "");
}

function parseMetaLine(line) {
  const match = /^-\s+([^:：]+)[:：]\s*(.*)$/.exec(line);
  if (!match) return null;
  return { key: match[1].trim(), value: match[2].trim() };
}

function parseDocument(markdown) {
  const lines = String(markdown).replace(/\r\n?/g, "\n").split("\n");
  let title = "";
  const meta = [];
  const overview = [];
  const sections = [];
  let current = null;
  let inMeta = true;

  for (const line of lines) {
    if (!title && /^#\s+/.test(line)) {
      title = line.replace(/^#\s+/, "").trim();
      continue;
    }
    if (/^##\s+/.test(line)) {
      if (current) sections.push(current);
      current = { title: line.replace(/^##\s+/, "").trim(), lines: [] };
      inMeta = false;
      continue;
    }
    if (inMeta && /^-\s+/.test(line)) {
      meta.push(line);
      continue;
    }
    if (inMeta) {
      if (current) current.lines.push(line);
      else overview.push(line);
      continue;
    }
    if (current) current.lines.push(line);
  }

  if (current) sections.push(current);
  if (overview.some((line) => line.trim())) sections.unshift({ title: "概览", lines: overview });

  return { title, meta: meta.map(parseMetaLine).filter(Boolean), sections };
}

function renderRichValue(value, context) {
  const trimmed = value.trim();
  if (/^(done|verified|awaiting|returned|failed|skipped|pending|in progress|parked|waiting dependency|conflict pending confirmation)$/i.test(trimmed)) {
    return `<span class="pill pill-${slugifyStatus(trimmed)}">${escapeHtml(trimmed)}</span>`;
  }
  const url = /(https?:\/\/\S+)/.exec(value);
  if (url) {
    const before = value.slice(0, url.index);
    const after = value.slice(url.index + url[1].length);
    return `${renderInline(before, context)}<a href="${escapeHtml(url[1])}">${escapeHtml(url[1])}</a>${renderInline(after, context)}`;
  }
  return renderInline(value, context);
}

function renderMetaChips(meta, context) {
  return meta
    .map((item) => {
      const value = renderRichValue(item.value, context);
      if (String(item.value).trim().length >= 70) {
        return `<div class="meta-row"><span class="meta-key">${escapeHtml(item.key)}</span><span class="meta-value">${value}</span></div>`;
      }
      return `<span class="chip"><span class="chip-key">${escapeHtml(item.key)}</span><span class="chip-value">${value}</span></span>`;
    })
    .join("");
}

function metaValue(doc, needle) {
  const item = doc.meta.find((entry) => entry.key.includes(needle));
  return item ? item.value : "";
}

function deriveSubtitle(doc, kind) {
  if (kind === "card") {
    return [metaValue(doc, "Status"), metaValue(doc, "Engine")].filter(Boolean).join(" · ");
  }
  if (kind === "progress") {
    return [metaValue(doc, "窗口"), metaValue(doc, "触顶")].filter(Boolean).join(" · ");
  }
  if (kind === "verification") return metaValue(doc, "核对");
  if (kind === "report") return [metaValue(doc, "结果"), metaValue(doc, "MR")].filter(Boolean).join(" · ");
  if (kind === "triage") return metaValue(doc, "本批卡片");
  return "";
}

export function renderKpiRow(items) {
  if (!items.length) return "";
  return `<div class="kpi-row">${items
    .map(([label, value]) => `<div class="kpi"><div class="kpi-value">${escapeHtml(value)}</div><div class="kpi-label">${escapeHtml(label)}</div></div>`)
    .join("")}</div>`;
}

function renderKpis(doc, kind) {
  if (kind === "verification") {
    const counts = metaValue(doc, "核对");
    const other = metaValue(doc, "其他结果");
    const items = [];
    const first = /Verified\s+(\d+)\s*\/\s*Awaiting\s+(\d+)\s*\/\s*Returned\s+(\d+)/i.exec(counts);
    if (first) items.push(["Verified", first[1]], ["Awaiting", first[2]], ["Returned", first[3]]);
    const second = /Failed\s+(\d+)\s*\/\s*Skipped\s+(\d+)\s*\/\s*Parked\s+(\d+)\s*\/\s*Left pending\s+(\d+)/i.exec(other);
    if (second) items.push(["Failed", second[1]], ["Skipped", second[2]], ["Parked", second[3]], ["Left pending", second[4]]);
    return renderKpiRow(items);
  }

  if (kind === "progress") {
    const overview = doc.sections.find((section) => section.title === "概览");
    if (!overview) return "";
    const rows = overview.lines.filter(
      (line) => line.trim().startsWith("|") && !line.includes("---"),
    );
    const dataRows = rows.slice(1);
    const done = dataRows.filter((line) => /\bdone\b/.test(line)).length;
    const failed = dataRows.filter((line) => /\bfailed\b/.test(line)).length;
    return renderKpiRow([
      ["任务", String(dataRows.length)],
      ["done", String(done)],
      ["failed", String(failed)],
      ["其他", String(Math.max(0, dataRows.length - done - failed))],
    ]);
  }

  return "";
}

function sectionClass(title) {
  if (/问题/.test(title)) return "callout callout-problem";
  if (/原因/.test(title)) return "callout callout-cause";
  if (/已完成的修复|修复/.test(title)) return "callout callout-fix";
  if (/需要你决定|待人工/.test(title)) return "callout callout-decision";
  return "";
}

function renderSection(section, index, context) {
  let body = renderBlocks(section.lines, context);
  if (/关键事件/.test(section.title)) {
    body = body.replace(/^<ul>/, '<ul class="timeline">');
  }
  if (/目标条件/.test(section.title)) {
    body = body.replace(/^<ol>/, '<ol class="condition-list">');
  }
  if (/^卡片[：:]|卡片详情|验收摘要|Card detail|Acceptance summary/i.test(section.title)) {
    body = body.replace(/^<ul>/, '<ul class="field-list">');
    body = body.replace(/<li>裁决：/g, '<li class="verdict">裁决：');
    body = body.replace(/<li>Verdict:/gi, '<li class="verdict">Verdict:');
  }
  if (/核对清单|冻结决策|约束|我替你做的决定|证据清单|需要你决定|Checklist|Frozen decisions|Constraints/i.test(section.title)) {
    body = body.replace(/^<ul>/, '<ul class="item-list">').replace(/^<ol>/, '<ol class="item-list">');
  }

  return `<section class="doc-section ${sectionClass(section.title)}" id="sec-${index}"><h2><span class="section-index">${String(index).padStart(2, "0")}</span>${renderInline(section.title, context)}</h2>${body}</section>`;
}

export function renderDocument(markdown, options = {}) {
  const sourcePath = options.sourcePath || "document.md";
  const generatedAt = options.generatedAt || new Date().toISOString();
  const context = {
    sourcePath,
    root: options.root || path.dirname(sourcePath),
    linkExists: options.linkExists,
    fileLink: options.fileLink,
    lang: options.lang,
    labels: options.labels,
  };
  const doc = parseDocument(markdown);
  const kind = options.kind || "document";
  const title = doc.title.replace(/^Goal:\s*/i, "").trim() || path.basename(sourcePath).replace(/\.md$/i, "");
  const subtitle = deriveSubtitle(doc, kind);
  const metaChips = renderMetaChips(doc.meta, context);
  const kpis = renderKpis(doc, kind);
  const toc = doc.sections
    .map((section, index) => `<a href="#sec-${index + 1}">${String(index + 1).padStart(2, "0")} · ${escapeHtml(section.title)}</a>`)
    .join("");
  const sections = doc.sections
    .map((section, index) => renderSection(section, index + 1, context))
    .join("\n");

  const { chrome, shellOptions } = shellOptionsFor(options);
  const body = `<header class="doc-header">
<p class="doc-kicker">${escapeHtml(kindLabel(kind, chrome))}</p>
<h1>${renderInline(title, context)}</h1>
${subtitle ? `<p class="doc-subtitle">${escapeHtml(subtitle)}</p>` : ""}
${metaChips ? `<div class="chips">${metaChips}</div>` : ""}
${kpis}
</header>
<div class="doc-layout">
<aside class="toc"><p class="toc-title">${escapeHtml(chrome.toc)}</p>${toc}</aside>
<div class="doc-main">
${sections}
</div>
</div>`;

  return renderShell({ title, body, options: shellOptions, generatedAt, sourcePath });
}

function listRunDirs(root) {
  try {
    return fs
      .readdirSync(path.join(root, "runs"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, "runs", entry.name))
      .sort();
  } catch {
    return [];
  }
}

export function renderFile(sourcePath, options = {}) {
  const absoluteSource = path.resolve(sourcePath);
  const root = path.resolve(options.root || path.dirname(absoluteSource));
  return writeRenderedFile(sourcePath, {
    ...options,
    render: options.kind ? renderDocument : renderMarkdown,
    extraFileTiers: [listRunDirs(root), SKILL_DIR],
    rootLabel: "queue root",
  });
}
