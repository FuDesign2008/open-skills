# Delta Spec: completion-evidence-discipline

## ADDED Requirements

### Requirement: A pass claim for an opened UI SHALL cite a non-empty screenshot from this turn

When the check opened a UI, a pass claim MUST cite a filesystem path to an image saved during the current turn, and that file MUST exist, be non-empty, and use a png, jpg, jpeg, or webp extension. A path string with no such file MUST NOT support the claim. Checks that did not open a UI MUST NOT be required to cite an image. This discipline MUST NOT restate another skill's measurement rules.

#### Scenario: Opened UI without a file cannot be claimed passed

- **WHEN** an agent claims a UI check passed and the cited screenshot path is missing or the file is empty
- **THEN** the claim is not complete, and the agent MUST save a non-empty image this turn or mark the item pending with the exact capture still required

#### Scenario: Non-UI check needs no image

- **WHEN** the check is a unit test or a spec validation and no UI was opened
- **THEN** a pass claim does not require a screenshot path
