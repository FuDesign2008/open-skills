# Spec Delta

## ADDED Requirements

### Requirement: goal-run SHALL write one review HTML when standalone

When a standalone run reaches stage 5, goal-driven-workflow MUST write one HTML page by following explain-clearly with the form fixed to HTML. The page MUST state the problem, the cause, and the completed fix. The completion report MUST record that file's path.

#### Scenario: Standalone stage 5 writes the page

- **WHEN** a standalone long run reaches stage 5
- **THEN** one HTML page exists and the completion report gives its path

### Requirement: goal-run queue child SHALL supply three facts and not write HTML

When this invocation is a queue child, the completion report MUST include the problem, the cause, and the completed fix. The queue child MUST NOT write the review HTML.

#### Scenario: Queue child reports the three facts

- **WHEN** goal-driven-workflow finishes as a queue child
- **THEN** the completion report includes the problem, the cause, and the completed fix, and this run does not write the HTML page
