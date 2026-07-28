## 1. Snapshots

- [x] 1.1 Snapshot P0/P1 skill files into `skills/<name>-workspace/skill-snapshot/` from current HEAD
- [x] 1.2 Confirm `article-writer` excluded and `git-release-finish` already English

## 2. Translate P0

- [x] 2.1 English body for `perf-workflow` (keep Chinese triggers)
- [x] 2.2 English body + reference for `frontend-perf`
- [x] 2.3 English body + reference for `git-conflict-resolve`
- [x] 2.4 English body for `git-release-start`

## 3. Translate P1 leftovers

- [x] 3.1 English `merge-discipline/reference.md` (+ residual SKILL CJK if instructional)
- [x] 3.2 English leftover templates in `jira-fix-workflow/reference.md`
- [x] 3.3 English leftover templates in `solve-workflow/reference.md`
- [x] 3.4 English `known-issue-research/reference.md` templates
- [x] 3.5 English instructional remnants in `code-design-review`
- [x] 3.6 English instructional remnants in `solution-review`

## 4. Lightweight eval

- [x] 4.1 Write `evals.json` (2–3 prompts) per in-scope skill needing behavior gates
- [x] 4.2 Run with_skill vs old_skill answers for those evals
- [x] 4.3 Write summary under `skills/_eval-en-batch2-tools/`

## 5. Verify and close

- [x] 5.1 CJK instructional remnant scan (allowlist triggers/slogans)
- [x] 5.2 `openspec validate migrate-skills-en-batch2-remaining` + regen skills index if needed
- [x] 5.3 Pause for user archive / PR confirmation
