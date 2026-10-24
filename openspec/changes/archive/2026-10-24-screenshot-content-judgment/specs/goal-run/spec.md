## MODIFIED Requirements

### Requirement: goal-run queue child SHALL supply explanation facts and an evidence list and not write HTML

When this invocation is a queue child, the completion report MUST include the problem, the cause, the completed fix, and an evidence list. Each evidence item MUST be either an opened-UI check citing a png, jpg, jpeg, or webp path, or a non-UI check citing the command and a short output summary. A missing or empty image MUST be listed as pending with the capture still required, and the report MUST NOT invent an image. Before an opened-UI image supports the check, the agent MUST look at the saved image in this turn. A blank frame, a solid black frame, or an image with no readable interface MUST stay pending and MUST state that the capture is still required. A readable interface that is not the screen this check was supposed to open MUST stay pending and MUST state the expected screen and what the image shows. If the image was not inspected, the item MUST stay pending and MUST state that the image was not inspected. The file MUST be kept. None of those results are the expected capture. The queue child MUST NOT write the review HTML and MUST NOT write the evidence HTML.

#### Scenario: Queue child reports the three facts

- **WHEN** goal-driven-workflow finishes as a queue child
- **THEN** the completion report includes the problem, the cause, the completed fix, and the evidence list, and this run does not write the review HTML or the evidence HTML

### Requirement: goal-run SHALL write one evidence HTML when standalone

When a standalone run reaches stage 5, goal-driven-workflow MUST write one HTML page at `.goal-driven/runs/<local-YYYYMMDD-HHmm>/evidence.html`. The page title MUST be 证据留痕. The directory name MUST be that timestamp, and a later run MUST NOT overwrite an existing directory.

The page MUST show each opened-UI check as the image copied into that same directory, referenced by a relative path. The page MUST show each non-UI check as the command and a short output summary and MUST NOT include an image for it. A missing or empty image MUST appear as pending with the capture still required, and the page MUST NOT invent an image. Before an opened-UI image supports the check, the agent MUST look at the saved image in this turn. A blank frame, a solid black frame, or an image with no readable interface MUST stay pending and MUST state that the capture is still required. A readable interface that is not the screen this check was supposed to open MUST stay pending and MUST state the expected screen and what the image shows. If the image was not inspected, the item MUST stay pending and MUST state that the image was not inspected. The file MUST be kept and shown. None of those results are the expected capture. An empty evidence list MUST still produce the page, stating that no checks were recorded, with no image.

The completion report MUST record that file's path.

#### Scenario: Standalone stage 5 writes the evidence page

- **WHEN** a standalone long run reaches stage 5
- **THEN** one evidence HTML page exists under `.goal-driven/runs/<local-YYYYMMDD-HHmm>/` and the completion report gives its path

#### Scenario: A later standalone run does not overwrite

- **WHEN** another standalone run writes an evidence page
- **THEN** the earlier evidence directory remains

#### Scenario: A non-UI check has no image

- **WHEN** a standalone check did not open a UI
- **THEN** the evidence page shows the command and the output summary and does not include an image for that check

#### Scenario: A missing image stays pending

- **WHEN** a standalone opened-UI check cites a file that is missing or empty
- **THEN** the evidence page marks that item pending, states the capture still required, and does not contain an invented image
