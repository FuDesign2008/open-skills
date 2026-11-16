# Spec Delta: opsx-jira-fix-workflow

## ADDED Requirements

### Requirement: Explore-review stage SHALL dispatch architect under contract and gate

After solution selection and before `staged-review-flow`, `opsx-jira-fix-workflow` MUST apply the design-phase architect gate from `agent-role-separation`. If a role contract is present and the gate fires, dispatch `architect` at `escalated` with the OpenSpec design-doc in `Artifacts`, then fail-closed accept. Otherwise continue without dispatching `architect`.

#### Scenario: Gate fires with contract on OPSX Jira host

- **WHEN** a solution is selected, a role contract exists, and `architecture: true` is set on the task card
- **THEN** the host dispatches `architect` before solution review

#### Scenario: Gate miss skips architect on OPSX Jira host

- **WHEN** a solution is selected, a role contract exists, and no gate input matches
- **THEN** the host does not dispatch `architect` and proceeds to solution review
