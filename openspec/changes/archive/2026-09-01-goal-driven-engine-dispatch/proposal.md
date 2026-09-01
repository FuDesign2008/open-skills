# Proposal: goal-driven engine dispatch

## Why

goal-driven-* currently hardcodes `goal-driven-workflow` (the goal-harness loop) as the only child executor. The confirmed target: queue tasks should also run under the stage-gated PDCA flows — `solve-workflow` / `opsx-solve-workflow` — with AI-AI interactive, unattended advancement. The counterpart skill (v2.13.0) already provides the bounded adversarial seat; what is missing is (A) engine selection at dispatch and (B) wiring that seat into the two PDCA hosts' stage exits.

## What Changes

- **Engine field (A)**: task cards gain `Engine: goal-driven-workflow | solve-workflow | opsx-solve-workflow` (default `goal-driven-workflow`, opt-in zero-change). The batch Delegate step dispatches by field: a `solve-workflow` child receives the card's problem + frozen decisions as its stage-1 input and runs in auto mode with `counterpart: on` propagated; an `opsx-solve-workflow` child additionally requires the openspec environment gate (dir + CLI detection reused from the traceability pattern) and persists its artifacts natively. Engine is fixed per card at freeze time; goal-driven-batch's own queue contracts (caps, isolation, recording) apply unchanged to every engine.
- **Unattended counterpart exits (B)**: `solve-workflow` and `opsx-solve-workflow` declare `ai-counterpart-discipline` in frontmatter dependencies and add a thin "Unattended counterpart exits" section: in auto mode with `counterpart: on`, each manual stop point (stages 1/2/3/4/5/7/8 exits) becomes a counterpart checkpoint per the charter (fresh context, artifact-only inputs, evidence-tagged verdicts, ledger-marked); the `design-approval-gate` auto escape is upgraded to the counterpart's bounded pre-authorization; merge decisions, irreversible actions, and protected-branch operations stay human-only (park + ticket on hit).
- **Rules single-source**: the seat-filling rules for PDCA exits live in `ai-counterpart-discipline`'s integration guide (new "PDCA host exits" section); both solve hosts keep one thin pointer. `workflow-mode-lifecycle` is untouched — counterpart mode composes existing auto mode.
- **Routing note**: `goal-driven-workflow` gains a one-line pointer that single-run tasks shaped for stage-gated PDCA route to solve/opsx directly (no second-order dispatch machinery).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `goal-queue`: ADDED requirement — engine-optional dispatch on task cards (field vocabulary by exact skill name, default engine, opsx environment gate, queue contracts engine-agnostic).
- `ai-counterpart`: ADDED requirement — PDCA-host exit wiring contract (auto × counterpart composition, bounded pre-authorization replacing the bare auto escape, human-only reservations, thin-pointer host integration).

## Impact

- `skills/goal-driven-batch/` (0.6.0 → 0.7.0): Task Card `Engine` field, Delegate dispatch, engine-specific child notes, evals +2.
- `skills/solve-workflow/` (1.24.1 → 1.25.0): dependency + Unattended-counterpart-exits section.
- `skills/opsx-solve-workflow/` (1.18.1 → 1.19.0): same as solve-workflow.
- `skills/ai-counterpart-discipline/` (1.0.0 → 1.1.0): integration guide "PDCA host exits" section (single source).
- `skills/goal-driven-workflow/` (0.5.0 → 0.5.1): routing pointer only.
- `AGENTS.md` dependency rows for both solve hosts; `docs/generated/skills-index.md` regenerated.
