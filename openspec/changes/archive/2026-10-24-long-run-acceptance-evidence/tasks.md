## 1. explain-clearly evidence link

- [x] 1.1 Add contract assertions that a caller who fixes HTML and supplies an evidence-page path gets one link after the visual, and a caller who supplies no path gets no evidence link; run `node --test scripts/explain-clearly-contract.test.mjs` and record the failure
- [x] 1.2 Add those sentences to `skills/explain-clearly/SKILL.md` and re-run that test until it passes

## 2. Queue evidence page

- [x] 2.1 Add contract assertions that a done card gets `evidence/<card>.html` titled 证据留痕, images are copied beside it and referenced by a relative path, a missing image stays pending with no invented image, a non-UI check has no image, the card slug has no path separator, `verification.md` records the path, the review page links to it, and an unfinished card and the enqueue shells do not write it; run `node --test scripts/review-html-flow-contract.test.mjs` and record the failure
- [x] 2.2 Add that record-step rule to `skills/goal-driven-queue/SKILL.md` and the verification-document template in `skills/goal-driven-queue/reference.md`, then re-run that test until it passes

## 3. Standalone versus queue child

- [x] 3.1 Add contract assertions that a standalone `goal-driven-workflow` writes `.goal-driven/runs/<local-YYYYMMDD-HHmm>/evidence.html` at stage 5 without overwriting an existing directory, and a queue child supplies the evidence list and writes neither HTML page; run `node --test scripts/review-html-flow-contract.test.mjs` and record the failure
- [x] 3.2 Add that split to `skills/goal-driven-workflow/SKILL.md` and record the evidence path on the stage-5 report template in `skills/goal-driven-workflow/reference.md`, then re-run that test until it passes

## 4. Engine reports

- [x] 4.1 Add contract assertions that `jira-fix-workflow`, `opsx-jira-fix-workflow`, `opsx-solve-workflow`, and `solve-workflow` include the evidence list when they are queue children, and write neither the review HTML nor the evidence HTML; run `node --test scripts/review-html-flow-contract.test.mjs` and record the failure
- [x] 4.2 Add those report sentences to the four skills and re-run that test until it passes

## 5. Integration check

- [x] 5.1 Run `npm test` and `openspec validate long-run-acceptance-evidence --strict --type change` and record both results
