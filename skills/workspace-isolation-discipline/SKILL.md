---
name: workspace-isolation-discipline
version: "1.0.0"
user-invocable: false
description: "Optional isolated workspace before non-trivial execution: detect existing isolation, offer create (platform-native or git worktree under ignored .worktrees/), allow decline or lean/hotfix in-place with 留痕; destruction belongs to feature-branch-closeout. Triggers — 「工作区隔离」「git worktree」「隔离工作区」「执行前隔离」「workspace isolation」 / workspace isolation discipline. Do NOT use as a name alias for using-git-worktrees."
---

# Workspace Isolation Discipline

> Internal shared skill. Optional **create/detect** isolation before production implementation. Hosts declare it in `dependencies` and abort if missing.
>
> **Name note:** intentionally **not** named `using-git-worktrees`. Use this name only.

## When to offer

After `design-approval-gate` passes (or auto escape), **before** non-trivial production edits. Skip offer only when: already isolated for this change, or lean/hotfix in-place 留痕, or user preference already recorded this session.

## Loop

1. **Detect** — existing worktree / isolated path for this branch or change?
2. **Offer** — create isolation (prefer agent/platform native workspace tools if available; else `git worktree add` under `.worktrees/<branch-slug>/`). Ensure `.worktrees/` is gitignored when creating.
3. **Consent** — user declines → continue in current worktree; record decline briefly.
4. **Lean/hotfix escape** — `【工作区隔离跳过】escape=lean-hotfix|user-decline；reason=…`

Do **not** replace design approval. Do **not** silently destroy isolation mid-run.

## Cleanup ownership

**Destroy/remove** isolated workspaces after verify/archive → `feature-branch-closeout` optional cleanup. This skill may document the remove command it used for create symmetry.

## Forbidden

- Mandatory isolation with no decline path
- Implementing full closeout menu here
- Renaming to `using-git-worktrees` in this repository

## Integration guide

- Hosts: one-line before execution — load this skill (optional isolation).
- Compose with `feature-branch-closeout` for cleanup only.
- Prefer `user-invocable: false`.
