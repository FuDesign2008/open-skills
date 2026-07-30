## ADDED Requirements

### Requirement: Jira fix workflow SHALL strong-depend on learn-and-improve

`jira-fix-workflow` MUST list `learn-and-improve` in frontmatter `dependencies`. At startup prerequisite check, a missing `learn-and-improve` MUST abort the workflow (no silent degrade).

#### Scenario: Missing learn-and-improve aborts startup

- **WHEN** `jira-fix-workflow` loads and `learn-and-improve` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before stage 0 continues

### Requirement: Jira fix workflow SHALL thin-delegate retrospective after closeout

After stage 10 merge path completes (merge + `jira-status-writeback`, or keep/continue when no merge), `jira-fix-workflow` MUST load `learn-and-improve` and follow that skill's framework. The host MUST NOT restate the full retrospective methodology inline.

#### Scenario: Post-merge closeout loads learn-and-improve

- **WHEN** stage 10 merge and Jira writeback have finished (or the user chose keep/continue after presenting the closeout menu)
- **THEN** the host loads `learn-and-improve` for structured retrospective and sediment judgment
