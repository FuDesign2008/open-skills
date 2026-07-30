## Context

Four PDCA hosts need aligned optional delivery without duplicating Jira Stage 9 prose or bloating `feature-branch-closeout`.

## Goals / Non-Goals

**Goals:** Shared optional commit+PR; reusable by solve and Jira hosts; skip when no delivery needed; idempotent with existing PRs.

**Non-Goals:** Merge gates (stay in `merge-discipline`); release→main (`git-release-finish`); replacing `git-commit` for commit-only asks.

## Decisions

1. New skill id `delivery-discipline` (`-discipline`, `user-invocable: true` like `merge-discipline`).
2. Layering: `git-commit` → `delivery-discipline` → `feature-branch-closeout` → `merge-discipline`.
3. Hosts pass Jira/OpenSpec fields via `{pr-body-extra}` / `{commit-context}`.
4. `opsx-jira-fix-workflow`: reorder to archive → delivery → closeout (aligned with archive-before-merge).

## Risks / Mitigations

| Risk | Mitigation |
|------|------------|
| Double commit | Idempotent §2; Jira Stage 9 thin-refs delivery only once before closeout |
| Force PR every solve | Need-delivery gate mandatory |
| Closeout still inlines PR | Option 1 must load delivery-discipline |
