## Why

`goal-driven-batch` can already dispatch `jira-fix-workflow` and `opsx-jira-fix-workflow` as queue children, but `jira-fix-batch` / `opsx-jira-fix-batch` still own a second, session-scoped orchestration loop (loop the engine, optional merge/writeback). That duplicates relationship/serial/progress logic, contradicts the queue's merge-is-human red line, and leaves routing text pointing both ways (queue description says Do NOT use for Jira multi-issue; Engine field includes those engines). Users now want every multi-issue Jira list to enqueue, confirm, then run — not to fix in-session to merge.

## What Changes

- **BREAKING** (`jira-fix-batch` / `opsx-jira-fix-batch`): they become **thin trigger shells**. They parse Jira IDs/URLs and invoke `goal-driven-batch`'s Jira list-enqueue shortcut with Engine frozen. They MUST NOT loop engines, write `.jira-fix/` progress files, start consumption, or merge.
- **`goal-driven-batch` Jira list-enqueue shortcut**: one interaction-budget ticket for the whole list; Engine frozen by the caller; one card per issue; one batch approval event; approval is not run-start. Analysis fog defers to the child per `Stage-exit policy`.
- **Relationship pass** gains **derived**; still MUST NOT share one branch or one OpenSpec change across two in-progress cards. Duplicate/equivalent → `skipped (covered)`. opsx-jira children receive relationship notes in the card supply so they write `Related Issues` in `design.md`.
- **Routing**: queue description no longer excludes Jira multi-issue; single-issue hosts still point batch triggers at the shells (which enqueue).

## Capabilities

### New Capabilities
- (none — shells stay trigger skills; their contract lives as a `goal-queue` requirement)

### Modified Capabilities
- `goal-queue`: Jira list-enqueue shortcut; derived relationship type; no shared change/branch; trigger-shell contract; routing Do-NOT-use rewrite.

## Impact

`skills/jira-fix-batch/` 2.0.0, `skills/opsx-jira-fix-batch/` 2.0.0, `skills/goal-driven-batch/` 0.12.0 (+ reference + evals), `jira-fix-workflow` / `opsx-jira-fix-workflow` Batch pointers, `workflow-mode-lifecycle` example, `AGENTS.md` rows, skills index.
