# opsx-solve-workflow Delta

## MODIFIED Requirements

### Requirement: opsx-solve-workflow SHALL strong-depend on figma-pixel implement and verify

`opsx-solve-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At startup prerequisite check, a missing either skill MUST abort (no silent degrade). Phase 6 MUST load `figma-pixel-implement` when Figma URL/node or pixel-restore / design-faithful UI intent is in scope; implement is incomplete without a durable inventory+spec path in the target repo. Phase 7 MUST load `figma-pixel-verify` when this run implemented from Figma or the user/plan requires alignment checking. When this run implemented from Figma, Phase 7 MUST treat a missing Verify section (or Spec source sibling) as a failed verification stage. A spec-gap FAIL MUST NOT pass Phase 7—re-enter implement to complete the table. Host prose MUST stay thin (load + scope conditions) and MUST NOT duplicate the Figma skills' methodology.

#### Scenario: Missing pair aborts opsx-solve startup

- **WHEN** `opsx-solve-workflow` loads and either Figma pixel skill is unavailable
- **THEN** the workflow aborts with a missing-dependency notice before stage 0 continues

#### Scenario: Phase 6 Figma UI work loads implement

- **WHEN** Phase 6 executes a plan that implements UI from a Figma node
- **THEN** the host loads `figma-pixel-implement` and follows that skill for assets and the living spec path

#### Scenario: Phase 7 missing Figma verify report fails

- **WHEN** Phase 6 implemented UI from Figma and Phase 7 has no Verify section (or Spec source sibling)
- **THEN** Phase 7 MUST NOT mark verification as passed

#### Scenario: Phase 7 spec-gap re-enters implement

- **WHEN** Phase 7 verify FAILs because Spec is missing critical rows
- **THEN** Phase 7 MUST NOT pass and MUST re-enter `figma-pixel-implement` to complete the table
