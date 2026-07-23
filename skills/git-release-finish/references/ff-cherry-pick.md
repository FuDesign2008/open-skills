# ff-mode cherry-pick flow

**When to read this**: Phase 3.5 of the main skill identified `merge_method = ff` (GitLab) or the rebase-only equivalent on GitHub, **and** the descendant check showed release is NOT a descendant of target (non-fast-forward relationship). This is the path that skips Phases 4 (default MR), 5, 5.5, 6, and 7 of the main flow.

## Why this path exists

GitLab `merge_method = ff` refuses to produce a merge commit. If release cannot fast-forward to target (the typical case — both branches moved since fork), `mr merge` returns **406 "Branch cannot be merged"** even though `can_be_merged=true`. The only way forward is to replay release's commits onto target via cherry-pick, producing a fast-forwardable branch.

GitHub's rebase-only mode (`allow_merge_commit=false && allow_squash_merge=false && allow_rebase_merge=true`) is the equivalent trap — PR merge rewrites commits and changes hashes. Treat it the same way.

## Complete flow

> Multi-repo note (M.1 from the main skill): every command in a multi-repo run starts with `cd <REPO_PATH> &&`. Tool-call layers have no persistent cwd state.

```bash
# 1. List commits unique to release (relative to target)
cd <REPO_PATH> && git log origin/<TARGET_BRANCH>..origin/<RELEASE_BRANCH> --oneline

# 2. Derive a sync branch from target
cd <REPO_PATH> && git checkout origin/<TARGET_BRANCH> -b sync-release/<VERSION>-to-<TARGET>

# 3. Cherry-pick each commit in chronological order
cd <REPO_PATH> && git cherry-pick <COMMIT_1> <COMMIT_2> ...
#   On conflict, delegate to the git-conflict-resolve skill (mode=rebase; cherry-pick is
#   commit-by-commit like rebase). Pass source=<RELEASE_BRANCH>, target=<TARGET_BRANCH>,
#   version=<VERSION>. Heuristic: version numbers / dependency fields usually take the
#   target side; build artifacts take the release side.
#   After resolution, continue with the next commit.

# 4. Empty commit (target already has equivalent change)
#    cd <REPO_PATH> && git cherry-pick --skip
#    (Use --allow-empty only if a record must be preserved.)

# 5. Residual marker scan (uses the main skill's Phase 0 regex)
cd <REPO_PATH> && git grep -lE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' 2>/dev/null

# 6. Push the sync branch
cd <REPO_PATH> && git push origin sync-release/<VERSION>-to-<TARGET>

# 7. Create MR (source is sync-release, NOT the original release branch)
#    Via your platform CLI: source=sync-release/<VERSION>-to-<TARGET>, target=<TARGET_BRANCH>
#    Title: "Release <VERSION> (ff cherry-pick)"
#    Keep the source branch (--remove-source-branch=false / --delete-branch=false)
```

After MR creation, the main skill resumes at Phase 8 (residual marker gate) → Phase 9 (merge). Because the sync branch is a direct descendant of target, ff merge succeeds without 406.

## Hash consistency

Cherry-pick produces new commit hashes — the same logical changes now live on:
- Original release branch: original hashes
- `sync-release/<VERSION>-to-<TARGET>` (and main after merge): new hashes

For ff-mode projects this is fine: ff mode produces no merge commit and does not require hash alignment. If a future cross-release sync is needed (release/A → release/B where release/A was cherry-picked into main), follow `cross-release-sync.md` and treat it as the "hash-changed" case — cherry-pick the original release/A commits into release/B (accepting hash divergence), or cherry-pick main's versions, but do **not** `git merge release/A → release/B` (it creates double-hash chaos when release/B later merges into main).

## Common pitfalls

| Pitfall | Consequence | Fix |
|------|------|------|
| Creating MR with source = original release branch (not `sync-release/...`) | Phase 9 hits the same 406 you were trying to avoid | Source branch is always `sync-release/<VERSION>-to-<TARGET>` |
| Forgetting `--skip` on empty cherry-pick | Cherry-pick halts with "previous cherry-pick is now empty" | `git cherry-pick --skip` resumes; use `--allow-empty` only if a record is needed |
| Skipping the residual marker scan (step 5) | Conflict residue from cherry-pick enters main via the ff MR | Step 5 uses the same regex as Phase 0/8 — always run it before pushing |
| Multi-repo run without `cd <REPO_PATH> &&` prefix | cherry-pick lands in the wrong repo's worktree | Every command block starts with `cd <REPO_PATH> &&` (M.1) |
