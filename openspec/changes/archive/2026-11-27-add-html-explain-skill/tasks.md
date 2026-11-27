## 1. OpenSpec change

- [x] 1.1 Add `.openspec.yaml`, `proposal.md`, `design.md`, `specs/html-explain/spec.md`
- [x] 1.2 Keep tasks checklist aligned with implementation steps

## 2. Skill package

- [x] 2.1 Add `skills/html-explain/SKILL.md` (English body, single-line description ≤1024, Chinese triggers, dependency on `system-browser-open-discipline` only)
- [x] 2.2 Add `skills/html-explain/reference.md` (five-section outline, escalation table, example.com MR URL)
- [x] 2.3 Add `skills/html-explain/assets/page-shell.html` (minimal light shell)
- [x] 2.4 Add `skills/html-explain/evals/evals.json` (≥2 positive, ≥2 negative)

## 3. Contract and AGENTS

- [x] 3.1 Add `scripts/html-explain-contract.test.mjs`
- [x] 3.2 Add AGENTS.md table row after `explain-clearly`

## 4. Verification

- [x] 4.1 Run `node scripts/gen-skill-docs.mjs`
- [x] 4.2 Run `npm run lint:skill-description` and `npm run lint:deid`
- [x] 4.3 Run `node --test scripts/html-explain-contract.test.mjs`
- [x] 4.4 Run `openspec validate add-html-explain-skill --strict` when CLI available
