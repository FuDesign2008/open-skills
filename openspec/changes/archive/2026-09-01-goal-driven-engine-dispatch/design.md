# Design: goal-driven engine dispatch

## Context

Two execution shapes exist in-repo: the goal-harness loop (`goal-driven-workflow` — run toward a verifiable end state until met/budget) and stage-gated PDCA (`solve-workflow` / `opsx-solve-workflow` — eight stages with per-exit artifacts and verdicts). The queue currently knows only the loop. The counterpart skill provides a bounded adversarial seat but is wired only into goal-driven checkpoints. Confirmed user goal: queue tasks dispatchable to either shape, AI-AI interactive, unattended.

## Goals / Non-Goals

**Goals:** engine selection per card (exact skill-name vocabulary); unattended PDCA children get counterpart-occupied exits; bare auto escape at design-approval upgraded to bounded pre-authorization; opt-out byte-identical.

**Non-Goals:** second-order dispatch inside `goal-driven-workflow` (single-run users pick solve/opsx directly — routing note only); new mode type (composes existing auto × counterpart); touching `workflow-mode-lifecycle`; changing any queue contract (caps/isolation/record apply to all engines).

## Decisions

1. **Engine field values are exact skill names** (`goal-driven-workflow | solve-workflow | opsx-solve-workflow`) — an earlier draft used the capability name `goal-run`, which mixed vocabularies; exact names match the repo's cross-skill-reference convention and the user-flagged ambiguity.
2. **Dispatch at the batch layer only** — that is where child delegation already lives; the engine stays fixed per card from freeze time (mid-run engine swaps would falsify the frozen approval for no benefit).
3. **B composes, not adds modes**: unattended PDCA child = auto mode (existing) + `counterpart: on` (existing opt-in) + exit-occupancy rule (the only new rule, single-sourced in `ai-counterpart-discipline`). No changes to `workflow-mode-lifecycle`.
4. **Bounded pre-authorization beats the bare auto escape**: solve's auto mode currently escapes `design-approval-gate` with 留痕 only; a counterpart-occupied stage-4 exit converts that into a charter-bounded approval with ledger entry — strictly stronger, so the upgrade is additive, not a gate weakening.
5. **opsx environment gate reuses the traceability detection pattern** (`openspec/` dir + usable CLI) — an opsx card in a project without openspec parks at consumption-entry as `conflict pending confirmation` instead of running degraded.
6. **Cost bound**: a PDCA child has up to 7 exit checkpoints (more than the goal-run default 5); each invocation is lightweight (charter + that stage's artifact only) and counts against the card budget — same R4 mitigation as before.

## Risks / Trade-offs

- [Exit-storm cost on solve children] → per-stage artifact-only inputs; budget counting; card may narrow the checkpoint set at freeze.
- [Counterpart approves a bad plan at stage 4] → bounded pre-authorization + ledger overturn + human outcome acceptance remain; strictly stronger than today's bare auto escape.
- [opsx child in non-openspec project] → environment gate parks the card; never silently degrades to plain solve.
- [Vocabulary drift (`goal-run` vs skill names)] → field values fixed to exact skill names; grep-verifiable.

## Migration Plan

Default engine unchanged — existing cards (no `Engine` field) behave identically. Rollback = revert.

## Open Questions

None.
