## ADDED Requirements

### Requirement: OPSX Jira fix workflow SHALL strong-depend on parallel-delegation-discipline

`opsx-jira-fix-workflow` MUST list `parallel-delegation-discipline` in frontmatter `dependencies`. At the workflow's prerequisite check, a missing `parallel-delegation-discipline` MUST abort with an install hint — no silent serial fallback. The workflow MUST thin-reference the discipline at stage 2 (analysis), stage 4 (review), and stage 7 (verification) with at most one pointer per stage, and MUST NOT restate the admission test, composition modes, return contract, or serial reservation list in its own body.

When the admitted unit set is non-empty, the workflow MUST state the parallel plan — unit count, split basis, and per-unit write set or isolated workspace — inside the stage output the workflow already produces, adding no new pause and no new approval event. OpenSpec artifact writes and Jira status transitions stay serial: a parallel analysis may produce unit findings, but the change's `proposal.md`, `design.md`, `tasks.md`, and delta specs are written by the workflow's own single-owner steps.

#### Scenario: Missing dependency aborts the prerequisite check

- **WHEN** `parallel-delegation-discipline` is not available at stage 0
- **THEN** the workflow aborts with the install hint instead of running serially by default

#### Scenario: OpenSpec artifacts keep a single writer

- **WHEN** stage 2 analysis runs as 3–5 parallel units
- **THEN** the units return findings only, and the change's OpenSpec artifacts are written afterwards by the workflow's single-owner steps

#### Scenario: Jira transitions stay serial

- **WHEN** any stage runs a parallel unit set
- **THEN** the status claim and the post-merge writeback remain serial single-owner actions

#### Scenario: Serial override is honored

- **WHEN** the user requests serial execution during an admissible parallel stage
- **THEN** the run executes serially and records the override with its reason
