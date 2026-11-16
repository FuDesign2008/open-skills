# Spec Delta: opsx-solve-workflow

## ADDED Requirements

### Requirement: Verify stage SHALL dispatch leader under contract

When a role contract is present, `opsx-solve-workflow` MUST dispatch `leader` with `Phase: verify` during Stage 7 and fail-closed-accept the leader card, while retaining host-owned OpenSpec/engineering/Figma checks. When no contract is present, Stage 7 MUST run without role dispatch.

#### Scenario: Stage 7 uses leader when contract present

- **WHEN** Stage 7 starts and a role contract exists
- **THEN** the host dispatches `leader` with `Phase: verify`

## MODIFIED Requirements

### Requirement: Phase 3-to-4 boundary SHALL dispatch architect under contract and gate

After Phase 3 selection and before Phase 4 review, when a role contract is present,
`opsx-solve-workflow` MUST dispatch `leader` with `Phase: design` so that `leader` applies
the design-phase architect gate. Fail-closed acceptance applies to the leader card. When no
contract is present, Phase 4 proceeds without role dispatch.

#### Scenario: Gate fires before Phase 4 review

- **WHEN** Phase 3 selection is confirmed, a role contract exists, and a verifiable architecture signal matches
- **THEN** `leader` dispatches `architect` before Phase 4 review

#### Scenario: No contract skips architect at Phase 3-to-4

- **WHEN** Phase 3 selection is confirmed and the project has no role contract
- **THEN** the host does not dispatch `leader` or `architect` and enters Phase 4 as before
