## Why

A non-empty screenshot file can still be a blank frame, a solid black frame, or a readable screen that is not the one the check was supposed to open. The acceptance package currently keeps that file without a judgment, so a pass claim can rest on the wrong picture.

## What Changes

- Before an opened-UI image supports a check, the agent looks at the saved image in that turn.
- A blank frame, a solid black frame, or an image with no readable interface stays pending, keeps the file, and is not the expected capture.
- A readable interface of a different screen stays pending and states the expected screen and what the image shows.
- An image that was not inspected stays pending and says so.
- The evidence page shows the copied image and that inspection.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `completion-evidence-discipline`: a non-empty file is not enough for an opened-UI pass claim.
- `runtime-verification-discipline`: the same look applies when a check keeps a screenshot. The look is not a subjective-UX handoff.
- `goal-queue`: the evidence page shows the image and the inspection.
- `goal-run`: a standalone page and a queue-child evidence list carry the inspection.
- `jira-fix-workflow`, `opsx-jira-fix-workflow`, `opsx-solve-workflow`: a queue-child evidence item carries the inspection.
- `solve-workflow` has no spec; its queue-child sentence matches the others.

## Impact

- Skill text in the capabilities above, plus `skills/solve-workflow/SKILL.md`.
- Contract test `scripts/screenshot-inspection-contract.test.mjs`.
- `figma-pixel-verify` keeps its own measurement. This look does not replace it.
