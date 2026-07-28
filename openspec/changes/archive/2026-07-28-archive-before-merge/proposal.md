## Why

OpenSpec-backed work recently merged implementation first and archived in a follow-up PR (#236 then #237). Stage-8 prose already says archive before merge, but the real merge entrypoint is `merge-discipline` (including a direct user "merge MR"), which previously only ran rebase → coverage → tip (then labeled Parts A→B→C) and whose tip-pinning Strategy B explicitly allowed a post-merge archive docs MR. Association-aware archive gating must live in `merge-discipline` so it cannot be skipped.

## What Changes

- Add an **OpenSpec archive association gate** as **Part A** of `merge-discipline` (shift former A/B/C → B/C/D); run **before** Parts B→C→D whenever the current branch/PR is associated with an active OpenSpec change
- Association rule: PR/branch diff touches `openspec/changes/<name>/` **or** the session-bound change name still appears in `openspec list` (either hit = associated)
- When associated and the change is still active (not under `openspec/changes/archive/`): **block merge**; require archive + specs sync into the same tip before continuing — no implicit skip on direct "merge MR"
- **BREAKING** relative to prior Strategy B guidance: Strategy B (separate post-merge archive MR) MUST NOT be used as a recommended path when the MR is still associated with an active change; recovery-only after accidental merge, with explicit 留痕
- Thin-sync referencing workflows' Part order lines and merge checklists (opsx-solve / opsx-jira / jira-fix) to name the new gate
- Soften/remove `opsx-jira-fix-workflow` wording that still allows "合并后归档" as a normal team option when merge-discipline applies

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `merge-discipline`: add archive-before-merge association gate; require direct-merge path to run it; revise dual-strategy so post-merge archive is not a default/recommended path for associated active changes

## Impact

- `skills/merge-discipline/SKILL.md` (+ evals)
- Thin pointers: `skills/opsx-solve-workflow/`, `skills/opsx-jira-fix-workflow/`, `skills/jira-fix-workflow/` (+ reference merge checklists)
- Main spec `openspec/specs/merge-discipline/spec.md` (via delta)
- Agents that load `merge-discipline` on any merge into a protected branch
