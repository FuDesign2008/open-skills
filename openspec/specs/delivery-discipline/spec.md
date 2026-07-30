# delivery-discipline Specification

## Purpose
Optional post-verify code delivery: need-delivery gate, commit/push via git-commit, open or update PR/MR. Does not merge.

## Requirements
### Requirement: delivery-discipline SHALL own optional post-verify commit and PR/MR creation

`delivery-discipline` MUST be the single source for optional code delivery after verification (and after OpenSpec archive when the host requires archive first). It MUST run a need-delivery gate, then commit/push via `git-commit` when the tree is dirty, then create or update a PR/MR. It MUST NOT merge into a protected branch and MUST NOT own release→main shipping.

#### Scenario: Skip when delivery is not needed

- **WHEN** the delivery surface is clean (no uncommitted changes and no commits to publish), or the user/host declined delivery
- **THEN** the skill skips commit and PR creation, states the reason, and returns to the host

#### Scenario: Commit then open PR when delivery is needed

- **WHEN** delivery is needed and uncommitted changes exist
- **THEN** the agent loads `git-commit` and afterward creates or updates a PR/MR, then stops without merging

#### Scenario: Idempotent when PR already exists

- **WHEN** an open PR/MR already exists for the head branch and the tip is already pushed
- **THEN** the skill does not create an empty commit and may update the PR body with host-supplied extras

### Requirement: delivery-discipline SHALL accept host field maps via placeholders

Hosts MUST supply host-specific PR sections through `{pr-body-extra}` and optional commit fields through `{commit-context}`. The skill MUST append `{pr-body-extra}` to the PR/MR body and MUST NOT drop host-required fields (e.g. Jira link, OpenSpec path).

#### Scenario: Jira host passes extras

- **WHEN** `jira-fix-workflow` or `opsx-jira-fix-workflow` invokes delivery-discipline with Jira and verification fields in `{pr-body-extra}`
- **THEN** those fields appear in the created or updated PR/MR description

### Requirement: delivery-discipline skill identity and layering SHALL stay clear

The skill directory and frontmatter `name` MUST be `delivery-discipline`. Body MUST be English; description MUST include Chinese triggers. It MUST declare `git-commit` as a strong dependency and abort if missing.

#### Scenario: Missing git-commit aborts

- **WHEN** `git-commit` is not available
- **THEN** delivery-discipline aborts with an install hint and does not silently skip commit
