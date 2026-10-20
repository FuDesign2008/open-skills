# Spec Delta

## Purpose

Governs opt-in branch protection so one active release stays mergeable, finished releases freeze, and trunk push stays closed on GitLab and GitHub.

## ADDED Requirements

### Requirement: Marker file gates release-skill protection changes
`git-release-start` and `git-release-finish` SHALL change branch protection only when the target repo contains the committed opt-in marker. Without that marker they SHALL leave protection rules unchanged.

#### Scenario: Marker absent
- **WHEN** either release skill runs in a repo that has no opt-in marker
- **THEN** it does not create, update, or delete protection rules

#### Scenario: Marker present
- **WHEN** either release skill runs in a repo whose opt-in marker is committed
- **THEN** it performs only the protection action specified for that skill

### Requirement: Release start adds one whitelist entry
When the marker is present, `git-release-start` SHALL add the newly created `release/X.Y.Z` to the merge whitelist after the remote branch exists, leaving push denied and merge allowed for maintainers.

#### Scenario: New release becomes mergeable
- **WHEN** start creates `release/X.Y.Z` on the remote and the marker is present
- **THEN** a maintainer can merge into that branch and a direct push is still rejected

#### Scenario: Other release branches stay as they were
- **WHEN** start adds `release/X.Y.Z` to the whitelist
- **THEN** other exact allow rules are not removed

### Requirement: Release finish freezes only the shipped branch
When the marker is present, `git-release-finish` SHALL remove that release branch from the merge whitelist only after both the tag and the merge into trunk have succeeded.

#### Scenario: Shipped branch freezes
- **WHEN** the tag exists and the release-to-trunk merge has succeeded
- **THEN** maintainers can no longer merge into that release branch

#### Scenario: Finish stops before a successful ship
- **WHEN** tagging or the trunk merge has not succeeded
- **THEN** the release branch remains on the whitelist

#### Scenario: A wider rule still allows merge
- **WHEN** the shipped branch is removed from the whitelist and some other matching rule still allows maintainer merge
- **THEN** finish reports the branch as not frozen and names that rule

### Requirement: Default release policy denies merge before whitelist use
When the marker is present, `git-release-start` SHALL establish a default that denies merge for release branches with no allow entry before it adds the new branch. If that default already holds, start SHALL leave it unchanged.

#### Scenario: First opted-in start
- **WHEN** the marker is present, unmatched release branches still allow maintainer merge, and start creates `release/X.Y.Z`
- **THEN** unmatched release branches deny merge, `release/X.Y.Z` allows maintainer merge, and every pre-existing allow entry is listed

#### Scenario: Default already denies merge
- **WHEN** unmatched release branches already deny merge
- **THEN** start adds only the new allow entry and does not rewrite the default

### Requirement: Trunk policy is not mutated by the release skills
`branch-access-lifecycle` SHALL be the only skill that sets trunk (`main` or `master`) to push denied and merge allowed for maintainers. The release skills SHALL only report when the live trunk rule differs from that policy.

#### Scenario: Trunk mismatch during release
- **WHEN** a release skill runs with the marker present and trunk push is allowed
- **THEN** the skill reports the mismatch and does not change the trunk rule

#### Scenario: Direct trunk setup
- **WHEN** the user invokes `branch-access-lifecycle` to set trunk policy
- **THEN** trunk push is denied and maintainer merge stays allowed

### Requirement: Incident rollback is a direct operation
Force-push rollback of a release branch SHALL run only when the user invokes `branch-access-lifecycle` for that incident. `git-release-finish` SHALL NOT perform it as part of a normal release.

#### Scenario: Normal finish does not roll back
- **WHEN** `git-release-finish` completes a release with the marker present
- **THEN** it freezes the branch and does not force-push the branch pointer

#### Scenario: Explicit rollback
- **WHEN** the user invokes rollback for a named release branch and confirms the force-push
- **THEN** the skill backs up the current tip, moves the branch to the requested commit, and restores the frozen policy

### Requirement: GitLab effective permission follows the loosest matching rule
On GitLab, the skill SHALL treat push, merge, and force-push as the most permissive matching rule, including group rules. It SHALL NOT treat a stricter exact rule as a freeze while a looser wildcard still matches.

#### Scenario: Exact deny does not freeze
- **WHEN** `release/*` allows maintainer merge and an exact rule denies merge
- **THEN** the skill reports the branch as still mergeable

#### Scenario: Wildcard freeze with exact allow
- **WHEN** `release/*` denies merge and an exact rule allows maintainer merge
- **THEN** that exact branch is mergeable and other release branches without an allow rule are not

### Requirement: GitHub classic uses the single winning rule
On GitHub classic branch protection, the skill SHALL treat the specific branch-name rule as the only rule for that branch. A whitelist entry SHALL be an exact rule that allows maintainer merge. A freeze SHALL be the absence of that exception under a locking wildcard, or a locking exact rule when no wildcard is in use.

#### Scenario: Exact rule opens one branch
- **WHEN** the wildcard locks `release/*` and an exact classic rule for `release/X.Y.Z` allows maintainer merge
- **THEN** only that branch accepts merges

### Requirement: GitHub rulesets whitelist by exclusion
On GitHub rulesets, the skill SHALL whitelist a release branch by excluding it from the freeze ruleset. It SHALL NOT add a second, looser ruleset to open a branch that a stricter ruleset already targets.

#### Scenario: Exclusion opens the active release
- **WHEN** a freeze ruleset targets `release/*` and excludes `release/X.Y.Z`
- **THEN** that branch is not frozen by that ruleset

#### Scenario: Looser ruleset is rejected
- **WHEN** a freeze ruleset already targets the branch
- **THEN** the skill does not create another ruleset whose only effect would be to loosen that freeze

### Requirement: Both GitHub layers must agree
When a GitHub repo has both a classic rule and a ruleset on the same branch, the skill SHALL change both layers until the effective result matches the requested allow or freeze. If either layer is outside the caller's permission, the skill SHALL stop and report which layer blocked the change.

#### Scenario: Org ruleset cannot be edited
- **WHEN** an organization ruleset freezes the branch and the caller cannot edit it
- **THEN** the skill does not claim the branch is whitelisted or frozen

### Requirement: Permission writes are checked with the host permission result
After every protection write, the skill SHALL verify the branch with the host's permission or read-only result. It SHALL NOT use merge-status or mergeability fields as that verdict.

#### Scenario: GitLab merge status stays mergeable
- **WHEN** a merge request into a frozen release still reports a mergeable status
- **THEN** the skill still reports frozen if the permission result denies merge

### Requirement: Pre-existing wider rules stay visible
When a freeze leaves another exact rule that still allows merge, the skill SHALL list that branch in the result and SHALL NOT delete it unless the user named it.

#### Scenario: Long-lived exact allow remains
- **WHEN** freeze removes only `release/X.Y.Z` and `release/fix-example` has its own allow rule
- **THEN** the result lists `release/fix-example` as still mergeable
