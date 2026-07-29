## ADDED Requirements

### Requirement: feature-branch-closeout SHALL compose with workspace-isolation-discipline for cleanup

When optional worktree/isolation cleanup is offered, `feature-branch-closeout` MUST treat destruction as composing with `workspace-isolation-discipline` (create/detect owned there; destroy offered here). It MUST NOT implement a full create-isolation flow inside closeout.

#### Scenario: Cleanup only

- **WHEN** closeout detects an isolation workspace from the change
- **THEN** it may offer remove/cleanup without creating a new isolation workspace
