---
name: perf-workflow
version: '2.3.0'
user-invocable: true
description: "Performance issue analysis and optimization workflow, six stages. All triggers start with 性能 (\"performance\"): 性能分析, 性能证据, 性能定位, 性能假设, 性能监控, 性能优化, 性能验证, 性能深入. Saying one of these words alone, or using the 「trigger: description」 form, enters this workflow or the corresponding stage."
dependencies:
  - clarifying-question-discipline
  - known-issue-research
---

# Performance Issue Analysis Workflow

> Strong dependencies: `clarifying-question-discipline` (hard active-questioning discipline) and `known-issue-research` (known performance-pattern quick search, §2.1). If either is missing, abort and print the install command (`npx skills add FuDesign2008/open-skills -g --skill '*' --yes`).

## Scope

This workflow is responsible for **finding the root cause of a performance bottleneck**: who triggered what expensive operation, and under what conditions. Once the root cause is confirmed, it can be used to design a fix, implement code/config optimizations, and verify the result.
How to release, roll out, or ship the fix is out of scope — that is decided by the project itself.

## Trigger Recognition

All triggers **start with 「性能」** (performance), which makes them easy to recognize and remember. Saying a trigger word **alone**, or using the **「trigger + colon + space + description」** form, enters this workflow or the corresponding stage. When a colon is used, both the colon and the space are language-agnostic (Chinese or English punctuation both work).

- **「性能分析」** or **「性能分析: xxx」** → enter this workflow, starting at Stage 1 (Gather Evidence)
- **「性能证据」** or **「性能证据: xxx」** → Stage 1: Gather Evidence
- **「性能定位」** or **「性能定位: xxx」** → Stage 2: Locate the Bottleneck
- **「性能假设」** or **「性能假设: xxx」** → Stage 3: Hypothesize the Root Cause
- **「性能监控」** or **「性能监控: xxx」** → Stage 4: Build Monitoring
- **「性能优化」** or **「性能优化: xxx」** → Stage 5: Implement Optimization
- **「性能验证」** or **「性能验证: xxx」** → Stage 6: Verify
- **「性能深入」** or **「性能深入: xxx」** → continue or deepen the analysis within Stage 2 (Locate the Bottleneck)

When the user says「性能问题」("performance issue"),「卡顿」("stutter/jank"),「很慢」("it's slow"), etc., this may also be treated as entering the workflow, starting at Stage 1 (Gather Evidence).
When the user provides performance-related logs or a profile and wants it analyzed, treat this as entering the workflow, starting at Stage 1 (Gather Evidence) or Stage 2 (Locate the Bottleneck).

---

## General Principles

**「先定问题拆链路，再采数据筛瓶颈，下钻推导提假设，控制变量验根因，优化固化成闭环。」** (Pin down the problem and break down the chain first; then gather data to filter bottlenecks; drill down to derive a hypothesis; control variables to verify the root cause; and consolidate the optimization into a closed loop.)

1. **Data-driven**: get the data before drawing a conclusion — never hypothesize a problem first and then hunt for supporting evidence. When there is no reproduction path or analyzable data, help the user collect it first (repro steps, logs, profiles, screen recordings, etc.).
2. **Top-down**: start from the full chain as perceived by the user, macro before micro. First identify **where** it's slow (time spent / blocking / render volume, etc.), then trace back to **who** triggered it and **under what conditions**.
3. **Single variable, reproducible**: a root-cause hypothesis must be resolvable to a yes/no verdict using existing data or a small amount of targeted instrumentation. When verifying, change only one variable at a time; the result must be reproducible and falsifiable — never treat correlation as causation.
4. **Full-chain coverage**: analyze the complete execution chain from the problem's start to its end, not just local data — avoid the blind-men-and-the-elephant trap.
5. **Toggleable, production-grade monitoring**: performance observability should be designed as a **proper, production-grade monitoring capability** that lives permanently in the codebase, gated by a toggle (environment variable, config item, feature flag, etc.). When off, it emits nothing and samples nothing, with no impact on the live product; when analysis is needed, flip the toggle to collect data — no need to bolt on temporary instrumentation and rip it out later.
6. **No premature optimization**: only optimize performance problems that are **backed by data, affect user experience, and exceed a threshold**. Do not perform preventive optimization for "performance issues that might happen someday" without measurement data behind them — it only adds unnecessary code complexity and maintenance cost.

