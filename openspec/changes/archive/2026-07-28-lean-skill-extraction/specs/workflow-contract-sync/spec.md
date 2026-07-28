## ADDED Requirements

### Requirement: Workflow hosts SHALL thin-ref shared orchestration and gates

PDCA workflows MUST thin-reference `pdca-review-orchestration` (all four) and `openspec-workspace-gates` (opsx pair only) per AGENTS thin-ref rules: load + placeholder map + host-only orchestration. They MUST NOT expand `merge-discipline` Part A–D steps, learn-and-improve four-step lists, clarifying-question long restatements, or node-version probe chains in host bodies.

#### Scenario: Merge hosts drop Part expansions

- **WHEN** Wave 1 completes
- **THEN** `jira-fix-workflow` / `opsx-solve-workflow` / `opsx-jira-fix-workflow` contain at most a one-line pointer to `merge-discipline` Parts A→D, not inline Part bullets

### Requirement: Workflow review stages SHALL NOT embed outdated review blocking lists

After `pdca-review-orchestration` lands, host review sections MUST NOT keep a parallel blocking/non-blocking bullet list that can drift from `solution-review` / `code-design-review`.

#### Scenario: Inline blocking guide removed from opsx-solve

- **WHEN** Wave 2a completes
- **THEN** `opsx-solve-workflow` no longer maintains its own「阻断问题判定指引」list duplicating review skills
