## Context

The renderer parsed Markdown into a generic HTML shell. The output was correct but visually flat and did not exploit HTML for reading. The Markdown file is the canonical record; the HTML view is the human reading surface.

## Goals / Non-Goals

**Goals:**

- A designed page shell with a document header, metadata chips, section table of contents, and section cards.
- Document-specific presentation: status pills, KPI tiles, callouts, timeline, verdict card, condition/field cards.
- A dashboard entry page with a KPI strip and link cards.
- Self-contained output, no script, no external asset.

**Non-Goals:**

- A documentation site, search, or runtime server.
- Editing the Markdown source.
- Backfilling old batches.

## Decisions

- `parseDocument` splits the source into a title, leading metadata, an optional overview section, and `##` sections. `renderDocument` renders the designed shell; `renderMarkdown` remains the generic fallback.
- `--kind` selects the presentation: `card`, `triage`, `progress`, `verification`, `report`.
- Metadata values render as chips; status values become pills. KPI tiles are derived from the verification counts or the progress table. Section titles map to callouts for problem/cause/fix. `关键事件` renders as a timeline. The verification card's `裁决` line renders as a verdict card. The task card's `目标条件` renders as condition cards; its card detail and acceptance summary render as field cards.
- The entry page is a dashboard: header, KPI strip, and a grid of link cards for every view.
- The page stays self-contained: inline CSS variables for light/dark, no script, no external asset.

## Risks / Trade-offs

- [A document's section titles change and lose a special layout] → The generic section card remains readable; the special layouts are progressive enhancements.
- [A KPI value cannot be derived] → The KPI strip is omitted rather than invented.
- [The designed view drifts from the Markdown] → The Markdown remains canonical; the renderer is deterministic and tested.

## Migration Plan

No backfill. New runs render the designed views; old batches can be regenerated on demand. Rollback is reverting the renderer and skill text.

## Open Questions

None.
