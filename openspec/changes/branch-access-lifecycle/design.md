# Design

## Context

See `proposal.md` for why. `git-release-start` creates the remote branch and stops at tracking checks. `git-release-finish` reads protection only to predict a failed force-push. Neither skill writes a whitelist. GitLab applies the loosest matching rule, including group rules. GitHub classic applies one winning rule, with a specific branch name ahead of a pattern. GitHub rulesets aggregate and keep the strictest setting, so a second ruleset cannot open a branch.

【工作区隔离跳过】escape=user-decline；reason=用户选择 B，在当前检出创建分支 `feat/branch-access-lifecycle`，不建 worktree。

## Goals / Non-Goals

**Goals:**

- One skill, `branch-access-lifecycle`, holds the policy and the host procedures.
- A committed `branch-access.json` is the only opt-in signal.
- Start establishes a default deny for unmatched release branches, then allows the new branch. Finish removes that allow only after tag and trunk merge, and says so when the branch is still mergeable.
- Trunk writes happen only on a direct invocation. Release skills only report trunk drift.

**Non-Goals:**

- Live calls to a Git host from this change's tests. The skill mutates protection rules; eval prompts are saved, not executed here.
- Changing release behavior in repos that have no marker.
- Code-owner approval, push rules, or deploy-key allow lists.
- Deleting a pre-existing allow rule the user did not name.

## Decisions

### Skill shape

`skills/branch-access-lifecycle/SKILL.md` names five operations: `ensure-default`, `allow-merge`, `freeze`, `check-trunk`, `rollback`. Host steps live in `references/gitlab.md` and `references/github.md`. The body tells the agent to read only the reference for the detected host.

Alternative: copy the commands into both release skills. Rejected. The precedence rules would be written three times.

### Opt-in file

Path: `<repo-root>/branch-access.json`.

```json
{
  "enabled": true,
  "trunk": "main"
}
```

`enabled` is required and must be JSON `true`. `trunk` is optional. A missing file, `enabled: false`, or invalid JSON means not opted in; the release skills do not touch protection. When `trunk` is set, checks use that branch. When it is omitted, the release skill passes the trunk name it already identified.

Alternative: treat "skill is installed" as opt-in. Rejected. A global install would change every repo.

### Release skills do not declare a frontmatter dependency

`git-release-start` and `git-release-finish` look for the marker during their existing flow. Marker absent: no lookup, no protection writes, same flow as today. Marker present and `branch-access-lifecycle` is not available: abort that run and print `npx skills add FuDesign2008/open-skills -g --skill branch-access-lifecycle --yes`. Marker present and the skill is available: call it.

Alternative: frontmatter `dependencies`. Rejected. This repo aborts a skill when a declared dependency is missing, which would stop every release in a partial install even when the repo is not opted in.

### Default deny, then one allow entry

On first opted-in start, if unmatched `release/*` branches can still be merged, the skill sets the default to deny merge and deny push, then adds an exact allow for the new branch (push denied, maintainer merge allowed). Later starts do not rewrite that default. Finish deletes only the exact allow for the shipped branch. If the effective result still allows merge, finish reports the surviving rule and does not claim a freeze.

GitLab numbers in the reference: push `0`, merge `0` for the default; push `0`, merge `40` for an allow entry; `allow_force_push` false. GitHub has no access-level field. An allow entry is an exact classic rule that restricts pushes and is not locked, or a ruleset exclusion. A freeze is lock / loss of that exclusion. The skill does not add bypass actors and does not turn off an existing "include administrators" setting.

### Read both GitHub layers

The skill lists classic branch-protection rules and rulesets. `release/*` is the wildcard. GitHub `*` does not match an extra `/`, so `release/*` matches `release/X.Y.Z`. When both layers target the branch, both are updated. When an organization ruleset or a GitLab group rule is looser and the caller cannot edit it, the operation stops and names that layer.

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
- [Partial skill install] → abort only when the marker is present and the skill is missing.

## Migration Plan

1. Land the skill and the two release-skill edits on `feat/branch-access-lifecycle`.
2. Consumer repos opt in by committing `branch-access.json`. Until that file exists, their release flow is unchanged.
3. Rollback of this change is reverting the skill files. Consumer protection rules already written are not reverted by reverting the skill.

## Open Questions

None that change the spec or the task split. Live host behavior stays outside this change's test run.
