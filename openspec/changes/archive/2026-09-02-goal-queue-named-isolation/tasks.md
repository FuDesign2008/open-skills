## 1. Skill contract

- [x] 1.1 Add Queue identity (auto-mint per conversation, never ask to pick, legacy `default` for scheduled only, no pointer file) to `skills/goal-driven-batch/SKILL.md`; bump version
- [x] 1.2 Point layout, re-scan, progress, and acceptance paths at `.goal-driven/queues/<queue-id>/`
- [x] 1.3 Update `reference.md` card and progress paths; keep gitignore hint at `.goal-driven/`

## 2. Evals and index

- [x] 2.1 Add evals for two-session isolation, unbound run auto-mints, and new conversation ignoring sibling leftovers
- [x] 2.2 Run `npm run lint:skill-description` and `node scripts/gen-skill-docs.mjs`

## 3. Thin shells

- [x] 3.1 Confirm `jira-fix-batch` / `opsx-jira-fix-batch` stay thin (inherit bind via `goal-driven-batch`; no second layout)
