## Context

The renderer already writes self-contained HTML views and an entry page. Only the entry page links to the other views; the card, triage, progress, verification content, report, review, and evidence pages do not link back.

## Goals / Non-Goals

**Goals:**

- A shared navigation block on every covered HTML view.
- One manifest as the source of labels and target paths.
- Relative links that work offline; missing targets marked unavailable.
- No script and no external asset.

**Non-Goals:**

- A documentation site, search, or a runtime server.
- Backfilling old batches.
- Editing agent-only files beyond the skill text and spec.

## Decisions

- The dispatcher writes one manifest `{ "items": [{ "label": "...", "path": "..." }] }` with paths relative to the workspace root.
- `renderNav(items, { fromPath, root })` resolves each target and computes a relative href from the current page; a missing target becomes `label（unavailable）`.
- `renderFile` accepts `nav`/`navManifest`, `navRoot`, and `unavailableLabel`; it injects the block before the page body. The CLI exposes `--nav`, `--nav-root`, and `--unavailable`.
- The entry page keeps its link list as the hub; every other view gets the same navigation block.
- Hand-written review and evidence pages receive the same block via `renderNav`.
- Labels and hrefs are escaped; the block contains no script and no external asset.

## Risks / Trade-offs

- [The manifest goes stale] → The block marks missing targets unavailable instead of linking to nothing.
- [A path escapes the workspace] → Paths are resolved under the nav root; the block uses relative hrefs only.
- [A label is untranslated] → The manifest supplies labels in the human's language.

## Migration Plan

No backfill. New runs carry the block; old batches can be regenerated on demand. Rollback is reverting the renderer and skill text.

## Open Questions

None.
