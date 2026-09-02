## MODIFIED Requirements

### Requirement: Part R SHALL classify non-application-code surfaces

Part R MUST classify the open PR/MR three-dot diff as **non-application-code** when every changed path matches the allowlist and none match the denylist in `merge-discipline/reference.md`. A mixed diff (any denylisted path) MUST be classified as **application-code**.

#### Scenario: Skills-only PR is non-application-code

- **WHEN** the PR diff only changes files under `skills/**` and `openspec/**` and `docs/**` Markdown
- **THEN** the surface classifier reports non-application-code

#### Scenario: Mixed runtime source forces full surface

- **WHEN** the PR also changes a denylisted path (e.g. `.github/workflows/**`, `scripts/**`, or runtime source extensions per the reference table)
- **THEN** the surface is application-code
