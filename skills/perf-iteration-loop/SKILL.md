---
name: perf-iteration-loop
version: "1.0.0"
user-invocable: false
description: "Hard protocol for the performance-optimization iteration loop: each round MUST run profile → one-target optimize → A/B cross-run judge → correctness gate → commit + baseline snapshot, repeating until a stop condition (5 consecutive no-gain rounds / target met / ROI exhausted). Strongly depended on by perf-optimize-workflow — optimization executes as this loop, not as one-off passes. Environment loop runners (ralph-style) accelerate execution; they never replace the protocol. Triggers — 「性能迭代循环」「无人值守优化」 / perf iteration loop, unattended optimization loop."
---

# Performance Iteration Loop Protocol

> Hard protocol skill: defines HOW the optimize↔verify cycle repeats. Strongly depended on by `perf-optimize-workflow` (frontmatter `dependencies`); this skill declares no dependencies and never depends on a host. Single-round optimization is an explicit exception, not the default.

## Why a loop, not a pass

Both provenance campaigns earned their headline numbers through sustained iteration, not single fixes: the native-toolchain campaign ran 36 loop rounds for a -77% workload gain, and the editor campaign's four accepted optimizations each took multiple judge-gated rounds. A single manual pass optimizes the first visible hotspot and stops; the loop keeps compounding gains until the stop condition — and the evidence gate keeps every round honest. Without a mandatory loop contract, executors routinely degrade to one-pass mode and the paradigm's compounding effect is lost.

## Loop body contract (every round, in order)

1. **Profile** — re-acquire hotspots fresh this round (sampling profiler / harness metrics); last round's hotspot list is stale input, not a shortcut.
2. **Pick exactly one target** — the top hotspot by user impact × time-share; queue everything else as future rounds.
3. **Optimize that one target** — per the host workflow's Optimize stage (root-cause-mapped change, revertible).
4. **A/B judge** — interleaved cross-runs against the previous snapshot; accept only if `avg_B − avg_A > max(stdev_B, stdev_A)`. Rejected → revert this round's change.
5. **Correctness gate** — full test suite / output-equivalence check (for transformation pipelines, byte-identical output is the strongest form). Failed → fix or revert; never commit red.
6. **Commit + snapshot + log** — one commit per round (single target), snapshot the accepted build as the next round's baseline (keyed by commit hash), append the round to the benchmark log — accepted or rejected, with reason (negative results leave traces).

## Stop conditions (any one ends the loop)

- **5 consecutive no-gain rounds** — the accepted optimization set has converged; further rounds are spinning.
- **Target met** — the stage-1 target threshold / red line is reached and verified.
- **ROI exhausted** — remaining bottlenecks' estimated gain no longer justifies change cost (host workflow's stop condition).

On stop: summarize rounds accepted/rejected, total measured gain vs baseline, and remaining known bottlenecks with their ROI assessment.

## Per-round disciplines (owned elsewhere, enforced here)

- **One target per round** — a round touching two targets has unattributable A/B results; split it.
- **Fresh baseline each accepted round** — the snapshot from step 6 is the next round's B side.
- **Evidence gate stays on** — metrics feeding round decisions remain subject to `perf-evidence-discipline` via the host.
- **No stacking on rejection** — a rejected round is reverted, not "improved" by a second speculative change piled on top.

## Execution tiers (platform-agnostic intent)

The protocol describes the loop contract; the executor adapts to environment capability:

- **Environment loop runner present** (ralph-style runner, agent loop capability): mount this protocol as the runner's loop body — the runner drives round cadence, this skill defines what each round MUST contain and when to stop.
- **No loop runner**: the agent self-drives the rounds — each round is one full pass of the six-step body, executed serially until a stop condition fires. Self-driven rounds obey the identical contract; the loop is not optional because the executor is a person or a plain agent session.

## Mount relationship

Mounted by `perf-optimize-workflow` via frontmatter `dependencies`; its Optimize and A/B-verify stages execute inside this loop. Other performance workflows may mount this protocol the same way. The single-round exception applies only when the user explicitly requests one pass; state it in the run's output.
