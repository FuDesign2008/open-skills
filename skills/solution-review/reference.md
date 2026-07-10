# Solution Review — Framework Reference

> Companion to [SKILL.md](SKILL.md). This file holds the detailed framework entries (author, year, method, source) and the full blocking/non-blocking criteria. All examples use generic placeholders — no internal identifiers.

## Contents

1. [Core dimensions — method detail](#core-dimensions)
2. [Strategic dimensions — framework entries](#strategic-dimensions)
3. [Full blocking / non-blocking criteria](#blocking--non-blocking-criteria)
4. [Reversibility calibration guide](#reversibility-calibration-guide)

---

## Core dimensions

The four core dimensions are the minimum viable review. They map directly to what most engineering workflows already check inline; this skill provides the depth behind them.

### 1. Effectiveness

- **Question**: Does the solution completely cover the root cause or requirement?
- **Method**: Trace each root-cause / requirement item to a specific part of the solution that addresses it. Any root-cause item with no corresponding solution element is an effectiveness gap.
- **Pass**: every root-cause / requirement item is addressed; the core logic is sound; no scenario where the problem persists after the solution.
- **Fail**: gaps exist — the problem partially survives after the solution is applied.

### 2. Side-effects & risks

- **Question**: What breaks elsewhere? What non-functional regressions are possible?
- **Method**: Identify functional side-effects (changes that affect other modules' behavior) and non-functional side-effects (performance, security, maintainability, compatibility). For each risk, check whether a mitigation measure is paired with it.
- **Pass**: all identified risks have mitigation measures; no unhandled medium/high risk.
- **Fail**: a medium/high risk exists with no mitigation.

### 3. Feasibility

- **Question**: Are the change scope, dependencies, and affected files concrete and actionable?
- **Method**: Verify the solution names specific files/modules, identifies dependencies, and produces a change sequence that can be executed. Vague scope ("refactor the auth module") is a feasibility failure.
- **Pass**: an executable plan can be derived from the solution.
- **Fail**: scope or dependencies are unclear — no executable plan is possible.

### 4. Spec & standards compliance

- **Question**: Does the solution match the originating requirement? Does it follow existing project conventions?
- **Method**: Compare the solution against the spec / PRD / requirement. Check against documented project patterns (AGENTS.md, CODING_STANDARDS.md, or equivalent).
- **Pass**: solution matches spec intent and follows conventions.
- **Fail**: solution conflicts with spec or with documented conventions.

---

## Strategic dimensions

These five dimensions catch decision-level failures. They are mandatory for one-way doors (see Reversibility) and recommended for all solutions.

### 5. Reversibility calibration

- **Framework**: Type 1 vs Type 2 Decisions — Jeff Bezos, 2016 Amazon Shareholder Letter.
- **What it evaluates**: Whether the decision is reversible, which calibrates how much review rigor is warranted.
- **Method**:
  1. Classify the solution: **Type 1 (one-way door)** — irreversible or extremely costly to undo (data migration, public API contract, schema change, destructive operation). **Type 2 (two-way door)** — easily reversed (feature flag, isolated module, config toggle).
  2. For Type 1: apply maximum rigor to all dimensions; require a rollback / mitigation-forward plan; require all strategic dimensions fully assessed.
  3. For Type 2: standard rigor on core dimensions; strategic dimensions get a quick pass; favor speed over exhaustive analysis.
  4. Watch for misclassification — the expensive error is treating a one-way door as two-way.
- **Source**: [Amazon 2016 Shareholder Letter](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders)

### 6. Failure-mode analysis

- **Framework**: FMEA — Failure Mode and Effects Analysis (ASQ / NASA formalization, 1950s).
- **What it evaluates**: Systematic enumeration of how the solution can fail, ranked by risk priority.
- **Method**:
  1. List the components / steps of the solution.
  2. For each, brainstorm failure modes (what can go wrong).
  3. For each failure mode, assign: **Severity** (1–10, how bad if it happens), **Occurrence** (1–10, how likely), **Detection** (1–10, how hard to detect before impact).
  4. Compute **RPN = Severity × Occurrence × Detection**. High-RPN failures need mitigation before approval.
  5. For one-way doors, any failure mode with Severity ≥ 8 and no mitigation is blocking.
- **Source**: [ASQ — Failure Mode and Effects Analysis](https://asq.org/quality-resources/fmea)

> **Lightweight variant for two-way doors**: Skip the full RPN calculation. Instead, run a **pre-mortem** (Gary Klein): "Assume this solution shipped and failed badly. What went wrong?" The pre-mortem surfaces the top 3–5 failure modes quickly. Source: Klein, *Performing a Project Premortem* (Harvard Business Review, 2007).

### 7. Operability

- **Framework**: Google SRE — Production Readiness Review (Beyer et al., *Site Reliability Engineering*, 2016).
- **What it evaluates**: Whether the solution can be operated in production, not just whether it works.
- **Method** — check each:
  1. **SLIs / SLOs**: Are there Service Level Indicators and Objectives for the affected service? Does the solution preserve or violate them?
  2. **Monitoring & alerting**: Will the team know if this breaks? Is there a dashboard? Is there an alert that fires before users notice?
  3. **Rollback path**: If the solution causes harm, can it be rolled back? How fast?
  4. **On-call burden**: Does this solution add toil? Does it require new runbook entries? Is the on-call rotation prepared?
  5. **Capacity**: Does the solution handle expected load? Is there a capacity plan?
- **Blocking**: For one-way doors, no rollback path + no monitoring = blocking. For two-way doors, flag as non-blocking recommendation.
- **Source**: [Google SRE Book — Production Readiness Review](https://sre.google/sre-book/production-readiness-review/)

### 8. Cost vs value

- **Framework**: CBAM — Cost Benefit Analysis Method (SEI/CMU, 2003); and WSJF — Weighted Shortest Job First (Don Reinertsen, *The Principles of Product Development Flow*, 2009; adopted by SAFe).
- **What it evaluates**: Whether the effort is worth the outcome, and whether delay loses economic value.
- **Method**:
  1. **CBAM**: Estimate the cost (engineering effort, infrastructure, maintenance) and the benefit (quality-attribute improvement, revenue, risk reduction) of the solution. Compare against alternatives. If cost > benefit and no cheaper alternative achieves ~80% of the value, flag for reconsideration.
  2. **WSJF / Cost of Delay**: If this solution is delayed, what is the economic cost? (business value + time criticality + risk reduction). High cost-of-delay items warrant prioritization; low cost-of-delay items can wait for a better approach.
- **Blocking**: For one-way doors, if cost clearly exceeds value and no alternative was considered, block. For two-way doors, note as non-blocking.
- **Sources**:
  - [SEI/CMU — CBAM (02tn023)](https://resources.sei.cmu.edu/library/asset-view.cfm?assetid=30753)
  - [SAFe — WSJF](https://www.scaledagileframework.com/wsjf/)

### 9. Team cognitive fit

- **Framework**: Team Topologies — Matthew Skelton & Manuel Pais, 2019 (drawing on Cognitive Load Theory, John Sweller).
- **What it evaluates**: Whether the solution fits the team's capacity to build and maintain it.
- **Method**:
  1. Assess the solution's cognitive demand: does it require knowledge or skills the team currently lacks?
  2. If new knowledge is required, is there a plan to acquire it (training, hiring, pairing)?
  3. Does the solution add to the team's existing cognitive load (number of services, domains, technologies they already juggle)?
  4. A technically superior solution the team cannot maintain is a liability. Prefer solutions within reach, or pair the solution with a capability-building plan.
- **Blocking**: Rarely blocking alone, but compounds with other dimensions — a high-cost, hard-to-operate solution that also exceeds team capacity is a strong block signal.
- **Source**: [Team Topologies](https://teamtopologies.com/)

---

## Blocking / non-blocking criteria

### Blocking (any one → solution does not pass)

**Core dimensions:**
- The solution does not completely cover the root cause / requirement (effectiveness gap).
- An identified medium/high risk has no mitigation measure.
- The change scope or dependencies are unclear — no executable plan can be derived.
- The solution conflicts with existing design patterns or coding conventions.
- A likely side-effect could introduce new bugs or break existing functionality, unhandled.

**Strategic dimensions (one-way doors only):**
- A failure mode with Severity ≥ 8 (FMEA) has no mitigation.
- The solution is irreversible and has no rollback path.
- The solution is irreversible and has no monitoring / alerting for its failure modes.
- The cost clearly exceeds the value and no cheaper alternative was considered.

### Non-blocking (note as recommendation, do not block)

- Low-risk items that already have mitigation.
- Style preferences that do not affect correctness.
- Performance improvements deferrable to a later iteration.
- A more elegant approach exists, but the current one is correct and maintainable.
- Deliberate, documented technical debt with a repayment plan.
- A two-way-door solution with a quick strategic pass — speed is favored over exhaustive analysis.

---

## Reversibility calibration guide

Reversibility is the first thing to classify, because it sets the review depth for everything else.

| Signal | Likely classification |
|--------|-----------------------|
| Data migration, schema change, format change | **One-way door** — data once migrated cannot be un-migrated without data loss |
| Public API contract, external integration | **One-way door** — external consumers depend on it; breaking change is costly |
| Destructive operation (delete, overwrite, drop) | **One-way door** — cannot be undone |
| Feature behind a feature flag | **Two-way door** — flag can be turned off |
| Isolated new module / file | **Two-way door** — can be deleted |
| Config change with version control | **Two-way door** — can be reverted |
| Refactor within a module (no API change) | **Two-way door** — can be reverted if tests catch regression |

**The calibration rule**: For two-way doors, the four core dimensions + a quick strategic pass is sufficient. For one-way doors, every strategic dimension gets a dedicated assessment, and the blocking criteria expand (rollback, monitoring, failure-mode mitigation become mandatory).

**The expensive error**: treating a one-way door as a two-way door — under-reviewing an irreversible decision because it "seems fine" or because the team is in a hurry. Always err toward classifying as one-way when uncertain; the cost of extra review is far lower than the cost of an irreversible mistake.
