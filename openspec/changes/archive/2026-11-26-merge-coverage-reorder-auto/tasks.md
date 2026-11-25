## 1. Specs

- [x] 1.1 Add change `openspec/changes/merge-coverage-reorder-auto` with proposal, design, tasks, and delta specs
- [x] 1.2 Apply order, tip 留痕, tip check, and `coverage-gate: auto` into `openspec/specs/merge-discipline/spec.md`
- [x] 1.3 Apply enum, should-run, and checklist wording into `openspec/specs/workflow-contract-sync/spec.md`
- [x] 1.4 Replace feature-branch-closeout merge order with A→B→R→C→D

## 2. Skill

- [x] 2.1 Update `skills/merge-discipline/SKILL.md` to 1.11.0: order, four-cell, satisfaction 留痕, fail-closed tip check
- [x] 2.2 Update `reference.md` checklist, sheet execute line, and Coverage auto four-cell
- [x] 2.3 Update evals to A→B→R→C→D and add auto / tip dry-runs
- [x] 2.4 Point hosts and `AGENTS.md` at the new order and enum; keep this repo's `coverage-gate: never`

## 3. Check

- [x] 3.1 `node --test scripts/merge-discipline-reorder-auto-contract.test.mjs`
- [x] 3.2 `node scripts/gen-skill-docs.mjs` and `npm run lint:skill-description`
- [x] 3.3 `openspec validate merge-coverage-reorder-auto --strict` passes. `openspec validate --strict --all` still fails on pre-existing purpose/length warnings in other specs.
