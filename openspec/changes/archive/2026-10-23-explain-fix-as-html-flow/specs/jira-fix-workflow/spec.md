# Spec Delta

## ADDED Requirements

### Requirement: jira-fix-workflow queue child SHALL report three facts and not write HTML

When jira-fix-workflow runs as a queue child, the completion report MUST include the problem, the cause, and the completed fix. The workflow MUST NOT write the review HTML.

#### Scenario: Queue child report carries the three facts

- **WHEN** jira-fix-workflow finishes as a queue child
- **THEN** the completion report includes the problem, the cause, and the completed fix, and this run does not write the HTML page
