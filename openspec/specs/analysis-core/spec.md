# analysis-core Specification

## Purpose

Shared analysis-stage methodology for PDCA workflows: temporary-change gate, instrumentation-debug delegation, analysis step skeleton, and debug-verify loop — owned by the non-user-invocable `analysis-core` skill and parameterized via `{next-stage}`.

## Requirements

### Requirement: analysis-core SHALL own analysis-stage methodology as single source

The shared skill `analysis-core` MUST be the single source of truth for analysis-stage methodology shared across PDCA workflows: temporary-change permission and rollback gate, instrumentation-debug triggers and debug-skill delegation (`runtime-evidence-debug`, `browser-debug-toolkit`, `hybrid-debug`), analysis step skeleton (existence check → research routing → phenomenon / locate / root-cause / upstream-eval / impact), and debug-verify loop rules. It MUST NOT encode workflow-specific orchestration (stage exits, manual/auto mode differences, OpenSpec/Jira artifact sinks, or intentional divergences on the 形似神异 list).

#### Scenario: Workflow loads methodology from analysis-core

- **WHEN** a referencing workflow reaches its analysis stage
- **THEN** it loads `analysis-core` for the methodology blocks above and does not paste those blocks inline in the workflow body

### Requirement: analysis-core SHALL parameterize the next-stage exit with `{next-stage}`

Jump targets that differ across workflows MUST use the placeholder `{next-stage}`. Each referencing workflow MUST declare its concrete mapping at the reference line (number + name). `analysis-core` MUST NOT hardcode any workflow's stage numbers or stage titles for that exit.

#### Scenario: Mapping declared at reference line

- **WHEN** `solve-workflow` references `analysis-core`
- **THEN** its reference line maps `{next-stage}` to 阶段 3「探索方案」(or the workflow's current equivalent), and `analysis-core` body still contains only `{next-stage}`

### Requirement: analysis-core SHALL be a non-user-invocable shared dependency

`analysis-core` MUST set `user-invocable: false` and MUST be invoked only via workflow frontmatter `dependencies` / explicit load during the analysis stage (and the verify stage for the debug-verify loop). It MUST abort with an install hint if a hard dependency it declares is missing (same no-silent-degrade rule as other shared methodology skills).

#### Scenario: Missing dependency aborts

- **WHEN** `analysis-core` is loaded and a skill it declares as a strong dependency is unavailable
- **THEN** the agent aborts that path and prints the install command; it does not silently skip the methodology

### Requirement: Hypothesis generation SHALL require a red-capable reproduction loop

Before generating or ranking root-cause hypotheses beyond existence/locate facts, `analysis-core` MUST require a **red-capable loop**: a deterministic, agent-runnable failing reproduction command (or equivalent observed failure) that has already been run at least once in the analysis stage. MUST NOT enter speculative hypothesis lists when no such loop exists; instead obtain the loop (instrumentation / repro steps with user confirm as needed) or stop with the gap stated.

#### Scenario: No red loop blocks guess-hypotheses

- **WHEN** static analysis has located candidate areas but no failing reproduction command has been run yet
- **THEN** the agent does not emit a multi-hypothesis guess list as if root cause were ready; it first establishes a red-capable loop (or reports why it cannot)

#### Scenario: Red loop satisfied then hypotheses allowed

- **WHEN** a failing reproduction command has been executed and observed red in this analysis stage
- **THEN** the agent MAY proceed to falsifiable hypotheses and instrumentation per existing analysis-core steps
