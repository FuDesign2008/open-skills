## Context

`goal-driven-queue` ends every batch with an acceptance package (`进度文档与验收包`). The package presents per-task results and a needs-your-judgment rollup, then stops — but the card lifecycle records engine completion (`done`) as the terminal record, so "engine finished" is silently read as "accepted". No per-card human verification is required or recorded.

## Goals / Non-Goals

- Goal: make a human per-card verification gate mandatory after a batch run.
- Goal: give the human one consolidated document to verify from (no hopping across N engine reports).
- Goal: record the verdict durably and gate the batch's "accepted" presentation on it.
- Goal: keep the verdict seat human-only (compatible with `ai-proxy-discipline` reserved list — outcome-type acceptance).
- Non-goal: changing the engine's single-run Stage 5 acceptance (`goal-driven-workflow`).
- Non-goal: inserting a human during the run — the batch still runs unattended to completion (option A).
- Non-goal: changing merge authority (stays human).

## Decisions

- **D1 — Verification state lives in the Acceptance Summary, not the Status vocabulary.** `done` keeps meaning "engine completed"; verification is `Verification: awaiting | verified | returned — <reason>` recorded in the card's existing Acceptance Summary plus a `Verification` column in the progress document. Rationale: no Status-vocabulary churn, legacy cards (no state) behave unchanged, and the card's existing field enumeration is untouched.
- **D2 — The dedicated document is the verification surface.** `verification.md` consolidates per-card info (goal / engine / result / branch / report / layered acceptance / engine checklist / side effects / ledger / conflict pre-run) with one verdict line per executed card. Dispatcher is the sole writer.
- **D3 — Closure gate.** A batch MUST NOT be presented as accepted until every executed card carries a human verdict; the batch summary shows `Verified: N / Awaiting: M / Returned: K`. Batches stay consumable — awaiting cards do not block later runs.
- **D4 — Human-only verdict seat.** `ai-proxy` may run the record-step report check but MUST NOT fill, infer, or pre-fill a per-card verdict; absent human verdicts stay `awaiting`. The queue contract states this explicitly and thin-references `ai-proxy-discipline`.
- **D5 — `returned` routes back.** Findings become new/revised cards per the existing acceptance-findings loop; no merge, revert, or silent drop of the branch.
- **D6 — Non-executed outcomes** (`failed` / `skipped (covered)` / `waiting dependency` / `conflict pending confirmation` / parked / leftover `pending`) go to a "needs your decision" section and do not occupy a per-card verdict slot.

## Risks / Trade-offs

- Human does not return → batch stays `awaiting`. Mitigation: batch summary + next-run entry surface awaiting items; later runs are not blocked.
- Document drifts from engine reports → Mitigation: dispatcher is the sole writer; generated at assembly; regenerated when statuses change.
- `done` vs verification ambiguity → Mitigation: D1 keeps both explicit.
- Extra discipline could slow acceptance → Trade-off accepted: the user explicitly requires per-card human verification (option A chose post-run, preserving unattended execution).

## Migration

Legacy batches/cards (no verification state recorded) require no retro-active verdict; behavior is unchanged.
