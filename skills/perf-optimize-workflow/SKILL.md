---
name: perf-optimize-workflow
version: "1.0.0"
user-invocable: true
description: "Performance optimization paradigm workflow, proven across stacks: benchmark harness → evidence gate → attribution → one-target-per-iteration optimization → A/B cross-run statistical verification → benchmark-log sediment, with an optional unattended iteration loop. Stack knowledge (React/Angular/Electron) lives in reference.md. Triggers — 「性能分析」「性能证据」「性能定位」「性能假设」「性能监控」「性能优化」「性能验证」「性能深入」「性能问题」「卡顿」「很慢」「前端性能」「Electron 性能」 / performance analysis, perf evidence, locate bottleneck, perf optimization, perf verification. Do NOT use for non-performance bugs (solve-workflow) or trivial single-line edits."
dependencies:
  - perf-evidence-discipline
  - perf-iteration-loop
  - clarifying-question-discipline
  - known-issue-research
---

# Performance Optimization Workflow

> Strong dependencies (frontmatter): `perf-evidence-discipline` (evidence-validity gate at four stages), `perf-iteration-loop` (mandatory iteration-loop protocol binding Stages 5-6), `clarifying-question-discipline` (one question per turn), `known-issue-research` (known performance-pattern quick search at the locate stage). If any is missing, abort and print: `npx skills add FuDesign2008/open-skills -g --skill '*' --yes`.

## Scope

This workflow owns the full performance optimization paradigm: **build a reproducible benchmark, gate every conclusion through evidence-validity checks, attribute the bottleneck along the full chain, optimize one target per iteration, verify by A/B cross-run statistics, and sediment results in a benchmark log** — optionally driving the whole loop unattended when the environment provides an iteration-loop capability.

It answers: who triggers what expensive operation, under which conditions, on which devices — and then eliminates it measurably. Shipping/rollout decisions belong to the project, not this workflow.

**Paradigm provenance**: distilled from two complete campaigns on different stacks (a native C++ toolchain: 29.4s → 6.7s workload, -77%, byte-identical outputs; a large web rich-text editor: -27% commit time / -31% render volume / -34% memory, plus a multi-year user-jank attribution closed in four paths). The stages below are the stack-agnostic skeleton both campaigns followed.

## Layered architecture

| Layer | Lives in | Changes when |
|-------|----------|--------------|
| Paradigm (this file) | `SKILL.md` | Rarely — behavioral contract, versioned deliberately |
| Evidence-validity gate | `perf-evidence-discipline` (strong dependency) | Rarely — hard rules against measurement traps |
| Stack knowledge | [reference.md](reference.md) (frontend chapter today; extensible per stack) | Often — framework versions and thresholds age; refresh via knowledge-only changes |

The paradigm is durable; the knowledge layer is perishable by design. Keep perishable content out of this file.

## Trigger Recognition

Trigger words (each enters the workflow; with 「trigger + colon + space + description」 form, enters the named stage directly — colon/space punctuation is language-agnostic):

- **「性能分析」/「性能问题」/「卡顿」/「很慢」** or English equivalents ("performance issue", "it's slow", "jank") → enter at Stage 1
- **「性能证据」** → Stage 1: Benchmark & Evidence
- **「性能定位」/「性能深入」** → Stage 2: Locate the Bottleneck (「性能深入」 continues/deepens Stage 2)
- **「性能假设」** → Stage 3: Hypothesize the Root Cause
- **「性能监控」** → Stage 4: Build Toggleable Monitoring
- **「性能优化」** → Stage 5: Optimize
- **「性能验证」** → Stage 6: A/B Verify
- **「前端性能」/「前端性能优化」/「Electron 性能」** → Stage 1, with the frontend knowledge chapter in [reference.md](reference.md) as the working knowledge base

Performance-related logs or a profile handed over for analysis also enter at Stage 1 or 2.

## General Principles

**先建基准再动刀，证据过闸才定罪，链路归因一锤定音，一轮一个目标，A/B 交叉说了算，负结果也留痕。** (Build the benchmark before cutting; convict only through the evidence gate; attribute along the full chain; one target per iteration; the A/B cross-run verdict rules; negative results leave traces too.)

