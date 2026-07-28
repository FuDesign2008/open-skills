## ADDED Requirements

### Requirement: Hypothesis generation SHALL require a red-capable reproduction loop

Before generating or ranking root-cause hypotheses beyond existence/locate facts, `analysis-core` MUST require a **red-capable loop**: a deterministic, agent-runnable failing reproduction command (or equivalent observed failure) that has already been run at least once in the analysis stage. MUST NOT enter speculative hypothesis lists when no such loop exists; instead obtain the loop (instrumentation / repro steps with user confirm as needed) or stop with the gap stated.

#### Scenario: No red loop blocks guess-hypotheses

- **WHEN** static analysis has located candidate areas but no failing reproduction command has been run yet
- **THEN** the agent does not emit a multi-hypothesis guess list as if root cause were ready; it first establishes a red-capable loop (or reports why it cannot)

#### Scenario: Red loop satisfied then hypotheses allowed

- **WHEN** a failing reproduction command has been executed and observed red in this analysis stage
- **THEN** the agent MAY proceed to falsifiable hypotheses and instrumentation per existing analysis-core steps
