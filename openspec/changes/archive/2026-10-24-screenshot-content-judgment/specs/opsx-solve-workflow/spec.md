## MODIFIED Requirements

### Requirement: opsx-solve-workflow queue child SHALL report explanation facts and an evidence list and not write HTML

When opsx-solve-workflow runs as a queue child, the completion report MUST include the problem, the cause, the completed fix, and an evidence list. Each evidence item MUST be either an opened-UI check citing a png, jpg, jpeg, or webp path, or a non-UI check citing the command and a short output summary. A missing or empty image MUST be listed as pending with the capture still required, and the report MUST NOT invent an image. Before an opened-UI image supports the check, the agent MUST look at the saved image in this turn. A blank frame, a solid black frame, or an image with no readable interface MUST stay pending and MUST state that the capture is still required. A readable interface that is not the screen this check was supposed to open MUST stay pending and MUST state the expected screen and what the image shows. If the image was not inspected, the item MUST stay pending and MUST state that the image was not inspected. The file MUST be kept. None of those results are the expected capture. The workflow MUST NOT write the review HTML and MUST NOT write the evidence HTML.

#### Scenario: Queue child report carries the three facts

- **WHEN** opsx-solve-workflow finishes as a queue child
- **THEN** the completion report includes the problem, the cause, the completed fix, and the evidence list, and this run does not write the review HTML or the evidence HTML
