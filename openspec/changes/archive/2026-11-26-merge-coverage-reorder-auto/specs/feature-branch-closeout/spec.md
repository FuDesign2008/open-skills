## MODIFIED Requirements

### Requirement: feature-branch-closeout SHALL delegate merge to merge-discipline

When the chosen option is merge (or the user later says merge), the agent MUST load `merge-discipline` and run Parts A→B→R→C→D before executing the merge. feature-branch-closeout MUST NOT restate those parts inline.

#### Scenario: Merge path loads merge-discipline

- **WHEN** closeout selects merge
- **THEN** `merge-discipline` is loaded and run end-to-end before `gh pr merge` / equivalent
