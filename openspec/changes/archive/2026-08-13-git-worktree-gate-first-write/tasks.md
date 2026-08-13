## 1. Contract surfaces

- [x] 1.1 Reword `openspec/specs/git-worktree-discipline/spec.md`: Purpose "Pre-exec"→"Pre-write", requirement renamed to "Pre-write worktree gate with preference resolution", trigger reworded to "before the first non-trivial persistent write (docs or code)"
- [x] 1.2 Sync `skills/git-worktree-discipline/SKILL.md`: description, header note, "When to run" (dropped design-approval ordering), Integration guide ("one line before the first artifact/code write")

## 2. Host re-anchoring

- [x] 2.1 `solve-workflow`: align the stage-6 head sentence with the canonical wording (anchor point unchanged — first write is the stage 6 production edit)
- [x] 2.2 `opsx-solve-workflow`: gate line inserted in stage 3 before `proposal.md` creation; dependency annotation updated to "before stage 3 — first artifact write"; worktree clause dropped from the stage 6 head
- [x] 2.3 `jira-fix-workflow`: gate added to stage 0 item 1 before the `state.json` write; quick-reference table stage 0 Bash cell flipped to ✅ (worktree gate); worktree clause dropped from the stage 7 head
- [x] 2.4 `opsx-jira-fix-workflow`: gate line at the stage 1 head before the `design.md` write; annotation updated; stage 1 table row allows Bash (worktree gate); `design-approval-gate` sentence moved from §6.2.5 to the stage 6 head; §6.2.5 trimmed to test-first / test-suite-ensure only

## 3. Repo-wide consistency

- [x] 3.1 AGENTS.md `worktree-gate` timing wording synced to "首个非平凡持久化写入（文档或代码）之前"
- [x] 3.2 Regenerate `docs/generated/skills-index.md`

## 4. Verification

- [x] 4.1 `lint-skill-description`: 56 skills, 0 errors, 0 warnings
- [x] 4.2 `gen-skill-docs.mjs` regen parity (regenerated content identical to committed index)
- [x] 4.3 `lint-skill-deidentification --staged`: no new internal identifiers
- [x] 4.4 Residual-wording greps (`Pre-exec` / `Optionally follow git-worktree-discipline` / `before non-trivial edits` / `非平凡生产编辑之前`) zero hits outside archived history; host lines and skill Integration guide phrase consistent on both sides
- [x] 4.5 Commit `f4bcaba`, push branch `feat/git-worktree-gate-first-write`, open PR #275 — CI (deid, verify) green

## 5. Retro sediment (this change)

- [x] 5.1 Backfill `proposal.md`, delta specs, `design.md`, `tasks.md` as-built (this change)
- [x] 5.2 `openspec validate` green for the backfilled change
- [x] 5.3 Archive the change (delta sync idempotent — main spec already updated) and confirm the diff shows only the archive move
- [x] 5.4 Commit and push the sediment to PR #275's branch
