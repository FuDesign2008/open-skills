# merge-squash-prompt Tasks

## 1. Skill contract (merge-discipline)

- [x] 1.1 Edit `skills/merge-discipline/SKILL.md` Part D: insert "Step 0 — Squash decision" (commit listing commands, quality decision table, mandatory ask with recommendation, user-override rule, platform-neutral execution mapping into the existing merge commands); renumber existing steps 1–4 intact below it
- [x] 1.2 Bump `skills/merge-discipline/SKILL.md` version 1.5.0 → 1.6.0; extend `description` with a short squash-decision mention (single-line quoted, ≤1024 chars, Chinese triggers preserved)
- [x] 1.3 Add one checklist item to `skills/merge-discipline/reference.md`「Pre-merge checklist」Part D section (squash decision asked + confirmed before merge command)

## 2. Repo guidance harmonization

- [x] 2.1 Reword `AGENTS.md` Git 工作流「合并 PR 时」entry: default remains merge-commit; squash permitted for trivial-accumulation MRs via merge-discipline Part D squash decision (point to it as decision owner)

## 3. Index & gates

- [x] 3.1 Regenerate `docs/generated/skills-index.md` (`node scripts/gen-skill-docs.mjs`) and confirm zero unexpected diff beyond the merge-discipline row
- [x] 3.2 Run `npm run lint:skill-description` (0 errors) and `node scripts/lint-skill-deidentification.mjs --staged` (no new identifiers)
- [x] 3.3 Run `npm test` (scripts test suite passes)

## 4. OpenSpec validation

- [x] 4.1 `openspec validate merge-squash-prompt` passes; cross-check delta-spec scenarios against implemented SKILL.md content one by one
