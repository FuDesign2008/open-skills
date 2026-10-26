#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

const CSS = `:root {
  color-scheme: light dark;
  --paper: #fbf9f4;
  --ink: #26221c;
  --muted: #7a7166;
  --line: #e4ddd2;
  --card: #fffdf8;
  --accent: #8a5a2b;
  --green: #2f6b4f;
  --amber: #946200;
  --red: #a33a2b;
  --blue: #2f5d8a;
  --nav-bg: rgba(251, 249, 244, 0.92);
  --code-bg: rgba(127, 127, 127, 0.14);
}
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #141312;
    --ink: #ece7df;
    --muted: #a39a8d;
    --line: #3a352f;
    --card: #1c1a17;
    --accent: #d4a373;
    --green: #7fb08c;
    --amber: #d9a441;
    --red: #e07a6a;
    --blue: #8ab4f8;
    --nav-bg: rgba(20, 19, 18, 0.92);
    --code-bg: rgba(255, 255, 255, 0.08);
  }
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans CJK SC", "Segoe UI", sans-serif;
  line-height: 1.75;
}
main { max-width: 1040px; margin: 0 auto; padding: 0 1.25rem 4rem; }
a { color: var(--accent); }
h1, h2, h3, h4, h5, h6 {
  font-family: Georgia, "Songti SC", "Noto Serif CJK SC", serif;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
h1 { font-size: clamp(2rem, 4vw, 2.9rem); margin: 0.4rem 0 0.6rem; }
h2 { font-size: 1.25rem; margin: 0 0 0.8rem; }
h3 { font-size: 1.05rem; margin: 1.1rem 0 0.4rem; }
h4 { font-size: 0.98rem; margin: 1rem 0 0.35rem; }
code { background: var(--code-bg); padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.9em; }
pre { background: var(--code-bg); padding: 1rem; overflow: auto; border-radius: 10px; }
pre code { background: none; padding: 0; }
table { width: 100%; border-collapse: collapse; margin: 0.5rem 0 1rem; }
th, td { text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
tbody tr:nth-child(even) { background: rgba(127, 127, 127, 0.04); }
blockquote { margin: 1rem 0; padding: 0.25rem 1rem; border-left: 4px solid var(--line); color: var(--muted); }
footer { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid var(--line); font-size: 0.8rem; color: var(--muted); }
img { max-width: 100%; height: auto; }

.queue-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 5;
  margin: 0 0 0.5rem;
  padding: 0.55rem 0.2rem;
  border-bottom: 1px solid var(--line);
  background: var(--nav-bg);
  backdrop-filter: blur(6px);
  font-size: 0.86rem;
}
.queue-nav a { color: var(--ink); text-decoration: none; padding: 0.2rem 0.55rem; border-radius: 999px; border: 1px solid transparent; }
.queue-nav a:hover { border-color: var(--accent); color: var(--accent); }
.queue-nav-sep { color: var(--muted); }
.queue-nav-unavailable { color: var(--muted); opacity: 0.7; }

.doc-header { padding: 2.5rem 0 1.25rem; border-bottom: 1px solid var(--line); margin-bottom: 1.5rem; }
.doc-kicker { margin: 0; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); }
.doc-subtitle { margin: 0 0 1.25rem; color: var(--muted); max-width: 62ch; font-size: 1.02rem; }
.chips { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.chip { display: inline-flex; align-items: baseline; gap: 0.35rem; padding: 0.2rem 0.65rem; border: 1px solid var(--line); border-radius: 999px; background: var(--card); font-size: 0.8rem; }
.chip-key { color: var(--muted); font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; }

.pill { display: inline-block; padding: 0.05rem 0.55rem; border-radius: 999px; font-size: 0.76rem; font-weight: 600; border: 1px solid currentColor; }
.pill-done, .pill-verified { color: var(--green); }
.pill-awaiting, .pill-pending, .pill-in-progress, .pill-waiting-dependency { color: var(--amber); }
.pill-failed, .pill-returned, .pill-conflict-pending-confirmation { color: var(--red); }
.pill-skipped, .pill-parked { color: var(--muted); }

.kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin: 1.25rem 0 0; }
.kpi { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 0.8rem 1rem; }
.kpi-value { font-family: Georgia, serif; font-size: 1.8rem; font-weight: 600; line-height: 1.1; }
.kpi-label { font-size: 0.74rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; }

.doc-layout { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 2.5rem; align-items: start; }
.toc { position: sticky; top: 3.2rem; font-size: 0.86rem; }
.toc-title { margin: 0 0 0.5rem; font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
.toc a { display: block; color: var(--ink); text-decoration: none; padding: 0.22rem 0; border-bottom: 1px dotted transparent; }
.toc a:hover { border-bottom-color: var(--accent); color: var(--accent); }
.doc-main { min-width: 0; }

.doc-section { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 1.25rem 1.4rem; margin-bottom: 1rem; }
.doc-section h2 { display: flex; gap: 0.5rem; align-items: baseline; }
.section-index { color: var(--accent); font-size: 0.8rem; letter-spacing: 0.08em; }
.callout { border-left: 4px solid var(--accent); padding-left: 1rem; }
.callout-problem { border-left-color: var(--red); }
.callout-cause { border-left-color: var(--amber); }
.callout-fix { border-left-color: var(--green); }
.callout-decision { border-left-color: var(--blue); }

.field-list { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.55rem; }
.field-list > li { border: 1px solid var(--line); border-radius: 8px; padding: 0.55rem 0.7rem; background: var(--paper); }
.field-list > li.verdict { grid-column: 1 / -1; border: 2px solid var(--green); background: var(--card); }
.condition-list { list-style: none; padding: 0; display: grid; gap: 0.6rem; }
.condition-list > li { border: 1px solid var(--line); border-radius: 10px; padding: 0.7rem 0.8rem; background: var(--paper); }
.item-list { padding-left: 1.1rem; }
.timeline { list-style: none; padding: 0; margin: 0.5rem 0 0 0.5rem; border-left: 2px solid var(--line); }
.timeline > li { position: relative; padding: 0.25rem 0 0.75rem 1rem; }
.timeline > li::before { content: ""; position: absolute; left: -5px; top: 0.55rem; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }

.link-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.7rem; margin-top: 1rem; }
.link-card { display: flex; flex-direction: column; gap: 0.25rem; border: 1px solid var(--line); border-radius: 10px; background: var(--card); padding: 0.8rem 0.9rem; text-decoration: none; color: var(--ink); }
.link-card:hover { border-color: var(--accent); }
.link-card-label { font-weight: 600; }
.link-card-path { font-size: 0.78rem; color: var(--muted); word-break: break-all; }
.link-card.unavailable { opacity: 0.65; }

figure { margin: 1.25rem 0; }
figure img { border: 1px solid var(--line); border-radius: 10px; }
figcaption { margin-top: 0.4rem; font-size: 0.85rem; color: var(--muted); }
.evidence-item { border: 1px solid var(--line); border-radius: 8px; padding: 0.6rem 0.8rem; margin: 0.5rem 0; background: var(--paper); }
.evidence-label { margin: 0 0 0.3rem; font-weight: 600; }
.evidence-link { margin-top: 1.5rem; }

@media (max-width: 860px) {
  .doc-layout { grid-template-columns: 1fr; }
  .toc { position: static; }
  .kpi-row { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
@media print {
  .queue-nav, .toc { display: none; }
  .doc-layout { display: block; }
  body { background: #fff; color: #000; }
  .doc-section, .kpi, .link-card { background: #fff; border-color: #ccc; }
  h1, h2, h3, h4 { color: #000; }
}
`;

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ESCAPES[character]);
}

