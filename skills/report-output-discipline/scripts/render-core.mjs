#!/usr/bin/env node
// Generic Markdown-to-HTML rendering. Owned by the report-output-format contract.
// Queue-specific templates and pages live in goal-driven-queue/scripts/render-html.mjs.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { renderMermaid } from "./render-mermaid.mjs";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

const CSS = `:root {
  color-scheme: light dark;
  --paper: #fbf9f4;
  --ink: #26221c;
  --muted: #7a7166;
  --line: #e4ddd2;
  --line-soft: #efe9df;
  --card: #fffdf8;
  --card-shadow: 0 1px 2px rgba(38, 34, 28, 0.035);
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
    --line-soft: #2b2722;
    --card: #1c1a17;
    --card-shadow: none;
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
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
  font-size: 17px;
  line-height: 1.75;
  letter-spacing: 0.004em;
  font-optical-sizing: auto;
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
}
main { max-width: 1060px; margin: 0 auto; padding: 0 1.5rem 5rem; }
a { color: var(--accent); overflow-wrap: anywhere; text-underline-offset: 0.16em; text-decoration-thickness: 0.06em; }
a:hover { text-decoration-thickness: 0.12em; }
::selection { background: var(--accent); color: var(--paper); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
h1, h2, h3, h4, h5, h6 {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
  font-weight: 600;
  line-height: 1.22;
  letter-spacing: -0.014em;
  text-wrap: balance;
}
h1 { font-size: clamp(2rem, 3.6vw, 2.55rem); font-weight: 700; line-height: 1.16; letter-spacing: -0.026em; margin: 0.35rem 0 0.65rem; }
h2 { font-size: 1.3rem; letter-spacing: -0.012em; margin: 0 0 0.9rem; }
h3 { font-size: 1.08rem; margin: 1.1rem 0 0.4rem; }
h4 { font-size: 1rem; margin: 1rem 0 0.35rem; }
p, li { text-wrap: pretty; }
p { margin: 0 0 1em; }
strong { font-weight: 600; }
.doc-section p, .doc-section li { max-width: 74ch; }
.doc-section p { max-width: 68ch; }
.doc-section li::marker { color: var(--muted); }
.doc-section p, .doc-section > ul:not(.field-list):not(.timeline), .doc-section > ol:not(.condition-list) {
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Songti SC", SimSun, STSong, "Noto Serif CJK SC", "Source Han Serif SC", serif;
  font-size: 18px;
  line-height: 1.86;
  letter-spacing: 0.01em;
}
code { background: var(--code-bg); padding: 0.08em 0.3em; border-radius: 4px; font-size: 0.87em; font-family: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; font-variant-ligatures: none; }
.file-link { text-decoration: none; border-bottom: 1px dotted var(--muted); }
.file-link code { color: var(--accent); }
.file-link-icon { font-size: 0.72em; margin-left: 0.15em; opacity: 0.65; }
pre { background: var(--code-bg); padding: 1rem; overflow: auto; border-radius: 10px; }
pre code { background: none; padding: 0; }
.table-wrap { overflow-x: auto; margin: 0.6rem 0 1.1rem; }
table { width: 100%; border-collapse: collapse; font-size: 0.95rem; line-height: 1.6; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 0.55rem 0.65rem; border-bottom: 1px solid var(--line-soft); vertical-align: top; min-width: 6.5rem; overflow-wrap: anywhere; }
.table-wrap th:last-child, .table-wrap td:last-child { min-width: 12rem; }
.record-list { margin: 0.5rem 0 1rem; display: grid; gap: 0.7rem; }
.record { border: 1px solid var(--line-soft); border-radius: 10px; padding: 0.45rem 0.8rem; background: var(--paper); }
.record-field { display: grid; grid-template-columns: minmax(5.5rem, 7rem) minmax(0, 1fr); gap: 0.75rem; padding: 0.3rem 0; }
.record-field + .record-field { border-top: 1px dashed var(--line); }
.record-field dt { color: var(--muted); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em; padding-top: 0.15rem; }
.record-field dd { margin: 0; min-width: 0; font-size: 0.98rem; line-height: 1.7; overflow-wrap: anywhere; }
th { font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
tbody tr:nth-child(even) { background: rgba(127, 127, 127, 0.035); }
blockquote { margin: 1rem 0; padding: 0.25rem 1rem; border-left: 4px solid var(--line); color: var(--muted); font-family: "Iowan Old Style", Palatino, "Songti SC", "Noto Serif CJK SC", serif; font-style: italic; font-size: 1.04em; }
footer { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid var(--line); font-size: 0.79rem; color: var(--muted); letter-spacing: 0.01em; }
img { max-width: 100%; height: auto; }
button.lightbox-trigger {
  display: inline-block;
  max-width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
  font: inherit;
  color: inherit;
  text-align: left;
}
button.lightbox-trigger img { display: block; max-width: 100%; height: auto; }
#queue-lightbox {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
}
#queue-lightbox::backdrop { background: rgba(10, 12, 20, 0.86); }
#queue-lightbox .lightbox-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  max-width: min(96vw, 1200px);
  max-height: 92vh;
}
#queue-lightbox .lightbox-panel img {
  display: block;
  max-width: min(92vw, 1100px);
  max-height: 82vh;
  width: auto;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--card);
}
#queue-lightbox .lightbox-close {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 999px;
  background: var(--card);
  color: var(--ink);
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  box-shadow: var(--card-shadow);
}
@media print {
  #queue-lightbox, button.lightbox-trigger { cursor: default; }
}

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
  font-size: 0.82rem;
}
.queue-nav a { color: var(--ink); text-decoration: none; padding: 0.18rem 0.55rem; border-radius: 999px; border: 1px solid transparent; }
.queue-nav a:hover { border-color: var(--accent); color: var(--accent); }
.queue-nav a[aria-current="page"] { color: var(--accent); border-color: var(--line-soft); background: var(--card); }
.queue-nav-sep { color: var(--muted); opacity: 0.7; }
.queue-nav-unavailable { color: var(--muted); opacity: 0.7; }

.doc-header { padding: 2.8rem 0 1.4rem; border-bottom: 1px solid var(--line); margin-bottom: 1.6rem; }
.doc-kicker { margin: 0; font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); }
.doc-subtitle { margin: 0 0 1.4rem; color: var(--muted); max-width: 64ch; font-size: 1.03rem; line-height: 1.68; }
.chips { display: flex; flex-wrap: wrap; gap: 0.45rem 0.5rem; }
.chip { display: inline-flex; align-items: baseline; gap: 0.35rem; padding: 0.28rem 0.7rem; border: 1px solid var(--line-soft); border-radius: 999px; background: transparent; font-size: 0.78rem; }
.chip-key { color: var(--muted); font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; }
.meta-row { display: grid; grid-template-columns: minmax(7rem, 9rem) minmax(0, 1fr); gap: 0.75rem; width: 100%; padding: 0.4rem 0; border-top: 1px dashed var(--line-soft); }
.meta-row:first-child { border-top: 0; padding-top: 0; }
.meta-key { font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); padding-top: 0.15rem; }
.meta-value { font-size: 0.92rem; line-height: 1.7; }

.pill { display: inline-block; padding: 0.05rem 0.55rem; border-radius: 999px; font-size: 0.76rem; font-weight: 600; border: 1px solid currentColor; }
.pill-done, .pill-verified { color: var(--green); }
.pill-awaiting, .pill-pending, .pill-in-progress, .pill-waiting-dependency { color: var(--amber); }
.pill-failed, .pill-returned, .pill-conflict-pending-confirmation { color: var(--red); }
.pill-skipped, .pill-parked { color: var(--muted); }

.kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(112px, 1fr)); gap: 0.7rem; margin: 1.25rem 0 0; }
.kpi { background: var(--card); border: 1px solid var(--line-soft); border-radius: 12px; padding: 0.9rem 1.05rem; }
.kpi-value { font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Songti SC", serif; font-size: 1.95rem; font-weight: 600; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.kpi-label { font-size: 0.68rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }

.doc-layout { display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 2.4rem; align-items: start; }
.toc { position: sticky; top: 3.2rem; font-size: 0.84rem; }
.toc-title { margin: 0 0 0.5rem; font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
.toc a { display: block; color: var(--ink); text-decoration: none; padding: 0.26rem 0; border-bottom: 1px dotted transparent; }
.toc a:hover { border-bottom-color: var(--accent); color: var(--accent); }
.doc-main { min-width: 0; }
[id] { scroll-margin-top: 4rem; }

.doc-section { background: var(--card); border: 1px solid var(--line-soft); border-radius: 14px; padding: 1.5rem 1.6rem 1.4rem; margin-bottom: 1.15rem; box-shadow: var(--card-shadow); }
.doc-section h2 { display: flex; gap: 0.5rem; align-items: baseline; padding-bottom: 0.6rem; border-bottom: 1px solid var(--line-soft); margin-bottom: 1rem; }
.section-index { color: var(--accent); font-size: 0.8rem; letter-spacing: 0.08em; font-variant-numeric: tabular-nums; }
.callout { border-left: 4px solid var(--accent); padding-left: 1rem; }
.callout-problem { border-left-color: var(--red); }
.callout-cause { border-left-color: var(--amber); }
.callout-fix { border-left-color: var(--green); }
.callout-decision { border-left-color: var(--blue); }

.field-list { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.55rem; }
.field-list > li { border: 1px solid var(--line-soft); border-radius: 10px; padding: 0.6rem 0.75rem; background: var(--paper); }
.field-list > li.verdict { grid-column: 1 / -1; border: 1px solid var(--line-soft); border-left: 4px solid var(--green); background: var(--card); }
.evidence-item.pending, figure.pending { border: 1px solid var(--line-soft); border-left: 4px solid var(--amber, #c47b1a); padding: 0.6rem 0.75rem; border-radius: 10px; background: var(--paper); }
.evidence-status { margin: 0.35rem 0 0; }
.evidence-empty { color: var(--muted); }

.condition-list { list-style: none; padding: 0; display: grid; gap: 0.6rem; }
.condition-list > li { border: 1px solid var(--line-soft); border-radius: 10px; padding: 0.7rem 0.8rem; background: var(--paper); }
.item-list { padding-left: 1.1rem; }
.timeline { list-style: none; padding: 0; margin: 0.5rem 0 0 0.5rem; border-left: 2px solid var(--line); }
.timeline > li { position: relative; padding: 0.25rem 0 0.75rem 1rem; }
.timeline > li::before { content: ""; position: absolute; left: -5px; top: 0.55rem; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }

.link-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.7rem; margin-top: 1rem; }
.link-card { position: relative; display: flex; flex-direction: column; gap: 0.3rem; border: 1px solid var(--line-soft); border-radius: 12px; background: var(--card); padding: 1rem 1.05rem; text-decoration: none; color: var(--ink); transition: border-color 0.15s ease, transform 0.15s ease; }
.link-card::after { content: "↗"; position: absolute; top: 0.7rem; right: 0.85rem; font-size: 0.85rem; color: var(--muted); opacity: 0.7; }
.link-card:hover { border-color: var(--accent); transform: translateY(-1px); }
.link-card:hover::after { color: var(--accent); opacity: 1; }
.link-card-label { font-size: 1.02rem; font-weight: 600; padding-right: 1.2rem; }
.link-card-path { margin-top: auto; font-family: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, monospace; font-size: 0.72rem; line-height: 1.55; color: var(--muted); overflow-wrap: anywhere; }
.link-card.unavailable { opacity: 0.65; }

figure { margin: 1.25rem 0; }
figure img { border: 1px solid var(--line); border-radius: 10px; }
figcaption { margin-top: 0.4rem; font-size: 0.85rem; color: var(--muted); }
.evidence-item { border: 1px solid var(--line-soft); border-radius: 10px; padding: 0.6rem 0.8rem; margin: 0.5rem 0; background: var(--paper); }
.doc-section .evidence-label { margin: 0 0 0.3rem; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif; font-size: 0.95rem; line-height: 1.6; letter-spacing: 0.003em; }

@media (max-width: 860px) {
  .doc-layout { grid-template-columns: 1fr; }
  .toc { position: static; }
  .kpi-row { grid-template-columns: repeat(auto-fit, minmax(112px, 1fr)); }
}
@media (max-width: 640px) {
  .meta-row { grid-template-columns: 1fr; gap: 0.15rem; }
  .meta-key { padding-top: 0; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .link-card { transition: none; }
}
@media print {
  .queue-nav, .toc { display: none; }
  .doc-layout { display: block; }
  body { background: #fff; color: #000; font-size: 10.5pt; }
  .doc-section p, .doc-section > ul:not(.field-list):not(.timeline), .doc-section > ol:not(.condition-list) { font-size: 10.5pt; line-height: 1.55; }
  .table-wrap { overflow: visible; }
  th, td { min-width: 0; font-size: 8.5pt; }
  .doc-section, .kpi, .link-card, .record { background: #fff; border-color: #ccc; box-shadow: none; }
  .record { break-inside: avoid; }
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

export function isUnderRoot(absolutePath, root) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(absolutePath);
  const lexical = resolved === resolvedRoot || resolved.startsWith(resolvedRoot + path.sep);
  if (!lexical) return false;
  try {
    const realRoot = fs.realpathSync(resolvedRoot);
    const realParent = fs.realpathSync(path.dirname(resolved));
    return realParent === realRoot || realParent.startsWith(realRoot + path.sep);
  } catch {
    return true;
  }
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

function lightboxEnlargeLabel(alt, context = {}) {
  const chrome = baseLabels(context);
  const trimmed = String(alt || "").trim();
  return trimmed ? `${chrome.lightboxEnlarge}: ${trimmed}` : chrome.lightboxEnlarge;
}

export function renderLightboxImage(alt, src, title, context = {}) {
  const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
  const label = lightboxEnlargeLabel(alt, context);
  return `<button type="button" class="lightbox-trigger" data-lightbox aria-label="${escapeHtml(label)}"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttribute}></button>`;
}

function renderImage(alt, rawTarget, title, context) {
  const normalized = normalizeTarget(rawTarget);
  if (normalized.kind !== "relative") return escapeHtml(alt);

  const absolute = path.resolve(path.dirname(context.sourcePath), normalized.value);
  if (!isUnderRoot(absolute, context.root) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    return escapeHtml(alt);
  }

  const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
  return renderLightboxImage(alt, normalized.value, title, context);
}

function renderPlainUrl(text, index) {
  // CJK punctuation and fullwidth forms never belong to a URL and often follow one without a space.
  const match = /^https?:\/\/[^\s<>"'\u3000-\u303f\uff01-\uff65]+/i.exec(text.slice(index));
  if (!match) return null;

  let url = match[0];
  let trailing = "";
  const trailingMatch = /[.,;:!?，。；：！？]+$/.exec(url);
  if (trailingMatch) {
    trailing = trailingMatch[0];
    url = url.slice(0, -trailing.length);
  }
  if (!url) return null;

  return {
    html: `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>${escapeHtml(trailing)}`,
    length: match[0].length,
  };
}

function renderCodeSpan(content, context) {
  const escaped = `<code>${escapeHtml(content)}</code>`;
  if (!context.fileLink) return escaped;
  const href = context.fileLink(content);
  if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return escaped;
  return `<a class="file-link" href="${escapeHtml(href)}" title="打开文件">${escaped}<span class="file-link-icon" aria-hidden="true">↗</span></a>`;
}

export function renderInline(text, context) {
  let output = "";
  let index = 0;

  while (index < text.length) {
    const character = text[index];

    if (character === "`") {
      const end = text.indexOf("`", index + 1);
      if (end !== -1) {
        output += renderCodeSpan(text.slice(index + 1, end), context);
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

    if (character === "h" || character === "H") {
      const url = renderPlainUrl(text, index);
      if (url) {
        output += url.html;
        index += url.length;
        continue;
      }
    }

    output += escapeHtml(character);
    index += 1;
  }

  return output;
}

