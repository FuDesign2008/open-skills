# Tasks: elevate-architecture-review-weight

## 1. code-design-review

- [x] 1.1 Update Why / How / Layer B default depth in `skills/code-design-review/SKILL.md` (AI-cheap-implementation premise; Layer B default for non-trivial changes)
- [x] 1.2 Rewrite Blocking / Non-blocking summaries: remove near-term-only architecture deferral; add superior-feasible-architecture blocking rule + Prudent-Deliberate escape
- [x] 1.3 Sync full criteria in `skills/code-design-review/reference.md`; bump version minor

## 2. solution-review

- [x] 2.1 Update cost-vs-value dimension text and Blocking / Non-blocking in `skills/solution-review/SKILL.md`
- [x] 2.2 Sync `skills/solution-review/reference.md` if it duplicates the old elegance deferral; bump version minor

## 3. Workflow thin sync

- [x] 3.1 `solve-workflow` / `opsx-solve-workflow`: review stage points at updated skills; remove/adjust any near-term architecture deferral prose
- [x] 3.2 `jira-fix-workflow` / `opsx-jira-fix-workflow`: same thin sync
- [x] 3.3 Regenerate `docs/generated/skills-index.md`

## 4. Verify

- [x] 4.1 `openspec validate elevate-architecture-review-weight`
- [x] 4.2 Grep for residual「near-term maintainability」/「superior architecture」deferral phrasing outside intentional debt escape
