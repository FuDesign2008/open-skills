#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

const CSS = `
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; line-height: 1.6; }
main { max-width: 980px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
h1, h2, h3, h4, h5, h6 { line-height: 1.25; margin: 1.6em 0 0.6em; }
h1:first-child { margin-top: 0; }
code { background: rgba(127, 127, 127, 0.16); padding: 0.1em 0.3em; border-radius: 4px; font-size: 0.92em; }
pre { background: rgba(127, 127, 127, 0.12); padding: 1rem; overflow: auto; border-radius: 8px; }
pre code { background: none; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
th, td { border: 1px solid rgba(127, 127, 127, 0.35); padding: 0.4rem 0.6rem; text-align: left; vertical-align: top; }
blockquote { margin: 1rem 0; padding: 0.25rem 1rem; border-left: 4px solid rgba(127, 127, 127, 0.4); }
footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid rgba(127, 127, 127, 0.3); font-size: 0.85rem; opacity: 0.8; }
img { max-width: 100%; height: auto; }
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
  const sourceLabel = options.sourceLabel
    ? ` (original: <code>${escapeHtml(options.sourceLabel)}</code>)`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${CSS}</style>
</head>
<body>
<main>
${body}
<footer>${escapeHtml(options.sourceLabelText || "Source")}: <code>${escapeHtml(sourcePath)}</code>${sourceLabel} · ${escapeHtml(options.generatedLabelText || "Generated")}: <time datetime="${escapeHtml(generatedAt)}">${escapeHtml(generatedAt)}</time></footer>
</main>
</body>
</html>
`;
}

export function renderFile(sourcePath, options = {}) {
  const absoluteSource = path.resolve(sourcePath);
  const outPath = path.resolve(options.outPath || absoluteSource.replace(/\.md$/i, ".html"));
  const root = path.resolve(options.root || path.dirname(absoluteSource));

  if (!isUnderRoot(outPath, root)) {
    throw new Error(`refusing to write outside the queue root: ${outPath}`);
  }

  const markdown = fs.readFileSync(absoluteSource, "utf8");
  const html = renderMarkdown(markdown, {
    ...options,
    sourcePath: absoluteSource,
    root,
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
      return `<li>${escapeHtml(label)}: <em>${escapeHtml(labels.unavailable)}</em></li>`;
    }
    return `<li>${escapeHtml(label)}: <a href="${escapeHtml(target.href)}">${escapeHtml(value)}</a></li>`;
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

  const body = `<h1>${escapeHtml(title)} — ${escapeHtml(options.batchId || "batch")}</h1>
<ul>${link(labels.progress, options.progressPath)}${link(labels.triage, options.triagePath)}${link(labels.content, options.contentPath)}${cardLinks}</ul>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — ${escapeHtml(options.batchId || "batch")}</title>
<style>${CSS}</style>
</head>
<body>
<main>
${body}
<footer>${escapeHtml(options.generatedLabelText || "Generated")}: <time datetime="${escapeHtml(generatedAt)}">${escapeHtml(generatedAt)}</time></footer>
</main>
</body>
</html>
`;
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
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const takeValue = () => {
      index += 1;
      return argv[index];
    };

    if (argument === "--root") options.root = takeValue();
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
