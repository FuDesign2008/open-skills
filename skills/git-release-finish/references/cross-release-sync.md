# Cross-release sync (release/A → release/B)

**When to read this**: `release/A` has already been merged into main (by any method), and you now need to sync those same changes to `release/B` (a newer release branch that does not yet have them).

## The core constraint — hash consistency

If `release/A` was merged into main via **rebase or cherry-pick** (not a pure merge commit), the same logical changes have **different commit hashes** on `release/A` versus main. Directly merging `release/A → release/B` would put the old hashes into `release/B`; when `release/B` later merges into main, git sees the same changes with two different hashes and conflicts are guaranteed.

## Decision tree

```
How was release/A merged into main?
├── merge commit (original hashes preserved)
│   → Safe to merge release/A → release/B directly
│     Future release/B → main stays clean
│
├── rebase (hashes changed)
│   → Do NOT merge release/A → release/B
│   → Rebase release/B onto main instead
│     (or merge main into release/B)
│     Main already contains release/A's changes
│
└── cherry-pick (ff-mode projects, hashes changed)
    → release/A's changes have new hashes on main
    → Sync to release/B by cherry-picking too — either:
       - Cherry-pick main's versions of those commits (new hashes, matches main)
       - Cherry-pick release/A's original commits (accept hash divergence; OK for ff
         projects because release/B → main will also be ff, producing no merge commit)
    → In both cases, resolve content conflicts on release/B
```

> **ff-mode projects** are more forgiving: they do not produce merge commits, so hash divergence alone does not cause conflicts. Still prefer cherry-picking release/A's original commits into release/B so the change origin stays traceable. If release/B is also ff-mode, Phase 3.5 of the main skill will have identified this and selected the cherry-pick strategy already.

## Commands

```bash
# 1. Dry-run conflict assessment
BASE=$(git merge-base origin/release/A origin/release/B)
git merge-tree $BASE origin/release/A origin/release/B | grep -c "^changed in both"

# 2. Determine how release/A entered main
git log origin/<MAIN_BRANCH> --oneline --merges | grep "release/A"
# No merge commit found → likely entered via rebase or cherry-pick

# 3a. release/A entered main via merge commit → safe to merge release/A → release/B
git checkout -B release/B origin/release/B
git merge origin/release/A
# Resolve conflicts if any; commit; push

# 3b. release/A entered main via rebase → rebase release/B onto main
git checkout -B release/B origin/release/B
git rebase origin/<MAIN_BRANCH>
# Resolve conflicts; force push (see main skill Phase 6 rebase mode + protected-branch fallback)

# 3c. release/A entered main via cherry-pick (ff project) → cherry-pick into release/B
git checkout -B release/B origin/release/B
git cherry-pick <ORIG_COMMIT_1> <ORIG_COMMIT_2> ...
# Resolve conflicts per commit; use --skip for empty cherry-picks
```

## Example

> `release/8.2.61` entered `master` via rebase. Its changes need to sync to `release/8.2.70`.
>
> Wrong: `git merge release/8.2.61` into release/8.2.70 — when 8.2.70 later merges into master, the same changes appear under two hash sets and conflict.
>
> Correct: rebase `release/8.2.70` onto `master`. Master already contains 8.2.61's changes; the rebase reconciles 8.2.70's unique work with them.

## Common pitfalls

| Pitfall | Consequence | Fix |
|------|------|------|
| Assuming release/A entered main via merge | If it actually entered via rebase/cherry-pick, `git merge release/A → release/B` creates double-hash chaos later | Run `git log origin/<MAIN_BRANCH> --merges \| grep release/A` first; no result means rebase/cherry-pick |
| Forgetting ff-mode projects are hash-tolerant | Over-engineering sync for an ff-mode repo where hash divergence is harmless | Check Phase 3.5 verdict — ff projects accept cherry-pick with original hashes |
| Force-pushing release/B without checking protected-branch rules | Protected-branch rejection mid-sync leaves release/B in a half-rebased state | Phase 3.5 already collected protection rules; if release/B is protected, follow the main skill's protected-branch fallback |
