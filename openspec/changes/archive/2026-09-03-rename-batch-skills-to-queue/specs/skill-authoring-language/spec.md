## MODIFIED Requirements

### Requirement: Skill bodies and references SHALL be written in English by default

Non-exception skills under `skills/<name>/` MUST write instructional body content in English for `SKILL.md`, `reference.md`, and other bundled instructional markdown. Frontmatter `description` MUST include Chinese trigger phrases when the skill is user-invocable or workflow-triggered for Chinese users, and MAY also include English equivalents. Chinese slogans that are contractual user-facing cues (e.g.「一次一问、多轮问清」) MAY remain in English bodies as quoted trigger/pointer text.

#### Scenario: Batch-1 workflow hosts are English-bodied

- **WHEN** an agent reads `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`, `jira-fix-queue`, or `opsx-jira-fix-queue` after this change
- **THEN** the instructional body (excluding quoted Chinese triggers/slogans) is English-primary, and `description` still contains Chinese trigger phrases
