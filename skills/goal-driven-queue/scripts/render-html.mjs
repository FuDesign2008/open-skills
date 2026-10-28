#!/usr/bin/env node
// Queue adapter. Generic Markdown-to-HTML rendering lives in
// report-output-discipline/scripts/render-core.mjs and is imported here.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
let core = null;
try {
  core = await import("../../report-output-discipline/scripts/render-core.mjs");
} catch {
  // The discipline skill is not installed. Rendering degrades to printing
  // Markdown paths instead of crashing the queue run.
  core = null;
}

const unavailable = () => {
  throw new Error("shared renderer unavailable: install report-output-discipline");
};
const {
  baseLabels = () => ({}),
  escapeHtml = (value) => String(value),
  findRepoRoot = () => null,
  isUnderRoot = () => false,
  normalizeTarget = (value) => ({ kind: "invalid", value }),
  renderBlocks = () => "",
  renderInline = (value) => String(value),
  renderLightboxImage = () => "",
  renderMarkdown = unavailable,
  renderNav = () => "",
  renderShell = unavailable,
  writeRenderedFile = unavailable,
} = core || {};

export {
  baseLabels,
  escapeHtml,
  findRepoRoot,
  isUnderRoot,
  normalizeTarget,
  renderBlocks,
  renderInline,
  renderLightboxImage,
  renderMarkdown,
  renderNav,
  renderShell,
  writeRenderedFile,
};

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

function kindLabel(kind, labels = {}) {
  const kinds = labels.kinds || {};
  return (
    kinds[kind] ||
    {
      card: "任务卡",
      triage: "Triage 记录",
      progress: "进度文档",
      verification: "人工核对",
      report: "完成报告",
      document: "队列文档",
    }[kind] ||
    "队列文档"
  );
}

