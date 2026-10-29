#!/usr/bin/env node
// Queue adapter facade. Queue-specific rendering lives in queue-document.mjs,
// queue-pages.mjs, queue-labels.mjs, and queue-open.mjs; the generic
// Markdown-to-HTML implementation lives in report-output-discipline's
// render-core.mjs and is reached through core-bridge.mjs.
import fs from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { renderNav } from "./core-bridge.mjs";
import { renderDocument, renderFile } from "./queue-document.mjs";
import { renderEntryPage, renderReviewPage, renderEvidencePage } from "./queue-pages.mjs";
import { readTrigger, openInBrowser, maybeAutoOpen } from "./queue-open.mjs";

// Hosts load this adapter by path and build review/evidence navigation with
// renderNav, so it stays part of the adapter's public surface.
export {
  renderNav,
  renderDocument,
  renderFile,
  renderEntryPage,
  renderReviewPage,
  renderEvidencePage,
  readTrigger,
  openInBrowser,
  maybeAutoOpen,
};

const VALUE_FLAGS = new Set([
  "--root",
  "--at",
  "--file-root",
  "--source-label",
  "--open",
  "--auto-open",
  "--progress",
  "--kind",
  "--nav",
  "--nav-root",
  "--unavailable",
]);

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
      const argv = process.argv.slice(2);
      const sources = [];
      for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (VALUE_FLAGS.has(argument)) { index += 1; continue; }
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
