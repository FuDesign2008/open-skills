## MODIFIED Requirements

### Requirement: goal-queue SHALL write one evidence HTML per completed card

For every card that reaches done, under stage-exit policy manual, auto, or ai-proxy, the dispatcher MUST write one HTML page at `.goal-driven/queues/<queue-id>/runs/<batch-id>/evidence/<card>.html` during the same sole-writer record step that records that completion. The `<card>` segment MUST be that card's slug and MUST contain no path separator. The page title MUST be 证据留痕.

The child completion report MUST include an evidence list. Each item MUST be either an opened-UI check citing a png, jpg, jpeg, or webp path, or a non-UI check citing the command and a short output summary. The dispatcher MUST copy each cited image that exists and is non-empty into `evidence/<card>/` under that same batch directory. The page MUST reference those copies by a relative path. The page MUST NOT depend on the child worktree remaining.

An opened-UI item whose file is missing or empty MUST appear as pending and MUST state the capture still required. The page MUST NOT invent an image for it. Before an opened-UI image supports the check, the agent MUST look at the saved image in this turn. A blank frame, a solid black frame, or an image with no readable interface MUST stay pending, MUST state that the capture is still required, and MUST NOT be treated as the expected capture. A readable interface that is not the screen this check was supposed to open MUST stay pending, MUST state the expected screen and what the image shows, and MUST NOT be treated as the expected capture. If the image was not inspected, the item MUST stay pending and MUST state that the image was not inspected. The file MUST be kept. The evidence page MUST show the copied image and that inspection. A non-UI item MUST show the command and the output summary and MUST NOT include an image. A done card whose evidence list is empty MUST still get the page, and that page MUST state that no checks were recorded and MUST NOT include an image.

The card's `verification.md` section MUST record this page's path. A card that is not done MUST NOT get this page. An enqueue shell MUST NOT write it. A queue child MUST NOT write it.

#### Scenario: Five completed cards produce five evidence pages

- **WHEN** five cards reach done in one batch
- **THEN** the acceptance package records five evidence HTML paths, one per card, and each page's images are copies under that batch's `evidence/` directory

#### Scenario: A card that did not finish has no evidence page

- **WHEN** a card ends failed, skipped, or parked
- **THEN** the dispatcher does not write an evidence HTML page for that card

#### Scenario: Manual policy still writes the evidence page

- **WHEN** a card reaches done and its stage-exit policy is manual
- **THEN** the dispatcher still writes that card's evidence HTML page and records its path

#### Scenario: An opened UI shows the copied image

- **WHEN** a done card's evidence list cites a non-empty png, jpg, jpeg, or webp
- **THEN** the evidence page shows that image through a relative path to the copy in the acceptance package

#### Scenario: A missing image stays pending

- **WHEN** a done card's evidence list cites an opened UI and the file is missing or empty
- **THEN** the evidence page marks that item pending, states the capture still required, and does not contain an invented image

#### Scenario: A blank or black frame stays pending on the evidence page

- **WHEN** a done card's copied image is a blank frame, a solid black frame, or has no readable interface
- **THEN** the evidence page shows the copied image, marks the item pending, states that the capture is still required, and does not treat it as the expected capture

#### Scenario: A different screen stays pending on the evidence page

- **WHEN** a done card's copied image has a readable interface that is not the screen this check was supposed to open
- **THEN** the evidence page shows the copied image, marks the item pending, states the expected screen and what the image shows, and does not treat it as the expected capture

#### Scenario: An uninspected image stays pending on the evidence page

- **WHEN** a done card's copied image was not inspected
- **THEN** the evidence page marks the item pending and states that the image was not inspected

#### Scenario: A non-UI check has no image

- **WHEN** a done card's check did not open a UI
- **THEN** the evidence page shows that check's command and output summary and does not include an image for it

#### Scenario: A done card with no checks still has a page

- **WHEN** a card reaches done and its evidence list is empty
- **THEN** the dispatcher still writes the evidence page, the page states that no checks were recorded, and the page contains no image

#### Scenario: The page path uses the card slug

- **WHEN** the done card's slug is `sync-dns`
- **THEN** the evidence page path ends with `evidence/sync-dns.html` and its copied images sit under `evidence/sync-dns/`
