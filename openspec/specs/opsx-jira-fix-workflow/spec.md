# opsx-jira-fix-workflow Specification

## Purpose
TBD - created by archiving change integrate-learn-and-improve-jira-hosts. Update Purpose after archive.
## Requirements
### Requirement: OPSX Jira fix workflow SHALL strong-depend on learn-and-improve

`opsx-jira-fix-workflow` MUST list `learn-and-improve` in frontmatter `dependencies`. At startup prerequisite check, a missing `learn-and-improve` MUST abort the workflow (no silent degrade).

#### Scenario: Missing learn-and-improve aborts startup

- **WHEN** `opsx-jira-fix-workflow` loads and `learn-and-improve` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before stage orchestration continues

### Requirement: OPSX Jira fix workflow SHALL thin-delegate retrospective at stage 8

After archive and branch closeout (and Jira writeback when merge ran), `opsx-jira-fix-workflow` MUST load `learn-and-improve` and follow that skill. Inline stage-8 sediment prose that duplicates `learn-and-improve` MUST be replaced by a thin pointer. OpenSpec artifacts archived through the normal flow MUST remain outside that skill's sediment-value gate (same carve-out as `opsx-solve-workflow`).

#### Scenario: Stage 8.5 delegates instead of inline methodology

- **WHEN** stage 8 archive and closeout steps have completed
- **THEN** the host loads `learn-and-improve` rather than only stating ad-hoc AGENTS/rules writing rules inline

### Requirement: OPSX Jira fix workflow SHALL strong-depend on figma-pixel implement and verify

`opsx-jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At startup prerequisite check, a missing either skill MUST abort (no silent degrade). Execute/verify stages MUST conditionally load implement and verify per the same Figma-scope rules as `jira-fix-workflow` / `figma-pixel-fidelity` host hooks.

#### Scenario: Missing figma-pixel-implement aborts opsx-jira-fix startup

- **WHEN** `opsx-jira-fix-workflow` loads and `figma-pixel-implement` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before orchestration continues

#### Scenario: OPSX Jira UI fix verifies with figma-pixel-verify

- **WHEN** verification runs after a Figma-scoped implement in this change
- **THEN** the host loads `figma-pixel-verify` for measured alignment rather than screenshot-only sign-off when a JS-eval channel exists

