## Why

The goal-driven family (`goal-driven-workflow`, capability `goal-run`; `goal-driven-batch`, capability `goal-queue`) delivers the unattended promise — nothing stalls waiting for an absent human — but its pre-launch questioning is shallow: the engine's stage 1 stops at "goal unambiguous" (no approach comparison, no freeze), and the queue's intake is architected as "confirm once, now", which reads as "ask once". Interactive `solve-workflow` gets its quality from a decision pipeline the unattended family lacks entirely: fog graduation (`decision-fog-discipline`), approach comparison with human pick, pre-launch review, and confirmed plans. In unattended runs those decisions fall to mid-run improvisation, unreviewed — that is where direction drift comes from.

Gap analysis (M1–M7, this change's analysis stage): question discipline pointer exists but is depth-unfulfilled (M1/M7); fog gate (M2), approach comparison (M3), pre-launch approach review (M4), plan confirmation (M5) are absent from both hosts. Verified by full read of both SKILL.md files against solve-workflow's mechanism inventory.

## What Changes

- Add a new internal shared discipline skill `intake-interview-discipline` (`user-invocable: false`): the single source of truth for interactive-grade question depth in unattended hosts. It composes `clarifying-question-discipline` (how to ask) + `decision-fog-discipline` (when clear enough) and adds the three unattended-specific mechanisms: **approach freeze** (comparison → human pick → frozen-decisions block → bounded pre-launch self-review), **runtime self-answer rules** (frozen contract → investigated fact → conservative default; falsified frozen approach → clean stop + ticket report, never a silent pivot), and the **acceptance ledger** (decision/assumption ledger surfaced for human acceptance).
- Wire both hosts with thin pointers: engine stage 1 runs the deep interview + freeze; stage 2's goal condition derives from the frozen approach; stage 4 carries frozen decisions into the run and binds in-run decisions to §B; stage 5 reports the ledger. Queue stage 1 replaces the shallow one-shot confirm with the fog-bounded interview (one approval event, not one question); stage 2 children never re-ask what the card froze; stage 3 rolls up per-task ledgers into the acceptance package.
- `solve-workflow` is untouched — one-way fusion, not a rewrite.

## Capabilities

### New Capabilities

- `intake-deep-interview`: Deep intake discipline for unattended hosts — fog-bounded interview while the human is present, approach freeze with bounded pre-launch self-review, runtime self-answer priority with clean-stop tickets on falsified approach, and the acceptance ledger rolled into human acceptance. Referenced via frontmatter dependencies only (`user-invocable: false`).

### Modified Capabilities

- `goal-run`: stage 1 becomes deep intake (interview + approach freeze + self-review); goal condition derives from the frozen approach; launch carries frozen decisions; in-run decisions follow §B; completion report surfaces the ledger.
- `goal-queue`: enqueue-time intake becomes a fog-bounded deep interview ending in one approval event; task cards gain a Frozen Decisions section; delegated children must not re-ask frozen content; acceptance package aggregates ledger rollups.

## Impact

- New files: `skills/intake-interview-discipline/SKILL.md` + `reference.md`.
- Modified: `skills/goal-driven-workflow/SKILL.md` + `reference.md` (v0.2.0 → v0.3.0), `skills/goal-driven-batch/SKILL.md` + `reference.md` + `evals/evals.json` (v0.2.0 → v0.3.0; eval 1 assertions aligned, eval 5 added).
- Regenerated: `docs/generated/skills-index.md`; AGENTS.md Skill-list dependency columns updated.
