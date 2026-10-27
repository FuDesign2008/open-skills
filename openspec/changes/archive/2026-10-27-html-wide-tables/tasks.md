## 1. Renderer

- [x] 1.1 Add failing renderer tests for the table scroll container and for wide tables rendering as labeled record cards.
- [x] 1.2 Render tables with seven or more columns as `dl.record-list` records; wrap narrower tables in `.table-wrap` with minimum column widths.
- [x] 1.3 Add the record-card styles, the scroll-container styles, and the print rules.

## 2. Documentation and verification

- [x] 2.1 Describe the wide-table fallback and the narrow-table scroll container in `reference.md`.
- [x] 2.2 Run `npm test` under Node 22, `openspec validate` for this change, and regenerate the acceptance views.
