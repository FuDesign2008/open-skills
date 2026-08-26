# merge-squash-prompt Proposal

## Why

merge-discipline Part D executes the merge command without any merge-strategy decision point: the GitLab "Squash commits when merge request is accepted" checkbox (and GitHub's `--squash` merge method) is never surfaced to the user, so commit history quality is left to platform defaults or silent AI choice. The repo rule in AGENTS.md ("prefer merge commit, avoid Squash") is unconditional and cannot express a per-MR judgment based on actual commit quality.

## What Changes

- Add a mandatory **squash decision step** to `merge-discipline` Part D, between Part R pass and the merge command: list the MR/PR commits, classify commit quality, present a recommendation (squash vs. no-squash) with rationale, and require explicit user confirmation before merging.
- Recommendation semantics are **dynamic, based on the MR's commit history**: atomic, individually valuable commits → recommend no-squash (merge commit preserves history); trivial accumulation (fixup/typo/wip/CI-retry noise) → recommend squash; branch that will continue to receive development → lean no-squash (squash cuts the commit graph and causes later conflicts).
- The decision step is platform-neutral (intent-level contract): GitHub `gh pr merge --merge|--squash`, GitLab `glab mr merge` with/without `--squash`; tip pinning semantics unchanged.
- Harmonize the AGENTS.md Git-workflow wording: default remains merge-commit; squash is permitted when the MR's commits are trivial accumulation and the branch will not continue development.
- Bump `skills/merge-discipline` version 1.5.0 → 1.6.0; extend the pre-merge checklist in `reference.md` with the squash-decision item.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `merge-discipline`: Part D gains a mandatory squash-decision requirement (commit-history listing, quality-based recommendation, explicit user confirmation, platform-neutral execution); the repo-level Git workflow guidance (AGENTS.md) is harmonized to permit squash in the trivial-accumulation case.

## Impact

- `skills/merge-discipline/SKILL.md` — Part D new step + version bump; `description` mentions the squash decision.
- `skills/merge-discipline/reference.md` — pre-merge checklist gains one item.
- `AGENTS.md` — Git 工作流「合并 PR 时」条目措辞调和.
- Referencing workflows (`feature-branch-closeout`, `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`) — zero changes; they delegate all merge execution to merge-discipline and inherit the new behavior.
- Runtime code / dependencies: none (Markdown skill contract only).
