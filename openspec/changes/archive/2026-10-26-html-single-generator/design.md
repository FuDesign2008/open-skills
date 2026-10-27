## Context

The queue renderer already generates the Markdown views. The review and evidence pages were the last hand-written HTML surfaces; they should use the same generator.

## Goals / Non-Goals

**Goals:**

- One HTML generator for every human-facing page.
- Markdown for records; small JSON for review/evidence templates.
- No hand-written HTML; no duplicated authoring tokens.

**Non-Goals:**

- Changing the Markdown record format.
- A documentation site or runtime server.
- Backfilling old pages.

## Decisions

- `renderReviewPage(data)` renders the problem/cause/fix callouts and the evidence link from JSON.
- `renderEvidencePage(data)` renders groups of image items or command/output items; an item without an image never gets one.
- Both use the shared shell, CSS, navigation, and language rules.
- The dispatcher writes `review.json` and `evidence.json`, then runs the renderer. It never writes HTML.

## Risks / Trade-offs

- [A JSON input omits a field] → The renderer omits the empty section rather than inventing content.
- [A hand-written page returns] → The skill text and contract test forbid it.

## Migration Plan

No backfill. New runs generate the pages; old runs can be regenerated. Rollback is reverting the renderer and skill text.

## Open Questions

None.
