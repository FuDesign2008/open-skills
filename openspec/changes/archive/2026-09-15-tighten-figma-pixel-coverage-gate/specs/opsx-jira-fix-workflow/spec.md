# opsx-jira-fix-workflow Delta

## MODIFIED Requirements

### Requirement: OPSX Jira fix workflow SHALL strong-depend on figma-pixel implement and verify

`opsx-jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At startup prerequisite check, a missing either skill MUST abort (no silent degrade). Execute/verify stages MUST conditionally load implement and verify per the same Figma-scope rules as `jira-fix-workflow` / `figma-pixel-fidelity` host hooks. When this run implemented from Figma, verification MUST treat a missing measured `figma-pixel-verify` report as a failed verification stage. Host prose MUST stay thin and MUST NOT duplicate Figma skill methodology.

#### Scenario: Missing figma-pixel-implement aborts opsx-jira-fix startup

- **WHEN** `opsx-jira-fix-workflow` loads and `figma-pixel-implement` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before orchestration continues

#### Scenario: OPSX Jira UI fix verifies with figma-pixel-verify

- **WHEN** verification runs after a Figma-scoped implement in this change
- **THEN** the host loads `figma-pixel-verify` for measured alignment rather than screenshot-only sign-off when a JS-eval channel exists

#### Scenario: Missing Figma verify report fails OPSX Jira verification

- **WHEN** this run implemented UI from Figma and verification has no `figma-pixel-verify` report
- **THEN** the host MUST NOT mark verification as passed
