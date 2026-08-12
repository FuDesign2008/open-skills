## MODIFIED Requirements

### Requirement: figma-pixel-fidelity skills SHALL stay platform-agnostic and strong-depend from PDCA hosts

Skill bodies MUST describe intents (obtain design context, export assets, measure computed styles) and MUST NOT require a single named MCP/CLI as the only implementation. Host workflows `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At host startup prerequisite check, a missing either skill MUST abort (no silent degrade). Hosts MUST load `figma-pixel-implement` during execution when the task includes a Figma URL/node or pixel-restore / design-faithful UI intent, and MUST load `figma-pixel-verify` during verification when this run implemented from Figma or the user/plan requires alignment checking. Pure non-UI work MUST still pass the install-time prerequisite check but MUST NOT be forced to run implement/verify loops.

#### Scenario: Missing Figma pixel skill aborts host startup

- **WHEN** a listed PDCA host loads and `figma-pixel-implement` or `figma-pixel-verify` is not available
- **THEN** the host prints a missing-dependency notice and aborts before orchestration continues

#### Scenario: Figma UI work invokes implement then verify

- **WHEN** stage execution is implementing UI from a Figma node URL
- **THEN** the host loads `figma-pixel-implement` for export-faithful implement + spec table, and later verification loads `figma-pixel-verify` for measured pass/fail when alignment checking is in scope

#### Scenario: Non-UI bug still requires skills installed

- **WHEN** a user runs `solve-workflow` for a non-UI backend bug and both Figma pixel skills are installed
- **THEN** the workflow proceeds without running implement/verify loops, but if either skill is missing the prerequisite check still aborts
