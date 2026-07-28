## Context

`merge-discipline` is the single merge entrypoint for opsx/jira workflows and for direct user "merge MR" commands. It previously ran rebase → coverage → tip (then Parts A→B→C). OpenSpec archive-before-merge was only documented in workflow stage 8, so direct merges skipped it. Tip-pinning Strategy B also endorsed a separate post-merge archive MR.

## Goals / Non-Goals

**Goals**
- Association-aware OpenSpec archive gate as Part A, before Parts B–D
- Direct merge commands must run the gate (no implicit skip)
- Strategy B demoted to recovery-only with 留痕
- Thin sync of workflow pointers / checklists
- Letter-consistent part IDs: **A → B → C → D** (no numeric Part 0)

**Non-Goals**
- Blocking merge when no associated active OpenSpec change (scope A)
- Changing coverage or tip-pinning mechanics beyond order/wording
- Automating `openspec archive` inside merge-discipline (gate blocks and tells agent/user to archive first; archive stays via `openspec-archive-change`)

## Decisions

1. **New Part A — OpenSpec archive association gate**, ordered **A → B → C → D → merge** (former A/B/C shifted to B/C/D). Runs first so agents do not rebase/CI-churn before discovering archive is required.
2. **Association = (diff has active `openspec/changes/<name>/`) OR (session-bound name in `openspec list`)**. Either hit is enough.
3. **Pass-through** when not associated — zero friction for ordinary PRs.
4. **Strategy B**: keep for accidental-merge recovery only; remove "recommended fallback when tip-race high" as a way to defer archive while the MR is still open and associated.
5. **Workflow sync**: one-line order updates + reference checklist row; do not restate Part A steps in workflows.
6. **opsx-jira**: remove/replace soft "团队要求合并后归档" normal path with pointer to merge-discipline Part A.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| False positive association (unrelated active change in list) | Session-bound name only for (2); (1) is diff-based and precise |
| Agent archives on wrong tip then merges old SHA | Existing Part D tip pin + ancestor check |
| Users force-skip | Require explicit skip 留痕 (mirror coverage-gate templates); default is block |

## Migration Plan

- Ship skill + delta spec in one PR; after merge, archive this change **on the same tip before** merging that PR (dogfood Part A).
- Bump `merge-discipline` version (minor).

## Open Questions

- None remaining (scope A, placement 1, association c, direct-merge must check — confirmed).

## Verification Notes

- 【覆盖率门控】本仓库为 Markdown skills 库；合并本 change 时若 analyzer 无有效覆盖率数据，按既有模式留痕跳过。
