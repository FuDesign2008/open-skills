# Spec Delta

## ADDED Requirements

### Requirement: goal-queue SHALL write one review HTML per completed card

For every card that reaches done, under stage-exit policy manual, auto, or ai-proxy, the dispatcher MUST write one HTML page by following explain-clearly with the form fixed to HTML. The page MUST state the problem, the cause, and the completed fix. The acceptance package MUST record that file's path. A card that is not done MUST NOT get this page. An enqueue shell MUST NOT write it.

#### Scenario: Five completed cards produce five files

- **WHEN** five cards reach done in one batch
- **THEN** the acceptance package records five HTML paths, one per card

#### Scenario: A card that did not finish has no file

- **WHEN** a card ends failed, skipped, or parked
- **THEN** the dispatcher does not write a review HTML for that card

#### Scenario: Manual policy still writes the file

- **WHEN** a card reaches done and its stage-exit policy is manual
- **THEN** the dispatcher still writes that card's HTML page and records its path
