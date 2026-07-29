## ADDED Requirements

### Requirement: design-approval-gate SHALL block production implementation until approval

`design-approval-gate` MUST forbid production/behavior code edits (and implementation-skill invocation whose purpose is to ship the fix) until the chosen solution/design has been **approved** for the current change. Approval means: explicit user pass in manual mode, or a recorded auto-mode self-approval under a named escape (see escape requirement). OpenSpec artifact writes and analysis-assist temporary edits governed by `analysis-core` are not production implementation.

#### Scenario: Manual mode blocks until user pass

- **WHEN** the agent is in manual mode and the user has not approved the solution/design
- **THEN** the agent MUST NOT begin stage-6-style production implementation

#### Scenario: Artifact-only work remains allowed

- **WHEN** the agent needs to write OpenSpec proposal/specs/design/tasks before approval completes
- **THEN** those artifact writes remain allowed; production business code remains forbidden

### Requirement: design-approval-gate SHALL define named escapes with 留痕

The skill MUST define named escapes that MAY bypass human approval: **auto mode** (workflow auto trigger), **Jira auto/force** (`--auto` / `--force`), and **lean hotfix** (host lean path with high certainty). Each escape MUST leave a short 留痕 (mode/path + reason). Silent skip without a named escape MUST NOT be allowed. "Too simple" alone is NOT an escape.

#### Scenario: Auto mode escape with 留痕

- **WHEN** the host is in auto mode and proceeds to implementation without a human pass
- **THEN** the agent records an auto-mode design-approval escape 留痕 and may proceed

#### Scenario: Unnamed skip forbidden

- **WHEN** manual mode and the user has not approved and no named escape applies
- **THEN** the agent MUST NOT implement production behavior code

### Requirement: design-approval-gate skill identity SHALL avoid external name collisions

The skill directory and frontmatter `name` MUST be `design-approval-gate` (not `brainstorming`). Body MUST be English; description MUST include Chinese triggers.

#### Scenario: Collision-free name

- **WHEN** the skill is published in open-skills
- **THEN** its `name` is `design-approval-gate`
