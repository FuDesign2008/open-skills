# Proposal: ai-counterpart-discipline

## Why

goal-driven-* unattended runs collapse interactive-grade checking into once-confirm + self-answer: the "human seat" at intake questions, approvals, and verdicts is simply empty. solve-workflow's auto mode has the same hole at its stage exits — it removes pauses but nobody occupies the seat (same-context self-review only). The user wants absent-mode runs to keep interactive checking granularity: an independent AI plays the bounded human. Real-case evidence (`docs/goal-driven-intake-depth-analysis.md`) shows what empty seats cost — unfrozen assumptions surviving to expensive rework.

## What Changes

- **New shared skill `ai-counterpart-discipline`** (`user-invocable: false`, dependency: `intake-interview-discipline`): the single source of truth for filling the human seat when no human is present.
  - **Authority charter**: all authority derives from the initial human delegation (trigger + budget + frozen contract) plus a bounded list — intake answers from project context, approach picks among pre-approved options, quality verdicts at enumerated checkpoints (may reject and demand re-verification), card/contract approval as bounded pre-authorization, continuation of the original frozen scope. A **reserved list** stays human-only: irreversible actions, over-budget extensions, protected-branch merges, outcome-type acceptance, `design-approval-gate` high-impact gates, any scope change beyond the frozen contract — a hit produces a ticket + park, never self-approval.
  - **Adversarial protocol** (anti-sycophancy, `multi-agent-debate`-isomorphic): fresh context per checkpoint; inputs = charter + artifacts only (card / plan / report / diff — never the executor's reasoning); mandate = challenge-not-please; verdicts must be evidence-tagged (`[FACT] / [INFERENCE] / [UNRESOLVED]`) — an untagged verdict is invalid.
  - **Ledger integration**: every counterpart decision enters the existing acceptance ledger marked `counterpart-made`; the human MAY overturn any entry at acceptance (zero new mechanisms).
  - **Cost bound**: checkpoints are enumerated in the frozen contract at opt-in; each invocation counts against the run budget.
- **Third presence tier**: `intake-interview-discipline` §A gains the extension point — when a counterpart is active, present-mode methodology runs with the counterpart as answer source, all decisions ledger-marked; §B's "next human touchpoint" for high-impact escalation may be a counterpart checkpoint (reserved items excepted — still human-only).
- **Host wiring (opt-in `counterpart: on`)**: `goal-driven-workflow` (intake Q&A, contract approval, completion-report check) and `goal-driven-batch` (intake, card approval event, record-step report check, conflict re-adjudication) invoke the counterpart at their enumerated checkpoints via thin pointers.
- **Fusion boundary**: solve-workflow / opsx-solve-workflow auto-mode exit wiring is an explicit **non-goal** (future change per host — checkpoint sets differ).

## Capabilities

### New Capabilities

- `ai-counterpart`: bounded-authority AI counterpart for absent-mode interactive checkpoints — charter, adversarial protocol, ledger integration, escalation, host wiring contract.

### Modified Capabilities

- `intake-deep-interview`: 深谈入库访谈 gains the third presence tier (AI counterpart as answer source under its charter).
- `goal-run`: stage wiring gains counterpart checkpoints + opt-in semantics.
- `goal-queue`: approval event / record-step / conflict re-adjudication gain counterpart mode.

## Impact

- New `skills/ai-counterpart-discipline/` (SKILL.md + reference.md).
- `skills/intake-interview-discipline/` (0.2.0 → 0.3.0): §A tier-3 line + §B touchpoint note.
- `skills/goal-driven-workflow/` (0.4.0 → 0.5.0): frontmatter dependency + thin checkpoint wiring.
- `skills/goal-driven-batch/` (0.5.0 → 0.6.0): frontmatter dependency + approval/record/conflict wiring + evals.
- `AGENTS.md` skill registry rows; `docs/generated/skills-index.md` regenerated.
- No changes to `design-approval-gate`, `workflow-mode-lifecycle`, `multi-agent-debate`, or solve-workflow (referenced, not modified).
