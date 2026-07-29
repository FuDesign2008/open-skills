## ADDED Requirements

### Requirement: ensure-tests SHALL NOT substitute for test-first-discipline

`ensure-tests` MUST remain the post-implementation test-suite ensure path (stack detection, scaffolding, generating/running tests for existing logic, advisory vs mandatory modes). It MUST NOT claim or imply that a successful ensure-tests run satisfies failing-test-first / `test-first-discipline` for behavior changes. When both skills are in scope, hosts MUST keep the order: test-first during implementation of behavior changes; ensure-tests for scaffolding and coverage gaps afterward (per existing advisory/mandatory rules).

#### Scenario: Boundary stated in skill

- **WHEN** an agent loads `ensure-tests` in a project that also uses `test-first-discipline`
- **THEN** ensure-tests guidance states it is post-hoc coverage/scaffold and does not replace failing-test-first

#### Scenario: Hosts keep both roles

- **WHEN** a PDCA host depends on both skills
- **THEN** its thin pointers assign test-first to the implementation sequence and ensure-tests to the post-task ensure step, without merging them into one gate
