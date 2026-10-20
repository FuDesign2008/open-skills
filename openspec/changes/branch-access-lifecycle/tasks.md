# Tasks

## 1. branch-access-lifecycle skill

- [x] 1.1 Write `skills/branch-access-lifecycle/SKILL.md` with the five operations, the `branch-access.json` marker, and Chinese-plus-English triggers. Verify the description is one quoted line and `npm run lint:skill-description` passes for this file.
- [x] 1.2 Write `skills/branch-access-lifecycle/references/gitlab.md` and link it from `SKILL.md`. Verify the file states loosest-match, the 15.6 PATCH split, `&&` replace, `userPermissions.canMerge`, and group-rule stop.
- [x] 1.3 Write `skills/branch-access-lifecycle/references/github.md` and link it from `SKILL.md`. Verify the file states classic single-winner, ruleset exclusion, both-layers, and that `mergeable_state` is not the verdict.
- [x] 1.4 Add `skills/branch-access-lifecycle/evals/evals.json` with three prompts (trigger, marker absent, freeze still allowed). Verify the JSON parses. Do not run the prompts against a live host.

## 2. Release skill hooks

- [x] 2.1 Edit `skills/git-release-start/SKILL.md` so a missing marker skips protection and a present marker runs `ensure-default` then `allow-merge` after the remote branch exists. Verify the phase map and the abort install command are in the file.
- [x] 2.2 Edit `skills/git-release-finish/SKILL.md` so a present marker runs read-only `check-trunk` and, only after tag and trunk merge succeed, runs `freeze`. Verify the file does not call `rollback`.

## 3. Contract check

- [x] 3.1 Run `openspec validate branch-access-lifecycle --strict --type change` and record a passing result.
- [x] 3.2 Regenerate `docs/generated/skills-index.md`, run the de-identification linter on the new skill files, and add `branch-access-lifecycle` to the category table in `AGENTS.md`. Verify the index contains the new skill and the linter reports no new internal identifier in those files.

## Workflow follow-up

- Archive only after verification is confirmed.
- Do not run eval prompts against a live Git host.
