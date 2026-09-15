## 1. Evals first (test-first)

- [x] 1.1 Add `figma-pixel-implement` eval: no solid fill when the node has no readable fill (screenshot color from parent does not count)
- [x] 1.2 Add `figma-pixel-implement` eval: outer instance exports as one local file; odd wrapper size (e.g. 18×22) is kept, not a generic 16/24 shell
- [x] 1.3 Add `figma-pixel-implement` eval: readable Figma text variable is the token mapping; missing name is `raw-only` (no invented semantic alias)
- [x] 1.4 Add `figma-pixel-implement` eval: readable annotation is inventoried; no Hover variant still does not invent colors; conflicting note does not change `expected`
- [x] 1.5 Add `figma-pixel-implement` eval: living artifact includes a required Assets subsection (node, local path, format) before implement is complete
- [x] 1.6 Add `figma-pixel-verify` eval: invented solid fill vs Spec transparent/`none`, and stacked leaf fragments vs one Assets export, are not PASS; `expected` stays unchanged

## 2. Implement skill

- [x] 2.1 Update `skills/figma-pixel-implement/SKILL.md` with short affirmative rules for fill ownership, whole-instance export, instance geometry, text-color provenance, annotation inventory, stacking/SVG aspect, and required Assets subsection; bump to 1.4.0; description ≤1024 with Chinese triggers
- [x] 2.2 Update `skills/figma-pixel-implement/reference.md` living-artifact template (Assets subsection, fill/`raw-only` examples) and asset whitelist for outer-node one-file export

## 3. Verify skill

- [x] 3.1 Update `skills/figma-pixel-verify/SKILL.md` FAIL/DRIFT reasons for invented fill, fragment-cut, generic shell, invented text alias, remote graphic; bump to 1.4.0
- [x] 3.2 Update `skills/figma-pixel-verify/reference.md` report notes for those verdicts; `expected` remains read-only

## 4. Docs and validate

- [x] 4.1 Run `node scripts/gen-skill-docs.mjs`
- [x] 4.2 Run `npm run lint:skill-description`
- [x] 4.3 Run `node scripts/lint-skill-deidentification.mjs --staged` after staging skill files (or equivalent scoped scan)
- [x] 4.4 Run `openspec validate figma-pixel-absorb-implement-pitfalls`
