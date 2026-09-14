## Why

Post-merge Jira comments (and other `jira_add_comment` bodies) are composed as GitHub Markdown, but Server/DC Jira renders comments with Wiki markup (`*bold*`, `h3. heading`, `{code}`, `||tables||`). There is no shared skill for that syntax, so `jira-status-writeback` owns the API SOP while hosts keep Markdown-shaped templates — comments render incorrectly. This change adds a callee skill as the single source for Wiki markup and requires every in-repo comment writer to load it.

## What Changes

- Add shared skill `jira-wiki-markup`: Jira Wiki notation for comment (and other wiki-rendered) fields; English body; Chinese triggers in description; detailed tables in `reference.md`; no internal hostnames or instance URLs (de-identification).
- `jira-status-writeback` MUST declare and load `jira-wiki-markup` when composing `body` before `jira_add_comment`.
- `jira-fix-workflow` and `opsx-jira-fix-workflow` MUST declare the same dependency and use Wiki markup for every Jira comment they write (writeback templates and direct comments: existence mismatch, industry-wide gate, analysis handoff).
- Convert existing Markdown comment templates in host `reference.md` files to Wiki markup; hosts MUST NOT restated the full notation tables (thin load + field map only).
- **Non-goals**: Jira Cloud ADF / Markdown dialect detection; changing the two-step writeback API or「已修复」status boundary; writing comments at PR-create time.

## Capabilities

### New Capabilities

- `jira-wiki-markup`: Authoritative Jira Wiki markup for agent-written Jira fields (headings, emphasis, lists, links, tables, `{code}`/`{panel}`/`{noformat}`, color/quote, escaping). Comment composition rules: wiki-not-markdown, YAGNI subset vs full tables in reference, de-identified examples.

### Modified Capabilities

- `jira-status-writeback`: Comment `body` MUST be composed by loading `jira-wiki-markup`; the skill MUST list it in frontmatter `dependencies`.
- `jira-fix-workflow`: MUST list `jira-wiki-markup` in `dependencies`; all Jira comments (writeback template and direct comments) MUST use that skill rather than Markdown templates.
- `opsx-jira-fix-workflow`: Same as `jira-fix-workflow` for comments this host writes or maps into writeback.
- `workflow-contract-sync`: Jira writeback comment `body` MUST be Wiki markup via `jira-wiki-markup`, not Markdown.

## Impact

- New: `skills/jira-wiki-markup/SKILL.md` + `reference.md`
- Edit: `skills/jira-status-writeback/SKILL.md`; `skills/jira-fix-workflow/SKILL.md` + `reference.md`; `skills/opsx-jira-fix-workflow/SKILL.md` + `reference.md`; AGENTS.md skill table / dependencies column
- `docs/generated/skills-index.md` via gen script / pre-commit
- Callee MUST NOT enumerate host skill ids (`skill-dependency-direction`); hosts own the `dependencies` edges
- Authoring: `skill-creator` for the new skill body; this OpenSpec change owns the behavioral contract
