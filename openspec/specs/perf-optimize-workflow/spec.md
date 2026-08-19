# perf-optimize-workflow Specification

## Purpose
Performance optimization paradigm host (proven across a native C++ toolchain campaign and a large web-editor campaign): benchmark harness contract, evidence-gated attribution via nine in-file evidence-validity disciplines, one-target-per-iteration optimization, A/B cross-run statistical judge, benchmark-log sediment, environment-gated iteration loop, full trigger inheritance from the removed `perf-workflow`/`frontend-perf`, and thin routing edges from the generic hosts.
## Requirements
### Requirement: The workflow SHALL run six evidence-gated stages

The skill MUST define the stages benchmark & evidence → locate the bottleneck → hypothesize the root cause → build toggleable monitoring → optimize → A/B verify, with documented forward flows and common jumps. Each stage that consumes performance numbers MUST declare which of the in-file Evidence Validity Disciplines gate it (the disciplines are owned in this skill's SKILL.md, not an external dependency).

#### Scenario: Stage gating uses in-file disciplines

- **WHEN** the workflow enters benchmark-evidence, locate, hypothesize, or verify stages
- **THEN** it applies the disciplines mapped to that stage from the in-file Evidence validity disciplines section before any number drives a decision

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

The skill's description MUST carry the trigger surface of the removed `perf-workflow` (「性能分析」「性能证据」「性能定位」「性能假设」「性能监控」「性能优化」「性能验证」「性能深入」「性能问题」「卡顿」「很慢」) and `frontend-perf` (「前端性能」「前端性能优化」「Electron 性能」), plus the inherited evidence-discipline triggers (「伪影排查」「口径校准」「设备画像」), with stage-direct colon forms honored.

#### Scenario: Old trigger routes to this workflow

- **WHEN** a user says 「性能定位：滚动卡」 or 「伪影排查：这个帧率数据可信吗」
- **THEN** the skill enters at the corresponding stage / evidence-gate mode

### Requirement: Evidence validity disciplines SHALL be owned in-file

The nine disciplines (environment-throttling artifacts, monitor self-pollution, framework counter ambiguity, device-profile calibration, input-event authenticity, instrumentation toggle lifecycle, single-sample extrapolation ban, ultimate control experiment, negative-results-leave-traces) MUST live as a section in this skill's `SKILL.md`, each with what it catches, detection, and what to do instead; the anonymized case archive MUST live in `reference.md`. The gate rule applies: a metric whose applicable discipline is unresolved is trend-only and MUST NOT drive decisions.

#### Scenario: Counter conflicts with native metric

- **WHEN** a framework-internal counter and a browser-native metric disagree in magnitude
- **THEN** the browser-native metric is trusted and the counter is demoted to trend-only signal

### Requirement: Generic hosts SHALL route performance-domain problems here

`solve-workflow`, `opsx-solve-workflow`, and `jira-fix-workflow` MUST each carry a thin routing reference at their problem-clarification / intake stage directing performance-domain problems (slow, jank, resource) to `perf-optimize-workflow`. The reference is informational — MUST NOT be a frontmatter dependency of those hosts.

#### Scenario: Performance problem enters a generic host

- **WHEN** a user enters solve-workflow's clarify stage with a jank/slow performance problem
- **THEN** the workflow suggests routing to `perf-optimize-workflow` (whose analysis output can flow back for fix execution), instead of running generic PDCA on the performance domain

### Requirement: Knowledge layer isolation

Stack- and project-specific knowledge MUST live in the target project's `code-insight` / `code-optimizer` skills (seeded and evolved by this workflow), not in `SKILL.md`; `SKILL.md` MUST stay paradigm-only. `reference.md` MUST carry the seed corpus (per-stack chapters with extension slots) and the evidence case archive, refreshed via knowledge-only changes. The project skills are the living knowledge layer; the corpus only needs occasional refresh.

#### Scenario: Knowledge accumulates in the project

- **WHEN** a campaign discovers a project-specific attribution pattern or a rejected optimization
- **THEN** the knowledge lands in the project's `code-insight` / `code-optimizer` skill, while `SKILL.md` stays unchanged and the `reference.md` corpus stays seed-only

#### Scenario: Knowledge refresh without contract change

- **WHEN** a framework version table in the corpus is outdated
- **THEN** updating it does not alter any requirement in this spec

### Requirement: Stages 5-6 SHALL execute as the iteration loop

The Optimize and A/B-verify stages MUST execute as a repeating iteration loop **mounted on a real environment loop-runner capability** (ralph-style runner, `/loop`, goal-driven long-run, or any mechanism that auto-continues the agent across rounds). At Stage 5 entry the workflow MUST probe the environment: with a runner present, it MUST mount its loop body (profile fresh hotspots → one target → optimize → A/B judge with revert on rejection → correctness gate → commit + snapshot + log) and run until a stop condition (5 consecutive no-gain rounds / target met / ROI exhausted). Without a runner, the workflow MUST stop optimization execution and print install guidance — analysis-stage findings remain deliverable — and MUST NOT degrade to a single manual pass. The gate is a runtime strong dependency on the environment, never a frontmatter dependency on repo skills.

#### Scenario: No loop runner in the environment

- **WHEN** the Stage 5 gate finds no loop-runner capability installed
- **THEN** the workflow stops optimization execution, delivers the analysis-stage findings, and states the install guidance for a loop runner — it does not run a one-pass optimization instead

#### Scenario: Runner present

- **WHEN** the Stage 5 gate finds a loop-runner capability
- **THEN** rounds execute mounted on the runner under the loop body and stop conditions defined in the workflow's iteration-loop section, with per-round context discipline (persist outcomes to the benchmark log; carry forward only summaries, baseline pointers, and stop counters)

### Requirement: The workflow SHALL seed and evolve project-level code-insight and code-optimizer skills

The Locate stage MUST probe for a project-level attribution skill (`code-insight`) and the Optimize stage for a project-level optimization skill (`code-optimizer`), both living in the target project's conventional agent-skill directory (detected by convention; manual mode confirms the location before writing). On first campaign with a skill absent, the workflow MUST seed it from the matching stack chapter of the `reference.md` corpus plus this run's project discoveries (tool paths, workload specifics, known pitfalls). On later campaigns it MUST run the existing skill's pipeline and record gaps as improvement candidates. At every iteration-loop stop condition (and at least every ~5 rounds in long loops), the workflow MUST fold validated campaign lessons — attribution patterns that worked, rejected optimizations with their data, stack/project pitfalls, benchmark-log invalidation rows — back into the two skills in place.

#### Scenario: First campaign seeds the skills

- **WHEN** the workflow enters the Locate stage in a project with no `code-insight` skill
- **THEN** it seeds the skill from the matching stack chapter plus this run's project discoveries, confirming the location in manual mode

#### Scenario: Campaign lessons evolve the skills

- **WHEN** the iteration loop hits a stop condition
- **THEN** this campaign's validated attribution patterns, rejected optimizations (with data), and stack pitfalls are folded into `code-insight` / `code-optimizer` in place, so the next campaign starts smarter

#### Scenario: Seeded skill works standalone

- **WHEN** a later session on the same project faces an attribution task without this workflow running
- **THEN** the project's `code-insight` skill is invocable on its own as a standing project asset

