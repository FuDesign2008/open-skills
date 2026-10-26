## 1. Designed document renderer

- [x] 1.1 Add `parseDocument`/`renderDocument` with the document header, metadata chips, table of contents, section cards, pills, KPI tiles, callouts, timeline, verdict card, condition/field cards, and `--kind`.

## 2. Dashboard entry page

- [x] 2.1 Redesign `renderEntryPage` with a status KPI strip and a grid of link cards.

## 3. Contract and tests

- [x] 3.1 Add renderer tests for the designed verification and progress views; run `node --test skills/goal-driven-queue/scripts/render-html.test.mjs`.
- [x] 3.2 Add the design sentences to `SKILL.md` and `reference.md`, and the contract assertions; run `node --test scripts/human-facing-html-contract.test.mjs`.

## 4. Verification

- [x] 4.1 Run `npm test` under Node 22 and `openspec validate goal-queue --strict`.
