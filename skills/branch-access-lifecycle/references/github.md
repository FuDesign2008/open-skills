# GitHub branch access

Read this file only when `origin` is GitHub. `<owner>/<repo>` comes from the `origin` URL. GitHub `*` does not match `/`, so the pattern `release/*` matches `release/1.2.3` and does not match `release/team/1.2.3`.

GitHub has no Maintainer access level. "Maintainer merge" here means people who can already merge to the repo may merge, direct pushes stay restricted, and this skill adds no bypass actor. Do not turn off an existing "include administrators" or ruleset-bypass setting. Do not claim administrators are blocked unless that setting is already on.

Two layers can both apply. Classic branch protection uses one winning rule: a specific branch name beats a pattern. Rulesets all apply, and the strictest setting wins, so a second ruleset cannot open a branch. A whitelist entry on a ruleset is an exclusion from the freeze ruleset.

The read commands below run immediately. Creating, updating, or deleting a classic rule or a ruleset changes protection. Run one of those only after the user accepts that operation in `SKILL.md`. When the live rule already matches, stop with no write.

## Read rules

```bash
gh api graphql -f query='
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    branchProtectionRules(first: 100) {
      nodes { pattern lockBranch allowsForcePushes restrictsPushes isAdminEnforced }
    }
    rulesets(first: 100) {
      nodes { name enforcement target }
    }
  }
}' -f owner='<owner>' -f name='<repo>'
```

For the ruleset that targets release branches, read its full payload (`gh api repos/<owner>/<repo>/rulesets/<id>`) and keep every rule other than the include/exclude list. Also read organization rulesets that target this repo. When an organization ruleset freezes the branch and the caller cannot edit it, set `blocked-layer` and stop.

## ensure-default

Unmatched `release/*` branches end up read-only (classic `lockBranch: true`, or a ruleset that restricts updates and blocks force-pushes, with no exclusion for those branches).

If the repo already uses a freeze ruleset, edit that ruleset. If it already uses a classic wildcard and no ruleset, edit the classic rule. If both exist, both must deny unmatched release branches. If neither exists, create a classic lock on `release/*` and do not invent a ruleset unless the repo has no classic protection API.

When a classic rule already exists, change only the lock and the push restriction. Leave status checks, review counts, and conversation rules as they are.

List every exact classic pattern and every ruleset exclusion that still allows merge.

## allow-merge

Classic: create or update one rule whose pattern is the exact branch name, with `lockBranch: false`, pushes restricted, force-push off. That rule replaces the wildcard for this branch only.

Ruleset: add `refs/heads/<branch>` to the freeze ruleset's exclude list. Do not create a second ruleset whose only job is to loosen the freeze.

When both layers exist, do both. Then read the aggregated rules for the branch (`gh api repos/<owner>/<repo>/rules/branches/<branch>`). If either layer still locks it, the allow did not land.

## freeze

Classic: delete the exact-name protection rule so the locking wildcard applies again. If there is no wildcard, set `lockBranch: true` on the exact rule.

Ruleset: remove `refs/heads/<branch>` from the exclude list.

If the aggregated rules still allow updates, report the branch as not frozen and name the rule or ruleset that allows them. Do not delete an exclusion or exact rule the user did not name.

## check-trunk

Read classic protection and rules for the trunk branch. Expected: direct push restricted or the branch locked against pushes that are not merges, force-push off, pull requests still mergeable by people who can merge. Print a mismatch. Do not write.

## set-trunk

Apply the expected trunk policy only after the user accepts `set-trunk`. Preserve status checks and review rules already on that branch.

## rollback

Run only after the user confirms `<sha>` and the force-push.

1. Push `backup/<branch>-<short-sha>` from the current tip. The name must not match `release/*`.
2. On the exact branch only, allow force-push long enough for one update. On classic protection that is `allowsForcePushes: true` on the exact rule. On a ruleset, add a temporary exclusion or a bypass that you remove in the next step. Do not loosen the wildcard for every release branch.
3. `git push --force-with-lease=refs/heads/<branch>:<current-tip> origin <sha>:refs/heads/<branch>`
4. Run `freeze` for that branch.
5. Tell collaborators to fetch and `git reset --hard origin/<branch>`. Rewinding the branch does not unpublish artifacts.

## Permission check

The verdict is the aggregated rules for that branch plus, for classic, `lockBranch` on the winning rule. `mergeable_state` is not the verdict. When no pull request targets the branch, set `observed-mr` to `none` and say the check is the rule payload.