export function normalizeTarget(raw) {
  const target = String(raw).trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (!target) return { kind: "blocked" };

  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(target);
  if (scheme) {
    const name = scheme[1].toLowerCase();
    if (name === "http" || name === "https" || name === "mailto") {
      return { kind: "external", value: target };
    }
    return { kind: "blocked" };
  }

  if (target.startsWith("//") || target.startsWith("/") || target.startsWith("\\")) {
    return { kind: "blocked" };
  }
  if (target.startsWith("#")) return { kind: "fragment", value: target };
  return { kind: "relative", value: target };
}

function isUnderRoot(absolutePath, root) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(absolutePath);
  return resolved === resolvedRoot || resolved.startsWith(resolvedRoot + path.sep);
}

function splitTarget(target) {
  const index = target.indexOf("#");
  if (index === -1) return { file: target, hash: "" };
  return { file: target.slice(0, index), hash: target.slice(index) };
}

function rewriteMdLink(target, context) {
  const { file, hash } = splitTarget(target);
  if (!/\.md$/i.test(file)) return target;

  const absolute = path.resolve(path.dirname(context.sourcePath), file.replace(/\.md$/i, ".html"));
  const exists = context.linkExists ? context.linkExists(absolute) : fs.existsSync(absolute);
  if (!exists) return target;

  return path.relative(path.dirname(context.sourcePath), absolute) + hash;
}

