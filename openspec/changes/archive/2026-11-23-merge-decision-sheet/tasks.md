## 1. Spec artifacts

- [x] 1.1 Write `proposal.md`
- [x] 1.2 Write delta spec `specs/merge-discipline/spec.md` (ADDED sheet + Part B; MODIFIED trigger, coverage, Part R preference, Part D squash, Part D sync)
- [x] 1.3 Write delta spec `specs/workflow-contract-sync/spec.md` (MODIFIED pre-merge checklist)
- [x] 1.4 Write `design.md` with iron-law-9 reverse-lookup record

## 2. Skill implementation

- [x] 2.1 `skills/merge-discipline/SKILL.md`: bump version, add Merge decision sheet section (preflight → one batch → execute, carve-out, mid-flight list), adjust Part B/C/R/D ask wording, mode lifecycle, integration guide
- [x] 2.2 `skills/merge-discipline/reference.md`: sheet template, preflight checklist, pre-merge checklist wording
- [x] 2.3 `skills/merge-discipline/evals/evals.json`: add evals for batch sheet, empty sheet, mid-flight pause after sheet
- [x] 2.4 Regenerate `docs/generated/skills-index.md`

## 3. Verification

- [x] 3.1 `openspec validate merge-decision-sheet --strict`
- [x] 3.2 `npm run lint:skill-description`
- [x] 3.3 `node scripts/gen-skill-docs.mjs` and index diff only touches merge-discipline row
- [x] 3.4 `node scripts/lint-skill-deidentification.mjs` has no new hits from this change
- [x] 3.5 Residual grep: no stale "ask at Part X" phrasing in `skills/merge-discipline`
