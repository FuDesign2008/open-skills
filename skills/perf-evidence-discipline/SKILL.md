---
name: perf-evidence-discipline
version: "1.0.0"
user-invocable: false
description: "Hard discipline for performance evidence validity: gate every performance conclusion against measurement artifacts, monitor self-pollution, framework counter ambiguity, synthetic-input falseness, and device-profile mismatch before it may drive any optimization decision. Loaded as a pre-gate by perf-optimize-workflow at its evidence, locate, hypothesis, and verify stages. Triggers — 「性能证据纪律」「伪影排查」「口径校准」「设备画像」 / perf evidence discipline, measurement artifact check, caliber calibration. Do NOT use standalone to find bottlenecks — it validates evidence, it does not locate hotspots."
---

# Performance Evidence Discipline

> Hard gate: a performance conclusion may drive an optimization decision only after passing this discipline's validity checks. This is not an analysis flow — it does not find bottlenecks; it decides whether evidence about a bottleneck can be trusted.

## Why this exists

Real attribution work regularly produces numbers that look rigorous and are wrong. In the source project (a large web rich-text editor), uncaught traps included: frame metrics inflated ~80x by environment throttling, dev-mode numbers ~4.7x above production because the performance monitor itself was the hotspot, and a framework counter claiming ~13,000 component renders per keystroke while the browser recorded only two long tasks. Each one, uncaught, would have produced a wrong optimization — wasted iterations, or a real problem dismissed. The traps fall into three classes:

1. **Measurement artifacts** — the environment or tool distorts the number (background throttling, observer overhead, task-boundary effects).
2. **Caliber pollution** — the number is real but measures something else (instrumented vs production builds, framework-internal counters with different semantics than assumed).
3. **Device-profile mismatch** — the number is true, but only on machines nobody complains about.

## The nine disciplines

| # | Discipline | One-line rule |
|---|-----------|---------------|
| 1 | Environment-throttling artifacts | Frame/rAF-class metrics from a controlled browser (headless, occluded, backgrounded) are invalid until proven otherwise |
| 2 | Monitor self-pollution | Instrumented builds can differ several-fold from production; optimization decisions use production caliber |
| 3 | Framework counter ambiguity | Audit any framework-internal statistic on a small scale before trusting it; on conflict with browser-native metrics, trust the browser |
| 4 | Device-profile calibration | Conviction-grade conclusions need a CPU-throttle matrix (e.g. 1x/8x/20x); an unthrottled "innocent" verdict is invalid for low-end users |
| 5 | Input-event authenticity | Every synthetic input load must verify the content delta; synthetic key/scroll events that bypass the real input pipeline are void |
| 6 | Instrumentation toggle lifecycle | Toggles read at module-load time must be injected before page scripts load; spans ended by rAF inherit throttling (see 1) |
| 7 | Single-sample extrapolation ban | Developer-machine data is not a user profile; negative-ROI conclusions need user-profile evidence |
| 8 | Ultimate control experiment | When profilers show no JS hotspot, run a static-copy control experiment to separate product-code cost from DOM-scale physical cost |
| 9 | Negative results and caliber corrections leave traces | Mark contaminated rows in the benchmark log with an invalidation warning (reason + correct caliber); exclusions are outputs too |

### 1. Environment-throttling artifacts

