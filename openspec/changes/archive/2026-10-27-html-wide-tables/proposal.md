## Why

Human-facing records contain wide tables. The progress view's overview table has nine columns carrying slugs, branch names, file paths, and a prose note. In the narrow reading column the table's minimum content width exceeded the section card, so the table overflowed the card border and its columns were squeezed into vertical strips. Containing the overflow alone still leaves one row hundreds of pixels tall, so the row stays hard to read.

## What Changes

- Tables with seven or more columns render as labeled record cards (definition list of field/value pairs) instead of table columns.
- Tables with fewer columns render as tables inside a horizontal scroll container with minimum column widths, so a long value cannot burst out of the card.
- Print keeps tables inside the page width.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: wide tables in human-facing HTML views render as labeled record cards; narrower tables stay tables and scroll horizontally inside their card.

## Impact

- `skills/goal-driven-queue/reference.md`, `scripts/render-html.mjs`, `scripts/render-html.test.mjs`.
- No dependency; no engine template edit; no change to the Markdown source.
