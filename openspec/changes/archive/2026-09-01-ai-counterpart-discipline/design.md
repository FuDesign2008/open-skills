# Design: ai-counterpart-discipline

## Context

Interactive-grade checking presumes an interlocutor with judgment and authority. The goal-driven series models two authority sources (present human / frozen contract + self-answer ladder); solve-workflow auto mode advances stages with the seat empty (same-context self-review). Real-case evidence shows empty seats cost rework. The idea: when the human is absent but interactive granularity is wanted, a bounded-authority adversarial AI occupies the seat. The user confirmed **bounded authority** (reserved list stays human) and asked about fusion with solve-workflow auto mode — resolved as use-layer wiring, not skill merging.

## Goals / Non-Goals

**Goals:**

- One shared skill defining how the human seat is filled in absent mode: authority charter, adversarial protocol, ledger integration, escalation.
- Wire the goal-driven hosts (opt-in) at their enumerated checkpoints.
- Compose with existing contracts (presence tiers, self-answer ladder, ledger, clean-stop tickets, frozen contract) with zero new mechanisms outside the skill itself.

**Non-Goals:**

- Merging into `workflow-mode-lifecycle` / `solve-workflow` / `intake-interview-discipline` (orthogonal concerns: control flow vs who checks; interview methodology vs seat-casting).
- solve-workflow / opsx auto-mode exit wiring (future change per host).
- Continuous counterpart presence (checkpoints only — between checkpoints the §B ladder governs).
- Any authority for the reserved list.

## Decisions

1. **Standalone skill, `user-invocable: false`, referenced by host frontmatter dependencies** — the repo's SoT pattern; merging anywhere would couple unrelated change reasons (tier evolution vs charter evolution vs protocol tuning).
2. **Authority derives from delegation, not from the model.** The charter's bounded list is an extension of the initial human delegation; nothing the counterpart "approves" exceeds what the human already authorized at trigger + freeze time. This is why bounded approval is not an escape from `design-approval-gate` — that gate governs *new* high-impact scope, which is exactly the reserved list.
3. **Anti-sycophancy by construction, not instruction-only**: fresh context per checkpoint; artifact-only inputs (the executor's reasoning transcript is never shown, preventing anchor effects — same blindness principle as `multi-agent-debate`'s role separation); verdicts require evidence tags, making rubber-stamps visibly invalid. An independent model tier MAY be used where the host platform supports it (intent-level, platform-agnostic).
4. **Ledger as the accountability substrate**: counterpart decisions ride the existing acceptance ledger marked `counterpart-made` — overturn rights, acceptance surfacing, and next-run feedback all reuse §C unchanged.
5. **Checkpoints are enumerated at opt-in** (default set: intake Q&A, approval event, high-impact escalation touchpoint, completion-report check, conflict re-adjudication) — bounding both cost (R4) and authority surface (R1).
6. **Escalation = ticket + park** on any reserved-list hit or unresolved high-impact doubt — reuses clean-stop semantics; the counterpart never improvises and never approves into the reserved list.
7. **Stacked on PR #295** (depends on its presence tiers); PR base = the #295 branch, auto-retargeted on its merge.

## Risks / Trade-offs

- [Authority laundering — counterpart approves beyond delegation] → charter derivation rule + reserved hard boundary + ticket-on-hit + ledger overturn + acceptance spot-check.
- [Sycophancy / same-source rubber-stamp] → blindness (fresh context, no executor reasoning), adversarial mandate, evidence-tag requirement; evals include an induce-approval test case.
- [Correlated blind spots (both agents miss the same flaw)] → mitigated, not eliminated — the human acceptance layer and outcome-type reservations remain the backstop; documented as a known limit.
- [Cost blow-up] → enumerated checkpoints + budget counting.
- [Composition-chain depth (4 hops)] → protocol body is self-contained; hosts keep one-line thin pointers.

## Migration Plan

Markdown + git. Opt-in default off — no behavior change for any existing run. Rollback = revert.

## Open Questions

None.
