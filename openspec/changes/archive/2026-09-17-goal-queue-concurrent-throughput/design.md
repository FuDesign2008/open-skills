## Context

Change A gave the queue work *selection*; it still executes one card at a time. Change B adds concurrent consumption plus two costs that ride the same loop: same-module exploration amortization and acceptance merge-decision compression.

The load-bearing constraint is that the queue's safety today is **bought by serial execution** — one child at a time makes isolation trivial (one branch suffices), accounting trivial (one writer), and failure isolation trivial. Concurrency turns all three into coordination problems at once, so the design's job is to reduce them back to as few criteria as possible.

Decisions below are recorded because two normative rules live here rather than in the specs (they are implementation-level derivations applied uniformly), and because the review's non-blocking findings must be discharged here to count as Prudent-Deliberate rather than Reckless-Inadvertent debt.

## Goals / Non-Goals

**Goals:**

- Compress wall-clock by running several children at once.
- Serialize same-module writes without forbidding parallelism, so conflicts do not move to the merge stage.
- Make concurrent accounting lossless with a single writer.
- Pre-compute the conflict picture so the human reviews real conflicts, not N unassisted merges.
- Keep concurrency an **explicit, recorded, human-set** value that unattended runs reuse.

**Non-Goals:**

- Worktree pooling, pre-warming, or recycling infrastructure.
- Dynamic slot sizing from the estimate band.
- Cross-queue (inter-`queue-id`) concurrency.
- Any hardcoded platform concurrency tool.
- Auto-merging anything, ever.

## Decisions

### B-D1 — The admission criterion is the design's single lever

A free slot is offered only to a card whose module set does not overlap any in-flight card. This one criterion discharges isolation (no two children in one working tree), worktree justification (each admitted child gets one), and write-conflict avoidance (same-module writes serialize). **Alternatives rejected:** optimistic any-card admission (moves conflicts to the merge stage — unpredictable, and the repo already documents worktree path breakage in multi-repo projects); group-then-parallel batching (adds a grouping concept and makes `max-concurrent` mean "parallel groups", raising user comprehension cost for a similar payoff).

### B-D2 — The module set is a machine-readable field, not free text

`Modules:` is a normalized path/module list on the card, extracted at enqueue from Constraints. The admission criterion reads the field and **MUST NOT** read Constraints prose. Rationale: the review's B1 — a gate resting on an unverifiable free-text judgment is the same defect change A's D1 fixed. The field is treated as a `factual` entry: checked against Constraints at the consumption-entry check, so a wrong extraction parks the card rather than mis-dispatching it.

### B-D3 — Conflict prediction never rewrites a published branch

Rebase happens in a **temporary scratch worktree** for prediction only; no push, no force-push, no rewrite of a branch carrying an open PR/MR. The human performs the real rebase and merge. Rationale: this was the design's only one-way action, and it had no mitigation (review B2). The compression benefit comes from *knowing* the conflicts, not from rewriting history.

### B-D4 — Consequences are disclosed by walking the actual configuration

The enqueue concurrency/isolation ticket must derive consequences from this project's real configuration (`intake-interview-discipline` §A step 5 — an existing hard rule, not a new one), at minimum: multi-repo sibling-path breakage, per-child worktree disk cost, and that the human will review conflict pre-runs rather than N merges. Rationale: review B3; a mis-described consequence is worse than none, and the repo already has a documented real case of worktree path breakage.

### B-D5 — `git-worktree-discipline` becomes a conditional dependency

Declared in frontmatter `dependencies` with a conditional prerequisite check: abort when resolved concurrency ≥ 2 and it is missing; do not block at concurrency 1. Rationale: review B4 — without this, a missing discipline silently degrades isolation exactly when it is load-bearing. Pattern copied from `ai-proxy-discipline`'s conditional check.

### B-D6 — Three caps, and wall-clock is the time cap

`max-tasks` (retained) / `max-concurrent` (new) / **wall-clock** (time). The summed-estimate comparison is reference only — under concurrency it is no longer an upper bound, and presenting it as one would be a false claim. Hitting `max-concurrent` stops *dispatch* but never interrupts an in-flight child.

### B-D7 — Single writer, and effective concurrency is recorded

