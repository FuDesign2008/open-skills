## Context

`goal-driven-batch` already dispatches Jira engines as `queue-child` (PR-open / archive+PR-open). `jira-fix-batch` and `opsx-jira-fix-batch` still implemented a second session-scoped loop. User decision: drop in-session fix-to-merge; every multi-issue list goes through enqueue → confirm → explicit run.

## Goals / Non-Goals

**Goals:** one orchestration SoT (`goal-driven-batch`); keep Chinese/English batch trigger words via thin shells; list-enqueue without N full intakes; derived relationships without shared branch/change.

**Non-Goals:** deleting the two skill directories; proxying merge or Jira writeback; sharing one OpenSpec change across in-progress issues; changing single-issue `jira-fix-workflow` / `opsx-jira-fix-workflow` semantics except Batch pointers and opsx Related Issues on queue-child.

## Decisions

1. **Thin shells, not deletion** — keep names so 「批量修复」 still routes; description stays under 1024. Alternative (merge triggers into `goal-driven-batch`) rejected: that description is already near the routing-only budget.
2. **List-enqueue shortcut** — one interaction-budget ticket + frozen Engine + one approval. Fog defers to the child under `Stage-exit policy`. Alternative (full per-card intake) rejected: unusable for a 10-issue paste.
3. **No shared change** — isolation (one task one branch) wins over opsx-jira-fix-batch's "MAY reuse one change". Duplicate → skip; derived → depend or split. Related Issues persist in each opsx child's `design.md`.
4. **Shells depend on `goal-driven-batch` only** — they never call the engines. Queue already opt-in-aborts on missing engines.

## Risks / Trade-offs

- [Shells grow orchestration again] → SKILL.md duties + Red Flags; eval 18 asserts no engine loop.
- [Users expect 批量修复 to start fixing now] → description Do-NOT + Batch pointer; approval ≠ run.
- [Unattended list-enqueue with `Stage-exit policy: manual`] → child will pause; budget ticket is the informed choice.

## Migration Plan

Ship on a feature branch. Installed `jira-fix-batch` 1.x users pick up 2.0.0 on next `npx skills` / plugin update. Rollback = revert. No card-format migration.

## Open Questions

None.
