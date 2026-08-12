## Why

`workspace-isolation-discipline` is already a strong dependency of PDCA hosts but is thin: it offers isolation without a project preference gate and without advising when git worktrees are a poor fit (multi-repo sibling path / full product pack). A real multi-repo local-verify case showed worktrees break `../sibling` assumptions. Product owners chose to **hard-rename** to `git-worktree-discipline`, add `worktree-gate` preference (default ask) with **status-based recommendation before asking**, and absorb case lessons—without strong-depending on external Superpowers `using-git-worktrees`.

## What Changes

- **BREAKING**: Rename skill id/directory `workspace-isolation-discipline` → `git-worktree-discipline` (hard cut, no alias directory).
- Enhance loop: detect → resolve `worktree-gate` → recommend from repo state → ask (when ask) → create (native preferred, else ignored `.worktrees/`) or decline/lean 留痕.
- Document multi-repo sibling / pack limitations; verification layering guidance in reference.
- Update four PDCA hosts, `feature-branch-closeout`, `AGENTS.md`, skills-index, and the case doc pointers (deidentified examples in skill prose).
- OpenSpec: add capability `git-worktree-discipline`; remove/retire `workspace-isolation-discipline` main spec; MODIFIED closeout composition requirement.

## Capabilities

### New Capabilities

- `git-worktree-discipline`: Pre-exec git/native worktree isolation with preference gate, applicability recommendation, and create/detect consent (cleanup via closeout).

### Modified Capabilities

- `workspace-isolation-discipline`: Retire — remove requirements (hard rename to `git-worktree-discipline`).
- `feature-branch-closeout`: Compose cleanup with `git-worktree-discipline` instead of the old id.

## Impact

- Skills: new `skills/git-worktree-discipline/`; delete old skill dir; host + closeout dependency strings; solve-workflow missing-notice list.
- Specs/docs as above; installers must pick up the new skill name after release.
- Does not add Superpowers as a dependency.
