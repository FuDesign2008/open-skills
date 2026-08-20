# analysis-core Delta Spec

## ADDED Requirements

### Requirement: The analysis stage SHALL close with the analysis gate output block

`analysis-core` MUST own the single source of truth for a mandatory **analysis gate output block** that closes every referencing workflow's analysis-stage output before entering `{next-stage}`. The block MUST contain at minimum: red-loop status (✅ command + observed red evidence, or ❌ why unestablished + the handoff already proposed), debug-entry status (`runtime-evidence-debug` loaded with trigger reason, or not-needed with one-line Tier 1–2 evidence), scenario supplements (`browser-debug-toolkit` / `hybrid-debug` / channel enabler: which engaged or not needed), and temporary-change rollback status. An unfilled or missing block MUST block entry to `{next-stage}`. Referencing workflows MUST reference this block with a thin pointer, not duplicate it.

#### Scenario: Analysis output without the gate block is rejected

- **WHEN** a referencing workflow's analysis-stage output omits the gate block
- **THEN** the agent does not proceed to `{next-stage}`; it completes the block first (which may require instrumentation or a user handoff)

#### Scenario: Workflow templates point instead of duplicating

- **WHEN** a referencing workflow's `reference.md` defines its analysis-stage output template
- **THEN** the template includes a pointer to the `analysis-core` gate block and does not restate the block's fields

## MODIFIED Requirements

### Requirement: analysis-core SHALL own analysis-stage methodology as single source

The shared skill `analysis-core` MUST be the single source of truth for analysis-stage methodology shared across PDCA workflows: temporary-change permission and rollback gate, instrumentation-debug delegation with `runtime-evidence-debug` as the **default entry** composed with scenario skills (`browser-debug-toolkit`, `hybrid-debug`, channel enablers), analysis step skeleton (existence check → research routing → phenomenon / locate / root-cause / upstream-eval / impact), the analysis gate output block, and debug-verify loop rules. It MUST NOT encode workflow-specific orchestration (stage exits, manual/auto mode differences, OpenSpec/Jira artifact sinks, or intentional divergences on the 形似神异 list).

#### Scenario: Workflow loads methodology from analysis-core

- **WHEN** a referencing workflow reaches its analysis stage
- **THEN** it loads `analysis-core` for the methodology blocks above and does not paste those blocks inline in the workflow body

#### Scenario: Runtime observation needed defaults to runtime-evidence-debug

- **WHEN** the analysis stage needs any runtime observation (static stalled, retry, silent failure)
- **THEN** `analysis-core` §3 directs the agent to load `runtime-evidence-debug` as the default entry, composing scenario skills as needed, rather than requiring a self-assessed confidence verdict first

### Requirement: Hypothesis generation SHALL require a red-capable reproduction loop

Before generating or ranking root-cause hypotheses beyond existence/locate facts, `analysis-core` MUST require a **red-capable loop**: a deterministic, agent-runnable failing reproduction command (or equivalent observed failure) that has already been run at least once in the analysis stage. A user-reported symptom (pasted log, verbal description, screenshot) MUST NOT count as an agent-observed red. When no agent-runnable loop can be established, the escape MUST land as an explicit handoff — instrumentation and reproduction steps handed to the user per `runtime-evidence-debug`'s human-AI division — or a stop with the gap stated; it MUST NOT silently pass on user-provided evidence alone.

#### Scenario: No red loop blocks guess-hypotheses

- **WHEN** static analysis has located candidate areas but no failing reproduction command has been run yet
- **THEN** the agent does not emit a multi-hypothesis guess list as if root cause were ready; it first establishes a red-capable loop (or reports why it cannot)

#### Scenario: Red loop satisfied then hypotheses allowed

- **WHEN** a failing reproduction command has been executed and observed red in this analysis stage
- **THEN** the agent MAY proceed to falsifiable hypotheses and instrumentation per existing analysis-core steps

#### Scenario: User-pasted log does not satisfy the gate

- **WHEN** the only failure evidence is a log pasted by the user, and no agent-runnable reproduction exists
- **THEN** the agent treats the loop as unestablished and either runs a reproduction itself, or hands instrumentation/repro steps to the user as an explicit handoff — it does not mark the gate satisfied on the pasted evidence alone
