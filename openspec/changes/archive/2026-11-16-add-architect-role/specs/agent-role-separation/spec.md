# Spec Delta: agent-role-separation

## ADDED Requirements

### Requirement: Architect role SHALL own design docs at escalated tier

The role catalog MUST include `architect`. Dispatch MUST use the `escalated` model tier. `architect` MAY write only design-document paths in task-card `Artifacts` (default `openspec/changes/<name>/design.md` when a change exists) and MUST NOT modify production or test code. Manual dispatch MUST remain available when a role contract is present.

#### Scenario: Architect default tier is escalated

- **WHEN** the organizer dispatches `architect`
- **THEN** the task card's model tier is `escalated` and the organizer resolves that tier from the project role configuration

#### Scenario: Architect design-doc write is accepted

- **WHEN** `architect` writes only paths listed in `Artifacts` that are design documents
- **THEN** the organizer accepts the write set for boundary purposes

#### Scenario: Architect touching production code is rejected

- **WHEN** `architect`'s diff modifies a production or test file
- **THEN** the organizer rejects that result

### Requirement: Design-phase architect dispatch SHALL use an explicit-or-verifiable gate

When a role contract is present, a PDCA host MUST auto-dispatch `architect` after solution selection and before solution review iff an explicit architecture mark or a verifiable architecture signal holds. Otherwise it MUST NOT auto-dispatch. The host MUST record which gate input matched, or that none matched. Signal definitions live in the role contract.

#### Scenario: Explicit mark triggers dispatch

- **WHEN** a role contract is present and the user marks `architecture: true`
- **THEN** the host dispatches `architect` after solution selection and before solution review

#### Scenario: Verifiable signal triggers dispatch

- **WHEN** a role contract is present and the selected solution proposes a new top-level module directory
- **THEN** the host dispatches `architect` and records that signal as the gate match

#### Scenario: No mark and no signal skips auto-dispatch

- **WHEN** a role contract is present but neither an explicit mark nor a verifiable signal holds
- **THEN** the host does not auto-dispatch `architect` and continues to solution review

## MODIFIED Requirements

### Requirement: Write boundaries SHALL match the role

`code-reviewer` MUST NOT write files; because `Bash` can still redirect output, this is a
stated convention, not a sandbox. `tester` MAY add or modify test files only and MUST NOT
change production code. `developer` MAY modify production code. `architect` MAY write design
documents only (task-card `Artifacts`) and MUST NOT modify production or test code. The
organizer MUST inspect the diff produced by a write-capable role and reject a result that
crosses its boundary.

#### Scenario: Tester touching production code is rejected

- **WHEN** the tester's diff changes a production file
- **THEN** the organizer rejects that result

#### Scenario: Architect touching test code is rejected

- **WHEN** the architect's diff changes a test file
- **THEN** the organizer rejects that result

### Requirement: Host integration SHALL be opt-in by presence

PDCA hosts that support role dispatch (`jira-fix-workflow`, `opsx-jira-fix-workflow`,
`solve-workflow`, `opsx-solve-workflow`) MUST dispatch roles only when the project provides
a role contract, and MUST run without role dispatch otherwise. Verification-stage dispatch
(for example `jira-fix-workflow` Stage 8: `code-reviewer` / `tester`) and design-phase
`architect` dispatch each apply this presence guard independently. The role contract MUST
remain a repository-level configuration that is not part of the skill installation surface.

#### Scenario: No contract keeps the original behavior

- **WHEN** a project has no role contract
- **THEN** Stage 8 runs its original checks and the skill behaves as before

#### Scenario: No contract skips design-phase architect dispatch

- **WHEN** a project has no role contract and the architecture gate would otherwise fire
- **THEN** the host does not dispatch `architect` and continues with organizer-owned design steps
