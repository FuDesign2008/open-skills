## ADDED Requirements

### Requirement: OPSX Jira fix workflow SHALL strong-depend on jira-wiki-markup for comments

`opsx-jira-fix-workflow` MUST list `jira-wiki-markup` in frontmatter `dependencies`. At startup prerequisite check, a missing `jira-wiki-markup` MUST abort (no silent degrade). Comments this host writes or maps into `jira-status-writeback` (including the stage 8.4 field list rendered as a comment body) MUST be composed after loading `jira-wiki-markup`. Direct comments (existence mismatch after user confirmation, and any other `jira_add_comment` from this host) MUST use the same skill. Host `reference.md` MUST NOT keep Markdown-shaped comment examples for Jira bodies.

#### Scenario: Missing jira-wiki-markup aborts opsx-jira-fix startup

- **WHEN** `opsx-jira-fix-workflow` loads and `jira-wiki-markup` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before orchestration continues

#### Scenario: Stage 8.4 comment body is Wiki markup

- **WHEN** post-merge writeback composes the comment from this host's field map
- **THEN** the resulting `body` follows `jira-wiki-markup` (Wiki notation), not Markdown
