## 1. merge-discipline Part C

- [x] 1.1 Rewrite Part C in `skills/merge-discipline/SKILL.md`: preference resolve → ask/always/never → then existing gate steps only when run; add project-preference 留痕 template; update mode-lifecycle sentence that says auto-running
- [x] 1.2 Update `skills/merge-discipline/reference.md` Part C checklist for preference + ask
- [x] 1.3 Bump `merge-discipline` frontmatter version (PATCH)

## 2. Host thin sync

- [x] 2.1 Grep and thin-fix auto-run assumptions in `opsx-solve-workflow` / `opsx-jira-fix-workflow` / `jira-fix-workflow` (pointers/red-flags only)
- [x] 2.2 Add `coverage-gate: never` to root `AGENTS.md` with one-line note

## 3. Verify

- [x] 3.1 Run `openspec validate coverage-gate-opt-in`
- [x] 3.2 Confirm delta specs match implemented Part C behavior
- [x] 3.3 Run `npm run lint:skill-description` if description strings changed
