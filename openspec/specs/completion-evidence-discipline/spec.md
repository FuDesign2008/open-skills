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

When the check opened a UI, a pass claim MUST cite a filesystem path to an image saved during the current turn, and that file MUST exist, be non-empty, and use a png, jpg, jpeg, or webp extension. A path string with no such file MUST NOT support the claim. Checks that did not open a UI MUST NOT be required to cite an image. This discipline MUST NOT restate another skill's measurement rules.

#### Scenario: Opened UI without a file cannot be claimed passed

- **WHEN** an agent claims a UI check passed and the cited screenshot path is missing or the file is empty
- **THEN** the claim is not complete, and the agent MUST save a non-empty image this turn or mark the item pending with the exact capture still required

#### Scenario: Non-UI check needs no image

- **WHEN** the check is a unit test or a spec validation and no UI was opened
- **THEN** a pass claim does not require a screenshot path