function renderLink(label, rawTarget, title, context) {
  const normalized = normalizeTarget(rawTarget);
  if (normalized.kind === "blocked") return renderInline(label, context);

  const href =
    normalized.kind === "relative" ? rewriteMdLink(normalized.value, context) : normalized.value;
  const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
  return `<a href="${escapeHtml(href)}"${titleAttribute}>${renderInline(label, context)}</a>`;
}

function renderImage(alt, rawTarget, title, context) {
  const normalized = normalizeTarget(rawTarget);
  if (normalized.kind !== "relative") return escapeHtml(alt);

  const absolute = path.resolve(path.dirname(context.sourcePath), normalized.value);
  if (!isUnderRoot(absolute, context.root) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    return escapeHtml(alt);
  }

  const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
  return `<img src="${escapeHtml(normalized.value)}" alt="${escapeHtml(alt)}"${titleAttribute}>`;
}

export function renderInline(text, context) {
  let output = "";
  let index = 0;

  while (index < text.length) {
    const character = text[index];

    if (character === "`") {
      const end = text.indexOf("`", index + 1);
      if (end !== -1) {
        output += `<code>${escapeHtml(text.slice(index + 1, end))}</code>`;
        index = end + 1;
        continue;
      }
    }

    if (character === "!" && text[index + 1] === "[") {
      const match = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/.exec(text.slice(index));
      if (match) {
        output += renderImage(match[1], match[2], match[3], context);
        index += match[0].length;
        continue;
      }
    }

    if (character === "[") {
      const match = /^\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/.exec(text.slice(index));
      if (match) {
        output += renderLink(match[1], match[2], match[3], context);
        index += match[0].length;
        continue;
      }
    }

    if (text.startsWith("**", index)) {
      const end = text.indexOf("**", index + 2);
      if (end !== -1) {
        output += `<strong>${renderInline(text.slice(index + 2, end), context)}</strong>`;
        index = end + 2;
        continue;
      }
    }

    if (character === "*" || character === "_") {
      const previous = text[index - 1] || "";
      const next = text[index + 1] || "";
      const wordBoundary = character === "_" && /[\w]/.test(previous) && /[\w]/.test(next);
      if (!wordBoundary) {
        const end = text.indexOf(character, index + 1);
        if (end !== -1) {
          output += `<em>${renderInline(text.slice(index + 1, end), context)}</em>`;
          index = end + 1;
          continue;
        }
      }
    }

    output += escapeHtml(character);
    index += 1;
  }

  return output;
}

function isTableSeparator(line) {
  return line.includes("|") && /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes("-");
}

function splitRow(line) {
  const cells = [];
  let current = "";
  let index = 0;

  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  while (index < trimmed.length) {
    if (trimmed[index] === "\\" && trimmed[index + 1] === "|") {
      current += "|";
      index += 2;
      continue;
    }
    if (trimmed[index] === "|") {
      cells.push(current.trim());
      current = "";
      index += 1;
      continue;
    }
    current += trimmed[index];
    index += 1;
  }
  cells.push(current.trim());
  return cells;
}

