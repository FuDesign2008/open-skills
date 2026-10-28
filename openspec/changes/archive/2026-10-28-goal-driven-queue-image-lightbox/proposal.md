# Proposal

## Why

Human-facing HTML views from `goal-driven-queue` already embed local evidence and Markdown images, but clicks do nothing. Reviewers need a single-image lightbox (enlarge, then dismiss) that still works offline under `file://` with no new runtime dependencies.

## What Changes

- Generated HTML pages that contain renderer-emitted images SHALL open a single-image lightbox on click (Markdown images and evidence-page figures).
- Closing SHALL work via backdrop click, Escape, and an explicit close control.
- The renderer MAY emit one controlled inline `<script>` (and matching CSS) owned by the shell for that lightbox; user/Markdown content that looks like `<script>` SHALL still be escaped.
- External stylesheets, scripts, fonts, images, and `@import` remain forbidden.
- No gallery next/prev, pinch-zoom, or third-party lightbox library.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `goal-queue`: extend the human-facing HTML self-containment contract to allow a renderer-owned inline lightbox script; add a requirement that rendered images support single-image lightbox open/close behavior.

## Impact

- Code: `skills/goal-driven-queue/scripts/render-html.mjs` (`renderShell`, `renderImage`, `renderEvidencePage`, CSS) and `render-html.test.mjs`.
- Docs: thin note in `skills/goal-driven-queue/reference.md` § Human-Facing HTML Views (self-containment + lightbox).
- Spec: `openspec/specs/goal-queue/spec.md` requirement text and self-containment scenario.
- No queue consumption, engine, or MR-merge behavior changes; no new npm dependencies.
