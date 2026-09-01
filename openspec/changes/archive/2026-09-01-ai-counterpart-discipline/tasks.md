# Tasks: ai-counterpart-discipline

## 1. New skill

- [x] - [x] 1.1 Create `skills/ai-counterpart-discipline/SKILL.md` (charter / adversarial protocol / ledger integration / checkpoints / integration guide; `user-invocable: false`; dependency: intake-interview-discipline) + `reference.md` (charter template, counterpart prompt template, ledger marking)

## 2. Host wiring

- [x] - [x] 2.1 `skills/intake-interview-discipline/SKILL.md` (0.3.0): §A third answer-source line + §B touchpoint note (thin pointer)
- [x] - [x] 2.2 `skills/goal-driven-workflow/SKILL.md` (0.5.0) + reference.md: frontmatter dependency + `counterpart: on` opt-in + thin checkpoint pointers (stage 1 intake / contract approval / stage 5 report check) + Template 1 field
- [x] - [x] 2.3 `skills/goal-driven-batch/SKILL.md` (0.6.0) + reference.md: frontmatter dependency + counterpart opt-in + approval-event / record-step / conflict re-adjudication pointers + Task Card `Counterpart` field + evals +2

## 3. Registry & verification

- [x] - [x] 3.1 `AGENTS.md` skill registry: add ai-counterpart-discipline row; add dep to goal-driven-workflow / goal-driven-batch rows
- [x] - [x] 3.2 Regenerate index; lint --staged; openspec validate; prerequisite-check greps (both hosts declare dep + abort notice); contract greps (counterpart: on / counterpart-made / reserved terms consistent)
- [x] - [x] 3.3 Archive the change (sync 4 specs) after verification passes; commit + push + stacked PR (base = feat/goal-driven-granularity-alignment)
