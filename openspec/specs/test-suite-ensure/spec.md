# test-suite-ensure Specification

## Purpose

Behavioral contract for the test-suite-ensure skill, including host-declared advisory vs mandatory modes for PDCA workflows.

## Requirements

### Requirement: test-suite-ensure SHALL support advisory and mandatory modes

`test-suite-ensure` MUST accept a host-declared mode: `advisory` (remind / non-blocking when user declines scaffolding or coverage is missing) or `mandatory` (unit-test failure or refused required scaffolding blocks leaving the execution stage). Host PDCA workflows MUST declare the mode at the call site and MUST NOT re-embed the full coverage decision tree in the workflow SKILL.md.

#### Scenario: solve-workflow uses advisory mode

- **WHEN** `solve-workflow` or `jira-fix-workflow` invokes test-suite-ensure after logic changes
- **THEN** mode is advisory: user may decline scaffolding; the workflow continues with a report reminder

#### Scenario: opsx workflows use mandatory mode

- **WHEN** `opsx-solve-workflow` or `opsx-jira-fix-workflow` invokes test-suite-ensure after all tasks are checked
- **THEN** mode is mandatory: failing unit tests block entry to the verification stage

### Requirement: test-suite-ensure SHALL NOT substitute for test-first-discipline

`test-suite-ensure` MUST remain the post-implementation test-suite ensure path (stack detection, scaffolding, generating/running tests for existing logic, advisory vs mandatory modes). It MUST NOT claim or imply that a successful test-suite-ensure run satisfies failing-test-first / `test-first-discipline` for behavior changes. When both skills are in scope, hosts MUST keep the order: test-first during implementation of behavior changes; test-suite-ensure for scaffolding and coverage gaps afterward (per existing advisory/mandatory rules).

#### Scenario: Boundary stated in skill

- **WHEN** an agent loads `test-suite-ensure` in a project that also uses `test-first-discipline`
- **THEN** test-suite-ensure guidance states it is post-hoc coverage/scaffold and does not replace failing-test-first

#### Scenario: Hosts keep both roles

- **WHEN** a PDCA host depends on both skills
- **THEN** its thin pointers assign test-first to the implementation sequence and test-suite-ensure to the post-task ensure step, without merging them into one gate
