## Context

Follow-up to `goal-queue-human-per-card-verification` (an independent pre-merge review flagged that `done`-as-evidence consumers were unsynced). `done` now means "engine completed"; acceptance is the card's `Verification` state (`awaiting | verified | returned`).

## Goals / Non-Goals

- Goal: make acceptance-grade evidence (`skipped (covered)`, dependency release) key on `verified`, not `done`.
- Goal: prevent an unverified card from mechanically suppressing the rework a `returned` verdict routes back.
- Non-goal: changing the verification gate itself (already landed), merge authority, or scheduling.

## Decisions

- **D1 — Acceptance-grade evidence requires `verified`.** Triage `skipped (covered)` and the dispatch relationship pass require the covering/source card to be `Verification: verified`.
- **D2 — `Waits-on` release requires `verified`.** A `done`-but-`awaiting` target holds the dependent in `waiting dependency`; a `returned` target (or any terminal state other than `verified`) parks the dependent as `conflict pending confirmation`.
- **D3 — Conservative direction.** Where acceptance is unresolved, the system waits or parks rather than proceeding on an unverified premise.
- **D4 — Legacy unchanged.** Cards/batches predating the verification state behave exactly as before; a legacy `done` card with no verification state is not retroactively treated as `awaiting`.

## Risks / Trade-offs

- Dependent chains now wait for human acceptance, reducing unattended throughput for coupled cards. Trade-off accepted: the gate exists because `done` is not acceptance, and building on unverified work is the failure it prevents.
- Risk: a human never verifies, stalling dependents. Mitigation: the verification state is surfaced (batch summary + `verification.md`), and a `returned` target parks dependents explicitly rather than hanging.

## Migration

Legacy cards (no `Verification` state) keep their prior semantics; no retro-active verdict is required.
