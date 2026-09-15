## Why

Repair comments already use Jira Wiki (`h3.` / `h4.` / `# *scenario*`), but Wiki `#` is a numbered list while GitHub Markdown `#` is heading 1. Agents rewrite list `#` as `h1. _name_`, which the Wiki renderer correctly shows as the largest heading. That is not the intended skeleton. Host `jira-fix-workflow/reference.md` also duplicated the skeleton without the dialect note, so agents copying the host miss the trap.

## What Changes

- `jira-wiki-markup` states the dialect trap (Wiki `#` = numbered list) and repair-comment heading ceiling (`h3.` report, `h4.` verification section, scenarios as `# *name*`).
- `jira-status-writeback` rewrites line-start `h1.`/`h2.` on a repair `body` back to numbered `# *name*` items before `jira_add_comment`.
- `jira-fix-workflow/reference.md` drops the full duplicated writeback body; it points at the callee skeleton and keeps a short shape reminder with the dialect note.
- OpenSpec examples use `h4. Verification Scenarios` (not `h3.`). Chat/checkpoint Markdown in hosts stays Markdown.

## Capabilities

### Modified Capabilities

- `jira-wiki-markup`: Repair comments use `h3.`/`h4.` plus numbered `# *name*` items; Wiki `#` is not rewritten as `h1.`.
- `jira-status-writeback`: Pre-post rewrite of repair-comment `h1.`/`h2.` lines; spec example `h4.` for Verification Scenarios.
- `jira-fix-workflow`: Host writeback section is a thin pointer + shape reminder, not a full skeleton copy.

## Impact

- Edit: `skills/jira-wiki-markup/SKILL.md` + `reference.md`; `skills/jira-status-writeback/SKILL.md`; `skills/jira-fix-workflow/SKILL.md` (version) + `reference.md`; main specs for the three capabilities.
- `docs/generated/skills-index.md` via gen script / pre-commit.
- Non-goals: Jira Cloud ADF; changing two-step writeback API; converting chat/local-md templates to Wiki; new industry-wide comment long templates.