- **⚠️ Ask proactively**: follow `clarifying-question-discipline` (one question per turn; multi-round until clear; clarify first, don't rush to answer; strong dependency — abort if missing).
- 🚩 **Red Flag**: dumping multiple questions/open points on the user to answer one by one at once (violates the hard discipline) — ask only the single most critical question each time, and ask the next only after getting an answer.

---

## Stage Flow

Forward flow: evidence → locate → hypothesize → monitor → optimize → verify.

Common jumps:
- Stage 1 finds data is missing and monitoring needs to be built → go directly to Stage 4 (Build Monitoring) to add it, then return to Stage 2.
- Stage 2 has enough data and the bottleneck is clear → skip Stage 3 and go directly to Stage 4 or 5.
- Stage 6 refutes the hypothesis → go back to Stage 2 or 3 to re-analyze.
- Stage 6 shows the optimization fell short → go back to Stage 3 to re-hypothesize, or Stage 5 to adjust the optimization.
- An intermittent issue is hard to capture data for in Stage 1 → prioritize Stage 4 to build long-term monitoring, then return to Stage 2 once it reproduces.

---

## Stage 1: Gather Evidence (性能证据)

### Goal

Obtain reproducible, analyzable performance data instead of just guessing from a description — and turn a vague "it's laggy/slow" into a quantified metric and performance baseline, with a clear optimization target and a hard red line.

### Information to Clarify

- **Symptom**: which action triggers the slowdown (click, scroll, typing, drag, an API request, etc.)? What does "slow" look like (jank, blank screen, spinner, unresponsive)? **Quantify** wherever possible (e.g. a given endpoint's P99 in ms, an action's frame rate/latency), and pin down the **analysis boundary** (the problem's start and end point, to avoid unbounded scope).
- **Data available**: are there existing logs, a Performance/CPU profile, a network capture, or custom instrumentation? If not, first determine "in what environment, with what method" data can be captured.
- **Reproduction conditions**: always reproducible or intermittent? Are there requirements on data volume/concurrency/device?

### Common Data Sources (pick by scenario)

| Scenario | Candidate data sources |
| --------------------- | ------------------------------------------------------------------ |
| Frontend jank / main-thread blocking | Console logs, Chrome Performance recording, Long Task / custom performance monitoring |
| Excessive rendering / expensive repaint | Framework render stats, React DevTools Profiler, custom commit/render instrumentation |
| Slow API / backend | Network panel, server-side logs, APM, traces |
| Memory / leak | Heap snapshot, memory trend graph |

Not tied to any specific tech stack — choose based on whatever monitoring and tools the project actually has.

### Output

- State clearly what data is **already available** and what is **still missing**.
- If data is missing: specify the **action the user needs to take** and **what needs to be captured** (e.g. repro steps, flip a given toggle, reproduce, and export console/profile output).
- **Recommended output includes**: the symptom (with quantified metrics), reproduction conditions, analysis boundary, current performance baseline, and target threshold or red line; this can be organized into a structured "performance problem definition sheet" for later comparison.

---

## Stage 2: Locate the Bottleneck (性能定位)

### Goal

Find the **anomalies** in the raw data (who spent how much time/resources, and when), and **trace the trigger chain** (event / call stack / data flow); build a full-chain topology from start to end, and use two data dimensions (time + resources) to do an initial bottleneck screen, narrowing the analysis scope to 1-2 core segments.

### Analysis Approach (general)

- **Full-chain topology**: break down every segment from the user action to the end of the problem, in execution order (code execution, system calls, network/storage, etc.), forming a topology with no gaps and no overlap; each segment should be independently timeable with clear inputs/outputs.
- **Two-dimensional capture**: time dimension (time spent per segment, share of the total chain) + resource dimension (CPU/memory/IO/network, etc.) — neither can be skipped.
- **Initial bottleneck screen**: rank segments by time-share to pin down the high-cost ones (e.g. share >20%); pin down abnormal segments by resource anomaly (saturation, sustained rise, error rate); rule out segments that are both low-cost and resource-normal. Resource utilization >70% is a common alert line — beyond this threshold, response time tends to rise non-linearly, so it deserves priority investigation even when the absolute value looks modest.

1. **Find the anomaly**
   In the timeline or aggregated stats, find metrics that stand out, e.g.:
   - a single task/request whose time exceeds a threshold (e.g. a main-thread task >50ms, >200ms);
   - an abnormally large single-operation volume (e.g. one update touching a huge number of nodes, one request returning a huge payload);
   - an abnormally high frequency (e.g. an event firing far more often than expected).

2. **Locate it**
   For each anomaly, determine:
   - which layer it occurs in (frontend/backend/network/storage);
   - the corresponding code or module (file, function, component, endpoint);
   - the call stack or event chain (from the user action or entry point to that time/resource sink).

3. **Build the causal chain**
   Chain it together as "user action → event/request → handler function → expensive operation → observed metric", so you don't end up seeing only the symptom without the trigger condition.

### Working Method

- For **text logs**: filter with search (grep/ripgrep, etc.) by keyword, duration, error code, etc., then read the relevant snippets and call stacks.
- For **profiles**: first look at the "wide bars" or "high-share" areas on the timeline or flame graph, then drill down to the specific function/component.
- For **code**: read the code and search call relationships, cross-referencing stack info from the logs, to work out "who called whom under what condition".

### Output

- **Anomaly summary**: what's slow / high-volume / high-frequency, and its approximate location.
- **Causal chain**: describe "action → ... → bottleneck" in a sentence or two, or a simple diagram.
- **Hypotheses to verify** (preliminary direction): list 1-3 "possible root cause" directions, and for each, state what evidence would confirm or refute it. Refinement and categorization happen in Stage 3 (Hypothesize the Root Cause).
- **Core bottleneck segment list**: 1-2 segments, with time-share or resource-anomaly summary attached.

### Known Performance-Pattern Quick Search (optional, use when locating stalls)

When `known-issue-research` §2.1's trigger conditions are met, load that skill and follow §2.1 (Performance-pattern variant). This workflow's own pattern table and stage orchestration stay in this file.

---

## Stage 3: Hypothesize the Root Cause (性能假设)

### Goal

Distill the anomalies and trigger chain into a verifiable **root-cause hypothesis**, and classify it against common performance-problem patterns to guide later instrumentation and fixes. Hypotheses must be verifiable and falsifiable — no vague guessing; industry methods can help classify them (see below).

### Root-Cause Reasoning References

- **USE method** (resource-type bottlenecks): judge resource saturation (CPU/memory/IO/network) along three dimensions — utilization, saturation, errors.
- **RED method** (execution/request-type bottlenecks): judge execution-logic or call-chain problems along three dimensions — rate, errors, duration.

Use these alongside the "Common Patterns" table below; the specific steps aren't expanded further here.

### Common Patterns (tech-agnostic description)

| Pattern | Characteristic | Typical trigger |
| ------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| **Response scope too broad** | An update that should be local instead triggers a global or large-scale recompute/re-render | A coarse-grained event (e.g. "any change") drives a broad update; missing fine-grained subscription or diffing |
| **Updates not batched/coalesced** | One operation causes multiple independent recomputes or re-renders | Multiple consecutive state updates aren't batched; async callbacks each trigger their own update |
| **High-frequency triggering** | A high-frequency event runs expensive logic every time | scroll/resize/mousemove etc. not throttled/debounced; heavy recompute on every frame or every event |
| **Backlog fires all at once** | When the main thread is busy or a queue backs up, many delayed tasks fire together | Multiple throttle/debounce timers fire at the same instant; timers/microtasks pile up |
| **Resource leak** | Memory/connections/handles keep growing and are never released | Unclosed connections, uncleared caches/timers, unremoved listeners |
| **Synchronous blocking** | The main thread or a critical path is held by a synchronous operation for a long time | Synchronous I/O, lock contention, long transactions, heavy synchronous computation |
| **Repeated/redundant computation** | The same result is recomputed repeatedly without caching | Missing memoization/caching, N+1 queries, repeated serialize/deserialize |

In a specific project this might show up as "some framework's `setState`", "some event bus's `emit`", "some RPC call", etc. — but at the abstract level they all fall into the categories above.

### Output

- The **1-2 most likely root-cause hypotheses** right now; each hypothesis must be **verifiable and falsifiable** (e.g. resolvable via "is it a full table scan?" or "what value does this variable have?" into a yes/no verdict) — avoid unverifiable statements like "the query is slow because the SQL is poorly written".
- If there are multiple hypotheses, rank them by "highest user-perceived impact + lowest verification cost", and verify the top-ranked one first.
- The **verification method** for each hypothesis: can existing logs answer it? If not, which points on which path need toggleable monitoring added (see Stage 4: Build Monitoring)? Once the root cause is confirmed, proceed to Stage 5 (Implement Optimization) to make the change, then verify the hypothesis and the optimization's effect in Stage 6 (Verify).

---

## Stage 4: Build Monitoring (性能监控)

### Goal

When existing data can't verify the hypothesis, add **toggleable, production-grade** performance observability on the critical path. The monitoring logic ships as real code and is gated by a toggle; when off it has no effect on the live product, and flipping it on enables performance monitoring for analysis.

### When Additional Monitoring Is Needed

- Existing logs/profiles don't show "who triggered it", "under what condition it was triggered", or "what a given variable's value was at the time".
- You need to compare behavior between "hypothesis true" and "hypothesis false" cases (e.g. behavior when some flag is true vs. false).
- The project doesn't yet have toggleable performance monitoring for this path, and it needs to be designed and shipped.

### Monitoring Design Principles (general)

1. **Toggle-controlled**
   Use a runtime toggle (environment variable, config center, feature flag, local debug switch, etc.) to control whether it's enabled. Default off in production, or enabled only for specific users/sessions; turn it on when investigating an issue, to avoid overhead or noise for normal users.

2. **Permanent, not temporary**
   The monitoring code is a permanent capability, not "add it to verify, then delete it". The logic stays long-term, and behavior is entirely controlled by the toggle: off means no output, no sampling, no extra overhead (or only a negligible one); on means it emits output or reports in an agreed format, aligned with existing logs/profiles.

3. **Alignable**
   Emit stable timestamps (e.g. `performance.now()` or server-side nanosecond time) and location identifiers, so output can be aligned with existing logs/profiles on the same timeline for causal and sequence analysis.

4. **Just enough information**
   Each record should include at least: a location identifier, a timestamp, and the small number of key variables needed to confirm or refute the hypothesis (e.g. which branch was hit, an ID, a count, an error code). Reuse the project's existing performance-log format where possible, to keep analysis consistent.

### Choosing Monitoring Points

- **Priority**: the suspected **direct trigger point** (e.g. the call that updates state, the call that fires the request, the entry point of the function doing the recompute).
- **Next**: intermediate nodes on the trigger chain (e.g. an event-handler entry point, a callback entry point), to confirm call order and frequency.
- **Then**: the entry/exit of the expensive computation, to confirm per-call duration and call count.

### Output

- A list of monitoring points (file:line or function/endpoint name), each with its purpose and a suggested toggle name.
- The action the user needs to take: how to enable the toggle, how to reproduce, and how to capture and provide the new logs/profile.
- If the root cause is already confirmed, or will be verified in Stage 6, proceed to Stage 5 (Implement Optimization) to make the change.

---

## Stage 5: Implement Optimization (性能优化)

### Goal

Based on Stage 3's root-cause conclusion (and Stage 4's monitoring; if the hypothesis was already verified in Stage 6, that can also inform this), implement a code- or config-level optimization that eliminates or mitigates the bottleneck. This stage only produces "changes targeting the root cause" and a change list — a multi-option evaluation or detailed task breakdown is out of scope here.

### Principles

- **Fix the root cause, not the symptom**: the change should map to the root-cause pattern identified in Stage 3 (e.g. narrow the response scope, batch updates, throttle/debounce), not a generic optimization.
- **Use monitoring for comparison**: prefer using Stage 4's toggleable monitoring to compare before/after under the same repro scenario in Stage 6, confirming the change actually worked.
- **Control-variable verification**: verify the root cause with a single-variable experiment before changing anything; each optimization should touch only one root-cause point at a time, so Stage 6 can attribute the benefit to a single change.
- **Layering and cost-effectiveness**: consider layers from high to low — business logic → application code → framework/dependency → system/hardware — preferring the upper layers; prefer solutions with "low change cost, high payoff" (e.g. simplifying logic, reusing a cache).
- **Prioritize by time-share**: optimize the segments with the highest time-share first; a segment with <10% time-share isn't worth optimizing even a 100x improvement in it barely moves the overall number, so skip it and focus on the real primary bottleneck.
- **Stability**: don't change business semantics, don't introduce functional bugs, and don't introduce new performance side effects.

### Output

- **Change list**: file, location (function/module), summary of the change.
- **Suggested verification method**: which repro scenario to use and which metrics to watch (aligned with Stage 4's monitoring), so Stage 6 can verify the optimization's effect.

---

## Stage 6: Verify (性能验证)

### Goal

1. Use new data to render a **yes/no** verdict on the hypothesis from Stage 3 (Hypothesize the Root Cause), revising the hypothesis or returning to Stage 2 (Locate the Bottleneck) if needed.
2. If Stage 5 (Implement Optimization) has been completed, use the same repro scenario and Stage 4's monitoring data to do a **before/after comparison**, confirming whether the optimization worked and whether the metrics hit the target.

### Verification Method

- For each hypothesis, state clearly "what the logs/profile should show if it's true" and "what they should show if it's false".
- Search the new logs for the corresponding pattern and check whether it matches the "true" expectation.
- If timestamps are available, align instrumentation points from different modules/layers onto the same timeline to confirm order and whether they occurred within the same task/request.
- After the optimization, compare key metrics (duration, call count, render volume, etc.) before and after under the same repro path, and state the pass criteria.
- **Effectiveness verification** (when Stage 5 has been completed):
  - **Baseline re-test**: compare full-dimension metrics under the same repro conditions and environment as before the optimization.
  - **Functional regression**: confirm normal, edge-case, and peak-load scenarios still work correctly.
  - **Side-effect check**: confirm no secondary performance issues were introduced (e.g. optimizing response time with a cache but causing memory to rise).
  - **If feasible**: do a production/canary rollout verification with real traffic to confirm the effect.

### Output

- The verdict for each hypothesis: **confirmed / refuted / still uncertain**.
- If still uncertain: state what information is still missing, and whether the next step is adding toggleable monitoring to gather more data, or re-analyzing from a different angle.
- If confirmed: summarize the root cause in a sentence or two (who, under what condition, triggered what), as input for designing and implementing the fix.
- If Stage 5 (Implement Optimization) was completed: report the before/after comparison and whether the target was met.
- **Close the loop (optional follow-up)**: once verification passes, consider folding the key metrics into standing monitoring and alerting; if there's CI/CD, consider adding a performance baseline or gate to the pipeline to prevent regression; and feed the metrics and best practices from this optimization into team conventions for continuous improvement.
- **Stop condition**: once every hypothesis has been verified and key metrics hit the target — or the cost-effectiveness of optimizing the remaining bottleneck is too low (change cost far exceeds the payoff) — this round of optimization can conclude.

---

## Output Detail Level (adaptive)

- Simple problem, ample data: can be condensed to "anomaly + causal chain + root-cause conclusion".
- Complex problem, many modules: give a brief output per stage (what was collected, main anomalies, hypotheses, monitoring-point list, optimization highlights, verification conclusion and effectiveness conclusion), attaching key log snippets or call-stack excerpts where necessary.
- When a specific tech stack is involved, fold it in conversationally for that session — don't hardcode specific tags or commands into this SKILL file.