1. **Data-driven**: no conclusion precedes its measurement. No reproduction path or analyzable data yet → the first task is building one (Stage 1), not hypothesizing.
2. **Evidence-gated**: every metric that feeds a decision must first pass `perf-evidence-discipline` (mounted per stage below). Non-decision-grade numbers may inform, never convict.
3. **Single variable, reproducible**: each hypothesis resolvable to yes/no with existing data or minimal targeted instrumentation; each optimization touches exactly one root-cause point so its benefit is attributable; results reproducible and falsifiable — correlation is not causation.
4. **Full-chain, top-down**: from the user-perceived chain (macro) to the hotspot (micro); identify *where* it is slow (time/resource share), then *who* triggers it and *under what conditions*. Avoid blind-men-and-elephant local analysis.
5. **Production caliber & device profile**: acceptance numbers come from production-caliber builds; conviction-grade conclusions come from device-profile-calibrated runs (CPU-throttle matrix), not from high-end developer machines alone.
6. **No premature optimization**: optimize only problems that are measured, user-affecting, and over threshold. Preventive optimization without data adds complexity for nothing.

- **⚠️ Ask proactively**: follow `clarifying-question-discipline` — one question per turn, multi-round until clear, clarify before answering.

## Stage Flow

Forward: **evidence → locate → hypothesize → (monitor) → optimize → verify**, iterating optimize↔verify until the target is met or cost-effectiveness runs out.

Common jumps:

- Stage 1 lacks data and monitoring must be built first → Stage 4, then back to Stage 1.
- Stage 2's data already pins the bottleneck → skip Stage 3, go to Stage 4/5.
- Stage 6 refutes the hypothesis → back to Stage 2/3; optimization fell short → back to Stage 5.
- Intermittent issue hard to capture → prioritize Stage 4 long-term monitoring, return when it reproduces.

---

## Stage 1: Benchmark & Evidence (性能证据)

### Goal

Turn a vague "it's laggy" into a **reproducible, standardized, logged workload** with a quantified baseline and a target/red-line — not a one-off manual repro. If a benchmark harness already exists, run it; if not, building a minimal one is part of this stage, because every later stage depends on repeatable numbers.

### Information to clarify

- **Symptom**: which action (click/scroll/type/open/IME…), what "slow" looks like (jank/blank/spinner/unresponsive), **quantified** where possible; pin the analysis boundary (start and end of the problem).
- **Data available**: existing logs/profiles/instrumentation? If none, determine in what environment, with what method, data can be captured.
- **Reproduction**: always vs intermittent; requirements on data volume / device class / duration.

### Benchmark harness contract (when building one)

- **Standardized workloads**: scripted loads per user scenario (open × scale, input × chars, scroll × rounds, switch, session-long editing, IME, paste, …) — each load driven through **real input paths** (discipline 5) and verifiable by content delta.
- **Automated capture**: metric collection wired once, reused every run — not manual copy-paste. Console/log parsing and structured JSON archives preferred.
- **Baseline first**: record the pre-optimization baseline before any change; every later claim is a comparison against it.
- **Benchmark log**: an append-only file (e.g. `BENCHMARK.md`) at repo root recording every run: date, commit, workload, scale, key metrics, note. This log is the campaign's memory — verdicts, retractions, and invalidations all land here (Stage 6).
- **A/B judge**: build or reuse a cross-run statistical judge (see Stage 6) so "did it improve" is never answered by eyeballing two numbers.

### Evidence gate (before any number leaves this stage)

Load `perf-evidence-discipline` and clear its disciplines **1 (throttling artifacts), 2 (monitor self-pollution), 5 (input authenticity), 6 (toggle lifecycle)** for every metric you plan to carry forward. Numbers failing the gate are marked trend-only.

### Output

- What data is available / missing; if missing, the exact capture action (who runs what, what gets captured).
- Recommended output: a structured problem definition — symptom (quantified), reproduction conditions, analysis boundary, baseline, target threshold/red line.
- Benchmark harness status: existing / built-this-stage / deferred-with-reason.

---

## Stage 2: Locate the Bottleneck (性能定位)