function isTableSeparator(line) {
  const trimmed = String(line).trim();
  if (!trimmed || !trimmed.includes("|") || !trimmed.includes("-")) return false;
  return /^[\s|:-]+$/.test(trimmed);
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

  if (header.length >= 7 && rows.length) {
    const records = rows
      .map(
        (row) =>
          `<div class="record">${header
            .map(
              (cell, column) =>
                `<div class="record-field"><dt>${renderInline(cell, context)}</dt><dd>${renderInline(row[column] || "", context)}</dd></div>`,
            )
            .join("")}</div>`,
      )
      .join("");
    return { html: `<dl class="record-list">${records}</dl>`, next: index };
  }

  const head = `<thead><tr>${header.map((cell) => `<th>${renderInline(cell, context)}</th>`).join("")}</tr></thead>`;
  const body = rows.length
    ? `<tbody>${rows
        .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell, context)}</td>`).join("")}</tr>`)
        .join("")}</tbody>`
    : "";

  return { html: `<div class="table-wrap"><table>${head}${body}</table></div>`, next: index };
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

export function renderBlocks(lines, context) {
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
      const fenceBody = body.join("\n");
      if (language && language.toLowerCase() === "mermaid") {
        const svg = renderMermaid(fenceBody);
        if (svg) {
          blocks.push(`<figure class="mermaid-figure">${svg}</figure>`);
        } else {
          const note = resolveDocumentLang({ lang: context && context.lang }) === "en"
            ? "Diagram not rendered. Source shown below."
            : "图未渲染，下方为原始源码。";
          blocks.push(
            `<figure class="mermaid-degraded"><figcaption>${escapeHtml(note)}</figcaption><pre><code class="language-mermaid">${escapeHtml(fenceBody)}</code></pre></figure>`
          );
        }
        continue;
      }
      blocks.push(`<pre><code${languageClass}>${escapeHtml(fenceBody)}</code></pre>`);
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
    if (paragraph.length) {
      blocks.push(`<p>${renderInline(paragraph.join(" "), context)}</p>`);
    } else {
      // A line that is a block start but matched no block (e.g. an info string
      // the fence regex rejects) must still consume a line, or the loop stalls.
      blocks.push(`<p>${renderInline(lines[index], context)}</p>`);
      index += 1;
    }
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
    const isCurrent = absolute === fromPath;
    if (!isCurrent && !fs.existsSync(absolute)) {
      return `<span class="queue-nav-unavailable">${escapeHtml(item.label)}（${escapeHtml(unavailable)}）</span>`;
    }
    const current = isCurrent ? ' aria-current="page"' : "";
    return `<a href="${escapeHtml(href)}"${current}>${escapeHtml(item.label)}</a>`;
  });

  return `<nav class="queue-nav" aria-label="文档导航">${links.join('<span class="queue-nav-sep">·</span>')}</nav>`;
}


