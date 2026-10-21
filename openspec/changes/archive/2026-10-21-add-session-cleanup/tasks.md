## 1. Failing contract test

- [x] 1.1 Add `scripts/session-cleanup-contract.test.mjs` asserting the skill id, Chinese triggers, action order, git-ref check, self-match rule, and handoffs to `merge-discipline`, `feature-branch-closeout`, and `learn-and-improve`
- [x] 1.2 Run that test and observe it fail because `skills/session-cleanup/SKILL.md` is absent

## 2. Skill

- [x] 2.1 Add `skills/session-cleanup/SKILL.md` (`user-invocable: true`, English body, single-line description) and `reference.md` implementing inventory, classify, preserve, stop, close unused pages, delete, and report
- [x] 2.2 Add `skills/session-cleanup/evals/evals.json` with prompt cases for the same behaviors
- [x] 2.3 Re-run the contract test and observe it pass

## 3. Repo wiring and verification

- [x] 3.1 Add a `session-cleanup` row to the skill table in `AGENTS.md`
- [x] 3.2 Regenerate `docs/generated/skills-index.md`
- [x] 3.3 Run description lint, de-identification scan on the new files, `openspec validate add-session-cleanup --strict`, and `npm test`
