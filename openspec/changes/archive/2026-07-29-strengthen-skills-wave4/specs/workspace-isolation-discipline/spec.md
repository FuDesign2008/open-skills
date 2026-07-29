## ADDED Requirements

### Requirement: workspace-isolation-discipline SHALL offer isolation before risky execution

Before host execution of non-trivial behavior changes, `workspace-isolation-discipline` MUST check whether an isolated workspace already exists for the change; if not, offer to create one (prefer platform-native isolation if available, else `git worktree` under a project-ignored path such as `.worktrees/`). The user MAY decline; lean/hotfix paths MAY stay in-place with a short 留痕. Creation MUST NOT replace `design-approval-gate`.

#### Scenario: Offer before execute

- **WHEN** the agent is about to start production implementation on a feature branch and no isolation is active
- **THEN** it offers workspace isolation (or records lean/hotfix in-place 留痕) before editing

#### Scenario: Existing isolation is reused

- **WHEN** an isolation workspace for this change already exists
- **THEN** the agent prefers continuing there rather than creating another

### Requirement: workspace-isolation-discipline SHALL not own closeout destruction

Removing or cleaning isolated workspaces after verify/archive MUST remain the responsibility of `feature-branch-closeout` (optional cleanup). This skill owns detect/create/consent only and MAY document how closeout should remove a worktree it created.

#### Scenario: Cleanup deferred to closeout

- **WHEN** verification completes and a worktree was used
- **THEN** destruction is offered via feature-branch-closeout, not silently by this skill mid-execution

### Requirement: workspace-isolation-discipline skill identity SHALL avoid external name collisions

The skill `name` MUST be `workspace-isolation-discipline` (not `using-git-worktrees`). Body English; description includes Chinese triggers.

#### Scenario: Collision-free name

- **WHEN** published in open-skills
- **THEN** `name` is `workspace-isolation-discipline`
