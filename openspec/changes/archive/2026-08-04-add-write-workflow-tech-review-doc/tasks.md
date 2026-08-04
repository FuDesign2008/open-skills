## 1. Branch and scaffolding

- [x] 1.1 Create feature branch from latest main
- [x] 1.2 Create `skills/tech-review-doc/` with `SKILL.md` + `template.md` (from external design-to-tech-review, adapted)
- [x] 1.3 Create `skills/write-workflow/` with `SKILL.md` (+ `reference.md` only if output templates exceed inline budget)

## 2. tech-review-doc skill

- [x] 2.1 English body; Chinese+English triggers; name `tech-review-doc`; `user-invocable: true`
- [x] 2.2 Strong dependency on `clarifying-question-discipline`; §1 approval hard gate; no `brainstorming` dependency
- [x] 2.3 Preserve five-step flow, Mermaid/audience rules, conditional §3/§6, output naming; ship Chinese `template.md`
- [x] 2.4 Run `npm run lint:skill-description` for this skill

## 3. write-workflow skill

- [x] 3.1 Thin host: prerequisite check, route table (default → tech-review-doc), extension slot note for future writers
- [x] 3.2 Dependencies: `clarifying-question-discipline`, `tech-review-doc`; Chinese+English triggers; Do NOT use boundaries vs solve/article-writer
- [x] 3.3 Run `npm run lint:skill-description` for this skill

## 4. Command and inventory

- [x] 4.1 Add `commands/write.md` (`disable-model-invocation: true`)
- [x] 4.2 Update `AGENTS.md` skill table (write-workflow + tech-review-doc)
- [x] 4.3 Regenerate `docs/generated/skills-index.md` via `node scripts/gen-skill-docs.mjs`

## 5. Verify

- [x] 5.1 `openspec validate add-write-workflow-tech-review-doc --strict` (or project-equivalent)
- [x] 5.2 Grep: no `brainstorming` strong-dep in new skills; no edits to `solve-workflow`
- [x] 5.3 Archive change after verification passes
