# completion-evidence-discipline Specification

## Purpose
Fresh-evidence gate for verification and completion claims in PDCA workflows.

## Requirements
### Requirement: Completion claims SHALL require fresh evidence from the current turn

When an agent would claim that verification passed, a fix works, tests are green, or the task is complete, it MUST base that claim on evidence produced by commands or checks executed in the **current turn** (or clearly labeled pending manual actions). MUST NOT treat designed scenarios, prior-turn memory, or subagent success reports alone as sufficient evidence. The shared skill implementing this gate MUST be named `completion-evidence-discipline` (MUST NOT reuse the Superpowers name `verification-before-completion`).

#### Scenario: Block bare pass claim

- **WHEN** an agent is about to report "tests passed" or "verification complete" without having run the relevant command in this turn
- **THEN** it MUST run the command (or mark the item pending with the exact action required) before claiming pass

#### Scenario: Non-colliding skill name

- **WHEN** the new shared skill is added under `skills/`
- **THEN** its directory and frontmatter `name` are `completion-evidence-discipline`, and it does not collide with Superpowers or mattpocock/skills skill names

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
