## 1. Skill directory renames

- [x] 1.1 `git mv skills/ensure-tests skills/test-suite-ensure` and set frontmatter `name` / title / version bump to `test-suite-ensure`
- [x] 1.2 `git mv skills/openspec-workspace-gates skills/opsx-workspace-gate` and set frontmatter `name` / title / version bump to `opsx-workspace-gate`
- [x] 1.3 `git mv skills/pdca-review-orchestration skills/staged-review-flow` and set frontmatter `name` / title / version bump to `staged-review-flow`

## 2. Reference sweep

- [x] 2.1 Replace all live references from `ensure-tests` → `test-suite-ensure` in `skills/`, `commands/`, `AGENTS.md`, `docs/` (except generated index until regen)
- [x] 2.2 Replace `openspec-workspace-gates` → `opsx-workspace-gate` in the same trees
- [x] 2.3 Replace `pdca-review-orchestration` → `staged-review-flow` in the same trees
- [x] 2.4 Update `AGENTS.md` naming section with the skill-naming taxonomy summary and User-invoked / Model-invoked table rows for the three renames

## 3. OpenSpec main specs

- [x] 3.1 Apply delta intent: `git mv` `openspec/specs/ensure-tests` → `openspec/specs/test-suite-ensure` and rewrite purpose/requirements to the new skill id
- [x] 3.2 `git mv` `openspec/specs/openspec-workspace-gates` → `openspec/specs/opsx-workspace-gate` and rewrite to new skill id
- [x] 3.3 `git mv` `openspec/specs/pdca-review-orchestration` → `openspec/specs/staged-review-flow` and rewrite to new skill id
- [x] 3.4 Add `openspec/specs/skill-naming/spec.md` from the change delta (ADDED requirements)
- [x] 3.5 Update `openspec/specs/workflow-contract-sync/spec.md` for the renamed skill ids per delta

## 4. Docs and verification prep

- [x] 4.1 Run `node scripts/gen-skill-docs.mjs` and stage `docs/generated/skills-index.md`
- [x] 4.2 Confirm `rg` zero hits for old ids in `skills/`, `commands/`, `AGENTS.md`, `openspec/specs/` (allow hits only inside `openspec/changes/rename-skills-semantic/` and archive if present)
- [x] 4.3 Run `openspec validate rename-skills-semantic` and project docs verify (`node scripts/gen-skill-docs.mjs` + diff clean on index after regen)
