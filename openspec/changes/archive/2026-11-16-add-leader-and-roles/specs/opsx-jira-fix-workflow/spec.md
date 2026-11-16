# Spec Delta: opsx-jira-fix-workflow

## MODIFIED Requirements

### Requirement: Explore-review stage SHALL dispatch architect under contract and gate

After solution selection and before `staged-review-flow`, when a role contract is present,
`opsx-jira-fix-workflow` MUST dispatch `leader` with `Phase: design` so that `leader`
applies the design-phase architect gate. Fail-closed acceptance applies to the leader card.
When no contract is present, the host MUST continue without role dispatch.

#### Scenario: Gate fires with contract on OPSX Jira host

- **WHEN** a solution is selected, a role contract exists, and `architecture: true` is set on the task card
- **THEN** `leader` dispatches `architect` before solution review

#### Scenario: Gate miss skips architect on OPSX Jira host

- **WHEN** a solution is selected, a role contract exists, and no architect gate input matches
- **THEN** `leader` does not auto-dispatch `architect` for that gate
