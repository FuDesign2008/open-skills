// Shared renderer bridge: the generic Markdown-to-HTML implementation lives in
// report-output-discipline/scripts/render-core.mjs and is imported here. When
// the discipline skill is not installed this module exposes no-op fallbacks so
// the queue adapter can degrade to printing Markdown paths instead of crashing.
let core = null;
try {
  core = await import("../../report-output-discipline/scripts/render-core.mjs");
} catch {
  core = null;
}

const unavailable = () => {
  throw new Error("shared renderer unavailable: install report-output-discipline");
};

export const {
  baseLabels = () => ({}),
  escapeHtml = (value) => String(value),
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
