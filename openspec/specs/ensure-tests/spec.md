# ensure-tests Specification

## Purpose

Behavioral contract for the ensure-tests skill, including host-declared advisory vs mandatory modes for PDCA workflows.

## Requirements

### Requirement: ensure-tests SHALL support advisory and mandatory modes

`ensure-tests` MUST accept a host-declared mode: `advisory` (remind / non-blocking when user declines scaffolding or coverage is missing) or `mandatory` (unit-test failure or refused required scaffolding blocks leaving the execution stage). Host PDCA workflows MUST declare the mode at the call site and MUST NOT re-embed the full coverage decision tree in the workflow SKILL.md.

#### Scenario: solve-workflow uses advisory mode

- **WHEN** `solve-workflow` or `jira-fix-workflow` invokes ensure-tests after logic changes
- **THEN** mode is advisory: user may decline scaffolding; the workflow continues with a report reminder

#### Scenario: opsx workflows use mandatory mode

- **WHEN** `opsx-solve-workflow` or `opsx-jira-fix-workflow` invokes ensure-tests after all tasks are checked
- **THEN** mode is mandatory: failing unit tests block entry to the verification stage
