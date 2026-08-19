## MODIFIED Requirements

### Requirement: Evidence validity disciplines SHALL be owned in-file

The ten disciplines (environment-throttling artifacts, monitor self-pollution, framework counter ambiguity, device-profile calibration, input-event authenticity, instrumentation toggle lifecycle, single-sample extrapolation ban, ultimate control experiment, negative-results-leave-traces, comparison-experiment environment-state validity) MUST live as a section in this skill's `SKILL.md`, each with what it catches, detection, and what to do instead; the anonymized case archive MUST live in `reference.md`. The gate rule applies: a metric whose applicable discipline is unresolved is trend-only and MUST NOT drive decisions.

#### Scenario: Counter conflicts with native metric

- **WHEN** a framework-internal counter and a browser-native metric disagree in magnitude
- **THEN** the browser-native metric is trusted and the counter is demoted to trend-only signal

#### Scenario: Hot-reload state pollutes an A/B comparison

- **WHEN** an optimization touching module structure is judged by an interleaved A/B run executed after hot code-swapping without an environment restart
- **THEN** the comparison is invalid; the environment MUST be restarted (or the page hard-refreshed) between arms before the judge's verdict counts

### Requirement: The workflow SHALL seed and evolve project-level code-insight and code-optimizer skills

The Locate stage MUST probe for a project-level attribution skill (`code-insight`) and the Optimize stage for a project-level optimization skill (`code-optimizer`), both living in the target project's conventional agent-skill directory (detected by convention; manual mode confirms the location before writing). On first campaign with a skill absent, the workflow MUST seed it as a **step-by-step pipeline** from the seed templates in `reference.md` Part 5 plus this run's project discoveries — the seed MUST NOT be a reference-document shape; the `code-optimizer` seed MUST include a deep-attribution step that delegates to the project's `code-insight`. A first campaign MUST also seed the **probe-script pattern**: recurring attribution questions become reusable probe scripts under the harness (convention `probe-*`), and pipeline steps invoke probes instead of ad-hoc scripting. The seeded content MUST pass a specialist-perspective review (language / runtime / hardware) before landing. On later campaigns it MUST run the existing skill's pipeline and record gaps as improvement candidates. At every iteration-loop stop condition (and at least every ~5 rounds in long loops), the workflow MUST fold validated campaign lessons — attribution patterns that worked, rejected optimizations with their data, stack/project pitfalls, benchmark-log invalidation rows — back into the two skills in place, and the update MUST be reviewed from the stack's specialist perspectives before landing.

#### Scenario: First campaign seeds pipeline-shaped skills with probes

- **WHEN** the workflow enters the Locate stage in a project with no `code-insight` skill
- **THEN** it seeds a step-by-step attribution pipeline from the Part 5 template plus this run's project discoveries, seeds recurring attribution questions as `probe-*` scripts under the harness, runs the specialist-perspective pass, and confirms the location in manual mode

#### Scenario: Optimizer delegates deep attribution to insight

- **WHEN** a code-optimizer pipeline reaches its deep-attribution step
- **THEN** it delegates to the same project's `code-insight` pipeline rather than re-implementing attribution

#### Scenario: Campaign lessons evolve the skills with specialist review

- **WHEN** the iteration loop hits a stop condition
- **THEN** this campaign's validated lessons are folded into the project skills, and the updated skill content is reviewed from the stack's specialist perspectives before landing

### Requirement: Benchmark harness contract

When no reproducible benchmark exists, the workflow MUST treat building one as part of the benchmark-evidence stage: it MUST first build or read a **scenario inventory** (the full set of real user scenarios and their coverage state) and plan workloads from it; standardized scripted workloads driven through real input paths (verifiable by content delta), including long-session degradation loads (continuous editing / switching / history growth) treated as their own problem class — analyzed by trend slope and inflection, not single-run numbers; automated capture; a pre-optimization baseline; an append-only benchmark log at the repo; and a reusable A/B judge. Recurring attribution questions MUST be sedimented as reusable probe scripts under the harness (convention `probe-*`), invoked by pipeline steps rather than ad-hoc scripting.

#### Scenario: Scenario inventory before workloads

- **WHEN** planning harness workloads
- **THEN** the workflow builds or reads the scenario inventory first and selects workloads to close its coverage gaps

#### Scenario: Attribution question recurs

- **WHEN** the same attribution question arises in a second campaign or round
- **THEN** it exists as a `probe-*` script under the harness and is invoked, not re-implemented
