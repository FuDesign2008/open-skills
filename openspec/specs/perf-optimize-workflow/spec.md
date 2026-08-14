# perf-optimize-workflow Specification

## Purpose
Performance optimization paradigm host (proven across a native C++ toolchain campaign and a large web-editor campaign): benchmark harness contract, evidence-gated attribution via `perf-evidence-discipline`, one-target-per-iteration optimization, A/B cross-run statistical judge, benchmark-log sediment, optional unattended iteration loop, and full trigger inheritance from the removed `perf-workflow`/`frontend-perf`.
## Requirements
### Requirement: The workflow SHALL run six evidence-gated stages

The skill MUST define the stages benchmark & evidence → locate the bottleneck → hypothesize the root cause → build toggleable monitoring → optimize → A/B verify, with documented forward flows and common jumps. Each stage that consumes performance numbers MUST declare which disciplines of `perf-evidence-discipline` gate it.

#### Scenario: Stage mounting disciplines

- **WHEN** the workflow enters benchmark-evidence, locate, hypothesize, or verify stages
- **THEN** it loads `perf-evidence-discipline` and applies the disciplines mapped to that stage before any number drives a decision

### Requirement: Benchmark harness contract

When no reproducible benchmark exists, the workflow MUST treat building one as part of Stage 1: standardized scripted workloads driven through real input paths (verifiable by content delta), automated capture, a pre-optimization baseline, an append-only benchmark log at the repo, and a reusable A/B judge.

#### Scenario: Baseline before optimization

- **WHEN** optimization is requested and no baseline exists
- **THEN** the workflow records a baseline run in the benchmark log before any change is made

### Requirement: A/B cross-run statistical judge

Optimization acceptance MUST use interleaved baseline/new runs (B₁A₁B₂A₂B₃A₃) with acceptance only when `avg_B − avg_A > max(stdev_B, stdev_A)`. Single runs and minimum-of-N MUST NOT be verdicts.

#### Scenario: Rejecting noise

- **WHEN** a candidate improvement's mean advantage is within the larger standard deviation of the interleaved runs
- **THEN** the improvement is not accepted, and the rejected attempt is logged (negative-result row)

### Requirement: One target per iteration

Each optimization iteration MUST target exactly one root-cause point, keep the change revertible, and revert on rejection instead of stacking speculative changes.

#### Scenario: Rejected optimization

- **WHEN** Stage 6 rejects a change
- **THEN** the change is reverted and the rejection is recorded in the benchmark log with reason

### Requirement: Trigger inheritance

The skill's description MUST carry the trigger surface of the removed `perf-workflow` (「性能分析」「性能证据」「性能定位」「性能假设」「性能监控」「性能优化」「性能验证」「性能深入」「性能问题」「卡顿」「很慢」) and `frontend-perf` (「前端性能」「前端性能优化」「Electron 性能」), with stage-direct colon forms honored.

#### Scenario: Old trigger routes to new host

- **WHEN** a user says 「性能定位：滚动卡」
- **THEN** the skill enters at the locate-the-bottleneck stage

### Requirement: Knowledge layer isolation

Stack-specific knowledge MUST live in `reference.md` (perishable layer, refreshable via knowledge-only PATCH changes), not in `SKILL.md`; `SKILL.md` MUST stay paradigm-only. Reference chapters MUST be organized per stack with extension slots for stacks not yet covered.

#### Scenario: Knowledge refresh without contract change

- **WHEN** a framework version table in `reference.md` is outdated
- **THEN** updating it does not alter any requirement in this spec

### Requirement: Stages 5-6 SHALL execute as the iteration loop

The Optimize and A/B-verify stages MUST execute as a repeating iteration loop **mounted on a real environment loop-runner capability** (ralph-style runner, `/loop`, goal-driven long-run, or any mechanism that auto-continues the agent across rounds). At Stage 5 entry the workflow MUST probe the environment: with a runner present, it MUST mount its loop body (profile fresh hotspots → one target → optimize → A/B judge with revert on rejection → correctness gate → commit + snapshot + log) and run until a stop condition (5 consecutive no-gain rounds / target met / ROI exhausted). Without a runner, the workflow MUST stop optimization execution and print install guidance — analysis-stage findings remain deliverable — and MUST NOT degrade to a single manual pass. The gate is a runtime strong dependency on the environment, never a frontmatter dependency on repo skills.

#### Scenario: No loop runner in the environment

- **WHEN** the Stage 5 gate finds no loop-runner capability installed
- **THEN** the workflow stops optimization execution, delivers the analysis-stage findings, and states the install guidance for a loop runner — it does not run a one-pass optimization instead

#### Scenario: Runner present

- **WHEN** the Stage 5 gate finds a loop-runner capability
- **THEN** rounds execute mounted on the runner under the loop body and stop conditions defined in the workflow's iteration-loop section, with per-round context discipline (persist outcomes to the benchmark log; carry forward only summaries, baseline pointers, and stop counters)