export function resolveDocumentLang(options = {}) {
  const lang = String(options.lang || "zh").toLowerCase();
  return lang.startsWith("en") ? "en" : "zh";
}


export function renderShell({ title, body, options = {}, generatedAt, sourcePath }) {
  const chrome = baseLabels(options);
  const documentLang = resolveDocumentLang(options);
  const sourceLabel = options.sourceLabel
    ? ` (original: <code>${escapeHtml(options.sourceLabel)}</code>)`
    : "";
  const lightbox = `<dialog id="queue-lightbox" aria-label="${escapeHtml(chrome.lightboxViewer)}" data-default-label="${escapeHtml(chrome.lightboxViewer)}"><div class="lightbox-panel"><button type="button" class="lightbox-close" aria-label="${escapeHtml(chrome.lightboxClose)}">×</button></div></dialog>`;
  return `<!doctype html>
<html lang="${escapeHtml(documentLang)}">
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
<footer>${escapeHtml(options.sourceLabelText || chrome.source)}: <code>${escapeHtml(sourcePath)}</code>${sourceLabel} · ${escapeHtml(options.generatedLabelText || chrome.generated)}: <time datetime="${escapeHtml(generatedAt)}">${escapeHtml(generatedAt)}</time></footer>
</main>
${lightbox}
<script>${LIGHTBOX_SCRIPT}</script>
</body>
</html>
`;
}


