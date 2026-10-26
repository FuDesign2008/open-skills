## Why

The generated HTML views were a direct Markdown translation: paragraphs, tables, and lists dumped into a generic page. They did not use HTML's layout, hierarchy, or visual affordances to make the record easier to scan and understand than the Markdown source.

## What Changes

- HTML views become designed reading documents: a document header with metadata chips, a section table of contents, section cards, status pills, KPI tiles when counts exist, callouts for problem/cause/fix, a timeline for events, and a verdict card for the acceptance decision.
- A `--kind card|triage|progress|verification|report` option selects the document-specific presentation.
- The entry page becomes a dashboard with a status KPI strip and a grid of link cards.
- The Markdown file remains canonical; HTML is the designed reading view.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: human-facing HTML views are designed reading documents with document-specific structure, not a line-by-line Markdown translation.

## Impact

- `skills/goal-driven-queue/SKILL.md`, `reference.md`, `scripts/render-html.mjs`, `scripts/render-html.test.mjs`, `scripts/human-facing-html-contract.test.mjs`.
- No dependency; no engine template edit.
