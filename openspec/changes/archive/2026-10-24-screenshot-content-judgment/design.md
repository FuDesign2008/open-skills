## Context

See proposal.md. A saved png can have bytes and still show nothing useful, or show a different screen. The agent that saved the file is the one that knows which screen the check was supposed to open.

## Goals / Non-Goals

**Goals:**

- Look at each saved opened-UI image in the same turn, before it supports the check.
- Keep the file on the evidence page and record the inspection next to it.
- Treat blank, solid black, unreadable, wrong-screen, and uninspected images as pending.

**Non-Goals:**

- A pixel diff against a design file. That stays in `figma-pixel-verify`.
- Deleting the bad image. The reviewer still needs to see it.
- Handing the look to a person as subjective UX.

## Decisions

### The capturing agent looks, and the page shows that result

The agent that saved the image looks at it before the evidence item supports the check. The dispatcher writes the copied image and the inspection onto the evidence page. A missing inspection is pending and states that the image was not inspected. Alternative considered: only the dispatcher looks. Rejected because the dispatcher does not know which screen the check was supposed to open unless the child records it.

### Blank, black, and wrong screen stay pending and keep the file

A blank frame, a solid black frame, or an image with no readable interface states that the capture is still required. A readable interface that is not the intended screen states the expected screen and what the image shows. The file remains. None of those count as the expected capture. Alternative considered: drop the file. Rejected because the reviewer then cannot see the bad capture.

### This look is not category C

`runtime-verification-discipline` hands subjective UX to a person. Blank, black, unreadable, and wrong-screen images are inspections in the same turn. The skill states that this look is not category C.

### Tests lock the sentences

`scripts/screenshot-inspection-contract.test.mjs` locks the inspection sentences in the skills that record or display the image. Do not snapshot rendered HTML.

## Risks / Trade-offs

- [The model cannot see the image] → The item stays pending and states that the image was not inspected.
- [A useful dark theme is called a black frame] → A solid black frame is a frame with no readable interface. A dark theme that still shows the intended screen is the expected capture.
- [The child skips the look] → The page marks the item pending because the image was not inspected.

## Migration Plan

No backfill. Existing evidence pages stay as they are. Rollback is reverting the skill text and the contract test.

## Open Questions

None.
