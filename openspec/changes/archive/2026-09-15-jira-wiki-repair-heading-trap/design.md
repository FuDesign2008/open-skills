## Context

Canonical repair-comment skeleton already used `h3.` / `h4.` / `# *{scenario_name}*`. A live writeback used `h1. _scenario_` under Verification Scenarios, producing page-title-sized text. Root cause: Wiki `#` vs Markdown `#`. Isolation skipped: `【工作区隔离跳过】escape=lean-hotfix；reason=Markdown skills 库、高确定性文案收紧`.

## Goals / Non-Goals

**Goals:**

- Agents keep scenario titles as numbered `# *name*` items
- Writeback rewrites stray `h1.`/`h2.` before posting
- Host writeback section does not duplicate the full skeleton without the dialect note
- Spec example `h4. Verification Scenarios`

**Non-Goals:**

- Changing Jira renderer behavior
- Converting chat/checkpoint/`jira-read` cache Markdown to Wiki
- New long templates for industry-wide / existence-fail comments (still load `jira-wiki-markup`)

## Decisions

1. **Keep `# *name*`** — numbering is useful; the fix is naming the dialect trap, not abandoning Wiki numbered lists.
2. **SOP rewrite, not a linter script** — this repo has no runtime comment linter; writeback SOP is the execution gate.
3. **Short host shape reminder** — pointer plus four-line shape (`h3.` / `h4.` / `# *name*`) so agents who only open the host still see the trap; not a second full field-map copy.
4. **Positive pitfall in `reference.md` Lists** — non-intuitive `#` clash; not a pile of 不得 sentences in SKILL.md.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Agents ignore prose | Writeback SOP rewrite of line-start `h1.`/`h2.` |
| Host copy drifts again | Thin pointer + short shape only |
| False-positive rewrite of Heading table examples | Gate applies to the composed repair `body`, not skill docs |

## Migration Plan

Skill text only. No runtime data migration. After merge, reinstall skills (`node scripts/install-skills.mjs`) so global copies pick up the trap and SOP.
