# Spec Delta: jira-fix-workflow

## ADDED Requirements

### Requirement: Design-phase SHALL dispatch architect under contract and gate

After solution selection and before `staged-review-flow`, `jira-fix-workflow` MUST apply the design-phase architect gate from `agent-role-separation`. If a role contract is present and the gate fires, dispatch `architect` at `escalated` with design-doc `Artifacts`, then fail-closed accept and enforce the write boundary. Otherwise continue without dispatching `architect`.

#### Scenario: Gate fires with contract

- **WHEN** Stage 5 has a selected solution, a role contract exists, and an explicit architecture mark is set
- **THEN** the host dispatches `architect` before solution review and records the result card

#### Scenario: Gate does not fire

- **WHEN** Stage 5 has a selected solution and a role contract exists but no gate input matches
- **THEN** the host does not dispatch `architect` and proceeds to solution review

#### Scenario: Architect diff outside design paths is rejected

- **WHEN** `architect` returns PASS but the working-tree diff includes a production file
- **THEN** the organizer rejects that result and does not treat the stage as passed for design dispatch
