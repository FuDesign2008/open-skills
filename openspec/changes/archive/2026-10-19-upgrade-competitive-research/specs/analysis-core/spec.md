# analysis-core Specification

## ADDED Requirements

### Requirement: analysis-core SHALL load competitive-research before confirming user-visible behavior

When the problem's expected outcome is a result the user can see or operate, `analysis-core` MUST load `competitive-research` and run that skill's lean layer-selected path before the behavior is treated as confirmed. The load MUST be a thin delegation and MUST NOT restate that skill's method. When the expected outcome is not user-visible, `analysis-core` MUST NOT require that path.

`solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` MUST list `competitive-research` in frontmatter `dependencies`. At each of those hosts' startup prerequisite checks, a missing `competitive-research` MUST abort with an install hint. Each host MUST keep one delegation line to this load and MUST NOT paste the competitive-research method.

#### Scenario: A user-visible problem loads the lean path

- **WHEN** analysis has confirmed a problem whose expected outcome is user-visible
- **THEN** `analysis-core` loads the `competitive-research` lean path before the behavior is treated as confirmed, and the behavior conclusion cites that path's evidence

#### Scenario: An internal-logic problem skips the path

- **WHEN** the expected outcome is not a result the user can see or operate
- **THEN** analysis continues without loading the `competitive-research` path

#### Scenario: A host aborts when competitive-research is missing

- **WHEN** `solve-workflow` starts and `competitive-research` is not installed
- **THEN** the workflow aborts and names the missing skill and an install command
