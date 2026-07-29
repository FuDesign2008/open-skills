## 1. New skills

- [x] 1.1 Create `skills/domain-language-discipline/SKILL.md` (v1.0.0, English body, Chinese triggers, collision-free name)
- [x] 1.2 Create `skills/test-first-discipline/SKILL.md` (v1.0.0, Iron Law + exceptions + ensure-tests boundary, Chinese triggers)

## 2. ensure-tests boundary

- [x] 2.1 Add coexistence section to `skills/ensure-tests/SKILL.md` (post-hoc ≠ test-first); bump patch version

## 3. Host thin wiring

- [x] 3.1 `solve-workflow`: deps + thin pointers (domain + test-first)
- [x] 3.2 `opsx-solve-workflow`: deps + thin pointers
- [x] 3.3 `jira-fix-workflow`: deps + thin pointers
- [x] 3.4 `opsx-jira-fix-workflow`: deps + thin pointers

## 4. Docs / index

- [x] 4.1 Update `AGENTS.md` skill/dependency table rows
- [x] 4.2 Optional: `learn-and-improve` carrier row for domain glossary / CONTEXT.md
- [x] 4.3 Regenerate `docs/generated/skills-index.md`; run `npm run lint:skill-description`
- [x] 4.4 Collision grep: no skill dirs named `tdd`, `test-driven-development`, `domain-modeling`

## 5. Verify

- [x] 5.1 `openspec validate strengthen-skills-wave2`
- [x] 5.2 Stage-7 verification report (executed vs pending)
- [x] 5.3 Pause for user archive / PR confirmation
