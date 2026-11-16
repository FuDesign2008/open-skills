# Spec Delta: agent-role-separation

## ADDED Requirements

### Requirement: Leader meta-role SHALL schedule subordinates by phase

The role catalog MUST include meta-role `leader`. When a role contract is present, PDCA hosts that opt into role dispatch MUST dispatch `leader` with a task card that includes `Phase` (`clarify`|`design`|`implement`|`verify`|`release`|`retrospect`). `leader` MUST select subordinates per the contract's phase defaults and gates, fail-closed-accept nested cards, and return one aggregated leader card. Default model tier for `leader` is `escalated`.

#### Scenario: Host dispatches leader for design phase

- **WHEN** a role contract is present and the host reaches the design-phase role boundary
- **THEN** the host dispatches `leader` with `Phase: design` and fail-closed-accepts the leader card

#### Scenario: Leader surfaces nested FAIL

- **WHEN** a required subordinate returns `Verdict: FAIL`
- **THEN** the leader card is `FAIL` and the host does not treat the phase as passed

### Requirement: Role catalog SHALL include the agreed subordinate ids

The contract MUST list subordinate roles `product-manager`, `designer`, `architect`, `developer`, `tester`, `code-reviewer`, `security-reviewer`, `debugger`, `perf-engineer`, `releaser`, `tech-writer`, `researcher`, and `retrospector`. Existing ids `developer`, `tester`, `code-reviewer`, and `architect` MUST keep those names.

#### Scenario: Catalog enumerates product-manager

- **WHEN** a reader opens the role contract catalog
- **THEN** it includes `product-manager` and does not rename `developer`

## MODIFIED Requirements

### Requirement: Host integration SHALL be opt-in by presence

PDCA hosts that support role dispatch MUST dispatch roles only when the project provides a
role contract, otherwise run without role dispatch. When enabled, hosts MUST dispatch
`leader` for opted-in phases rather than hardcoding subordinate lists. The role contract
MUST stay repository-level and MUST NOT be part of the skill installation surface.

#### Scenario: No contract keeps the original behavior

- **WHEN** a project has no role contract
- **THEN** the host runs its original checks without role dispatch

#### Scenario: Contract present uses leader

- **WHEN** a project has a role contract and the host reaches a role-dispatch boundary
- **THEN** the host dispatches `leader` with a `Phase` and does not inline 8a/8b/8c-style subordinate lists
