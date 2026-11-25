## Why

Merge order ran coverage before PR review, so a coverage pause could move the tip after review had already passed, and `coverage-gate` had no verifiable `auto` value. Projects that are mostly Markdown still had to choose `never` or be asked every merge.

## What Changes

- Execution order becomes merge decision sheet → A → B → R → C → D → merge. After a rebase in the same attempt, continue R → C → D and reuse the sheet. A later merge after a CI wait starts again from Part A.
- Part R's next part is Part C. Part C continue goes to a fail-closed tip check, then Part D.
- Every Part R satisfaction exit (clean pass, user skip, accept-residual, `never`) writes 留痕 that includes `tip=<full sha of origin/<source> at exit>`. Clean pass uses `【PR code-review 门控通过】tip=<sha>。时间：<ISO>。PR：<id>。depth=<light|full>。`
- Before Part D: the latest satisfaction 留痕 must contain `tip=`; `git fetch origin <source>`; `T_trace`, `T_tracking`, `T_pr`, and `T_local` when `refs/heads/<source>` exists must all equal `T_trace`. Otherwise do not enter Part D; start a new attempt from Part A. Part D pins that SHA. The coverage analyzer stays read-only, so tests added during a Part C pause that move the tip fail this check.
- `coverage-gate` accepts `always` | `never` | `ask` | `auto`. Unset remains `ask`, not `auto`. `auto` uses the non-application-code surface table plus the scale/risk ladder without the post-fail re-entry signal. Non-application-code or empty paths (`changed-paths=0` with a successful classify) and no hit → auto-skip 留痕. Any hit, any application-code diff, or a classify/command failure → run. Auto-skip is not an implicit miss. Should-run includes `auto` when the cell says run.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `merge-discipline`: order A→B→R→C→D, Part R tip 留痕, fail-closed tip check before Part D, `coverage-gate: auto` four-cell.
- `workflow-contract-sync`: preference enum includes `auto`; unset ≡ `ask`; should-run includes auto→run; checklist names auto-skip; auto-skip is not an implicit miss.
- `feature-branch-closeout`: merge pointer is A→B→R→C→D, including the spec line that previously omitted Part R.

## Impact

- `skills/merge-discipline/SKILL.md` (1.11.0), `reference.md`, `evals/evals.json`.
- Thin order pointers in `feature-branch-closeout`, `jira-fix-workflow`, `opsx-solve-workflow`, `opsx-jira-fix-workflow`.
- `AGENTS.md` documents `coverage-gate: always | never | ask | auto` and unset ≡ `ask`. This repo keeps `coverage-gate: never`.
- Main specs under `openspec/specs/` for the three capabilities above are updated in the same change.
