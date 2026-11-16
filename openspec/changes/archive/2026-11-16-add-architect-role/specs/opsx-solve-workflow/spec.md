# Spec Delta: opsx-solve-workflow

## ADDED Requirements

### Requirement: Phase 3-to-4 boundary SHALL dispatch architect under contract and gate

After Phase 3 selection and before Phase 4 review, `opsx-solve-workflow` MUST apply the design-phase architect gate from `agent-role-separation`. If a role contract is present and the gate fires, dispatch `architect` at `escalated` with the change design-doc path in `Artifacts`, then fail-closed accept. Otherwise enter Phase 4 without dispatching `architect`.

#### Scenario: Gate fires before Phase 4 review

- **WHEN** Phase 3 selection is confirmed, a role contract exists, and a verifiable architecture signal matches
- **THEN** the host dispatches `architect` before Phase 4 review

#### Scenario: No contract skips architect at Phase 3-to-4

- **WHEN** Phase 3 selection is confirmed and the project has no role contract
- **THEN** the host does not dispatch `architect` and enters Phase 4 as before
