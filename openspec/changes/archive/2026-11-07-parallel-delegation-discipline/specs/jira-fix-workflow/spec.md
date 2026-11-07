## ADDED Requirements

### Requirement: jira-fix-workflow SHALL strong-depend on parallel-delegation-discipline

`jira-fix-workflow` MUST list `parallel-delegation-discipline` in frontmatter `dependencies`. At the workflow's prerequisite check, a missing `parallel-delegation-discipline` MUST abort with an install hint — no silent serial fallback. The workflow MUST thin-reference the discipline at stage 3 (analysis), stage 5 (review), and stage 8 (verify) with at most one pointer per stage, and MUST NOT restate the admission test, composition modes, return contract, or serial reservation list in its own body.

When the admitted unit set is non-empty, the workflow MUST state the parallel plan — unit count, split basis, and per-unit write set or isolated workspace — inside the stage output the workflow already produces, adding no new pause and no new approval event. The serial reservation list applies unconditionally: the Jira status transition (claiming 「解决中」 before analysis) and every Jira comment stay single-owner serial actions, and the stage-4 difficulty grading gateway stays a serial decision even when analysis ran in parallel.

#### Scenario: Missing dependency aborts the prerequisite check

- **WHEN** `parallel-delegation-discipline` is not available at stage 0
- **THEN** the workflow aborts with the install hint instead of running serially by default

#### Scenario: Parallel analysis still yields one serial grading decision

- **WHEN** stage 3 analysis runs as 3–5 parallel units
- **THEN** the stage output still closes with one analysis gate block and stage 4 produces a single difficulty grade, not one per unit

#### Scenario: Jira writes stay serial under parallelism

- **WHEN** any stage runs a parallel unit set
- **THEN** the status claim, the analysis comment, and the post-merge writeback remain serial single-owner actions

#### Scenario: Stage 8 role dispatch keeps its dependency edge

- **WHEN** the project provides a role contract and stage 8 runs 8a (standard review), 8b (escalated review), and 8c (integration test)
- **THEN** 8b is admitted only when its escalation condition holds and runs after 8a by contract, while only the independent units of 8a and 8c may be admitted to a parallel set

#### Scenario: Serial override is honored

- **WHEN** the user requests serial execution during an admissible parallel stage
- **THEN** the run executes serially and records the override with its reason
