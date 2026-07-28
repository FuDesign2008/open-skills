## ADDED Requirements

### Requirement: Batch-2 remaining skills SHALL be English-bodied

After this change, the batch-2 inventory skills MUST have English-primary instructional bodies in `SKILL.md` and bundled `reference.md` (excluding quoted Chinese triggers/slogans and the `article-writer` exception). The inventory MUST include at least: `perf-workflow`, `frontend-perf`, `git-conflict-resolve`, `git-release-start`, `merge-discipline`, leftover Chinese templates in `jira-fix-workflow/reference.md` and `solve-workflow/reference.md`, `known-issue-research/reference.md`, and instructional Chinese remnants in `code-design-review` and `solution-review`.

#### Scenario: Batch-2 inventory is English-primary

- **WHEN** an agent reads any skill in the batch-2 inventory after this change
- **THEN** instructional prose (excluding quoted Chinese triggers/slogans) is English-primary, and user-invocable `description` fields still contain Chinese trigger phrases where applicable
