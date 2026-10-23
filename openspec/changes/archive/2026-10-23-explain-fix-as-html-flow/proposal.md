## Why

A role-handoff flow explained as prose plus a comparison table does not show who acts in what order. Review of a finished fix needs that order on a page. Queue acceptance and a standalone goal run do not produce an explain-clearly HTML page today.

## What Changes

- `explain-clearly`: when the subject is a role-handoff flow, the diagram is the explanation. Roles are visually distinct, arrows show order, and the handed-off items are on the diagram. A comparison table does not satisfy a flow. A concept with no such shape still gets no forced diagram. An ordinary explanation still asks for a form when none was named.
- `goal-driven-queue`: each completed card gets one HTML flow page under every stage-exit policy (`manual`, `auto`, `ai-proxy`). Five completed cards produce five files. The acceptance package records each path. The page follows `explain-clearly` with the form fixed to HTML, so the run does not ask which form to use. The child report supplies the problem, the cause, and the completed fix. Enqueue shells do not write a page.
- `goal-driven-workflow`: a standalone run writes one such page at stage 5. A queue child supplies the three facts and does not write a second page.
- Queue-child engines that already have a spec (`jira-fix-workflow`, `opsx-jira-fix-workflow`, `opsx-solve-workflow`) include those three facts in the completion report and do not write the HTML.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `explain-clearly`: a role-handoff flow must be drawn as the explanation; a comparison table does not replace that diagram.
- `goal-queue`: each completed card gets one fixed-HTML flow page, linked from the acceptance package, for every stage-exit policy.
- `goal-run`: standalone stage 5 writes that page; a queue child only supplies the three facts.
- `jira-fix-workflow`: a queue-child completion report includes the problem, the cause, and the completed fix, and does not write the HTML.
- `opsx-jira-fix-workflow`: same report obligation as `jira-fix-workflow`.
- `opsx-solve-workflow`: same report obligation when the run is a queue child.

## Impact

- Skill text: `skills/explain-clearly/`, `skills/goal-driven-queue/`, `skills/goal-driven-workflow/`, `skills/jira-fix-workflow/`, `skills/opsx-jira-fix-workflow/`, `skills/opsx-solve-workflow/`. `solve-workflow` has no spec; its queue-child report gets the same three facts in skill text only.
- Contract tests that lock the new sentences.
- No new runtime service. The HTML files are review artifacts under `.explain-clearly/`.
