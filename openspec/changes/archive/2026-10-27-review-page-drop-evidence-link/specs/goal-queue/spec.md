# goal-queue Specification (DELTA)

## MODIFIED Requirements

### Requirement: goal-queue SHALL write one review HTML per completed card

For every card that reaches done, under stage-exit policy manual, auto, or ai-proxy, the dispatcher MUST write one HTML page by following explain-clearly with the form fixed to HTML. The page MUST state the problem, the cause, and the completed fix. The page MUST NOT add a standalone link to the evidence page after the explanation; the shared navigation block and the acceptance entry page reach that evidence page. The acceptance package MUST record that file's path. A card that is not done MUST NOT get this page. An enqueue shell MUST NOT write it.

#### Scenario: Five completed cards produce five files

- **WHEN** five cards reach done in one batch
- **THEN** the acceptance package records five review HTML paths, one per card

#### Scenario: A card that did not finish has no file

- **WHEN** a card ends failed, skipped, or parked
- **THEN** the dispatcher does not write a review HTML for that card

#### Scenario: Manual policy still writes the file

- **WHEN** a card reaches done and its stage-exit policy is manual
- **THEN** the dispatcher still writes that card's review HTML page, and the acceptance package records the review path

#### Scenario: Review page links to the evidence page

- **WHEN** a card reaches done, the review HTML and its evidence page both exist
- **THEN** the shared navigation block on the review page links to the evidence page, and the review body carries no standalone evidence link
