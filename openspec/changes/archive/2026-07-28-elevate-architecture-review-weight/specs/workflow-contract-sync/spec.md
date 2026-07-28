## ADDED Requirements

### Requirement: Workflow review stages SHALL defer architecture-weight gates to review skills

PDCA workflows that strongly depend on `solution-review` and `code-design-review` (solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow) MUST NOT embed outdated non-blocking guidance that allows deferring a superior architecture solely because near-term maintainability is acceptable. They MUST point agents to those skills for blocking/non-blocking criteria and, for code-affecting solutions, MUST require `code-design-review` Layer B at the depth that skill defines.

#### Scenario: Workflow drops near-term architecture deferral prose

- **WHEN** a workflow's review-stage section lists non-blocking examples
- **THEN** it does not include "better architecture but near-term OK → non-blocking"; instead it states that architecture-weight and long-term maintainability gates live in `code-design-review` / `solution-review`
