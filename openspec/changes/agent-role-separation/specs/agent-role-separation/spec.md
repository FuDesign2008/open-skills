# Spec Delta

## ADDED Requirements

### Requirement: Role contract SHALL define task and result cards

The role contract SHALL define a task card with `Goal`, `Artifacts`, `Constraints`, `Acceptance criteria`, and `Model tier`, and a result card with `Verdict`, `Confidence`, `Model tier`, `Findings`, `Evidence`, and `Unresolved`. A reviewer role MUST additionally report `Standards` and `Spec` as separate axis verdicts.

#### Scenario: Reviewer reports two axes

- **WHEN** a reviewer role returns a result card
- **THEN** it contains both `Standards` and `Spec` verdicts, and `Verdict` is PASS only when both are PASS

#### Scenario: Missing field is a format error

- **WHEN** a result card omits any required field
- **THEN** the organizer treats it as a format error and blocks the stage

### Requirement: Organizer SHALL accept results fail-closed

The organizer MUST read every result-card field. A missing field, an empty `Evidence` entry, or a `PASS` carrying a non-empty `Unresolved` MUST block acceptance. An unexecuted check MUST NOT pass as completed.

#### Scenario: Unresolved blocks a pass

- **WHEN** a card reports `Verdict: PASS` with a non-empty `Unresolved`
- **THEN** the organizer does not accept it, and the role must resolve the item or return `FAIL` / `Confidence: low`

#### Scenario: Empty evidence blocks acceptance

- **WHEN** a card's `Evidence` is empty
- **THEN** the organizer blocks the stage

### Requirement: Escalation SHALL be checkable and SHALL NOT overrule failure

The organizer MUST resolve the model tier from the project role configuration and pass it on dispatch, MUST record the dispatched alias in the stage report, and MUST reject a card whose `Model tier` disagrees with that record. A passing escalated card MAY discharge a standard card's `Confidence: low`, but MUST NOT discharge a `FAIL`.

#### Scenario: Escalated pass discharges low

- **WHEN** the standard card is `PASS` with `Confidence: low` and the escalated card is `PASS` with `Confidence: high`
- **THEN** the review is accepted

#### Scenario: Escalated pass never overrules fail

- **WHEN** the standard card is `FAIL` and the escalated card is `PASS`
- **THEN** the review remains failed and routes to fix

#### Scenario: Missing configuration aborts

- **WHEN** the project role configuration is missing or unreadable, or a tier has no mapping
- **THEN** the organizer aborts and reports instead of falling back silently

### Requirement: Write-capable roles SHALL be limited to test paths

A write-capable role MUST only add or modify files matching the configured test paths. The organizer MUST inspect the resulting diff and invalidate that role's result when a change falls outside the set.

#### Scenario: Production change invalidates the result

- **WHEN** a write-capable role modifies a file outside the configured test paths
- **THEN** the organizer invalidates that role's result

#### Scenario: Reviewer working tree is unchanged

- **WHEN** a reviewer role completes
- **THEN** the organizer compares the working-tree snapshot taken before and after; any difference invalidates the result

### Requirement: Host integration SHALL be opt-in by presence

`jira-fix-workflow` Stage 8 MUST dispatch roles only when the project provides a role contract, and MUST run its original checks otherwise. The role contract MUST remain a repository-level configuration that is not part of the skill installation surface.

#### Scenario: No contract keeps the original behavior

- **WHEN** a project has no role contract
- **THEN** Stage 8 runs its original checks and the skill behaves as before
