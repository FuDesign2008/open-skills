# Tasks

## 1. Renderer lightbox shell

- [x] 1.1 Add lightbox CSS (`dialog`, `::backdrop`, zoom-in cursor, close control) to the shared `CSS` constant in `skills/goal-driven-queue/scripts/render-html.mjs`
- [x] 1.2 Extend `renderShell` with one shared `<dialog>` plus renderer-owned inline script: open on activatable `data-lightbox` images, close on backdrop / Escape / close button; no external assets
- [x] 1.3 Update `renderImage` so local relative images are lightbox-activatable (mark + keyboard-reachable control) without changing alt/src escaping
- [x] 1.4 Update `renderEvidencePage` figure images the same way as Markdown images

## 2. Docs and contract sync

- [x] 2.1 Thin-update `skills/goal-driven-queue/reference.md` § Human-Facing HTML Views: self-contained pages may include the renderer-owned inline lightbox script; theme/nav still need no script

## 3. Tests

- [x] 3.1 Adjust self-containment tests to allow the renderer-owned inline lightbox script while still forbidding external `<script src>`, stylesheets, `@import`, and remote `src`
- [x] 3.2 Keep user-content `<script>` escaping coverage (source text must not become an executable tag)
- [x] 3.3 Add tests: Markdown image and evidence figure emit lightbox affordance; shell includes dialog + inline script; no-image pages still render without requiring lightbox interaction
- [x] 3.4 Run `node --test skills/goal-driven-queue/scripts/render-html.test.mjs` and fix failures

## 4. Verification

- [x] 4.1 Run `openspec validate goal-driven-queue-image-lightbox --strict`
- [x] 4.2 Spot-check generated HTML in a local file open (optional): click image → lightbox; Esc / backdrop / close dismiss
