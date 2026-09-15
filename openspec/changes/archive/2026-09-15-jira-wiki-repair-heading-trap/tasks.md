## 1. jira-wiki-markup dialect trap

- [x] 1.1 SKILL.md composition + repair-comment heading ceiling (`h3.`/`h4.` / `# *name*`)
- [x] 1.2 reference.md Lists note + skeleton closing line (Wiki `#` is numbered list)

## 2. Writeback SOP

- [x] 2.1 `jira-status-writeback` rewrite line-start `h1.`/`h2.` before `jira_add_comment`
- [x] 2.2 Bump writeback skill version

## 3. Host thin pointer

- [x] 3.1 Replace duplicated writeback body in `jira-fix-workflow/reference.md` with pointer + shape reminder
- [x] 3.2 Bump `jira-fix-workflow` version

## 4. Specs

- [x] 4.1 Delta specs in this change
- [x] 4.2 Apply to main `openspec/specs/` (same PR)
- [x] 4.3 `openspec validate --changes` (includes this change) and `openspec validate --specs`

## 5. Lint / index

- [x] 5.1 `npm run lint:skill-description`
- [x] 5.2 `node scripts/gen-skill-docs.mjs`
- [x] 5.3 Grep: host writeback is not a full field-map copy; spec example is `h4. Verification Scenarios`
