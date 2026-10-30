// Queue page templates: the acceptance entry page, the per-card review page,
// and the evidence page. These take queue JSON/Markdown inputs and delegate
// generic rendering primitives to the shared core through core-bridge.
import fs from "node:fs";
import path from "node:path";
import {
  escapeHtml,
  isUnderRoot,
  normalizeTarget,
  renderBlocks,
  renderInline,
  renderLightboxImage,
  renderShell,
} from "./core-bridge.mjs";
import { shellOptionsFor } from "./queue-labels.mjs";
import { renderKpiRow } from "./queue-document.mjs";

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
  const { chrome, shellOptions } = shellOptionsFor(options);
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
  const { chrome, shellOptions } = shellOptionsFor(options);
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
  return renderShell({ title, body, options: shellOptions, generatedAt, sourcePath: context.sourcePath });
}

export function renderEvidencePage(data = {}, options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const { chrome, shellOptions } = shellOptionsFor(options);
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
  return renderShell({
    title,
    body,
    options: shellOptions,
    generatedAt,
    sourcePath: options.sourcePath || "evidence.html",
  });
}
