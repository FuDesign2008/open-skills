# Proposal

## Why

Release branches stay mergeable after a version ships, and a stricter exact rule does not freeze a branch that a looser wildcard already allows. `git-release-start` and `git-release-finish` never grant or retire merge access, so an opted-in project cannot keep one active `release/X.Y.Z` open and every finished release closed.

## What Changes

- Add `branch-access-lifecycle`: one skill that owns trunk protection, release whitelist membership, release freeze, and incident force-push rollback for GitLab and GitHub.
- Opt-in is a committed marker file in the target repo. Without that file, `git-release-start` and `git-release-finish` keep their current behavior.
- When the marker is present, `git-release-start` adds the new `release/X.Y.Z` to the merge whitelist after the remote branch exists. `git-release-finish` removes that same branch from the whitelist after the tag and the merge into trunk both succeed.
- Trunk (`main` or `master`) is set only by a direct call to `branch-access-lifecycle`. The two release skills only compare the live trunk rule with the policy and report a mismatch.
- Incident rollback (backup, temporary force-push, restore, re-freeze) stays a direct operation of `branch-access-lifecycle`. It is not a phase of `git-release-finish`.
- Host procedures stay in this skill's references. GitLab uses most-permissive matching (wildcard freeze plus exact allow rules). GitHub classic uses one winning exact rule. GitHub rulesets use exclusions, because an added ruleset cannot loosen an existing one. Writes are verified with the host permission result, not merge-status fields.

## Capabilities

### New Capabilities

- `branch-access-lifecycle`: Opt-in protection policy for `release/*`, an exact `release/xxx`, and trunk, including whitelist add/remove, read-only trunk checks from the release skills, and host-specific rule precedence.

### Modified Capabilities

## Impact

- New skill directory `skills/branch-access-lifecycle/` (`SKILL.md` plus GitLab and GitHub references).
- `skills/git-release-start/SKILL.md` and `skills/git-release-finish/SKILL.md` gain a conditional call when the marker file exists. They do not declare a frontmatter dependency. A present marker with the skill missing aborts that run and prints the install command.
- No application runtime, API, or dependency package changes. Consumer repos opt in by committing the marker; a global install of this skill does not change their release flow.
- Skill text stays free of internal host names, project ids, and ticket ids. Platform facts are limited to public GitLab and GitHub behavior.
