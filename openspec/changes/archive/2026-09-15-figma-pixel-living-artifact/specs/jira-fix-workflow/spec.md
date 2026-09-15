# jira-fix-workflow Delta

## MODIFIED Requirements

### Requirement: Jira fix workflow SHALL strong-depend on figma-pixel implement and verify

`jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At startup prerequisite check, a missing either skill MUST abort the workflow (no silent degrade). During execute/verify stages, the host MUST load implement when Figma URL/node or pixel-restore intent is in scope (implement incomplete without a durable inventory+spec path), and MUST load verify when this run implemented from Figma or alignment checking is required. When this run implemented from Figma, the verification stage MUST treat a missing Verify section (or Spec source sibling) as a failed verification stage. A spec-gap FAIL MUST NOT pass verification—re-enter implement to complete the table. Host prose MUST stay thin and MUST NOT duplicate Figma skill methodology.

#### Scenario: Missing figma-pixel-verify aborts jira-fix startup

- **WHEN** `jira-fix-workflow` loads and `figma-pixel-verify` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before stage 0 continues

#### Scenario: Jira UI fix with Figma link uses implement

- **WHEN** stage execute is applying a UI fix and the issue or plan references a Figma node
- **THEN** the host loads `figma-pixel-implement` rather than inventing CSS without the fidelity workflow

#### Scenario: Missing Figma verify report fails Jira verification

- **WHEN** this run implemented UI from Figma and verification has no Verify section (or Spec source sibling)
- **THEN** the host MUST NOT mark verification as passed

#### Scenario: Spec-gap FAIL re-enters implement

- **WHEN** verify FAILs because Spec is missing critical rows after this-run implement
- **THEN** the host MUST NOT pass verification and MUST re-enter `figma-pixel-implement`
