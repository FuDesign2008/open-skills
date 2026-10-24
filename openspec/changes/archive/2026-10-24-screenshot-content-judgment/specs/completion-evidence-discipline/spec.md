## MODIFIED Requirements

### Requirement: A pass claim for an opened UI SHALL cite a non-empty screenshot from this turn

When the check opened a UI, a pass claim MUST cite a filesystem path to an image saved during the current turn, and that file MUST exist, be non-empty, and use a png, jpg, jpeg, or webp extension. A path string with no such file MUST NOT support the claim. Before that image supports the claim, the agent MUST look at the saved image in this turn. A blank frame, a solid black frame, or an image with no readable interface MUST stay pending, MUST state that the capture is still required, and MUST NOT be treated as the expected capture. A readable interface that is not the screen this check was supposed to open MUST stay pending, MUST state the expected screen and what the image shows, and MUST NOT be treated as the expected capture. If the image was not inspected, the item MUST stay pending and MUST state that the image was not inspected. The file MUST be kept. Checks that did not open a UI MUST NOT be required to cite an image. This discipline MUST NOT restate another skill's measurement rules.

#### Scenario: Opened UI without a file cannot be claimed passed

- **WHEN** an agent claims a UI check passed and the cited screenshot path is missing or the file is empty
- **THEN** the claim is not complete, and the agent MUST save a non-empty image this turn or mark the item pending with the exact capture still required

#### Scenario: A blank or black frame does not support the claim

- **WHEN** the saved image is a blank frame, a solid black frame, or has no readable interface
- **THEN** the item stays pending, states that the capture is still required, keeps the file, and is not treated as the expected capture

#### Scenario: A different screen does not support the claim

- **WHEN** the saved image has a readable interface that is not the screen this check was supposed to open
- **THEN** the item stays pending, states the expected screen and what the image shows, keeps the file, and is not treated as the expected capture

#### Scenario: An image that was not inspected does not support the claim

- **WHEN** the saved image was not inspected
- **THEN** the item stays pending and states that the image was not inspected

#### Scenario: Non-UI check needs no image

- **WHEN** the check is a unit test or a spec validation and no UI was opened
- **THEN** a pass claim does not require a screenshot path
