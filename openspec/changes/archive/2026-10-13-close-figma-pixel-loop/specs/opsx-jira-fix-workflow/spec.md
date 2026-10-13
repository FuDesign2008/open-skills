# Delta Spec: opsx-jira-fix-workflow

## MODIFIED Requirements

### Requirement: OPSX Jira fix workflow SHALL strong-depend on figma-pixel implement and verify

`opsx-jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At startup prerequisite check, a missing either skill MUST abort (no silent degrade). Execute/verify stages MUST conditionally load implement and verify per the same Figma-scope rules as `jira-fix-workflow` / `figma-pixel-fidelity` host hooks, including the durable living-artifact path. Implement MUST continue into `figma-pixel-verify` in the same run until overall PASS or the measurement command cannot run. When this run implemented from Figma, verification MUST treat a missing Verify section (or Spec source sibling) as a failed verification stage. Verification MUST pass only when that report’s overall status is PASS (accepted residuals included), its channel is `storybook`, `isolated-harness`, `preview`, `full-app`, or `layout-probe`, and `scripts/check-figma-verify-report.mjs` from `figma-pixel-verify` exits 0 on that file. A source-literal compare, or a report that leaves pixel rows for a person, MUST NOT pass. Any other result MUST fail the stage and return to the implement stage for another fix/re-measure loop. A spec-gap FAIL MUST NOT pass verification—re-enter implement to complete the table. Host prose MUST stay thin and MUST NOT duplicate Figma skill methodology.

#### Scenario: Missing figma-pixel-implement aborts opsx-jira-fix startup

- **WHEN** `opsx-jira-fix-workflow` loads and `figma-pixel-implement` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before orchestration continues

#### Scenario: OPSX Jira UI fix verifies with figma-pixel-verify

- **WHEN** verification runs after a Figma-scoped implement in this change
- **THEN** the host loads `figma-pixel-verify` and passes only on overall PASS from a laid-out channel

#### Scenario: Missing Figma verify report fails OPSX Jira verification

- **WHEN** this run implemented UI from Figma and verification has no Verify section (or Spec source sibling)
- **THEN** the host MUST NOT mark verification as passed

#### Scenario: Spec-gap FAIL re-enters implement

- **WHEN** verify FAILs because Spec is missing critical rows after this-run implement
- **THEN** the host MUST NOT pass verification and MUST re-enter `figma-pixel-implement`

#### Scenario: Source compare does not pass OPSX Jira verification

- **WHEN** the Verify channel is a source-literal compare, or the report leaves pixel rows for a person
- **THEN** the host MUST NOT pass verification and MUST return to the implement stage for another fix/re-measure loop
