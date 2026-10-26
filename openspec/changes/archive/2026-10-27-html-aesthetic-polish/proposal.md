## Why

The designed views were functional but read like an admin dashboard: every header wrapped the same pills regardless of value length, long metadata became giant pills, the seven-tile KPI strip broke onto a second row with one orphan tile, the navigation did not show which page the reader was on, document titles showed literal Markdown markers, and the type scale and section rhythm were flat.

## What Changes

- Typography and rhythm: refined heading scale, section padding and gaps, softer internal rules, muted list markers, smaller table type with tracked headers, tabular numerals.
- Header metadata: short values stay pills; long values render as labeled full-width rows with dashed separators.
- Navigation marks the current page and treats it as available even before the file exists.
- Document titles render inline Markdown instead of literal markers.
- KPI strip fits seven tiles in one row; entry link cards gain arrows, mono paths, and anchored path placement.
- Narrow screens stack metadata rows and keep the KPI grid compact.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: navigation marks the current page; designed document headers separate short chips from long labeled rows; document titles render inline Markdown.

## Impact

- `skills/goal-driven-queue/SKILL.md`, `reference.md`, `scripts/render-html.mjs`, `scripts/render-html.test.mjs`, `scripts/human-facing-html-contract.test.mjs`.
- No dependency; no engine template edit; no change to the Markdown source.
