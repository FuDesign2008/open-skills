---
name: jira-wiki-markup
version: "1.1.0"
user-invocable: false
description: "Compose Jira wiki-rendered fields (especially comments) in Jira Wiki markup. Use whenever writing jira_add_comment body, a wiki description, or a repair report that will be posted to Jira. Triggers — 「Jira 语法」「Jira Wiki」「写 Jira 评论」「Jira 评论格式」「wiki markup」「jira comment markup」. Do NOT use for reading issues, status transitions, GitHub/PR Markdown, or Jira Cloud ADF. Referenced by Jira comment writers via frontmatter dependencies."
---

# Jira Wiki Markup

> Internal shared skill. Single source of truth for **Jira Wiki** notation (Wiki renderer / Server/DC). Hosts and other comment writers declare it in `dependencies`, abort if missing, and load it immediately before composing a wiki-rendered field. This skill does not call the Jira API and does not own status transitions.

**Prerequisite check**: this skill has no further skill dependencies. Referencing skills abort when *this* skill is missing (install: `npx skills add FuDesign2008/open-skills -g --skill '*' --yes`).

## When to load

Load this skill in the same turn as composing any Jira field that the Wiki renderer will display — typically `jira_add_comment`'s `body`. Hosts keep the *semantic* field map (branch, commit, URL, root cause); this skill owns *how those values are marked up*.

Full notation tables and the canonical repair-comment skeleton: [reference.md](reference.md).

## Composition

Write Wiki markup, not GitHub Markdown. The Wiki renderer is a different dialect.

| Intent | Wiki |
|--------|------|
| Heading | Line-start `h1.` … `h6.` (space after the dot) |
| Bold / emphasis / strike / underline / mono | `*bold*` / `_emphasis_` / `-strike-` / `+underline+` / `{{monospaced}}` |
| Color / quote | `{color:red}text{color}` / `{quote}…{quote}` or `bq.` at line start |
| New paragraph / forced break / rule | Blank line / `\\` / `----` |
| Link | `[https://example.com]` or `[label\|https://example.com]` |
| Attachment / user / anchor | `[^file.ext]` / `[~username]` / `{anchor:name}` then `[#name]` |
| Bullet / numbered list | Line-start `*` / `#` (more characters = deeper); mix `*#` and `#*`. Wiki `#` is a numbered list; GitHub Markdown `#` is heading 1 — keep list `#`, do not rewrite it as `h1.` |
| Table | Header `\|\|H1\|\|H2\|\|` then rows `\|c1\|c2\|` |
| Code / panel / plain | `{code:lang}…{code}` / `{panel:title=…}…{panel}` / `{noformat}…{noformat}` |
| Escape a Wiki character | `\X` (e.g. `\{`) |

Links: put a space after a URL when the next character is not part of the URL. Images: `!https://example.com/image.png!` or `!attached.png|thumbnail!`.

## Repair comment

When a host or `jira-status-writeback` posts a post-merge repair comment, format the host field map with the canonical skeleton in [reference.md](reference.md): report title `h3.`, verification section `h4.`, bold labels `*Field*:`, each scenario a numbered item `# *{name}*` (bold name, not `_italic_`). Wiki `#` is that numbered list — leave it as `#`, not `h1.`/`h2.`. Omit a field only when the host marks it N/A.

## Integration

- Declare `jira-wiki-markup` in frontmatter `dependencies`.
- Load it before composing the wiki field; pass through host field values unchanged except for markup wrapping.
- Keep in the host: when the comment is written, and the semantic field map only.
- Orientation: referenced by Jira comment writers via frontmatter `dependencies` (no integrator-name roster).
