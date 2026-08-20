## MODIFIED Requirements

### Requirement: Stages 5-6 SHALL execute as the iteration loop

The Optimize and A/B-verify stages MUST execute as a repeating iteration loop **mounted on a real environment loop-runner capability** (ralph-style runner, `/loop`, goal-driven long-run, or any mechanism that auto-continues the agent across rounds). At Stage 5 entry the workflow MUST probe the environment: with a runner present, it MUST mount its loop body (profile fresh hotspots → one target → optimize → A/B judge with revert on rejection → correctness gate → commit + snapshot + log) and run until a stop condition (5 consecutive no-gain rounds / target met / ROI exhausted). Without a runner, the workflow MUST stop optimization execution and print install guidance — analysis-stage findings remain deliverable — and MUST NOT degrade to a single manual pass. The gate is a runtime strong dependency on the environment, never a frontmatter dependency on repo skills.

#### Scenario: No loop runner in the environment

- **WHEN** the Stage 5 gate finds no loop-runner capability installed
- **THEN** the workflow stops optimization execution, delivers the analysis-stage findings, and states the install guidance for a loop runner — it does not run a one-pass optimization instead

#### Scenario: Runner present

- **WHEN** the Stage 5 gate finds a loop-runner capability
- **THEN** rounds execute mounted on the runner under the loop body and stop conditions defined in the workflow's iteration-loop section, with per-round context discipline (persist outcomes to the benchmark log; carry forward only summaries, baseline pointers, and stop counters)