The dispatcher alone writes the progress document and queue records; children report back. Completions arriving together are recorded sequentially so nothing is lost. The document also records **effective** concurrency next to the resolved value, so slot idling on module overlap (or a platform fallback) is visible rather than silently slower. Rationale: review N3 — an honest accounting surface is the whole premise of the detach-run-accept cycle.

### B-D8 — Amortization reuses change A's Approach Record; it does not build a parallel mechanism

The first card on a module produces an exploration record in the Approach Record shape; later cards seed from it. A record whose `factual` entries fail verification must not seed. Rationale: avoids a second reusable-knowledge shape in the same queue.

### B-D9 — Concurrency is expressed as intent, with an explicit degradation path

The skill never names a platform concurrency tool. When the platform cannot run N children, it falls back to the highest supported value and **states the fallback** in the progress document. Rationale: the repository's platform-agnostic rule; silently pretending to be concurrent would corrupt every downstream claim about the run.

### B-D10 — Per-card budget clause means per-child wall-clock

A card's "stop after N minutes" budget is the child's own wall-clock, unchanged by how many siblings run. Rationale: the clause exists to bound a single run's cost, and concurrency must not silently stretch or shrink it.

## Risks / Trade-offs

- **Module-set extraction wrong → overlapping children admitted** → `Modules:` is a factual field verified against Constraints at the consumption-entry check (B-D2); a mismatch parks the card.
- **Slot idling starves throughput** → tolerated deliberately: idling is the price of not colliding. Made visible via effective-concurrency accounting (B-D7) rather than hidden. Residual: a queue whose cards all touch one module gains nothing from concurrency — accepted, and disclosed at the enqueue ticket (B-D4).
- **Worktree path breakage in multi-repo projects** → disclosed by walking the actual configuration (B-D4); refusing worktrees caps concurrency at 1. Residual: a project that accepts ≥ 2 and then hits breakage discovers it at run time — mitigated by the disclosure and by the fact that degradation is a per-run setting, not a migration.
- **Conflict prediction rewrites history** → eliminated: prediction is scratch-worktree-local and never pushes (B-D3).
- **Missing worktree discipline silently weakens isolation** → conditional prerequisite check aborts at ≥ 2 (B-D5).
- **Concurrent completions lose accounting entries** → single writer recording sequentially (B-D7).
- **Wall-clock cap reached with several children in flight** → the cap stops dispatch; in-flight children continue to a safe point.
- **Canonical-statement drift across the six requirements that mention concurrency** → keep one canonical home per rule: the admission criterion and slot mechanics live in `goal-queue-concurrency`; the three caps live in `队列级预算与停止规则`; the consumption order lives in `持久 backlog 载体`; everything else references rather than restates (review N5).

## Migration Plan

- **No data migration.** A queue with no recorded concurrency resolves to 1 and behaves exactly as before this change; a card without a `Modules:` field is not admitted concurrently until one is added, which is the conservative direction.
- **Purpose text update.** `openspec/specs/goal-queue/spec.md`'s Purpose still says "serial consumption"; it is not covered by a MODIFIED requirement and must be rewritten during archiving (review N1). Same for the stale `branch isolation` wording in `子任务引擎可选调度`'s closing sentence (review N2).
- **Deployment order:** `reference.md` (queue config fields, `Modules:` field, caps defaults, accounting) → `SKILL.md` (enqueue ticket, slot dispatch, red-flag reversal, description) → `evals.json` → regenerate the index → archive.
- **Rollback:** set the queue's concurrency back to 1 (behavior returns to serial) or `git revert` the contract change.

## Open Questions

- **`goal-queue` Purpose and `branch isolation` wording** (review N1/N2): decided — update both at archive time; they are documentation truth, not behavior, so no requirement change is needed.
- **Number of eval cases** for the concurrent path: decided — cover admission (non-overlap, idling, refill), the enqueue concurrency/isolation ticket with consequence disclosure, three-cap stopping, single-writer losslessness, effective-concurrency visibility, local-only conflict prediction, amortized seeding, and the platform fallback.
- **Whether ⑤ should ship separately** (strategic note from the review): decided to keep it in this change — it rides acceptance-package assembly, which the concurrent loop already rewrites, and splitting it would mean touching the same requirement twice.
