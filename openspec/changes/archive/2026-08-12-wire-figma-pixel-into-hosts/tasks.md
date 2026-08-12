## 1. Specs and docs contract

- [x] 1.1 Sync main-intent: confirm delta specs cover four hosts + reverse opt-in in `figma-pixel-fidelity`
- [x] 1.2 Note solve-workflow has no dedicated OpenSpec file; fidelity host list + skill edit covers it

## 2. Host frontmatter

- [x] 2.1 Add `figma-pixel-implement` and `figma-pixel-verify` to `skills/solve-workflow/SKILL.md` `dependencies` and strong-dependency bullets; bump version
- [x] 2.2 Same for `skills/opsx-solve-workflow/SKILL.md`
- [x] 2.3 Same for `skills/jira-fix-workflow/SKILL.md`
- [x] 2.4 Same for `skills/opsx-jira-fix-workflow/SKILL.md`

## 3. Thin stage hooks

- [x] 3.1 `solve-workflow`: Stage 6 + Stage 7 thin load conditions (Figma scope)
- [x] 3.2 `opsx-solve-workflow`: Phase 6 + Phase 7 thin load conditions
- [x] 3.3 `jira-fix-workflow`: Execute + Check stages thin load conditions
- [x] 3.4 `opsx-jira-fix-workflow`: Execute/verify stages thin load conditions

## 4. AGENTS and notices

- [x] 4.1 Update `AGENTS.md` Skill 清单 dependency columns for the four hosts
- [x] 4.2 If host `reference.md` missing-notice enumerates deps, add the two skills or point to frontmatter

## 5. Validate

- [x] 5.1 `openspec validate wire-figma-pixel-into-hosts`
- [x] 5.2 `npm run lint:skill-description` on touched hosts
- [x] 5.3 Smoke: hosts list both skills; fidelity main requirement text matches after archive sync
