## 1. Failing contract test

- [x] 1.1 Add `scripts/system-browser-open-discipline-contract.test.mjs` asserting skill id, `user-invocable: true`, Chinese triggers, Iron Law, Read/edit boundaries, host dependency lines, and AGENTS pointer
- [x] 1.2 Run that test and observe it fail because the skill is absent

## 2. Skill

- [x] 2.1 Add `skills/system-browser-open-discipline/SKILL.md` (English body, single-line description ≤1024) and short `reference.md` (optional env appendix)
- [x] 2.2 Add `skills/system-browser-open-discipline/evals/evals.json` with prompt cases
- [x] 2.3 Re-run the contract test and observe it pass once hosts and AGENTS are wired

## 3. Host thin-mount and AGENTS

- [x] 3.1 Add `system-browser-open-discipline` to `goal-driven-queue` and `goal-driven-workflow` frontmatter `dependencies` plus thin open pointers; bump host patch versions
- [x] 3.2 Add AGENTS.md iron-law #12 pointer, skill-table row, and user-invocable exception list entry; update dependency columns for the two hosts
- [x] 3.3 Regenerate `docs/generated/skills-index.md`

## 4. Verification

- [x] 4.1 Run contract test, `npm run lint:skill-description`, deid on new/changed skill files, `openspec validate system-browser-open-discipline --strict`
