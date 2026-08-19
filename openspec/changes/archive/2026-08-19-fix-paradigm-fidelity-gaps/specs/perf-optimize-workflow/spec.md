## MODIFIED Requirements

### Requirement: The workflow SHALL seed and evolve project-level code-insight and code-optimizer skills

The Locate stage MUST probe for a project-level attribution skill (`code-insight`) and the Optimize stage for a project-level optimization skill (`code-optimizer`), both living in the target project's conventional agent-skill directory (detected by convention; manual mode confirms the location before writing). On first campaign with a skill absent, the workflow MUST seed it as a **step-by-step pipeline** from the seed templates in `reference.md` Part 5 plus this run's project discoveries — the seed MUST NOT be a reference-document shape; the `code-optimizer` seed MUST include a deep-attribution step that delegates to the project's `code-insight`. On later campaigns it MUST run the existing skill's pipeline and record gaps as improvement candidates. At every iteration-loop stop condition (and at least every ~5 rounds in long loops), the workflow MUST fold validated campaign lessons — attribution patterns that worked, rejected optimizations with their data, stack/project pitfalls, benchmark-log invalidation rows — back into the two skills in place, and the update MUST be reviewed from the stack's specialist perspectives (e.g. language / runtime / hardware) before landing, correcting inconsistencies the lessons reveal.

#### Scenario: First campaign seeds pipeline-shaped skills

- **WHEN** the workflow enters the Locate stage in a project with no `code-insight` skill
- **THEN** it seeds a step-by-step attribution pipeline from the Part 5 template plus this run's project discoveries, confirming the location in manual mode

#### Scenario: Optimizer delegates deep attribution to insight

- **WHEN** a code-optimizer pipeline reaches its deep-attribution step
- **THEN** it delegates to the same project's `code-insight` pipeline rather than re-implementing attribution

#### Scenario: Campaign lessons evolve the skills with specialist review

- **WHEN** the iteration loop hits a stop condition
- **THEN** this campaign's validated lessons are folded into the project skills, and the updated skill content is reviewed from the stack's specialist perspectives before landing

### Requirement: Benchmark harness contract

When no reproducible benchmark exists, the workflow MUST treat building one as part of the benchmark-evidence stage: it MUST first build or read a **scenario inventory** (the full set of real user scenarios and their coverage state) and plan workloads from it; standardized scripted workloads driven through real input paths (verifiable by content delta), including long-session degradation loads (continuous editing / switching / history growth) treated as their own problem class — analyzed by trend slope and inflection, not single-run numbers; automated capture; a pre-optimization baseline; an append-only benchmark log at the repo; and a reusable A/B judge.

#### Scenario: Scenario inventory before workloads

- **WHEN** planning harness workloads
- **THEN** the workflow builds or reads the scenario inventory first and selects workloads to close its coverage gaps

#### Scenario: Baseline before optimization

- **WHEN** optimization is requested and no baseline exists
- **THEN** the workflow records a baseline run in the benchmark log before any change is made

## ADDED Requirements

### Requirement: Technology-selection decisions SHALL escalate to the user

During the Optimize stage, decisions that introduce a new dependency, replace a data structure, or change an allocation/memory strategy MUST be escalated to the user as option lists with trade-offs (performance, portability, maintenance), rather than decided unilaterally by the agent.

#### Scenario: Container replacement escalates

- **WHEN** an optimization proposes replacing a core data structure with a different library/container family
- **THEN** the workflow presents the candidate options with trade-offs and lets the user pick before implementing
