## 1. New shared skill (S1)

- [x] 1.1 Create `skills/completion-evidence-discipline/SKILL.md` (English body, Chinese triggers, `user-invocable: false`)
- [x] 1.2 Add `openspec` delta already present; ensure AGENTS/index regen after skill add

## 2. Enhance clarifying (M1)

- [x] 2.1 Update `skills/clarifying-question-discipline/SKILL.md` with recommended-answer + fact-vs-decision rules
- [x] 2.2 Sync main-facing pointers if reference exists

## 3. Enhance review orchestration (M2)

- [x] 3.1 Update `skills/pdca-review-orchestration/SKILL.md` with Standards ∥ Spec dual-axis + no cross-axis merge rank
- [x] 3.2 Point verification honesty at `completion-evidence-discipline`

## 4. Enhance analysis-core (M3)

- [x] 4.1 Update `skills/analysis-core/SKILL.md` with red-capable loop gate before hypotheses

## 5. Host thin refs

- [x] 5.1 Wire `completion-evidence-discipline` into solve-workflow / opsx-solve-workflow dependencies + stage-7 one-liner
- [x] 5.2 Wire jira-fix-workflow / opsx-jira-fix-workflow similarly if they own verification stages
- [x] 5.3 Confirm clarifying / analysis / pdca hosts already depend on enhanced skills (no duplicate prose)

## 6. Verify

- [x] 6.1 `npm run lint:skill-description` + `node scripts/gen-skill-docs.mjs`
- [x] 6.2 `openspec validate strengthen-skills-from-superpowers`
- [x] 6.3 Grep: no new skill named `verification-before-completion` / `grilling` / `diagnosing-bugs` as directory
- [x] 6.4 Pause for user archive / PR confirmation
