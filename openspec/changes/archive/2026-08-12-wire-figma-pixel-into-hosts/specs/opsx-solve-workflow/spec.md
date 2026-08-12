## ADDED Requirements

### Requirement: opsx-solve-workflow SHALL strong-depend on figma-pixel implement and verify

`opsx-solve-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At startup prerequisite check, a missing either skill MUST abort (no silent degrade). Phase 6 MUST load `figma-pixel-implement` when Figma URL/node or pixel-restore / design-faithful UI intent is in scope. Phase 7 MUST load `figma-pixel-verify` when this run implemented from Figma or the user/plan requires alignment checking. Host prose MUST stay thin (load + scope conditions) and MUST NOT duplicate the Figma skills' methodology.

#### Scenario: Missing pair aborts opsx-solve startup

- **WHEN** `opsx-solve-workflow` loads and either Figma pixel skill is unavailable
- **THEN** the workflow aborts with a missing-dependency notice before stage 0 continues

#### Scenario: Phase 6 Figma UI work loads implement

- **WHEN** Phase 6 executes a plan that implements UI from a Figma node
- **THEN** the host loads `figma-pixel-implement` and follows that skill for assets and design-spec table
