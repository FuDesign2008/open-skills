# Tasks

## 1. explain-clearly diagram lead

- [x] 1.1 Add contract assertions that a role-handoff flow leads with a diagram and a comparison table does not satisfy it, then run that test and record the failure
- [x] 1.2 Add those sentences to `skills/explain-clearly/SKILL.md` and re-run the contract test until it passes

## 2. Queue review page

- [x] 2.1 Add a contract test that a done card gets one HTML page under manual, auto, and ai-proxy, an unfinished card gets none, and enqueue shells are not named as writers; run it and record the failure
- [x] 2.2 Add that rule to `skills/goal-driven-queue/SKILL.md` at the done-record step and the verification section, then re-run the test until it passes

## 3. Standalone versus queue child

- [x] 3.1 Add a contract test that standalone `goal-driven-workflow` writes one HTML page at stage 5 and a queue child only supplies the three facts; run it and record the failure
- [x] 3.2 Add that split to `skills/goal-driven-workflow/SKILL.md` and re-run the test until it passes

## 4. Engine reports

- [x] 4.1 Add contract tests that `jira-fix-workflow`, `opsx-jira-fix-workflow`, `opsx-solve-workflow`, and `solve-workflow` include the problem, the cause, and the completed fix when they are queue children, and do not write the HTML; run them and record the failure
- [x] 4.2 Add those report sentences to the four skills and re-run the tests until they pass

## 5. Integration check

- [x] 5.1 Run `npm test` and `openspec validate explain-fix-as-html-flow --strict --type change` and record both results

## Workflow follow-up

- Archive after verification passes and the user confirms archiving.
- Do not commit or open a pull request until asked.
