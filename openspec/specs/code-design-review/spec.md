# code-design-review Specification

## Purpose

Behavioral contract for the `code-design-review` skill: pre-implementation design-quality gates for code-affecting solutions, including architecture weight and Layer B depth.

## Requirements

### Requirement: code-design-review SHALL weight long-term architecture over mere near-term adequacy

When reviewing a proposed code-affecting solution, `code-design-review` MUST treat architectural elegance and long-term maintainability as first-class pass criteria, not optional polish. The skill MUST document that low implementation cost (including AI-assisted coding) does **not** justify accepting a design that is only "good enough for now" when a clearly superior structure is identified and feasible in the same change scope.

#### Scenario: Superior feasible architecture blocks pass

- **WHEN** Layer B (or equivalent architecture assessment) identifies a clearly superior modular/dependency design that is feasible within the current change scope and materially improves long-term maintainability
- **THEN** the review MUST NOT classify that gap as non-blocking solely because the current design is correct and near-term maintainable; it MUST treat the gap as blocking unless the user explicitly accepts documented Prudent-Deliberate debt with a repayment plan

### Requirement: Layer B SHALL be the default depth for non-trivial code solutions

`code-design-review` MUST run Layer B (architecture-level quality attributes) by default for solutions that add modules, change dependency direction, cross module boundaries, or alter public contracts. A "quick path" that skips or lightly skims Layer B MUST be limited to small, isolated changes with no new module boundaries and no dependency-direction impact, and MUST state that limitation in the review report.

#### Scenario: Cross-module change requires full Layer B

- **WHEN** the proposed solution introduces or reshapes module boundaries or dependency direction
- **THEN** the agent runs full Layer B and reports pass/fail per attribute; it does not skip Layer B because the change "looks small"

### Requirement: Non-blocking criteria SHALL NOT defer better architecture on near-term grounds alone

The skill's non-blocking list MUST NOT include a blanket rule that a superior architecture may be deferred whenever correctness and near-term maintainability hold. Non-blocking remains appropriate for style preferences, mitigated low risks, and Prudent-Deliberate debt with a repayment plan.

#### Scenario: Near-term-only deferral removed

- **WHEN** a reviewer would previously mark "superior architecture, near-term OK" as non-blocking without user-accepted debt
- **THEN** under the updated skill that outcome is blocking (or requires explicit Prudent-Deliberate acceptance), not a silent deferral
