## 1. Skill authoring

- [x] 1.1 Create `skills/goal-queue-workflow/SKILL.md` with frontmatter (name, version 0.1.0, `user-invocable: true`, single-line double-quoted English description ≤1024 chars containing Chinese triggers 「跑队列」「goal 队列」「无人值守队列」with English equivalents and a Do-not-use boundary), strong dependencies `goal-driven-workflow` + `design-approval-gate`, prerequisite-check section
- [x] 1.2 Write SKILL.md body in English: intake/enqueue stage (card format per design §3 + approval capture), consumption stage (serial loop, relationship pass, isolation directive, mode propagation, caps), acceptance-package stage; thin-reference `goal-driven-workflow` stages by number+name mapping and `design-approval-gate` escape semantics; no methodology restatement
- [x] 1.3 Extract output templates (task card, progress doc, batch summary) into `skills/goal-queue-workflow/reference.md`; keep SKILL.md as summary + pointer; every support file is referenced from SKILL.md

## 2. Repo integration

- [x] 2.1 Add one row for `goal-queue-workflow` to the AGENTS.md Skill 清单 table (category 工作流, dependencies: goal-driven-workflow、design-approval-gate)
- [x] 2.2 Regenerate `docs/generated/skills-index.md` via `node scripts/gen-skill-docs.mjs` and confirm it is staged in git

## 3. Verification

- [x] 3.1 Run `openspec validate goal-queue-workflow` (pass), `npm run lint:skill-description` on the new skill, de-identification scan scoped to new files
- [x] 3.2 Thin-reference residue check: grep new SKILL.md for engine-stage methodology titles (e.g. acceptance-tier / four-part condition / sub-agent headings) — must be zero restatements
- [x] 3.3 Cross-check each delta-spec requirement against implemented SKILL.md sections one by one; run repo verification commands (`node --check scripts/gen-skill-docs.mjs`, index diff clean)