- **What it catches**: frame rate, rAF latency, and similar frame-class metrics measured in a controlled browser environment. Chromium throttles rAF to ~once per 800ms and timers toward 1Hz for occluded/backgrounded windows; focus emulation does not lift this (occlusion is an OS window state, not a focus state).
- **Detection**: sample the JS profiler during the "long frames" — if the thread is ~99.9% idle, the frames are environmental throttling, not product long tasks.
- **What to do instead**: put the stimulus and the measurement in the same JS task (e.g. change a container's width, then immediately force a synchronous layout read). The browser gets no chance to do the layout in between, so the number reflects real work. Signature in the source project: resize-relayout "frame latency" of ~728ms under throttling vs ~9ms measured same-task — an ~80x artifact.

### 2. Monitor self-pollution

- **What it catches**: numbers from builds that carry performance instrumentation. A monitor that walks the whole tree on every commit, plus unminified code, can multiply real cost several-fold (source project: 745ms instrumented vs 157ms production, ~4.7x).
- **Detection**: cross-check monitor-caliber numbers against a browser-native metric (e.g. long-task observer). When they disagree, the browser-native metric wins.
- **What to do instead**: use instrumented builds for relative A/B trends only; acceptance numbers and optimization decisions use production caliber.

### 3. Framework counter ambiguity

- **What it catches**: self-built or framework-internal statistics (render counts, mount counts, commit counts) whose semantics silently differ from what you assume. Example (React 16): fibers bailed out of rendering can look like mounts; a "performed work" bit may retain stale residue across commits, so a full-tree DFS double-counts on every commit.
- **Detection**: before first use, audit the counter on a small scale — cross-reconcile independent counts (e.g. mounts vs performed vs total) against a browser-native metric in the same window. Magnitude contradiction (e.g. 13,420 renders/keystroke vs 2 long tasks) means the counter is the artifact.
- **What to do instead**: treat such counters as relative trend signals only; never as conviction-grade evidence.

### 4. Device-profile calibration

- **What it catches**: conclusions drawn only on high-end developer machines. Developer and user devices can differ 5-20x in effective CPU speed; "zero blocking on my machine" says nothing about the users who complain.
- **Detection**: apply the browser debugging protocol's CPU-throttling emulation across a matrix (e.g. 1x / 8x / 20x) × code path × data scale, and read each cell separately. Source-project scroll workload: 1x → 0 long tasks, 8x → 18 tasks / 1089ms, 20x → 47 tasks / 6282ms — one workload, three verdicts.
- **What to do instead**: conviction ("this path is/is not the user's problem") requires the throttled cells, not the comfortable one.

### 5. Input-event authenticity

- **What it catches**: synthetic input that "succeeds" without exercising the product. Protocol-level key dispatch can bypass the editor's text-processing chain entirely (source project: 40 keys dispatched, zero characters landed); programmatic scrolling can skip the full scroll pipeline.
- **Detection**: after every input load, verify the content delta equals the intended change (e.g. document length delta == characters sent). No delta, no valid load — regardless of what the driver reported.
- **What to do instead**: drive text through the host's native input API; drive IME through a composition-capable API; drive scrolling with real wheel events.

### 6. Instrumentation toggle lifecycle

- **What it catches**: instrumentation that never activated because its toggle was read exactly once at module-load time — setting it after page load does nothing. Related: any span whose end boundary is a rAF callback contains throttled frames (see discipline 1) — source project saw ~800ms of pure throttling inside rAF-terminated spans.
- **Detection**: confirm the toggle took effect by observing the instrumentation's first output; for spans, check whether the end boundary is synchronous or rAF-terminated.
- **What to do instead**: inject toggles via the debugging protocol's evaluate-on-new-document capability (before any page script loads); for phase conclusions, use synchronous spans plus long-task counts.

### 7. Single-sample extrapolation ban

- **What it catches**: user-profile claims built from one account's data. Source project: local notes were 96.1% under 10KB, which "disproved" the need for large-document optimization — until field evidence showed complaining users routinely hold documents tens of thousands of characters large.
- **Detection**: ask of every negative-ROI conclusion: whose data backs the "users don't hit this"? One developer account is not a profile.
- **What to do instead**: negative-ROI conclusions need user-profile evidence (aggregated telemetry, support feedback, field data). Until then, treat the question as open.

### 8. Ultimate control experiment

- **What it catches**: the blind spot when profilers show `(program)`/`(idle)` dominant (no JS hotspot) and the question is "is this our code's cost, or the physical cost of DOM scale itself?"
- **Method**: clone the live DOM into a pure static copy (no framework, no editor logic, same styles environment), run the same load under the same throttling, and compare long-task totals. Copy ≈ original → the bulk is base rendering cost of DOM scale × style environment, and the optimization direction shifts from "find the code hotspot" to "cut base rendering cost" (containment, style scoping, virtualization); the difference is the product-code margin, i.e. the ceiling of code-level optimization. Source project: static copy 792ms vs live editor 1089ms → product margin only ~30%.
- **Ablation rider**: manually activate an existing optimization mechanism and re-run — "mechanism exists" does not mean "mechanism works" (source project: activating a dormant content-visibility mechanism made scrolling 1089ms → 7139ms, a negative optimization).

### 9. Negative results and caliber corrections leave traces

- **What it catches**: contaminated numbers that keep living in reports and get cited by others for optimization decisions.
- **Method**: the moment an artifact is discovered, add an invalidation warning row to the benchmark log next to the bad data: what is wrong, why, and the correct caliber. Source project logged three such rows in one campaign (728ms frame artifact / 745ms dev-caliber spike / 13,420-per-keystroke counter artifact).
- **Principle**: an attribution campaign's output is not only what it found, but what it ruled out — exclusion records keep later readers from repeating the mistake.

## Mount points

Mounted by `perf-optimize-workflow` via its frontmatter `dependencies`:

| Host stage | Gate disciplines |
|-----------|-----------------|
| Benchmark & Evidence | 1, 2, 5, 6 — evidence validity before anything downstream |
| Locate the Bottleneck | 3, 8 — counter audits and the control experiment |
| Hypothesize the Root Cause | 7 (user-profile evidence) + 4 (throttle-matrix validation) |
| A/B Verify | 9 (negative-result logging) + 2 (production-caliber acceptance) |

Other performance-touching workflows may load this skill the same way and mount the disciplines at their own evidence/verification points.

## Gate rule

For any metric, if a discipline in the table above is unresolved for that metric's trap class, the metric is **not decision-grade**: it may appear in reports as trend-only context, but must not drive optimization choices, priorities, or pass/fail verdicts.

## Case archive

[reference.md](reference.md) holds the full battle-tested cases behind every discipline — anonymized real-project numbers, detection procedures, and reproduction patterns — plus placeholders for cases from other stacks. Read it when a compact rule above is not enough to make the call.
