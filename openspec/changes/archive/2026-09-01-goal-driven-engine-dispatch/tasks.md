# Tasks: goal-driven engine dispatch

## 1. Single-source rules + PDCA hosts

- [x] - [x] 1.1 `skills/ai-counterpart-discipline/` (1.1.0): integration guide adds the "PDCA host exits" section (seat-filling rules, bounded pre-authorization replacing the bare auto escape, human-only reservations)
- [x] - [x] 1.2 `skills/solve-workflow/` (1.25.0): dependency += ai-counterpart-discipline + thin "Unattended counterpart exits" section after Mode Lifecycle
- [x] - [x] 1.3 `skills/opsx-solve-workflow/` (1.19.0): dependency + same thin section (after its Mode line)

## 2. Queue dispatch + routing

- [x] - [x] 2.1 `skills/goal-driven-batch/` (0.7.0): Task Card `Engine` field (exact skill names, default goal-driven-workflow) + Delegate dispatch by field (solve child input mapping, opsx environment gate parking) + consumption-entry note
- [x] - [x] 2.2 `skills/goal-driven-workflow/` (0.5.1): routing pointer — single-run tasks shaped for stage-gated PDCA route to solve/opsx directly

## 3. Registry, evals & verification

- [x] - [x] 3.1 `AGENTS.md`: append ai-counterpart-discipline to solve-workflow / opsx-solve-workflow dependency rows; evals +2 (engine dispatch to solve child; opsx env-gate parking)
- [x] - [x] 3.2 Regenerate index; lint --staged; openspec validate; contract greps (Engine vocabulary exact skill names both sides; exit-seat terms consistent; default-off zero-change wording)
- [x] - [x] 3.3 Archive; commit; push; PR (base main)
