## ADDED Requirements

### Requirement: Host reference.md SHALL NOT restate shared analysis or industry-research skeletons

PDCA host `reference.md` files MUST NOT paste the full `analysis-core` step skeleton or the full `known-issue-research` industry-wide evaluation report template. They MUST use one-line (or short) pointers to those skills' authoritative docs. Host-only fields MAY remain (e.g. jira `02-analysis.md` path, difficulty pre-assessment, OpenSpec-specific verify bullets).

#### Scenario: jira Stage 3 leans on analysis-core

- **WHEN** an agent formats jira-fix stage 3 analysis output
- **THEN** methodology steps come from `analysis-core`; the host reference keeps jira-specific artifact/gate/difficulty fields without re-listing the full shared skeleton

#### Scenario: Industry template points to known-issue-research

- **WHEN** jira-fix needs an industry-wide hard-problem report format
- **THEN** it points to `known-issue-research/reference.md` for the shared template and keeps only the jira gate divergence (stop flow + Jira comment) in the host reference

### Requirement: Prerequisite missing-notice dependency lists SHALL match frontmatter

When a host documents a Prerequisite Skill Check missing-notice that enumerates strong dependencies, that enumeration MUST include every skill listed in the host's current frontmatter `dependencies` (or state "see frontmatter dependencies" without a stale partial list). It MUST NOT omit newer shared disciplines that the frontmatter already declares.

#### Scenario: solve-workflow missing notice stays current

- **WHEN** `solve-workflow` frontmatter gains new strong dependencies
- **THEN** its reference.md missing-notice list is updated in the same change (or replaced by an explicit "enumerate from frontmatter" instruction) so install hints do not lie