function renderTable(lines, start, context) {
  const header = splitRow(lines[start]);
  const rows = [];
  let index = start + 2;
  while (index < lines.length && lines[index].includes("|") && lines[index].trim() !== "") {
    rows.push(splitRow(lines[index]));
    index += 1;
  }

  const head = `<thead><tr>${header.map((cell) => `<th>${renderInline(cell, context)}</th>`).join("")}</tr></thead>`;
  const body = rows.length
    ? `<tbody>${rows
        .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell, context)}</td>`).join("")}</tr>`)
        .join("")}</tbody>`
    : "";

  return { html: `<table>${head}${body}</table>`, next: index };
}

function renderList(lines, start, context, baseIndent) {
  const ordered = /^\s*\d+\.\s+/.test(lines[start]);
  const tag = ordered ? "ol" : "ul";
  const items = [];
  let index = start;

  while (index < lines.length) {
    const match = /^(\s*)([-*+]|\d+\.)\s+(.*)$/.exec(lines[index]);
    if (!match) break;

    const indent = match[1].length;
    if (indent < baseIndent) break;
    if (indent === baseIndent && /^\d+\.$/.test(match[2]) !== ordered) break;

    if (indent > baseIndent) {
      const nested = renderList(lines, index, context, indent);
      if (items.length) items[items.length - 1].children += nested.html;
      index = nested.next;
      continue;
    }

    let content = match[3];
    let prefix = "";
    const task = /^\[( |x|X)\]\s+(.*)$/.exec(content);
    if (task) {
      const checked = task[1].toLowerCase() === "x" ? " checked" : "";
      prefix = `<input type="checkbox" disabled${checked}> `;
      content = task[2];
    }

    items.push({ prefix, content, children: "" });
    index += 1;
  }

  const html = `<${tag}>${items
    .map((item) => `<li>${item.prefix}${renderInline(item.content, context)}${item.children}</li>`)
    .join("")}</${tag}>`;
  return { html, next: index };
}

