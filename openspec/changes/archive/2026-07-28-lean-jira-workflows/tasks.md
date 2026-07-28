## 1. New skill jira-status-writeback

- [x] 1.1 Create `skills/jira-status-writeback/SKILL.md` (frontmatter, English body, Chinese triggers in description, two-step API, 已修复-only, field placeholders, failure warn)
- [x] 1.2 Optional short `reference.md` only if comment template >5 lines; else keep in SKILL

## 2. Wire hosts + Wave 1 thin

- [x] 2.1 `jira-fix-workflow`: add dependency; replace stage-10 writeback with load + field map; remove merge Part C/D Red Flag catalog; compress env section; thin analysis/clarifying restatements; merge duplicate quick-ref if safe; move bulky templates to reference
- [x] 2.2 `opsx-jira-fix-workflow`: same writeback wiring; remove merge restatements; compress env; move stage-3 field checklist to reference; thin stage-8 Red Flags to host-unique
- [x] 2.3 Update AGENTS.md skill summary row for `jira-status-writeback` if applicable
- [x] 2.4 Bump host frontmatter versions; fix dependency count prose to match arrays

## 3. Verify

- [x] 3.1 `openspec validate lean-jira-workflows`
- [x] 3.2 `npm run lint:skill-description`
- [x] 3.3 Soft line-count check + grep for leftover full writeback / merge Part C catalogs
- [x] 3.4 Regenerate skills-index via hook or `node scripts/gen-skill-docs.mjs`
