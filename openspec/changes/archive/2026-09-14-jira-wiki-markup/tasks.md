## 1. New skill jira-wiki-markup

- [x] 1.1 Create `skills/jira-wiki-markup/SKILL.md` (frontmatter name/version/`user-invocable: false`, English body, Chinese triggers in quoted description ≤1024, composition rules, thin pointer to reference, role phrase not host roster, de-identified examples)
- [x] 1.2 Create `skills/jira-wiki-markup/reference.md` with full Wiki notation tables (headings, emphasis, breaks, links, lists, images, tables, `{code}`/`{panel}`/`{noformat}`, escape) plus one canonical repair-comment skeleton in Wiki

## 2. Wire writeback and hosts

- [x] 2.1 `jira-status-writeback`: add `jira-wiki-markup` to `dependencies`, bump MINOR, SOP step 2 loads it and composes Wiki `body`; abort if missing
- [x] 2.2 `jira-fix-workflow`: add dependency, bump MINOR, thin pointer at comment/writeback sites; convert writeback comment template in `reference.md` to Wiki; direct-comment paths load the skill
- [x] 2.3 `opsx-jira-fix-workflow`: add dependency, bump MINOR, thin pointer at stage 8.4; `reference.md` comment guidance uses Wiki / points at `jira-wiki-markup`

## 3. Inventory and lint

- [x] 3.1 AGENTS.md skill table: add `jira-wiki-markup` row; update `jira-status-writeback` and both hosts' dependency columns
- [x] 3.2 Run `node scripts/gen-skill-docs.mjs`; `npm run lint:skill-description`; `node scripts/lint-skill-deidentification.mjs --base origin/main` (or equivalent added-content scan)
- [x] 3.3 Grep Jira comment templates for leftover Markdown (`**Fix`, `### Verification`, fenced ` ``` ` in writeback templates); zero hits in those templates