function isBlockStart(line, nextLine) {
  return (
    /^\s*$/.test(line) ||
    /^\s*(```+|~~~+)/.test(line) ||
    /^(#{1,6})\s+/.test(line) ||
    /^\s*(---+|\*\*\*+|___+)\s*$/.test(line) ||
    /^\s*>\s?/.test(line) ||
    /^\s*([-*+]|\d+\.)\s+/.test(line) ||
    (line.includes("|") && nextLine !== undefined && isTableSeparator(nextLine))
  );
}

function renderBlocks(lines, context) {
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (/^\s*$/.test(line)) {
      index += 1;
      continue;
    }

    const fence = /^\s*(```+|~~~+)\s*([\w-]*)\s*$/.exec(line);
    if (fence) {
      const marker = fence[1][0];
      const language = fence[2];
      const body = [];
      index += 1;
      while (index < lines.length && !new RegExp(`^\\s*${marker}{3,}\\s*$`).test(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1;
      const languageClass = language ? ` class="language-${escapeHtml(language)}"` : "";
      blocks.push(`<pre><code${languageClass}>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInline(heading[2], context)}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) {
      blocks.push("<hr>");
      index += 1;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quoted = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quoted.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push(`<blockquote>${renderBlocks(quoted, context)}</blockquote>`);
      continue;
    }

    if (line.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const table = renderTable(lines, index, context);
      blocks.push(table.html);
      index = table.next;
      continue;
    }

    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const list = renderList(lines, index, context, /^\s*/.exec(line)[0].length);
      blocks.push(list.html);
      index = list.next;
      continue;
    }

    const paragraph = [];
    while (index < lines.length && !isBlockStart(lines[index], lines[index + 1])) {
      paragraph.push(lines[index]);
      index += 1;
    }
    if (paragraph.length) blocks.push(`<p>${renderInline(paragraph.join(" "), context)}</p>`);
  }

  return blocks.join("\n");
}

export function renderNav(items, options = {}) {
  if (!Array.isArray(items) || !items.length) return "";
  const root = path.resolve(options.root || process.cwd());
  const fromPath = path.resolve(options.fromPath || path.join(root, "index.html"));
  const unavailable = options.unavailableLabel || "unavailable";

  const links = items.map((item) => {
    const absolute = path.resolve(root, item.path);
    const href = path.relative(path.dirname(fromPath), absolute);
    if (!fs.existsSync(absolute)) {
      return `<span class="queue-nav-unavailable">${escapeHtml(item.label)}（${escapeHtml(unavailable)}）</span>`;
    }
    return `<a href="${escapeHtml(href)}">${escapeHtml(item.label)}</a>`;
  });

  return `<nav class="queue-nav" aria-label="文档导航">${links.join('<span class="queue-nav-sep">·</span>')}</nav>`;
}

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
      return `<span class="chip"><span class="chip-key">${escapeHtml(item.key)}</span><span class="chip-value">${value}</span></span>`;
    })
    .join("");
}

function kindLabel(kind) {
  return {
    card: "任务卡",
    triage: "Triage 记录",
    progress: "进度文档",
    verification: "人工核对",
    report: "完成报告",
    document: "队列文档",
  }[kind] || "队列文档";
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
  if (/^卡片[：:]/.test(section.title)) {
    body = body.replace(/^<ul>/, '<ul class="field-list">');
    body = body.replace(/<li>裁决：/g, '<li class="verdict">裁决：');
  }
  if (/核对清单|冻结决策|约束|我替你做的决定|验收摘要|证据清单|需要你决定/.test(section.title)) {
    body = body.replace(/^<ul>/, '<ul class="item-list">').replace(/^<ol>/, '<ol class="item-list">');
  }

  return `<section class="doc-section ${sectionClass(section.title)}" id="sec-${index}"><h2><span class="section-index">${String(index).padStart(2, "0")}</span>${renderInline(section.title, context)}</h2>${body}</section>`;
}

function renderShell({ title, body, options = {}, generatedAt, sourcePath }) {
  const sourceLabel = options.sourceLabel
    ? ` (original: <code>${escapeHtml(options.sourceLabel)}</code>)`
    : "";
  return `<!doctype html>
<html lang="${escapeHtml(options.lang || "en")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${CSS}</style>
</head>
<body>
<main>
${options.navHtml || ""}
${body}
<footer>${escapeHtml(options.sourceLabelText || "Source")}: <code>${escapeHtml(sourcePath)}</code>${sourceLabel} · ${escapeHtml(options.generatedLabelText || "Generated")}: <time datetime="${escapeHtml(generatedAt)}">${escapeHtml(generatedAt)}</time></footer>
</main>
</body>
</html>
`;
}

export function renderDocument(markdown, options = {}) {
  const sourcePath = options.sourcePath || "document.md";
  const generatedAt = options.generatedAt || new Date().toISOString();
  const context = {
    sourcePath,
    root: options.root || path.dirname(sourcePath),
    linkExists: options.linkExists,
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

  const body = `<header class="doc-header">
<p class="doc-kicker">${escapeHtml(kindLabel(kind))}</p>
<h1>${escapeHtml(title)}</h1>
${subtitle ? `<p class="doc-subtitle">${escapeHtml(subtitle)}</p>` : ""}
${metaChips ? `<div class="chips">${metaChips}</div>` : ""}
${kpis}
</header>
<div class="doc-layout">
<aside class="toc"><p class="toc-title">本页目录</p>${toc}</aside>
<div class="doc-main">
${sections}
</div>
</div>`;

  return renderShell({ title, body, options, generatedAt, sourcePath });
}

export function renderMarkdown(markdown, options = {}) {
  const sourcePath = options.sourcePath || "document.md";
  const generatedAt = options.generatedAt || new Date().toISOString();
  const context = {
    sourcePath,
    root: options.root || path.dirname(sourcePath),
    linkExists: options.linkExists,
  };

  const lines = String(markdown).replace(/\r\n?/g, "\n").split("\n");
  const body = renderBlocks(lines, context);
  const titleMatch = /^#{1,6}\s+(.+)$/m.exec(markdown);
  const title = titleMatch ? titleMatch[1] : path.basename(sourcePath).replace(/\.md$/i, "");

  return renderShell({ title, body, options, generatedAt, sourcePath });
}

export function renderFile(sourcePath, options = {}) {
  const absoluteSource = path.resolve(sourcePath);
  const outPath = path.resolve(options.outPath || absoluteSource.replace(/\.md$/i, ".html"));
  const root = path.resolve(options.root || path.dirname(absoluteSource));

  if (!isUnderRoot(outPath, root)) {
    throw new Error(`refusing to write outside the queue root: ${outPath}`);
  }

  let navItems = options.nav;
  if (!navItems && options.navManifest) {
    const manifest = JSON.parse(fs.readFileSync(options.navManifest, "utf8"));
    navItems = Array.isArray(manifest) ? manifest : manifest.items;
  }
  const navHtml = navItems
    ? renderNav(navItems, {
        fromPath: outPath,
        root: options.navRoot || root,
        unavailableLabel: options.unavailableLabel,
      })
    : "";

  const markdown = fs.readFileSync(absoluteSource, "utf8");
  const render = options.kind ? renderDocument : renderMarkdown;
  const html = render(markdown, {
    ...options,
    sourcePath: absoluteSource,
    root,
    navHtml,
  });

  const temporary = `${outPath}.tmp`;
  fs.writeFileSync(temporary, html, "utf8");
  fs.renameSync(temporary, outPath);
  return outPath;
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
  const body = `<header class="doc-header">
<p class="doc-kicker">验收入口</p>
<h1>${escapeHtml(title)} — ${escapeHtml(options.batchId || "batch")}</h1>
<p class="doc-subtitle">${escapeHtml(options.subtitle || "打开任意页面即可横向查看本次运行的记录；缺失目标标注为不可用。")}</p>
${kpis}
</header>
<div class="link-grid">${link(labels.progress, options.progressPath)}${link(labels.triage, options.triagePath)}${link(labels.content, options.contentPath)}${cardLinks}${extras}</div>`;

  return renderShell({
    title: `${title} — ${options.batchId || "batch"}`,
    body,
    options,
    generatedAt,
    sourcePath: entryPath,
  });
}

export function renderReviewPage(data = {}, options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const title = data.title || "变更说明";
  const context = {
    sourcePath: options.sourcePath || "review.md",
    root: options.root || process.cwd(),
    linkExists: options.linkExists,
  };
  const cards = [
    ["问题", data.problem, "callout-problem"],
    ["原因", data.cause, "callout-cause"],
    ["已完成的修复", data.fix, "callout-fix"],
  ]
    .map(
      ([label, text, className]) =>
        `<section class="doc-section ${className}"><h2>${escapeHtml(label)}</h2>${renderBlocks(String(text || "").split("\n"), context)}</section>`,
    )
    .join("");
  const evidence = data.evidencePath
    ? `<p class="evidence-link"><a href="${escapeHtml(data.evidencePath)}">证据留痕</a></p>`
    : "";
  const body = `<header class="doc-header"><p class="doc-kicker">变更说明</p><h1>${escapeHtml(title)}</h1>${data.lead ? `<p class="doc-subtitle">${escapeHtml(data.lead)}</p>` : ""}</header>${cards}${evidence}`;
  return renderShell({ title, body, options, generatedAt, sourcePath: context.sourcePath });
}

export function renderEvidencePage(data = {}, options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const title = data.title || "证据留痕";
  const sections = (data.groups || [])
    .map((group) => {
      const items = (group.items || [])
        .map((item) => {
          if (item.image) {
            return `<figure><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt || item.label || "")}"><figcaption>${escapeHtml(item.label || "")}</figcaption></figure>`;
          }
          const command = item.command ? `<p><code>${escapeHtml(item.command)}</code></p>` : "";
          const output = item.output ? `<p>${escapeHtml(item.output)}</p>` : "";
          return `<div class="evidence-item"><p class="evidence-label">${escapeHtml(item.label || "")}</p>${command}${output}</div>`;
        })
        .join("");
      return `<section class="doc-section"><h2>${escapeHtml(group.heading || "")}</h2>${items}</section>`;
    })
    .join("");
  const body = `<header class="doc-header"><p class="doc-kicker">证据留痕</p><h1>${escapeHtml(title)}</h1>${data.intro ? `<p class="doc-subtitle">${escapeHtml(data.intro)}</p>` : ""}</header>${sections}`;
  return renderShell({ title, body, options, generatedAt, sourcePath: options.sourcePath || "evidence.html" });
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

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}
