## MODIFIED Requirements

### Requirement: Writeback comment body SHALL use jira-wiki-markup

`jira-status-writeback` MUST list `jira-wiki-markup` in frontmatter `dependencies` and abort at startup if it is missing. When composing the repair comment `body` (step 2 of the existing two-step SOP), the skill MUST load `jira-wiki-markup` and emit Jira Wiki markup. Host-supplied field values remain the semantic content; Wiki notation is not optional. After composing, if any line of that repair `body` starts with `h1.` or `h2.`, the skill MUST rewrite those titles as numbered `# *name*` items so the posted comment stays at `h3.`/`h4.` plus lists, then call `jira_add_comment`.

#### Scenario: Missing jira-wiki-markup aborts writeback skill load

- **WHEN** `jira-status-writeback` is loaded and `jira-wiki-markup` is not available
- **THEN** the skill (or its host prerequisite check) aborts with the standard missing-dependency install hint

#### Scenario: Repair comment is Wiki not Markdown

- **WHEN** writeback calls `jira_add_comment` after a successful merge
- **THEN** `body` uses Wiki headings/emphasis/lists/links as specified by `jira-wiki-markup` (for example `*Fix Branch*` or `h4. Verification Scenarios`) and does not use Markdown `**bold**` or `### heading`

#### Scenario: Stray h1/h2 scenario titles are rewritten before post

- **WHEN** the composed repair `body` contains a line starting with `h1.` or `h2.`
- **THEN** those titles are rewritten as numbered `# *name*` items before `jira_add_comment`
