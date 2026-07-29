## ADDED Requirements

### Requirement: merge-discipline SHALL compose with feature-branch-closeout without owning the menu

`merge-discipline` MUST remain the single source for Parts A–D on protected-branch merges. When a host uses `feature-branch-closeout`, that skill owns the closeout **menu** and non-merge paths; `merge-discipline` MUST apply only after merge is selected (or on a direct user merge command). merge-discipline MUST NOT redefine the full closeout option list.

#### Scenario: Menu then merge

- **WHEN** feature-branch-closeout selects merge
- **THEN** merge-discipline runs A→B→C→D and does not present a competing full closeout menu

#### Scenario: Direct merge still uses merge-discipline

- **WHEN** the user issues a direct merge command without going through closeout
- **THEN** merge-discipline still loads (unchanged existing requirement)
