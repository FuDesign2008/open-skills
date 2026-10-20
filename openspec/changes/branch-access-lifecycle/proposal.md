# Proposal

## Why

Release branches stay mergeable after a version ships, and a stricter exact rule does not freeze a branch that a looser wildcard already allows. `git-release-start` and `git-release-finish` never grant or retire merge access, so an opted-in project cannot keep one active `release/X.Y.Z` open and every finished release closed.

## What Changes

- Add `branch-access-lifecycle`: one skill that owns trunk protection, release whitelist membership, release freeze, and incident force-push rollback for GitLab and GitHub.
- There is no committed marker file. The condition is the live protection rule, read with `glab` or `gh`. When `branch-access-lifecycle` is not installed, the two release skills leave protection unchanged.
- `git-release-start` reads the new `release/X.Y.Z` after the remote branch exists. `git-release-finish` reads that branch after the tag and the merge into trunk both succeed. A create, update, or delete of a protection rule runs only after the user confirms that command.
- Trunk (`main` or `master`) is set only by a direct call to `branch-access-lifecycle`, and only after the user confirms the write. The two release skills only compare the live trunk rule with the policy and report a mismatch.
- Incident rollback (backup, temporary force-push, restore, re-freeze) stays a direct operation of `branch-access-lifecycle`. It is not a phase of `git-release-finish`.
- Host procedures stay in this skill's references. GitLab uses most-permissive matching (wildcard freeze plus exact allow rules). GitHub classic uses one winning exact rule. GitHub rulesets use exclusions, because an added ruleset cannot loosen an existing one. Writes are verified with the host permission result, not merge-status fields.

## Capabilities

### New Capabilities

- `branch-access-lifecycle`: Protection policy for `release/*`, an exact `release/xxx`, and trunk. The live host rule is the condition. Whitelist add/remove and trunk writes wait for user confirmation. Host rule precedence stays in the references.

### Modified Capabilities

## Impact

- New skill directory `skills/branch-access-lifecycle/` (`SKILL.md` plus GitLab and GitHub references).
- `skills/git-release-start/SKILL.md` and `skills/git-release-finish/SKILL.md` read protection when this skill is available. They do not declare a frontmatter dependency. A missing skill skips the check and does not abort the release. A present skill still does not write until the user confirms.
- No application runtime, API, or dependency package changes. Installing the skill adds a remote read. It does not change protection rules by itself.
- Skill text stays free of internal host names, project ids, and ticket ids. Platform facts are limited to public GitLab and GitHub behavior.
