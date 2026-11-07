# solve-workflow Specification

## Purpose
TBD - created by archiving change parallel-delegation-discipline. Update Purpose after archive.

## Requirements

### Requirement: solve-workflow SHALL strong-depend on parallel-delegation-discipline

`solve-workflow` MUST list `parallel-delegation-discipline` in frontmatter `dependencies`. At the startup prerequisite check, a missing `parallel-delegation-discipline` MUST abort with an install hint — no silent serial fallback. The workflow MUST thin-reference the discipline at stage 2 (analyze), stage 4 (review), and stage 7 (verify) with at most one pointer per stage, and MUST NOT restate the admission test, composition modes, return contract, or serial reservation list in its own body.

When the admitted unit set is non-empty, the workflow MUST state the parallel plan — unit count, split basis, and per-unit write set or isolated workspace — inside the stage output the workflow already produces, adding no new pause and no new approval event. Stages 1–5 keep their no-business-code-write constraint regardless of parallelism; parallel writing is admitted only in stage 6.

#### Scenario: Missing dependency aborts startup

- **WHEN** `parallel-delegation-discipline` is not available at the prerequisite check
- **THEN** the workflow aborts with the install hint instead of running serially by default

#### Scenario: Parallel plan rides the existing stage confirmation

- **WHEN** stage 2 analysis yields 3–5 independent read-only units
- **THEN** the stage output states the unit count, split basis, and that no write set applies, within the confirmation output already required, and no extra pause is added

#### Scenario: Parallel analysis does not write business code

- **WHEN** a parallel unit set runs during stages 1–5
- **THEN** no unit modifies business code; analysis-assist edits remain subject to `analysis-core`'s temporary-change and rollback gate

#### Scenario: Serial override is honored

- **WHEN** the user requests serial execution during an admissible parallel stage
- **THEN** the run executes serially and records the override with its reason
