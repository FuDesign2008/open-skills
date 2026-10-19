# opsx-jira-fix-workflow Specification

## ADDED Requirements

### Requirement: opsx-jira-fix-workflow SHALL strong-depend on competitive-research

`opsx-jira-fix-workflow` MUST list `competitive-research` in frontmatter `dependencies`. At startup prerequisite check, a missing `competitive-research` MUST abort with an install hint. The analysis stage MUST delegate user-visible competitive research to `analysis-core`'s load of `competitive-research` with one line, and MUST NOT restate that skill's method.

#### Scenario: Missing competitive-research aborts startup

- **WHEN** `opsx-jira-fix-workflow` loads and `competitive-research` is not installed
- **THEN** the workflow aborts and names the missing skill and an install command
