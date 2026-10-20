# Tasks

## 1. branch-access-lifecycle skill

- [x] 1.1 Write `skills/branch-access-lifecycle/SKILL.md` with the five operations, a remote read, a confirmation step before every protection write, and Chinese-plus-English triggers. Verify the description is one quoted line and `npm run lint:skill-description` passes for this file.
- [x] 1.2 Write `skills/branch-access-lifecycle/references/gitlab.md` and link it from `SKILL.md`. Verify the file states loosest-match, the 15.6 PATCH split, `&&` replace, `userPermissions.canMerge`, and group-rule stop.
- [x] 1.3 Write `skills/branch-access-lifecycle/references/github.md` and link it from `SKILL.md`. Verify the file states classic single-winner, ruleset exclusion, both-layers, and that `mergeable_state` is not the verdict.
- [x] 1.4 Add `skills/branch-access-lifecycle/evals/evals.json` with three prompts (confirm before freeze, read without writing, unfinished confirmation). Verify the JSON parses. Do not run the prompts against a live host.

## 2. Release skill hooks

- [x] 2.1 Edit `skills/git-release-start/SKILL.md` so a missing skill skips protection, and an available skill reads the live rules after the remote branch exists. Verify a write runs only after the user accepts it.
- [x] 2.2 Edit `skills/git-release-finish/SKILL.md` so an available skill runs read-only `check-trunk` and, only after tag and trunk merge succeed, offers `freeze`. Verify the file does not call `rollback` and does not write before acceptance.

## 3. Contract check

- [x] 3.1 Run `openspec validate branch-access-lifecycle --strict --type change` and record a passing result.
- [x] 3.2 Regenerate `docs/generated/skills-index.md`, run the de-identification linter on the new skill files, and add `branch-access-lifecycle` to the category table in `AGENTS.md`. Verify the index contains the new skill and the linter reports no new internal identifier in those files.

## Workflow follow-up

- Archive only after verification is confirmed.
- Do not run eval prompts against a live Git host.
