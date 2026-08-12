## MODIFIED Requirements

### Requirement: feature-branch-closeout SHALL compose with git-worktree-discipline for cleanup

When optional worktree/isolation cleanup is offered, `feature-branch-closeout` MUST treat destruction as composing with `git-worktree-discipline` (create/detect owned there; destroy offered here). It MUST NOT implement a full create-isolation flow inside closeout. References to `workspace-isolation-discipline` MUST be updated to `git-worktree-discipline`.

#### Scenario: Cleanup only

- **WHEN** closeout detects an isolation workspace from the change
- **THEN** it may offer remove/cleanup without creating a new isolation workspace
