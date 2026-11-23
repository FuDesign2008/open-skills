## 1. Skill and repo wiring

- [x] 1.1 Add `skills/macos-permission-align/SKILL.md` (`user-invocable: true`, English body, single-line description)
- [x] 1.2 Add `skills/macos-permission-align/reference.md` with pane links, logging, verification, rollback
- [x] 1.3 Add `skills/macos-permission-align/evals/evals.json`
- [x] 1.4 Add `macos-permission-align` row to the skill table in `AGENTS.md`
- [x] 1.5 Regenerate `docs/generated/skills-index.md`
- [x] 1.6 Run `npm run lint:skill-description` and `node scripts/lint-skill-deidentification.mjs` on new skill paths

## 2. OpenSpec change artifacts

- [x] 2.1 Write `openspec/changes/add-macos-permission-align/proposal.md`
- [x] 2.2 Write delta `openspec/changes/add-macos-permission-align/specs/macos-permission-align/spec.md`
- [x] 2.3 Write `openspec/changes/add-macos-permission-align/design.md`
- [x] 2.4 Write `openspec/changes/add-macos-permission-align/tasks.md`

## 3. Validate, main spec, archive

- [x] 3.1 Run `openspec validate add-macos-permission-align --strict` and fix until pass
- [x] 3.2 Create `openspec/specs/macos-permission-align/spec.md` (Purpose + Requirements, main-spec form)
- [x] 3.3 Run `openspec archive add-macos-permission-align --yes` (or supported equivalent)
- [x] 3.4 Run `openspec validate macos-permission-align --type spec --strict` (repo-wide `--all` has pre-existing strict warnings)