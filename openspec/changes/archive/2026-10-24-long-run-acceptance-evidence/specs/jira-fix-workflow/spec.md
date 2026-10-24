## RENAMED Requirements

### Requirement: jira-fix-workflow queue child SHALL report three facts and not write HTML
- FROM: `### Requirement: jira-fix-workflow queue child SHALL report three facts and not write HTML`
- TO: `### Requirement: jira-fix-workflow queue child SHALL report explanation facts and an evidence list and not write HTML`

## MODIFIED Requirements

### Requirement: jira-fix-workflow queue child SHALL report explanation facts and an evidence list and not write HTML

When jira-fix-workflow runs as a queue child, the completion report MUST include the problem, the cause, the completed fix, and an evidence list. Each evidence item MUST be either an opened-UI check citing a png, jpg, jpeg, or webp path, or a non-UI check citing the command and a short output summary. A missing or empty image MUST be listed as pending with the capture still required, and the report MUST NOT invent an image. The workflow MUST NOT write the review HTML and MUST NOT write the evidence HTML.

#### Scenario: Queue child report carries the three facts

- **WHEN** jira-fix-workflow finishes as a queue child
- **THEN** the completion report includes the problem, the cause, the completed fix, and the evidence list, and this run does not write the review HTML or the evidence HTML
