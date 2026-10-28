# Design

## Context

See `proposal.md` — Why. Human-facing HTML is produced solely by `skills/goal-driven-queue/scripts/render-html.mjs`. Images come from `renderImage` (Markdown) and `renderEvidencePage` (figures). The shell currently injects inline CSS only. The `goal-queue` delta now allows one renderer-owned inline script for a single-image lightbox while keeping external assets forbidden.

## Goals / Non-Goals

**Goals**

- Click (or keyboard-activate) any renderer-emitted local `<img>` to enlarge it in a modal lightbox.
- Dismiss via backdrop, Escape, and a labeled close control.
- Keep `file://` / offline usable; no CDN or npm runtime deps.
- Preserve escaping: Markdown/`<script>` in source stays text.

**Non-Goals**

- Multi-image gallery navigation, pinch-zoom, download buttons.
- Changing queue dispatch, MR, or acceptance semantics.
- Hand-written HTML outside the renderer.

## Decisions

1. **Native `<dialog showModal()>`** over a custom overlay div — browser supplies Escape, top-layer, backdrop, and focus handling (aligned with web.dev / WAI H102).
2. **One shared dialog in `renderShell`** + delegated click on images marked `data-lightbox` — avoids N dialogs per page; Markdown and evidence paths share one code path.
3. **Mark lightboxable images at emit time** (`renderImage` / evidence figure `<img>`) rather than binding every `<img>` — decorative or future non-content images stay out.
4. **Cursor `zoom-in` + button-like activation** — visual affordance from the freeze; prefer wrapping or role that keeps keyboard reachable without rewriting Markdown alt text.
5. **Update the self-containment test** to forbid external `<script src>` / stylesheets while allowing the renderer-owned inline lightbox script; keep the escaped-user-`<script>` test unchanged.
6. **Thin `reference.md` update** — note that self-contained pages may include the lightbox inline script; theme/nav still need no script.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Spec/tests assumed “no `<script>` at all” | MODIFIED delta + update self-containment assertions |
| Backdrop click closes when clicking the image | Close only when `event.target === dialog` |
| Keyboard users cannot open | Make the image control activatable (button wrap or equivalent) |
| Old browsers without `<dialog>` | Acceptable for local review HTML; no polyfill (YAGNI) |

## Migration Plan

None. Regenerated HTML picks up the behavior on next render; committed `.md` sources unchanged.

## Open Questions

None — freeze covers scope, interaction tier, and vanilla inline implementation.
