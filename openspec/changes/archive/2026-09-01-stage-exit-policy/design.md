# Design: stage-exit policy

## Context

The incident doc root-causes the leak to defaults and contract gaps, not mechanism: five tickets bought the WHAT, never the HOW; mode defaulted from one trigger word; the counterpart knob defaulted off with a wrong consequence description; one factual answer was unverified; nothing told the child how to treat its exits. Verified symmetric for both PDCA engines.

## Goals / Non-Goals

**Goals:** one informed choice (interaction-budget ticket) covering the whole run's question handling; one contract field (`Stage-exit policy`) propagated to all three engines; falsified factual answers stopped at the gate; interaction count predictable before analysis (forecast); consequence text trustworthy.

**Non-Goals:** changing the counterpart charter/protocol (worked flawlessly); removing trigger-word mode propagation for card-less flows (legacy default preserved); auto-starting runs; 4.6-style start-time disambiguation prompt (subsumed by the first ticket).

## Decisions

1. **Single knob replaces the pair.** The incident's root ③ was a two-knob miscombination (manual mode + counterpart off + wrong description). `Stage-exit policy` encodes the three legal combinations directly; `Counterpart: on` legacy lines map to `counterpart` at read time — no dual-field period.
2. **Ticket order: interaction budget is the fixed first ticket** — before scope. It is the cheapest insurance and shapes every later question's audience.
3. **Policy overrides trigger words; absent policy = legacy rule.** Zero-regression for existing cards: no field → trigger-word propagation exactly as today; field present → it wins. This is the precise wording of "identical to today".
4. **Factual/preference marking rides the existing freeze-time impact re-review** (no new review round); verification lives at the consumption-entry check where the card is already re-validated — the incident's baseline falsification would have been caught by one `git rev-list --count`.
5. **Forecast lives in the PDCA hosts** (they own their exit lists), wired via the ai-counterpart spec's PDCA-exits requirement — the single-source pattern used for the exit-seat rules themselves.
6. **Consequence-derivation discipline lands in `intake-interview-discipline`** (SoT for Decisions-I-made) as a writing constraint with a walkthrough example, not a new artifact.

## Risks / Trade-offs

- [Factual/preference misclassification] → marking happens in the same freeze-time re-review as impact tiers; unmarked entries default to factual (verified — cheap, safe direction).
- [Policy value ignored by a child] → each engine's wiring requirement names the field; contract greps gate the terminology; legacy fallback keeps behavior at today's level at worst.
- [Forecast table goes stale as workflows evolve] → it is generated from the host's own current exit list at child start, not a maintained copy.

## Migration Plan

Cards without `Stage-exit policy` behave identically to pre-policy versions. Rollback = revert.

## Open Questions

None.
