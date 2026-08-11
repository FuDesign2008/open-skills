## 1. Skill scaffold

- [x] 1.1 Create `skills/brainstorm-workflow/SKILL.md` (English body, Chinese triggers, `user-invocable: true`, frontmatter deps `brainstorming` + `solve-workflow`)
- [x] 1.2 Create `skills/brainstorm-workflow/reference.md` (install hints, handoff input template, stage output shapes)
- [x] 1.3 Add `commands/brainstorm.md` invoking `brainstorm-workflow`

## 2. Catalog registration

- [x] 2.1 Add `brainstorm-workflow` row to `AGENTS.md` skill dependency table (note external `brainstorming`)
- [x] 2.2 Add `brainstorm-workflow` to Skill 调用分层「编排入口」examples in `AGENTS.md`
- [x] 2.3 Run `node scripts/gen-skill-docs.mjs` and ensure `docs/generated/skills-index.md` includes the skill

## 3. Validation

- [x] 3.1 Run `npm run lint:skill-description` (or script equivalent) for the new description
- [x] 3.2 Run `openspec validate add-brainstorm-workflow` (or `--changes`) and fix any spec format issues
- [x] 3.3 Grep: no `skills/brainstorming/` vendored dir; host states writing-plans override + bug redirect
