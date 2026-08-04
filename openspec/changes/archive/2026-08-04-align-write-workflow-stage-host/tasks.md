## 1. write-workflow host

- [x] 1.1 Rewrite `skills/write-workflow/SKILL.md` to eight-stage skeleton + modes + Path + QR; add `workflow-mode-lifecycle` dependency; bump version to 1.1.0
- [x] 1.2 Add `skills/write-workflow/reference.md` with host output templates
- [x] 1.3 Update description triggers for auto mode (keep ≤1024 chars)

## 2. tech-review-doc contract

- [x] 2.1 Add auto-host / §1 gate note to `skills/tech-review-doc/SKILL.md`; bump to 1.0.1

## 3. Inventory and verify

- [x] 3.1 Update `AGENTS.md` dependency column for write-workflow
- [x] 3.2 `npm run lint:skill-description` + `node scripts/gen-skill-docs.mjs`
- [x] 3.3 Grep: no `analysis-core` in write-workflow dependencies; `openspec validate --strict`
- [x] 3.4 Sync main specs + archive change
