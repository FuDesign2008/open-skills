---
name: feature-branch-closeout
version: "1.0.1"
user-invocable: false
description: "Post-verification feature-branch closeout menu: after verify (and archive when applicable), present PR / merge / keep / continue options; optional worktree cleanup; selecting merge MUST load merge-discipline Parts A–D; keep/continue MUST NOT trigger merge gates. Triggers — 「分支收尾」「feature 收尾菜单」「合入或保留分支」「branch closeout」 / feature branch closeout, post-verify branch menu. Do NOT use as a name alias for finishing-a-development-branch."
dependencies:
  - merge-discipline
---

# Feature Branch Closeout

> Internal shared skill. Single source of truth for **post-verify branch closeout decisions**. Hosts declare it in `dependencies` and abort if missing — no silent fallback.
>
> **Name note:** intentionally **not** named `finishing-a-development-branch` (external skills repo). Use this name only.

## Prerequisite

On load, verify `merge-discipline` is available; if missing, abort with install hint. No silent degrade.

## When this applies

After verification is **green**, or every incomplete check is labeled **Pending** with an exact action — and after OpenSpec archive when the host requires archive before closeout. Do not claim the branch work is finished without presenting the menu (unless the user already gave an explicit closeout choice this turn).

## Closeout menu (minimum)

Present intent clearly; agent picks native structured-question capability or prose:

1. **Open / update PR** — push if needed, create or refresh PR, stop (no merge)
2. **Merge** — merge into the protected target (then run `merge-discipline`)
3. **Keep branch** — leave branch as-is; no merge
4. **Continue development** — stay on branch for more work; no merge

Optional (when applicable): detect worktree / detached HEAD / isolation created via `workspace-isolation-discipline` and offer cleanup; **discard** only with explicit strong confirmation (user must clearly affirm discard). Do **not** create new isolation here — create/detect lives in `workspace-isolation-discipline`.

## Merge path

If the choice is **merge** (or the user later says merge):

1. Load `merge-discipline`
2. Run Parts **A → B → C → D**
3. Only then execute the platform merge

Do **not** copy rebase / coverage / tip-pin prose into this skill.

## Non-merge paths

**Keep** / **continue** / **PR-only**: do **not** start merge-discipline coverage or tip pinning for a merge. PR-only may still push and open a PR.

## Forbidden

- Silently merging without the menu (unless user already ordered merge explicitly — then still run `merge-discipline`)
- Embedding merge-discipline Parts A–D inline
- Renaming this skill to `finishing-a-development-branch` inside this repository

## Integration guide

- Hosts: after archive/verify, one-line — load `feature-branch-closeout` for the menu; on merge, it loads `merge-discipline`.
- Prefer `user-invocable: false`; reach via PDCA hosts.
- Order: archive (if any) + diff check → **this menu** → merge-discipline only if merge selected.
