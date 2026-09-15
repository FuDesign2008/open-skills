## 1. Evals first (test-first)

- [x] 1.1 Add `figma-pixel-implement` eval 8 (durable path, incremental append) and tighten eval 3 (handoff path)
- [x] 1.2 Add `figma-pixel-verify` evals 7–8 (write-back + spec-gap return; standalone persist-first) and tighten eval 3 (persist)

## 2. Implement skill

- [x] 2.1 Update `skills/figma-pixel-implement/SKILL.md` living artifact + incremental append; bump to 1.3.0; description ≤1024 with Chinese triggers
- [x] 2.2 Update `skills/figma-pixel-implement/reference.md` path convention and three-section template

## 3. Verify skill

- [x] 3.1 Update `skills/figma-pixel-verify/SKILL.md` (read path, write Verify, spec-gap returns, standalone persist); bump to 1.3.0
- [x] 3.2 Update `skills/figma-pixel-verify/reference.md` Verify-section template (`expected` read-only)

## 4. Hosts

- [x] 4.1 Tighten `solve-workflow` execute/verify Figma lines + `reference.md`; PATCH version
- [x] 4.2 Same intent one-liners for `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow` (PATCH versions)

## 5. Docs and validate

- [x] 5.1 Run `node scripts/gen-skill-docs.mjs`
- [x] 5.2 Run `npm run lint:skill-description`
- [x] 5.3 Run `openspec validate figma-pixel-living-artifact`