export function renderMarkdown(markdown, options = {}) {
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

  const lines = String(markdown).replace(/\r\n?/g, "\n").split("\n");
  const body = renderBlocks(lines, context);
  const titleMatch = /^#{1,6}\s+(.+)$/m.exec(markdown);
  const title = titleMatch ? titleMatch[1] : path.basename(sourcePath).replace(/\.md$/i, "");
  const chrome = baseLabels(options);
  const shellOptions = {
    ...options,
    sourceLabelText: options.sourceLabelText || chrome.source,
    generatedLabelText: options.generatedLabelText || chrome.generated,
  };

  return renderShell({ title, body, options: shellOptions, generatedAt, sourcePath });
}


export function findRepoRoot(startPath) {
  let current = path.dirname(path.resolve(startPath));
  while (true) {
    if (fs.existsSync(path.join(current, ".git"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}


const LIGHTBOX_SCRIPT = `(function(){var d=document.getElementById("queue-lightbox");if(!d||typeof d.showModal!=="function")return;var panel=d.querySelector(".lightbox-panel");var c=d.querySelector(".lightbox-close");function open(t){var p=t.querySelector("img")||t;var i=panel.querySelector("img");if(!i){i=document.createElement("img");panel.appendChild(i);}var alt=p.alt||"";i.src=p.currentSrc||p.src;i.alt=alt;d.setAttribute("aria-label",alt||d.getAttribute("data-default-label")||"");d.showModal();}document.querySelectorAll("button.lightbox-trigger").forEach(function(el){el.addEventListener("click",function(){open(el);});});if(c)c.addEventListener("click",function(){d.close();});d.addEventListener("click",function(e){if(e.target===d)d.close();});})();`;

export function baseLabels(options = {}) {
  const lang = String(options.lang || "zh").toLowerCase();
  const english = lang.startsWith("en");
  const defaults = english
    ? { toc: "On this page", source: "Source", generated: "Generated", lightboxClose: "Close", lightboxEnlarge: "Enlarge image", lightboxViewer: "Enlarged image" }
    : { toc: "本页目录", source: "来源", generated: "生成", lightboxClose: "关闭", lightboxEnlarge: "放大图片", lightboxViewer: "放大后的图片" };
  return { ...defaults, ...(options.labels || {}) };
}

export function writeRenderedFile(sourcePath, options = {}) {
  const absoluteSource = path.resolve(sourcePath);
  const defaultOut = /\.md$/i.test(absoluteSource)
    ? absoluteSource.replace(/\.md$/i, ".html")
    : `${absoluteSource}.html`;
  const outPath = path.resolve(options.outPath || defaultOut);
  if (outPath === absoluteSource) {
    throw new Error(`refusing to overwrite the source file: ${outPath}`);
  }
  const root = path.resolve(options.root || path.dirname(absoluteSource));

  if (!isUnderRoot(outPath, root)) {
    throw new Error(`refusing to write outside the ${options.rootLabel || "root"}: ${outPath}`);
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

  const fileLink = (value) => {
    if (!options.fileRoot) return null;
    const candidate = String(value).trim();
    if (!candidate || /^https?:\/\//i.test(candidate) || /[*?]/.test(candidate)) return null;

    const tiers = [
      [path.dirname(absoluteSource)],
      [root],
      [options.fileRoot],
      [findRepoRoot(absoluteSource)],
      ...(options.extraFileTiers || []).map((tier) => (Array.isArray(tier) ? tier : [tier])),
    ];
    for (const tier of tiers) {
      const matches = new Set(
        tier
          .filter(Boolean)
          .map((base) => path.resolve(base, candidate))
          .filter((candidatePath) => fs.existsSync(candidatePath)),
      );
      if (matches.size === 0) continue;
      if (matches.size > 1) return null;
      const [found] = matches;
      const href = path.relative(path.dirname(outPath), found);
      return href || path.basename(found);
    }
    return null;
  };

  const markdown = fs.readFileSync(absoluteSource, "utf8");
  const render = options.render || renderMarkdown;
  const html = render(markdown, {
    ...options,
    sourcePath: absoluteSource,
    root,
    navHtml,
    fileLink,
  });

  const temporary = `${outPath}.tmp`;
  fs.writeFileSync(temporary, html, "utf8");
  fs.renameSync(temporary, outPath);
  return outPath;
}

export async function main(argv) {
  const sources = [];
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const takeValue = () => {
      index += 1;
      return argv[index];
    };
    if (argument === "--root") options.root = takeValue();
    else if (argument === "--at") options.generatedAt = takeValue();
    else if (argument === "--file-root") options.fileRoot = takeValue();
    else if (argument === "--source-label") options.sourceLabel = takeValue();
    else sources.push(argument);
  }
  if (!sources.length) {
    throw new Error("usage: render-core.mjs <source.md>... [--root <dir>] [--at <iso>] [--file-root <dir>] [--source-label <path>]");
  }
  for (const source of sources) {
    process.stdout.write(`${writeRenderedFile(source, options)}\n`);
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
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}
