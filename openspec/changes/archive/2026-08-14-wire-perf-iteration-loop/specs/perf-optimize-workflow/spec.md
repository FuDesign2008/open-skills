## ADDED Requirements

### Requirement: Stages 5-6 SHALL execute as the iteration loop

The Optimize and A/B-verify stages MUST execute as a repeating iteration loop governed by the strong dependency `perf-iteration-loop` (round contract and stop conditions owned there). A missing `perf-iteration-loop` at the prerequisite check MUST abort the workflow. A single pass MUST only run when the user explicitly requests exactly one round, and that exception MUST be stated in the run's output.

#### Scenario: Default run is loop-shaped

- **WHEN** the workflow reaches Stage 5 without an explicit single-pass request
- **THEN** optimization proceeds round-by-round under the `perf-iteration-loop` protocol until a stop condition fires

#### Scenario: Missing loop dependency aborts

- **WHEN** the workflow's prerequisite check finds `perf-iteration-loop` unavailable
- **THEN** the workflow aborts with the install command instead of degrading to one-pass mode
