# agent-role-separation Specification

## Purpose
Defines the repository-level role contract for organizer ↔ role dispatch: task/result cards, fail-closed acceptance, model tiers, write boundaries (including `architect`), and opt-in host integration for verification and design-phase roles.
## Requirements
### Requirement: Role contract SHALL define task and result cards

The role contract SHALL define a task card with `Goal`, `Artifacts`, `Constraints`, and
`Acceptance criteria`, and a result card with `Verdict`, `Confidence`, `Model tier`,
`Findings`, `Evidence`, and `Unresolved`. A reviewer role MUST prefix each finding with its
axis (`Standards` or `Spec`) and MUST NOT merge the two axes into one ranked list.

#### Scenario: Missing field is a format error

- **WHEN** a result card omits any required field
- **THEN** the organizer treats it as a format error and blocks the stage

#### Scenario: Reviewer labels findings by axis

- **WHEN** a reviewer role returns findings
- **THEN** each finding carries a `[Standards]` or `[Spec]` prefix

### Requirement: Organizer SHALL accept results fail-closed

The organizer MUST read every result-card field. A missing field, an empty `Evidence`
entry, or a `Verdict: PASS` carrying a non-empty `Unresolved` MUST block acceptance. An
unexecuted check MUST return `FAIL`; it MUST NOT ride along with a pass.

#### Scenario: Unresolved blocks a pass

- **WHEN** a card reports `Verdict: PASS` with a non-empty `Unresolved`
- **THEN** the organizer does not accept it

#### Scenario: Empty evidence blocks acceptance

- **WHEN** a card's `Evidence` is empty
- **THEN** the organizer blocks the stage

### Requirement: Confidence SHALL be recorded but SHALL NOT gate acceptance

`Confidence` MUST be recorded in the stage report and MUST NOT change the pass/fail
outcome. The stage passes when every card is `Verdict: PASS` with an empty `Unresolved`.

#### Scenario: Low confidence with passing verdicts

- **WHEN** every card is `Verdict: PASS` with an empty `Unresolved` and one card reports
  `Confidence: low`
- **THEN** the stage passes, and the low confidence is recorded

### Requirement: Escalation SHALL run the same role with the escalated tier

The organizer MUST run the escalated review when a changed path matches the sensitive-path
list in `skills/merge-discipline/reference.md`, when the diff exceeds that skill's
large-diff row, or when the standard review reports `Confidence: low`. The escalated review
MUST use the same agent and the same flow with the `escalated` tier. Both cards are
independent and both must pass; a `FAIL` on either card fails the review.

#### Scenario: Escalated failure fails the review

- **WHEN** the standard card is `PASS` and the escalated card is `FAIL`
- **THEN** the review fails and routes to fix

#### Scenario: Missing role configuration aborts

- **WHEN** the project role configuration is missing or unreadable, or a tier has no mapping
- **THEN** the organizer aborts and reports instead of falling back silently

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

PDCA hosts that support role dispatch MUST dispatch roles only when the project provides a
role contract, otherwise run without role dispatch. Verification-stage and design-phase
`architect` dispatch each apply this presence guard. The role contract MUST stay
repository-level and MUST NOT be part of the skill installation surface.

#### Scenario: No contract keeps the original behavior

- **WHEN** a project has no role contract
- **THEN** Stage 8 runs its original checks and the skill behaves as before

#### Scenario: No contract skips design-phase architect dispatch

- **WHEN** a project has no role contract and the architecture gate would otherwise fire
- **THEN** the host does not dispatch `architect` and continues with organizer-owned design steps

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

