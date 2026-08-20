## MODIFIED Requirements

### Requirement: The workflow SHALL run six evidence-gated stages

The skill MUST define the stages benchmark & evidence → locate the bottleneck → hypothesize the root cause → build toggleable monitoring → optimize → A/B verify, with documented forward flows and common jumps. Each stage that consumes performance numbers MUST declare which of the in-file Evidence Validity Disciplines gate it (the disciplines are owned in this skill's SKILL.md, not an external dependency).

#### Scenario: Stage gating uses in-file disciplines

- **WHEN** the workflow enters benchmark-evidence, locate, hypothesize, or verify stages
- **THEN** it applies the disciplines mapped to that stage from the in-file Evidence validity disciplines section before any number drives a decision

### Requirement: Trigger inheritance

The skill's description MUST carry the trigger surface of the removed `perf-workflow` (「性能分析」「性能证据」「性能定位」「性能假设」「性能监控」「性能优化」「性能验证」「性能深入」「性能问题」「卡顿」「很慢」) and `frontend-perf` (「前端性能」「前端性能优化」「Electron 性能」), plus the inherited evidence-discipline triggers (「伪影排查」「口径校准」「设备画像」), with stage-direct colon forms honored.

#### Scenario: Old trigger routes to this workflow

- **WHEN** a user says 「性能定位：滚动卡」 or 「伪影排查：这个帧率数据可信吗」
- **THEN** the skill enters at the corresponding stage / evidence-gate mode

## ADDED Requirements

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
