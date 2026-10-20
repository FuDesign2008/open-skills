# Design

## Context

See `proposal.md` for why. `git-release-start` creates the remote branch and stops at tracking checks. `git-release-finish` reads protection only to predict a failed force-push. Neither skill writes a whitelist. GitLab applies the loosest matching rule, including group rules. GitHub classic applies one winning rule, with a specific branch name ahead of a pattern. GitHub rulesets aggregate and keep the strictest setting, so a second ruleset cannot open a branch.

【工作区隔离跳过】escape=user-decline；reason=用户选择 B，在当前检出创建分支 `feat/branch-access-lifecycle`，不建 worktree。

## Goals / Non-Goals

**Goals:**

- One skill, `branch-access-lifecycle`, holds the policy and the host procedures.
- The live host rule, read with `glab` or `gh`, is the condition. There is no marker file.
- Start compares the default deny and the new allow entry. Finish compares the freeze after tag and trunk merge. Each write waits for its own confirmation.
- Trunk writes happen only on a direct invocation, after confirmation. Release skills only report trunk drift.

**Non-Goals:**

- Live calls to a Git host from this change's tests. The skill mutates protection rules; eval prompts are saved, not executed here.
- Writing protection rules without an explicit yes for that command.
- Changing release behavior when this skill is not installed.
- Code-owner approval, push rules, or deploy-key allow lists.
- Deleting a pre-existing allow rule the user did not name.

## Decisions

### Skill shape

`skills/branch-access-lifecycle/SKILL.md` names five operations: `ensure-default`, `allow-merge`, `freeze`, `check-trunk`, `rollback`. Host steps live in `references/gitlab.md` and `references/github.md`. The body tells the agent to read only the reference for the detected host.

Alternative: copy the commands into both release skills. Rejected. The precedence rules would be written three times.

### Remote read, confirmed write

The skill reads protection with `glab api` or `gh api` and compares the result with the operation. A matching rule ends the operation with no write. A differing rule is shown with the exact command. POST, PATCH, DELETE, and ruleset or classic protection updates run only after the user accepts that branch and that operation. Workflow auto-advance is not acceptance. A release skill naming the operation is not acceptance.

Alternative: a committed `branch-access.json`. Rejected. The user asked to judge the condition from the remote branch, not from a config file.

### Release skills do not declare a frontmatter dependency

When `branch-access-lifecycle` is available, `git-release-start` and `git-release-finish` call its read. When it is not available, they skip the check and leave protection unchanged. They do not abort the release.

Alternative: frontmatter `dependencies`. Rejected. This repo aborts a skill when a declared dependency is missing, which would stop every release in a partial install.

### Default deny, then one allow entry

If unmatched `release/*` branches can still be merged, the skill shows `ensure-default` and writes it only after acceptance, then shows an exact allow for the new branch (push denied, maintainer merge allowed) and writes that only after its own acceptance. A default that already denies merge is left unchanged. Finish deletes only the exact allow for the shipped branch, and only after acceptance. If the effective result still allows merge, finish reports the surviving rule and does not claim a freeze.

GitLab numbers in the reference: push `0`, merge `0` for the default; push `0`, merge `40` for an allow entry; `allow_force_push` false. GitHub has no access-level field. An allow entry is an exact classic rule that restricts pushes and is not locked, or a ruleset exclusion. A freeze is lock / loss of that exclusion. The skill does not add bypass actors and does not turn off an existing "include administrators" setting.

### Read both GitHub layers

The skill lists classic branch-protection rules and rulesets. `release/*` is the wildcard. GitHub `*` does not match an extra `/`, so `release/*` matches `release/X.Y.Z`. When both layers target the branch, both are updated after the user accepts those writes. When an organization ruleset or a GitLab group rule is looser and the caller cannot edit it, the operation stops and names that layer.

### Verify the permission result

GitLab: GraphQL `userPermissions.canMerge` when an open merge request targets the branch. With no open merge request, the skill reports the computed rule result and states that no merge request was observed. It does not treat `merge_status` as the verdict. GitHub: the branch rules API plus the classic protection API. It does not treat `mergeable_state` as the verdict.

### GitLab writes

Read the server version. Below 15.6, replace a rule by DELETE then POST in one shell command joined with `&&`. On 15.6 or newer, PATCH the existing rule. If the server rejects the access-level fields, stop and quote the error. Do not leave a deleted wildcard unrestored.

### Rollback

Direct invocation only, after the user confirms the commit and the force-push. Create `backup/<branch>-<short-sha>`, push it, temporarily allow force-push for that exact branch, `git push --force-with-lease` to the confirmed sha, then return the branch to the frozen policy. `git-release-finish` never calls this operation.

### Authoring

English body, Chinese triggers in the description, description a single quoted line at or under 1024 characters. No internal host, project, or ticket identifiers. Examples use `example.com` and `release/fix-example`.

## Risks / Trade-offs

- [GitLab DELETE then POST drops protection for a moment] → one shell command with `&&`; if POST fails, the skill stops and tells the user the wildcard is missing.
- [Group or organization rules override the project] → read them when the API allows; otherwise stop without claiming success.
- [GitHub admins can bypass classic protection] → the skill does not claim admins are blocked unless the repo already enforces rules for admins.
- [No open merge request, so `canMerge` cannot be queried] → report rule-level evidence and say the merge request was not observed.
- [A long-lived exact allow stays open after the default is frozen] → list it; do not delete it.
- [Partial skill install] → skip the check when this skill is missing. A present skill still waits for confirmation before a write.
- [Workflow auto-advance is mistaken for permission to change protection] → acceptance is an explicit yes to that command.

## Migration Plan

1. Land the skill and the two release-skill edits on `feat/branch-access-lifecycle`.
2. Consumer repos change protection only when a person confirms a write. Until then, a read does not change their rules. When this skill is not installed, the release flow is unchanged.
3. Rollback of this change is reverting the skill files. Consumer protection rules already written are not reverted by reverting the skill.

## Open Questions

None that change the spec or the task split. Live host behavior stays outside this change's test run.
