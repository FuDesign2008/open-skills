## Why

After a merge lands, the local workspace must return to the integration line before the next task starts — switch to the MR's target branch and fast-forward it. Today no skill owns this: the only trace is an AGENTS.md prose line hardcoded to `main`, while real target branches are often `release/*`, `develop`, or integration branches. The gap surfaced twice in one working day (manual sync after PR #284 and #285).

## What Changes

- merge-discipline Part D gains a final **post-merge workspace sync** step (after the mandatory ancestor check): resolve the target from MR metadata (reusing Part B's base, never assuming `main`/`master`), checkout + `git pull --ff-only` when the branch exists locally, report guidance instead of silently skipping when it doesn't, and surface merged-source-branch cleanup as an offer.
- The AGENTS.md prose line is generalized to point at this behavior contract.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `merge-discipline`: one ADDED requirement — "Part D SHALL sync the local workspace onto the merged target branch" with scenarios covering non-main targets, missing local target branch, and fast-forward blocked.

## Impact

- Files: `skills/merge-discipline/SKILL.md` (new unnumbered subsection under Part D + description sentence), `openspec/specs/merge-discipline/spec.md` via delta sync, AGENTS.md workflow-section line, one pointer sentence in `feature-branch-closeout`.
- No change to Parts A–C/R; tip-pinning steps untouched.