### Goal

Find the anomalies in the data (who spent how much time/resources, when), trace the full trigger chain, and narrow to 1-2 core segments — with every load-bearing number already evidence-gated.

### Analysis approach

1. **Full-chain topology**: segment the path from user action to problem end (code execution, system calls, network/storage), no gaps, no overlap; each segment independently timeable.
2. **Two-dimensional capture**: time (per-segment duration/share) + resources (CPU/memory/IO/network). Neither skipped. Resource utilization >70% is a common alert line — beyond it, response time rises non-linearly.
3. **Initial screen**: rank segments by time-share (e.g. >20% = high-cost); flag resource anomalies (saturation, sustained growth, error rate); rule out low-cost + resource-normal segments.

### Attribution techniques (pick by what the data shows)

- **Text logs**: filter by keyword/duration/error code, read snippets + stacks.
- **Profiles**: read the wide bars / high-share regions first, drill to function/component. **Editor/web-app four-bucket split** when Rendering dominates: framework commit / style insertion / layout / paint — their fixes differ entirely; do not read "Rendering" as one blob.
- **Forced-reflow reading** (write→read patterns; rich-text editors: DOM mutation followed immediately by selection-boundary reads is the classic #1 source).
- **No JS hotspot** (`(program)`/`(idle)` dominant)? → discipline 8's static-copy control experiment decides: product-code cost vs DOM-scale physical cost. This single experiment can end a multi-year argument.
- **Known-pattern quick search**: when `known-issue-research`'s triggers fire, load it and run its performance-pattern variant before deeper custom analysis.

### Evidence gate

Disciplines **3 (counter audits — audit any framework-internal statistic before use)** and **8 (control experiment)** mount here.

### Output

- Anomaly summary (slow/high-volume/high-frequency + location); causal chain "action → … → bottleneck" in a sentence or diagram.
- 1-3 preliminary hypotheses with confirming/refuting evidence stated; core bottleneck segment list (1-2) with shares.

---

## Stage 3: Hypothesize the Root Cause (性能假设)

### Goal

Distill anomalies into **verifiable, falsifiable** root-cause hypotheses, classified against common patterns; ranked by user impact × verification cost.

### Reasoning references

- **USE method** (resource bottlenecks): utilization / saturation / errors.
- **RED method** (execution/request bottlenecks): rate / errors / duration.
- **Common patterns table** (response-scope-too-broad, unbatched updates, high-frequency triggers, backlog-fires-at-once, resource leak, synchronous blocking, redundant computation): generic forms in this file's paradigm; concrete frontend manifestations in [reference.md](reference.md).

### Evidence gate

Discipline **7 (single-sample extrapolation ban — "users don't hit this" needs user-profile evidence)** and discipline **4 (throttle matrix — hypotheses about user-perceived jank are validated on calibrated cells)** mount here.

### Output

- The 1-2 most likely hypotheses, each resolvable to yes/no ("is it a full re-render?" is answerable; "the code is badly written" is not); ranked; with verification method (existing data, or which monitoring points from Stage 4).

---

## Stage 4: Build Toggleable Monitoring (性能监控)

### Goal

When existing data cannot verify the hypothesis, add **toggleable, production-grade observability** on the critical path — permanent code, gated at runtime.

### Design principles

1. **Toggle-controlled** (env var / config / feature flag / debug switch): off in production = zero output, zero sampling, negligible overhead; on = structured output aligned with existing logs.
2. **Permanent, not temporary**: a standing capability, not instrumentation to rip out later.
3. **Alignable**: stable timestamps + location identifiers, joinable with existing logs/profiles on one timeline.
4. **Just enough**: location + timestamp + the few key variables that confirm/refute the hypothesis; reuse the project's log format.
5. **Toggle lifecycle**: toggles read at module load must be injected before page scripts (discipline 6).

### Point selection

Direct trigger point first (the state update / request fire / recompute entry), then intermediate chain nodes (call order/frequency), then the expensive computation's entry/exit (per-call duration/count).

### Output

Monitoring-point list (file:line or function, purpose, toggle name) + the user action to enable/reproduce/capture. Root cause already confirmable → skip to Stage 5.

---

## Stage 5: Optimize (性能优化)

### Goal

Implement the change that eliminates/mitigates the confirmed bottleneck — **one root-cause target per iteration**, sized by impact.

### Principles

- **Fix the root cause, not the symptom**: the change maps to the Stage 3 pattern (narrow the scope, batch, throttle, cache, move off-thread…), not a generic "make it faster".
- **One target per iteration**: every commit optimizes exactly one thing, keeps the change reviewable and revertible, and makes Stage 6's benefit attribution unambiguous. Multiple good ideas queue as separate iterations.
- **Layer priority** (high → low): business logic → application code → framework/dependency → system/hardware; prefer upper layers and "low change cost, high payoff" moves.
- **Time-share priority**: optimize the highest-share segments first; a <10% segment improved 100x barely moves the total (Amdahl).
- **Stability**: no semantic change, no functional bugs, no new performance side effects.
- **No gain → revert**: Stage 6 rejects the change → revert it (the benchmark log keeps the negative row), do not stack a second speculative change on top.

### Output

Change list (file, location, summary) + suggested verification scenario/metrics aligned with Stage 4 monitoring, for Stage 6.

---

## Stage 6: A/B Verify (性能验证)

### Goal

1. Render a yes/no verdict on the hypothesis.
2. If Stage 5 changed code: prove the optimization worked **statistically**, at production caliber, without side effects — or revert.

### A/B cross-run statistical judge

- Keep the previous commit's build as Baseline (snapshot keyed by commit hash).
- Alternate runs **B₁ A₁ B₂ A₂ B₃ A₃** (Baseline, New, interleaved) so system-load noise hits both sides roughly equally.
- Accept an improvement **only if `avg_B − avg_A > max(stdev_B, stdev_A)`**. Single runs and minimum-of-N are not verdicts (min-of-N chases idle moments; single runs chase noise).
- Why it works: alternating runs experience the same machine states, so the difference is far more stable than absolute numbers — no machine lockdown, core pinning, or service-killing required.

### Verification checklist

- **Hypothesis verdict**: confirmed / refuted / uncertain (+ what's missing, next monitoring or re-analysis).
- **Effectiveness**: same repro path, before/after key metrics, pass criteria stated up front.
- **Regression**: functional correctness (normal/edge/peak) intact — for optimization of transformation pipelines, output-equivalence checks (e.g. byte-identical) are the strongest form.
- **Side effects**: no secondary performance issues (e.g. latency fixed but memory climbing).
- **Caliber**: acceptance numbers from production-caliber builds (discipline 2); user-jank verdicts from device-profile-calibrated cells (discipline 4).
- **Sediment**: append the run to the benchmark log — including **rejections** (discipline 9: no-gain and artifact rows are recorded with reason, keeping others from re-walking dead ends or citing bad numbers).

### Stop condition

Every hypothesis verified, targets met — or remaining bottlenecks' cost-effectiveness too low (change cost ≫ payoff). Then optionally fold key metrics into standing monitoring/CI gates.

---

## Iteration loop (mandatory orchestration for Stages 5-6)

Optimize (Stage 5) and A/B verify (Stage 6) execute as a **repeating loop governed by `perf-iteration-loop`**, not as a single pass: each round runs profile → one-target optimize → A/B judge → correctness gate → commit + snapshot + log, until a stop condition fires (5 consecutive no-gain rounds / target met / ROI exhausted). This is where the paradigm's compounding gains come from — one-pass optimization stops at the first visible hotspot.

- The loop is a hard contract: when the environment provides a loop runner (ralph-style), mount the protocol on it; otherwise self-drive the rounds serially — the contract is identical either way.
- Single pass is an explicit exception (user requests exactly one round), stated in the run's output — never the silent default.

## Output detail level (adaptive)

- Simple problem, ample data: condense to "anomaly + causal chain + verdict".
- Complex/multi-module: brief per-stage outputs, key snippets attached.
- Stack-specific knowledge (framework versions, thresholds, patterns, tool tables): fold in from [reference.md](reference.md) conversationally — never hardcode stack specifics into this file's paradigm.
