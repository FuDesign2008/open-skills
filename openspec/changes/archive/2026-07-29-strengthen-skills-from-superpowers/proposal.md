## Why

open-skills already has strong host workflows (solve/opsx/jira) and shared disciplines, but three-way research against Superpowers and Matt Pocock skills shows gaps in (1) clarifying questions without a recommended answer, (2) completion claims without fresh command evidence, (3) review axes that can be merged into one score, and (4) analysis that guesses before a red-capable reproduction loop exists. Closing these with thin shared contracts improves agent reliability without re-depending on those external skill repos.

## What Changes

- Enhance `clarifying-question-discipline` (M1): each user question MUST include a recommended answer / option preference; distinguish fact-self-check vs decision-ask-human.
- Add new shared skill `completion-evidence-discipline` (S1) — **not** named `verification-before-completion` (Superpowers collision). Iron Law: no completion/pass claims without fresh evidence from commands run in the current turn.
- Enhance `pdca-review-orchestration` (M2): Standards ∥ Spec dual-axis review; parallel OK; MUST NOT merge ranks across axes.
- Enhance `analysis-core` (M3): before hypothesis generation, require a red-capable reproduction loop (a failing command already run); MUST NOT enter guess-hypothesis without it.
- Host workflows (solve / opsx-solve / jira-fix / opsx-jira-fix as applicable) get thin pointers / dependencies only — no full Superpowers/Matt pipelines.
- **Naming constraint**: any new skill directory/frontmatter `name` MUST NOT collide with skill names in Superpowers or mattpocock/skills.

## Capabilities

### New Capabilities

- `completion-evidence-discipline`: shared gate forbidding unverified completion claims; English body + Chinese triggers in description.

### Modified Capabilities

- `clarifying-question-discipline`: recommended-answer + fact-vs-decision questioning contract.
- `pdca-review-orchestration`: dual-axis Standards ∥ Spec review rules.
- `analysis-core`: red-capable loop gate before hypotheses.

## Impact

- New: `skills/completion-evidence-discipline/SKILL.md`
- Edit: `clarifying-question-discipline`, `pdca-review-orchestration`, `analysis-core`, and thin host references/dependencies
- Docs index regen; optional light eval later
- Does **not** reintroduce Superpowers as a dependency; does **not** copy Matt skill names (`grilling`, `tdd`, `code-review`, `diagnosing-bugs`, etc.)
