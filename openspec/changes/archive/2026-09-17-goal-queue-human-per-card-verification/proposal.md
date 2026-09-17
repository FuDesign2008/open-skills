## Why

`goal-driven-queue` runs a batch unattended and hands back an acceptance package, but the card lifecycle records "engine completed" (`done`) as the terminal record and acceptance is only a presentation event. Nothing requires — or records — a human verifying each executed card, so an unattended batch's results can be read (or merged) without anyone having gone card by card, and `done` is silently read as "accepted". The user needs a mandatory post-run, per-card human verification gate with the per-card information consolidated into one document.

## What Changes

- Add a **human per-card verification gate** to the post-run acceptance: when the batch ends and the package is assembled, every **executed** card enters the verification state `awaiting`; the batch MUST NOT be presented as accepted until each executed card carries a human verdict (`verified` / `returned`).
- Add a **dedicated, consolidated verification document** `.goal-driven/queues/<queue-id>/runs/<batch-id>/verification.md` — one section per executed card gathering goal condition, engine/result/branch/report, layered acceptance status, the engine report's numbered checklist, side effects, ledger items and conflict pre-run, plus a verdict line; the human verifies from one place.
- **Preserve `done`**: `done` keeps meaning "engine completed"; verification is a separate state recorded in the card's existing Acceptance Summary (and a progress-doc column), so legacy cards/batches behave exactly as before.
- Make the per-card verdict **human-only**: `ai-proxy` may still run the record-step report-checklist check, but MUST NOT fill or infer a per-card acceptance verdict (reserved: outcome-type acceptance).
- Route `returned` findings back as new/revised cards (existing acceptance-findings loop); no merge or revert.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `goal-queue`: the acceptance package gains a mandatory per-card human verification gate and the dedicated verification document; the verification state is recorded and batch "accepted" presentation is gated on human verdicts; the proxy checkpoint wiring gains an explicit human-only clause for the verdict seat.

## Impact

- Files: `skills/goal-driven-queue/SKILL.md`, `skills/goal-driven-queue/reference.md`, `skills/goal-driven-queue/evals/evals.json`, `openspec/specs/goal-queue/spec.md` (via archive), `docs/generated/skills-index.md` (regenerated).
- Behavior: unattended batches now end in `awaiting verification` cards and are not accepted until a human verdicdts each executed card; with `Stage-exit policy: ai-proxy` the run is unchanged except the verdict seat stays human. Legacy batches are unaffected.
- Out of scope: `goal-driven-workflow` Stage 5 single-run acceptance; merge authority (stays human); scheduling.
