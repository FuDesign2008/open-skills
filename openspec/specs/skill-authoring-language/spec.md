# skill-authoring-language Specification

## Purpose
TBD - created by archiving change migrate-workflow-skills-en-batch1. Update Purpose after archive.
## Requirements
### Requirement: Skill bodies and references SHALL be written in English by default

Non-exception skills under `skills/<name>/` MUST write instructional body content in English for `SKILL.md`, `reference.md`, and other bundled instructional markdown. Frontmatter `description` MUST include Chinese trigger phrases when the skill is user-invocable or workflow-triggered for Chinese users, and MAY also include English equivalents. Chinese slogans that are contractual user-facing cues (e.g.「一次一问、多轮问清」) MAY remain in English bodies as quoted trigger/pointer text.

#### Scenario: Batch-1 workflow hosts are English-bodied

- **WHEN** an agent reads `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`, `jira-fix-queue`, or `opsx-jira-fix-queue` after this change
- **THEN** the instructional body (excluding quoted Chinese triggers/slogans) is English-primary, and `description` still contains Chinese trigger phrases

### Requirement: Chinese-only exception skills MAY keep Chinese bodies

Skills explicitly designated as Chinese-only (currently `article-writer`) MAY keep Chinese instructional bodies. They MUST still be listed in inventory/migration planning as exceptions, not as English migration targets unless product policy changes.

#### Scenario: article-writer remains Chinese

- **WHEN** migration batch-1 completes
- **THEN** `article-writer` is not required to be English-bodied by this capability

### Requirement: Batch-2 remaining skills SHALL be English-bodied

After this change, the batch-2 inventory skills MUST have English-primary instructional bodies in `SKILL.md` and bundled `reference.md` (excluding quoted Chinese triggers/slogans and the `article-writer` exception). The inventory MUST include at least: `perf-workflow` and `frontend-perf` (both later superseded by `perf-optimize-workflow`), `git-conflict-resolve`, `git-release-start`, `merge-discipline`, leftover Chinese templates in `jira-fix-workflow/reference.md` and `solve-workflow/reference.md`, `known-issue-research/reference.md`, and instructional Chinese remnants in `code-design-review` and `solution-review`.

#### Scenario: Batch-2 inventory is English-primary

- **WHEN** an agent reads any skill in the batch-2 inventory after this change
- **THEN** instructional prose (excluding quoted Chinese triggers/slogans) is English-primary, and user-invocable `description` fields still contain Chinese trigger phrases where applicable

