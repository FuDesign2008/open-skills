## 1. Templates

- [x] 1.1 Add `renderReviewPage` and `renderEvidencePage`; generate the pages from JSON inputs.

## 2. Contract and tests

- [x] 2.1 Add renderer tests for both templates; run `node --test skills/goal-driven-queue/scripts/render-html.test.mjs`.
- [x] 2.2 Add the single-generator sentences to `SKILL.md` and `reference.md`, and the contract assertions; run `node --test scripts/human-facing-html-contract.test.mjs`.

## 3. Verification

- [x] 3.1 Run `npm test` under Node 22 and `openspec validate goal-queue --strict`.
