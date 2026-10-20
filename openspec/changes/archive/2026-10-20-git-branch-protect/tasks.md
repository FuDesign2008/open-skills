# Tasks

## 1. git-branch-protect skill

- [x] 1.1 Write `skills/git-branch-protect/SKILL.md` with the five operations, a remote read, a confirmation step before every protection write, and Chinese-plus-English triggers. Verify the description is one quoted line and `npm run lint:skill-description` passes for this file.
- [x] 1.2 Write `skills/git-branch-protect/references/gitlab.md` and link it from `SKILL.md`. Verify the file states loosest-match, the 15.6 PATCH split, `&&` replace, `userPermissions.canMerge`, and group-rule stop.
- [x] 1.3 Write `skills/git-branch-protect/references/github.md` and link it from `SKILL.md`. Verify the file states classic single-winner, ruleset exclusion, both-layers, and that `mergeable_state` is not the verdict.
- [x] 1.4 Add `skills/git-branch-protect/evals/evals.json` with three prompts (confirm before freeze, read without writing, unfinished confirmation). Verify the JSON parses. Do not run the prompts against a live host.

## 2. Release skill hooks

- [x] 2.1 Edit `skills/git-release-start/SKILL.md` so a missing skill skips protection, and an available skill reads the live rules after the remote branch exists. Verify a write runs only after the user accepts it.
- [x] 2.2 Edit `skills/git-release-finish/SKILL.md` so an available skill runs read-only `check-trunk` and, only after tag and trunk merge succeed, offers `freeze`. Verify the file does not call `rollback` and does not write before acceptance.

## 3. Contract check

- [x] 3.1 Run `openspec validate git-branch-protect --strict --type change` and record a passing result.
- [x] 3.2 Regenerate `docs/generated/skills-index.md`, run the de-identification linter on the new skill files, and add `git-branch-protect` to the category table in `AGENTS.md`. Verify the index contains the new skill and the linter reports no new internal identifier in those files.

## 4. Review fixes before archive

- [x] 4.1 Phase 6 treats an existing push denial plus maintainer merge as a pass, and a declined write does not authorize removing protection.
- [x] 4.2 Release skills report trunk drift and do not run `set-trunk`.
- [x] 4.3 GitLab freeze tightens the exact rule when no denying wildcard exists, and recomputes after the write.
- [x] 4.4 Rollback shows the temporary protection write and waits for acceptance before running it.

## Workflow follow-up

- Archive only after verification is confirmed.
- Do not run eval prompts against a live Git host.
