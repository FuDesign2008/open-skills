## 1. Specs and scaffolding

- [x] 1.1 Confirm proposal/design/skill-authoring-language delta present; `openspec validate migrate-workflow-skills-en-batch1`
- [x] 1.2 Record pre-migration CJK baselines for the six skills

## 2. Batch skills (small → large)

- [x] 2.1 English + lean: `jira-fix-batch/SKILL.md`
- [x] 2.2 English + lean: `opsx-jira-fix-batch/SKILL.md`
- [x] 2.3 English + lean: `solve-workflow/SKILL.md` + `reference.md`
- [x] 2.4 English + lean: `opsx-solve-workflow/SKILL.md` + `reference.md`
- [x] 2.5 English + lean: `jira-fix-workflow/SKILL.md` + `reference.md`
- [x] 2.6 English + lean: `opsx-jira-fix-workflow/SKILL.md` + `reference.md`

## 3. Verify

- [x] 3.1 Recompute CJK ratios; each skill instructional body English-primary (CJK ≪ baseline; quoted triggers OK)
- [x] 3.2 Grep descriptions for Chinese triggers; run `node scripts/gen-skill-docs.mjs` if needed
- [x] 3.3 `openspec validate migrate-workflow-skills-en-batch1`; spot-check no platform-tool hardcoding / no「一问一答」
