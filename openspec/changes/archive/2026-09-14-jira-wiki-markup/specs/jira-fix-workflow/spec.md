## ADDED Requirements

### Requirement: Jira fix workflow SHALL strong-depend on jira-wiki-markup for comments

`jira-fix-workflow` MUST list `jira-wiki-markup` in frontmatter `dependencies`. At startup prerequisite check, a missing `jira-wiki-markup` MUST abort the workflow (no silent degrade). Every Jira comment this host writes — including the post-merge writeback template rendered through `jira-status-writeback`, and direct comments (existence-check mismatch, industry-wide hard-problem gate, analysis handoff) — MUST be composed after loading `jira-wiki-markup`. Host `reference.md` comment templates MUST be Jira Wiki, not GitHub Markdown.

#### Scenario: Missing jira-wiki-markup aborts jira-fix startup

- **WHEN** `jira-fix-workflow` loads and `jira-wiki-markup` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before stage 0 continues

#### Scenario: Writeback template is Wiki markup

- **WHEN** an agent reads the Jira writeback comment template in `jira-fix-workflow/reference.md`
- **THEN** headings use `hN.` and emphasis uses `*text*` / lists at column 0, not Markdown `**` / `###`

#### Scenario: Direct gate comments use Wiki markup

- **WHEN** the host writes a Jira comment for an existence-check mismatch or an industry-wide hard-problem stop
- **THEN** the comment body is composed per `jira-wiki-markup`
