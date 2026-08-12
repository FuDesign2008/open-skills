---
name: git-worktree-discipline
version: "1.0.0"
user-invocable: false
description: "Pre-exec git/native worktree isolation with worktree-gate (always|never|ask; unset≡ask): detect reuse, recommend suitability from project state, then create (native or ignored .worktrees/) or decline/lean with 留痕; cleanup via feature-branch-closeout. Triggers — 「git worktree」「工作区隔离」「隔离工作区」「执行前隔离」「worktree 门控」 / git worktree discipline. Do NOT use as Superpowers using-git-worktrees alias or for closeout destroy."
---

# Git Worktree Discipline

> Internal shared skill. Optional **create/detect** isolation before production implementation. Hosts declare it in `dependencies` and abort if missing.
>
> **Name note:** intentionally **not** named `using-git-worktrees`. Use `git-worktree-discipline` only.

## When to run

After `design-approval-gate` passes (or auto escape), **before** non-trivial production edits. Skip the create offer only when already isolated for this change, or gate/`never`, or lean/hotfix in-place 留痕 this session.

## Loop

1. **Detect** — already in a change-scoped worktree / native isolation? → reuse; report and stop.
2. **Resolve preference** — read `worktree-gate` from `AGENTS.md` / `CLAUDE.md`: `always` | `never` | `ask`. Unset ≡ `ask`. Details: `reference.md`.
3. **Recommend (ask / always)** — from project state: multi-repo sibling `../` scripts, full product pack intent, dirty primary tree, etc. State fit briefly (good for code + unit tests; poor for pack without path rebinding).
4. **Act by gate**
   - `never` → skip create; `【工作区隔离跳过】escape=worktree-gate-never；reason=…`
   - `always` → create when possible (no ask)
   - `ask` → after recommendation, ask: create / decline / lean; do not silently create
5. **Create** — prefer agent-native workspace isolation; else `git worktree add` under `.worktrees/<branch-slug>/`. Ensure `.worktrees/` is gitignored. Record path for closeout.
6. **Lean/hotfix / decline** — `【工作区隔离跳过】escape=lean-hotfix|user-decline；reason=…`

Do **not** replace design approval. Do **not** silently destroy isolation mid-run. Do **not** imply one-click full product pack inside a worktree.

## Cleanup ownership

**Destroy/remove** after verify/archive → `feature-branch-closeout` optional cleanup. This skill may note the remove command symmetric to create.

## Integration guide

- Hosts: one line before execution — load this skill (worktree gate + optional isolation).
- Compose with `feature-branch-closeout` for cleanup only.
- Prefer `user-invocable: false`.
- Suitability checklist and env-rebinding notes: `reference.md`.
