## ADDED Requirements

### Requirement: test-first-discipline SHALL enforce failing-test-first for behavior changes

For work that changes production behavior (features, bug fixes, behavior-affecting refactors), `test-first-discipline` MUST require: write a failing test (or equivalent automated failing check) first, observe the failure in the current session, then write minimal production code to pass. If production code was written before a failing test was observed, the agent MUST delete that production code and restart from the failing test (no "keep as reference" / "adapt while writing tests").

#### Scenario: Red then green

- **WHEN** an agent implements a behavior change under this skill
- **THEN** it has already run and observed a failing test for that behavior before editing production code to make it pass

#### Scenario: Code-first is discarded

- **WHEN** production behavior code was written without a prior observed failing test
- **THEN** the agent deletes that production code and starts over from a failing test

### Requirement: test-first-discipline SHALL define explicit exceptions

The skill MUST list exceptions where failing-test-first does not apply unless the user asks otherwise: throwaway prototypes, generated code, pure configuration with no behavior under test, pure documentation, and **user-explicit skip** with a short recorded reason. Rationalizing "just this once" without an exception or user skip MUST NOT be allowed.

#### Scenario: Documented exception

- **WHEN** the change is pure documentation or the user explicitly skips test-first with a stated reason
- **THEN** the agent may proceed without a failing test first and records the exception/skip

#### Scenario: Unstated skip is forbidden

- **WHEN** the work is a normal behavior change and no exception applies
- **THEN** the agent MUST NOT skip the failing-test-first sequence

### Requirement: test-first-discipline SHALL stay distinct from ensure-tests

`test-first-discipline` owns **implementation order** (red before production code). `ensure-tests` owns **post-hoc** stack detection, scaffolding, and coverage generation/runs. Completing `ensure-tests` MUST NOT be described as satisfying test-first. Hosts that declare both MUST invoke test-first during behavior implementation and ensure-tests after (or for gaps), without collapsing the two.

#### Scenario: Post-hoc green is not test-first

- **WHEN** an agent only runs `ensure-tests` after implementing behavior code with no prior failing test
- **THEN** that path MUST NOT be reported as compliance with `test-first-discipline`

### Requirement: test-first-discipline skill identity SHALL avoid external name collisions

The skill directory and frontmatter `name` MUST be `test-first-discipline` (not `tdd` or `test-driven-development`). Body MUST be English; description MUST include Chinese triggers.

#### Scenario: Installable name is collision-free

- **WHEN** the skill is published in open-skills
- **THEN** its `name` is `test-first-discipline` and does not reuse `tdd` or `test-driven-development`
