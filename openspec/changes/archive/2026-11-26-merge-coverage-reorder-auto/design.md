## Context

`merge-discipline` ran coverage before PR review. A coverage pause could move `origin/<source>` after Part R had already passed, and Part D then pinned whatever `origin/<source>` was at merge time. `coverage-gate` was only `always` | `never` | `ask`, with unset ≡ `ask`. `feature-branch-closeout`'s spec omitted Part R from the merge order.

## Goals / Non-Goals

**Goals**

- One execution order: sheet → A → B → R → C → D → merge.
- Every Part R satisfaction exit records `tip=<full sha of origin/<source> at exit>`.
- Part D starts only when that tip still matches tracking, platform head, and the local branch when it exists.
- `coverage-gate: auto` decides run versus skip from verifiable surface, line/file, breaking, and sensitive signals.

**Non-Goals**

- No change to `pr-review-gate` unset ≡ `auto`, dual-axis clearance, or the 3-round cap.
- No change to this repo's own line `coverage-gate: never`.
- Hosts keep a one-line order pointer. They do not copy the four-cell or the tip check.

## Decisions

### D1. Review before coverage

Part R's successor is Part C. Part C's continue path is the tip check, then Part D. A fail in Part R blocks Part C. After rebase in the same attempt, continue R → C → D and reuse sheet answers. Pausing to wait for CI ends the attempt; the next merge starts at Part A.

### D2. Tip 留痕 is a full SHA, not a label

Clean pass, user skip, accept-residual, and `never` each write `tip=` from `origin/<source>` at that exit. The clean-pass sentence is fixed: `【PR code-review 门控通过】tip=<sha>。时间：<ISO>。PR：<id>。depth=<light|full>。`

### D3. Tip check is fail-closed

Inputs are commands and the 留痕 string: `tip=` present, `git fetch origin <source>`, then `T_trace` = `T_tracking` = `T_pr` = `T_local` when `refs/heads/<source>` exists. Any miss or mismatch does not enter Part D and starts a new attempt from Part A. Part D pins `T_trace`. The analyzer does not commit, so a user push during a coverage pause is visible to this check.

### D4. `auto` is four cells, unset stays `ask`

Regex: `coverage-gate:\s*(always|never|ask|auto)\b`. No match ⇒ `ask`.

| Surface | Scale/risk hit | Action |
|---|---|---|
| non-application-code, or empty paths (`changed-paths=0` and classify succeeded) | no | auto-skip 留痕 (surface, lines, files, flags) |
| non-application-code or empty | yes | run |
| application-code | no or yes | run |
| classify or path listing failed | — | run |

Scale/risk hit = lines > 400, files > 20, breaking regex, or the sensitive table. Post-fail re-entry is Part R depth only and is not a coverage hit. Should-run includes `auto` when the cell says run. Auto-skip is not an implicit miss.

### D5. Iron law 9

Order phrases and `coverage-gate` enum mentions were updated in `merge-discipline`, `workflow-contract-sync`, and `feature-branch-closeout` specs, plus the thin host pointers. `pr-review-gate` unset ≡ `auto` and `worktree-gate` unset ≡ `ask` stay as they are.