function chromeLabels(options = {}) {
  const base = baseLabels(options);
  const lang = String(options.lang || "zh").toLowerCase();
  const english = lang.startsWith("en");
  const defaults = english
    ? {
        toc: "On this page",
        entryKicker: "Acceptance entry",
        entrySubtitle:
          "Open any page to browse this run; missing targets are marked unavailable.",
        evidenceKicker: "Evidence record",
        evidenceTitle: "Evidence record",
        evidenceEmpty: "No checks were recorded.",
        reviewKicker: "Change note",
        reviewTitle: "Change note",
        problem: "Problem",
        cause: "Cause",
        fix: "Completed fix",
        pending: "pending",
        source: "Source",
        generated: "Generated",
        kinds: {
          card: "Task card",
          triage: "Triage record",
          progress: "Progress",
          verification: "Human verification",
          report: "Completion report",
          document: "Queue document",
        },
      }
    : {
        toc: "本页目录",
        entryKicker: "验收入口",
        entrySubtitle: "打开任意页面即可横向查看本次运行的记录；缺失目标标注为不可用。",
        evidenceKicker: "证据留痕",
        evidenceTitle: "证据留痕",
        evidenceEmpty: "未记录任何检查，且不含图片。",
        reviewKicker: "变更说明",
        reviewTitle: "变更说明",
        problem: "问题",
        cause: "原因",
        fix: "已完成的修复",
        pending: "待补",
        source: "来源",
        generated: "生成",
        kinds: {
          card: "任务卡",
          triage: "Triage 记录",
          progress: "进度文档",
          verification: "人工核对",
          report: "完成报告",
          document: "队列文档",
        },
      };
  return { ...defaults, ...base, kinds: { ...defaults.kinds, ...((options.labels || {}).kinds || {}) } };
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

function renderKpiRow(items) {
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

  const chrome = chromeLabels(options);
  const shellOptions = {
    ...options,
    sourceLabelText: options.sourceLabelText || chrome.source,
    generatedLabelText: options.generatedLabelText || chrome.generated,
  };
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

export function renderEntryPage(options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const root = path.resolve(options.root || process.cwd());
  const entryPath = path.resolve(options.entryPath || path.join(root, "verification.html"));
  const labels = {
    progress: "Progress",
    triage: "Triage",
    content: "Verification content",
    card: "Card",
    report: "Report",
    review: "Review",
    evidence: "Evidence",
    unavailable: "unavailable",
    ...(options.labels || {}),
  };
  const title = options.title || "Human Verification";

  const resolve = (value) => {
    if (!value) return null;
    const absolute = path.resolve(root, value);
    return {
      href: path.relative(path.dirname(entryPath), absolute),
      exists: fs.existsSync(absolute),
    };
  };

  const link = (label, value) => {
    const target = resolve(value);
    if (!target || !target.exists) {
      return `<div class="link-card unavailable"><span class="link-card-label">${escapeHtml(label)}</span><span class="link-card-path"><em>${escapeHtml(labels.unavailable)}</em></span></div>`;
    }
    return `<a class="link-card" href="${escapeHtml(target.href)}"><span class="link-card-label">${escapeHtml(label)}</span><span class="link-card-path">${escapeHtml(value)}</span></a>`;
  };

  const cardLinks = (options.cards || [])
    .map((card) =>
      [
        link(`${labels.card} ${card.slug}`, card.viewPath),
        link(`${labels.report} ${card.slug}`, card.reportPath),
        link(`${labels.review} ${card.slug}`, card.reviewPath),
        link(`${labels.evidence} ${card.slug}`, card.evidencePath),
      ].join(""),
    )
    .join("");

  const extras = (options.extras || []).map((item) => link(item.label, item.path)).join("");
  const kpis = options.kpis ? renderKpiRow(options.kpis) : "";
  const chrome = chromeLabels(options);
  const shellOptions = {
    ...options,
    sourceLabelText: options.sourceLabelText || chrome.source,
    generatedLabelText: options.generatedLabelText || chrome.generated,
  };
  const body = `<header class="doc-header">
<p class="doc-kicker">${escapeHtml(chrome.entryKicker)}</p>
<h1>${escapeHtml(title)} — ${escapeHtml(options.batchId || "batch")}</h1>
<p class="doc-subtitle">${escapeHtml(options.subtitle || chrome.entrySubtitle)}</p>
${kpis}
</header>
<div class="link-grid">${link(labels.progress, options.progressPath)}${link(labels.triage, options.triagePath)}${link(labels.content, options.contentPath)}${cardLinks}${extras}</div>`;

  return renderShell({
    title: `${title} — ${options.batchId || "batch"}`,
    body,
    options: shellOptions,
    generatedAt,
    sourcePath: entryPath,
  });
}

export function renderReviewPage(data = {}, options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const chrome = chromeLabels(options);
  const title = data.title || chrome.reviewTitle;
  const reviewRoot = path.resolve(options.root || process.cwd());
  const context = {
    sourcePath: options.sourcePath || path.join(reviewRoot, "review.md"),
    root: reviewRoot,
    linkExists: options.linkExists,
    fileLink: options.fileLink,
    lang: options.lang,
    labels: options.labels,
  };
  const cards = [
    [chrome.problem, data.problem, "callout-problem"],
    [chrome.cause, data.cause, "callout-cause"],
    [chrome.fix, data.fix, "callout-fix"],
  ]
    .map(
      ([label, value, className]) =>
        `<section class="doc-section ${className}"><h2>${escapeHtml(label)}</h2>${renderBlocks(String(value || "").split("\n"), context)}</section>`,
    )
    .join("");
  const body = `<header class="doc-header"><p class="doc-kicker">${escapeHtml(chrome.reviewKicker)}</p><h1>${escapeHtml(title)}</h1>${data.lead ? `<p class="doc-subtitle">${escapeHtml(data.lead)}</p>` : ""}</header>${cards}`;
  const shellOptions = {
    ...options,
    sourceLabelText: options.sourceLabelText || chrome.source,
    generatedLabelText: options.generatedLabelText || chrome.generated,
  };
  return renderShell({ title, body, options: shellOptions, generatedAt, sourcePath: context.sourcePath });
}

export function renderEvidencePage(data = {}, options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const chrome = chromeLabels(options);
  const title = data.title || chrome.evidenceTitle;
  const evidenceRoot = path.resolve(options.root || process.cwd());
  const context = {
    sourcePath: options.sourcePath || path.join(evidenceRoot, "evidence.html"),
    root: evidenceRoot,
    fileLink: options.fileLink,
    lang: options.lang,
    labels: options.labels,
  };
  const groups = data.groups || [];
  const emptyMessage =
    groups.length === 0
      ? `<p class="evidence-empty">${escapeHtml(data.intro || chrome.evidenceEmpty)}</p>`
      : "";
  const sections = groups
    .map((group) => {
      const items = (group.items || [])
        .map((item) => {
          const status = String(item.status || "").toLowerCase();
          const pending = status === "pending" || Boolean(item.pending);
          const note = item.note || item.inspection || "";
          const statusHtml = pending
            ? `<p class="evidence-status"><span class="chip">${escapeHtml(chrome.pending)}</span> ${escapeHtml(note || item.label || "")}</p>`
            : note
              ? `<p class="evidence-note">${escapeHtml(note)}</p>`
              : "";
          const classes = pending ? "evidence-item pending" : "evidence-item";
          if (item.image) {
            const normalized = normalizeTarget(item.image);
            let imageHtml = "";
            if (normalized.kind === "relative") {
              const imageBase = path.dirname(path.resolve(context.sourcePath));
              const imageAbsolute = path.resolve(imageBase, normalized.value);
              if (isUnderRoot(imageAbsolute, context.root)) {
                imageHtml = renderLightboxImage(item.alt || item.label || "", normalized.value, null, context);
              }
            }
            return `<figure class="${classes}">${imageHtml}<figcaption>${escapeHtml(item.label || "")}</figcaption>${statusHtml}</figure>`;
          }
          const command = item.command ? `<p><code>${escapeHtml(item.command)}</code></p>` : "";
          const output = item.output ? `<p>${renderInline(item.output, context)}</p>` : "";
          return `<div class="${classes}"><p class="evidence-label">${escapeHtml(item.label || "")}</p>${command}${output}${statusHtml}</div>`;
        })
        .join("");
      return `<section class="doc-section"><h2>${escapeHtml(group.heading || "")}</h2>${items}</section>`;
    })
    .join("");
  const intro =
    groups.length === 0
      ? ""
      : data.intro
        ? `<p class="doc-subtitle">${escapeHtml(data.intro)}</p>`
        : "";
  const body = `<header class="doc-header"><p class="doc-kicker">${escapeHtml(chrome.evidenceKicker)}</p><h1>${escapeHtml(title)}</h1>${intro}</header>${emptyMessage}${sections}`;
  const shellOptions = {
    ...options,
    sourceLabelText: options.sourceLabelText || chrome.source,
    generatedLabelText: options.generatedLabelText || chrome.generated,
  };
  return renderShell({
    title,
    body,
    options: shellOptions,
    generatedAt,
    sourcePath: options.sourcePath || "evidence.html",
  });
}

export function readTrigger(progressPath) {
  const content = fs.readFileSync(progressPath, "utf8");
  const match = /^\s*-\s*Trigger:\s*(interactive|scheduled)\s*$/m.exec(content);
  return match ? match[1] : null;
}

export function openInBrowser(filePath, options = {}) {
  const root = path.resolve(options.root || path.dirname(filePath));
  const absolute = path.resolve(filePath);

  if (!isUnderRoot(absolute, root)) {
    throw new Error(`refusing to open a file outside the queue root: ${absolute}`);
  }
  if (!fs.existsSync(absolute)) {
    throw new Error(`view does not exist: ${absolute}`);
  }

  const spawnFn = options.spawnFn || spawn;
  let command;
  let args;

  if (process.platform === "darwin") {
    command = "/usr/bin/open";
    args = [absolute];
  } else if (process.platform === "win32") {
    command = "cmd";
    args = ["/c", "start", "", absolute];
  } else {
    command = "xdg-open";
    args = [absolute];
  }

  const child = spawnFn(command, args, { stdio: "ignore", detached: true });
  if (child && typeof child.unref === "function") child.unref();
  return { opened: true, command, args };
}

export function maybeAutoOpen(options) {
  if (options.trigger !== "interactive") {
    return { opened: false, reason: "trigger is not interactive" };
  }
  return openInBrowser(options.filePath, options);
}

function parseArguments(argv) {
  const sources = [];
  const options = {
    root: undefined,
    open: undefined,
    autoOpen: undefined,
    progress: undefined,
    generatedAt: undefined,
    sourceLabel: undefined,
    nav: undefined,
    navRoot: undefined,
    unavailableLabel: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const takeValue = () => {
      index += 1;
      return argv[index];
    };

    if (argument === "--root") options.root = takeValue();
    else if (argument === "--kind") options.kind = takeValue();
    else if (argument === "--file-root") options.fileRoot = takeValue();
    else if (argument === "--nav") options.navManifest = takeValue();
    else if (argument === "--nav-root") options.navRoot = takeValue();
    else if (argument === "--unavailable") options.unavailableLabel = takeValue();
    else if (argument === "--open") options.open = takeValue();
    else if (argument === "--auto-open") options.autoOpen = takeValue();
    else if (argument === "--progress") options.progress = takeValue();
    else if (argument === "--at") options.generatedAt = takeValue();
    else if (argument === "--source-label") options.sourceLabel = takeValue();
    else sources.push(argument);
  }

  return { sources, options };
}

export async function main(argv) {
  const { sources, options } = parseArguments(argv);
  if (!sources.length) {
    throw new Error("usage: render-html.mjs <source.md>... [--root <dir>] [--open <file>] [--auto-open <file> --progress <progress.md>] [--at <iso>] [--source-label <path>]");
  }

  for (const source of sources) {
    const outPath = renderFile(source, options);
    process.stdout.write(`${outPath}\n`);
  }

  if (options.autoOpen && options.progress) {
    const trigger = readTrigger(options.progress);
    const result = maybeAutoOpen({ ...options, trigger, filePath: options.autoOpen });
    if (!result.opened) process.stdout.write(`auto-open skipped: ${result.reason}\n`);
  } else if (options.open) {
    openInBrowser(options.open, options);
  }
}

function isEntrypoint() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

const isMain = isEntrypoint();
if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    if (/shared renderer unavailable/.test(error.message)) {
      const valueFlags = new Set([
        "--root", "--at", "--file-root", "--source-label", "--open",
        "--auto-open", "--progress", "--kind", "--nav", "--nav-root", "--unavailable",
      ]);
      const argv = process.argv.slice(2);
      const sources = [];
      for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (valueFlags.has(argument)) { index += 1; continue; }
        if (!argument.startsWith("--")) sources.push(argument);
      }
      for (const source of sources) process.stdout.write(`${source}\n`);
      process.stderr.write("shared renderer unavailable; printed Markdown paths instead of writing HTML\n");
      return;
    }
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}
