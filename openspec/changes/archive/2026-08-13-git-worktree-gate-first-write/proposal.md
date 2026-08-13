## Why

The `git-worktree-discipline` gate contract triggered "before the first non-trivial production edit", which lands after host workflows' first persistent writes (OpenSpec artifacts, jira-fix runtime docs), so isolation could not cover document deliverables; additionally `opsx-jira-fix-workflow`'s gate sentence was misplaced inside §6.2.5, a subsection positioned after the production-edit loop. This change is persisted retroactively: the implementation already landed in commit `f4bcaba` (PR #275) before this OpenSpec sediment existed.

## What Changes

- Gate trigger moved up: `git-worktree-discipline` now loads before the first non-trivial persistent write (docs or code) in a PDCA host run, no longer ordered after design approval.
- Hosts re-anchored at their measured first-write points: `solve-workflow` (stage 6 head, point unchanged), `opsx-solve-workflow` (stage 3, before `proposal.md`), `jira-fix-workflow` (stage 0, before `state.json`), `opsx-jira-fix-workflow` (stage 1, before `design.md`).
- `opsx-jira-fix-workflow`: the `design-approval-gate` sentence moved from §6.2.5 to the stage 6 head; §6.2.5 keeps only test-first / test-suite-ensure content.
- AGENTS.md `worktree-gate` timing wording synced to the new contract.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `git-worktree-discipline`: requirement "Pre-exec worktree gate with preference resolution" renamed to "Pre-write worktree gate with preference resolution" and its trigger reworded from the first non-trivial production edit to the first non-trivial persistent write (docs or code).

## Impact

- Modified: `openspec/specs/git-worktree-discipline/spec.md`, `skills/git-worktree-discipline/SKILL.md` (description, When to run, Integration guide), `skills/solve-workflow/SKILL.md`, `skills/opsx-solve-workflow/SKILL.md`, `skills/jira-fix-workflow/SKILL.md`, `skills/opsx-jira-fix-workflow/SKILL.md`, `AGENTS.md`; `docs/generated/skills-index.md` regenerated.
- Delivered via PR #275 on branch `feat/git-worktree-gate-first-write` (commit `f4bcaba`); verification: description lint, skills-index regen parity, de-identification scan, residual-wording greps — all green.
