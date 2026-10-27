## Context

The renderer turns Markdown tables into HTML tables with `width: 100%`. A table's used width cannot go below its minimum content width, so a nine-column table overflowed the section card and each column collapsed to its longest unbreakable fragment. Wrapping the table in a scroll container contains the overflow but leaves the row extremely tall. The reading column is roughly 700px wide.

## Goals / Non-Goals

**Goals:**

- Wide rows stay readable without horizontal scrolling.
- Narrow tables stay tables, keep their headers, and cannot overflow the card.
- No change to the Markdown source; the HTML stays self-contained.

**Non-Goals:**

- A configurable table mode per document.
- Reworking narrow tables into cards.
- Editing old Markdown records.

## Decisions

- Threshold is seven columns: six columns at the 6.5rem minimum still fit the reading column; seven or more cannot. The threshold is a single constant in `renderTable`.
- Wide tables render as `<dl class="record-list">` with one `.record` per row and one `.record-field` per column holding `<dt>` (header label) and `<dd>` (value). A definition list keeps the label/value relationship in the accessibility tree, unlike a CSS-only table-to-block transformation.
- Values are rendered with the same `renderInline` path as table cells, so links, code spans, and file links keep working.
- Narrower tables keep `<table>` and gain a `.table-wrap` scroll container. Cells get a 6.5rem minimum width, the last column 12rem, and `overflow-wrap: anywhere` so a long URL cannot force the column wide.
- Print removes the scroll container, drops minimum widths, and shrinks table text so the table fits the page.

## Risks / Trade-offs

- [A seven-column table with many short rows becomes tall records] → Each row is a labeled card; the structure is still scannable, and the reading column never scrolls sideways.
- [A narrow table has a very long unbreakable value] → The scroll container contains it inside the card; print shrinks it to the page.
- [The threshold is wrong for some fonts or widths] → It is a single constant next to the table renderer and covered by a renderer test.

## Migration Plan

No backfill required. Regenerate existing views to pick up the new layout. Rollback is reverting the renderer and reference text.

## Open Questions

None.
