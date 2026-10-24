## Why

A finished long run already explains the problem, the cause, and the completed fix, but the acceptance package does not show the screenshots and command records from that run. A pass claim may cite an image path while the reviewer still cannot see the image.

## What Changes

- For every completed queue card, the dispatcher writes one evidence HTML page titled 证据留痕 under that batch's `evidence/` directory, copies non-empty screenshots next to it, and shows command records for checks that did not open a UI. The page does not invent an image.
- The card's `verification.md` section records that page's path. The existing review HTML keeps the explanation and adds one link to the evidence page after the visual.
- A standalone long run writes the same kind of page at stage 5 and records its path on the completion report. A queue child supplies the evidence list in its completion report and does not write either HTML page.
- A card that is not done gets no evidence page. An enqueue shell does not write one.
- Missing or empty images stay pending on the page. Copied images use relative paths, so the page still opens after the child worktree is gone.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: the acceptance package and the per-card verification section include one evidence HTML page per completed card; the review HTML links to it.
- `goal-run`: a standalone run writes that evidence page; a queue child adds the evidence list to its report and writes neither HTML page.
- `explain-clearly`: a fixed-form review page may append one evidence link after the visual. An ordinary explanation does not.
- `jira-fix-workflow`: a queue-child report includes the evidence list and does not write the review HTML or the evidence HTML.
- `opsx-jira-fix-workflow`: same report obligation as `jira-fix-workflow`.
- `opsx-solve-workflow`: same report obligation as `jira-fix-workflow`.

## Impact

- Skill text: `skills/goal-driven-queue/`, `skills/goal-driven-workflow/`, `skills/explain-clearly/`, `skills/jira-fix-workflow/`, `skills/opsx-jira-fix-workflow/`, `skills/opsx-solve-workflow/`. `solve-workflow` has no spec; its queue-child report gets the same evidence list in skill text only.
- Contract test `scripts/review-html-flow-contract.test.mjs`.
- No new runtime service. Evidence files live in the acceptance directory for a queue, and under `.goal-driven/runs/<local-YYYYMMDD-HHmm>/` for a standalone run. They are not written into `.explain-clearly/`.
