---
name: perf-workflow
version: '3.0.0'
user-invocable: true
description: "性能问题分析与优化工作流，共六阶段。触发词均以「性能」开头：性能分析、性能证据、性能定位、性能假设、性能监控、性能优化、性能验证、性能深入。当用户说上述词或使用「触发词： 具体描述」形式时，进入本工作流或对应阶段。 / Performance issue analysis and optimization workflow with six phases. All triggers start with 「性能」: 性能分析 / performance analysis, 性能证据 / performance evidence, 性能定位 / performance localization, 性能假设 / performance hypothesis, 性能监控 / performance monitoring, 性能优化 / performance optimization, 性能验证 / performance verification, 性能深入 / performance deep-dive. Enter this workflow or the corresponding phase when the user says any trigger word or uses the form 「trigger: specific description」."
---

# Performance Issue Analysis Workflow

## Scope of Responsibility

This workflow is responsible for **finding the root cause of performance bottlenecks**: who, under what conditions, triggered what expensive operation. Once the root cause is confirmed, a fix plan can be formulated, code/configuration optimizations implemented, and the effect verified.

Only the delivery side — how to release, gray-rollout, go-live — is outside this workflow's scope; the project decides that itself.

## Trigger Recognition

All triggers **start with 「性能」** for easy recognition and recall. When the user says a trigger word **alone** or uses the form **「trigger + colon + space + specific description」**, enter this workflow or the corresponding phase. When a colon is used, the colon and space can be either Chinese or English.

- **「性能分析」** or **「性能分析： xxx」** → Enter this workflow, starting from Phase 1 (Performance Evidence)
- **「性能证据」** or **「性能证据： xxx」** → Phase 1: Performance Evidence
- **「性能定位」** or **「性能定位： xxx」** → Phase 2: Performance Localization
- **「性能假设」** or **「性能假设： xxx」** → Phase 3: Performance Hypothesis
- **「性能监控」** or **「性能监控： xxx」** → Phase 4: Performance Monitoring
- **「性能优化」** or **「性能优化： xxx」** → Phase 5: Performance Optimization
- **「性能验证」** or **「性能验证： xxx」** → Phase 6: Performance Verification
- **「性能深入」** or **「性能深入： xxx」** → Continue or deepen analysis within Phase 2 (Performance Localization)

When the user says 「性能问题」 (performance issue), 「卡顿」 (lag/stutter), 「很慢」 (very slow), etc., this can also be treated as entering this workflow, starting from Phase 1 (Performance Evidence).
When the user provides performance-related logs or profiles and wants analysis, treat it as entering this workflow, starting from Phase 1 (Performance Evidence) or Phase 2 (Performance Localization).

---

## General Principles

**"First define the problem and break down the chain, then collect data and filter bottlenecks, drill down and derive hypotheses, control variables to verify the root cause, optimize and solidify into a closed loop."**

1. **Data-driven**: Get data first, then derive conclusions. Do not assume a problem first and then hunt for corroborating evidence. When there is no reproduction path or analyzable data, first help the user collect it (reproduction steps, logs, profiles, screen recordings, etc.).
2. **Top-down**: Start from the user-perceived full link — macro first, then micro. First identify "where it is slow" (duration/blocking/render volume, etc.), then trace back to "who triggered it" and "under what conditions".
3. **Single variable, reproducible**: A root cause hypothesis must be confirmable or rejectable via existing data or a few targeted instrumentation points. During verification, change only one variable when possible; keep it reproducible and falsifiable. Never treat correlation as causation.
4. **Full-link coverage**: Analyze the complete execution chain from the problem's starting point to its endpoint. Do not look only at local data — avoid the blind-men-and-elephant trap.
5. **Toggleable formal monitoring**: Performance observation should be designed as a **formal performance monitoring capability** that lives in the codebase, controlled by toggles (environment variables, configuration entries, feature flags, etc.). When off, it produces no output and no sampling, and does not affect the production product; when analysis is needed, flip the switch to collect data — no temporary code-then-delete cycles.
6. **No premature optimization**: Only optimize performance issues that are "confirmed by data, affect user experience, and exceed thresholds". Do not perform preventive optimization for hypothetical "possible future performance issues" without measurement data — it only introduces unnecessary code complexity and maintenance cost.

---

## Phase Transitions

Forward flow: Evidence → Localization → Hypothesis → Monitoring → Optimization → Verification.

Common transitions:
- Phase 1 finds data missing and monitoring needs to be built → can go directly to Phase 4 (Performance Monitoring), then return to Phase 2.
- Phase 2 has sufficient data and a clear bottleneck → can skip Phase 3 and go directly to Phase 4 or 5.
- Phase 6 hypothesis is rejected → return to Phase 2 or 3 to re-analyze.
- Phase 6 optimization did not meet target → return to Phase 3 to re-formulate hypotheses or to Phase 5 to adjust the optimization plan.
- Intermittent issues that are hard to capture in Phase 1 → prioritize Phase 4 to build long-term monitoring, wait for reproduction, then return to Phase 2.

---

## Phase 1: Performance Evidence (Collect Evidence)

### Goal

Obtain reproducible, analyzable performance data — not guesses based on descriptions. Transform vague "lag, slow" into quantifiable metrics and a performance baseline, and clarify the optimization target and the non-negotiable red line.

### Information to Clarify

- **Symptom**: Which operation is slow (click, scroll, input, drag, API request, etc.)? What does the slowness look like (stutter, blank screen, spinner, no response)? Try to **quantify** (e.g., P99 ms of an API, frame rate/duration of an operation), and clarify the **analysis boundary** (start and end of the problem, to avoid unbounded scope).
- **Data form**: Are there existing logs, Performance/CPU profiles, network captures, custom instrumentation? If not, first determine "in which environment, using which method" data can be collected.
- **Reproduction conditions**: Always reproducible or intermittent? Any data volume / concurrency / device requirements?

### Common Data Sources (Choose by Scenario)

| Scenario | Optional Data Sources |
| --- | --- |
| Frontend stutter / main thread blocking | Console logs, Chrome Performance recording, Long Task / custom performance monitoring |
| Excessive rendering / expensive repaint | Framework render stats, React DevTools Profiler, custom commit/render instrumentation |
| Slow API / backend | Network panel, server logs, APM, trace |
| Memory / leak | Heap snapshot, memory trend chart |

Not limited to specific tech stacks — choose based on the project's actual monitoring and tools.

### Output

- Clarify "data already in hand" vs. "what is still missing".
- If data is missing: provide "operations the user needs to perform" and "content to collect" (e.g., reproduction steps, turn on a toggle then reproduce and export console/profile).
- **Recommended output includes**: symptom (with quantified metrics), reproduction conditions, analysis boundary, current performance baseline, target threshold or red line. Can be organized into a structured "Performance Issue Definition Sheet" for downstream alignment.

---

## Phase 2: Performance Localization (Analyze and Localize)

### Goal

Find **anomalies** in the raw data (who spent how much time/resources, and when), and **trace the trigger chain** (event / call stack / data flow). Build a full-link topology from start to end, do an initial bottleneck screen via dual-dimension data (time + resources), and narrow the analysis scope to 1–2 core segments.

### Analysis Approach (General)

- **Full-link topology**: Decompose, in execution order, every segment from the user action to the problem endpoint (code execution, system calls, network/storage, etc.) into a non-overlapping, full-coverage topology. Each segment can be timed independently and has clear inputs and outputs.
- **Dual-dimension collection**: Time dimension (duration of each segment, share of full link) + Resource dimension (CPU/memory/IO/network, etc.). Both are indispensable.
- **Bottleneck initial screen**: Lock high-duration segments by duration share (e.g., >20%); lock anomalous segments by resource anomalies (saturation, sustained rise, error rate). Segments with low duration and normal resources are excluded first. Resource utilization above 70% is a common alarm line — above this threshold, response time often rises non-linearly, so prioritize investigation even if absolute values look fine.

1. **Find anomalies**
   In the timeline or aggregate statistics, identify obviously large metrics, e.g.:
   - Tasks/requests whose single duration exceeds a threshold (e.g., main thread task >50ms, >200ms);
   - Abnormally large single processing volume (e.g., one update affecting a large number of nodes, one request returning a huge payload);
   - Abnormally high frequency (e.g., an event fires far more often than expected).

2. **Locate position**
   For each anomaly, determine:
   - Which layer it occurs in (frontend / backend / network / storage);
   - The corresponding code or module (file, function, component, API);
   - The call stack or event chain (from the user action or entry point to that time/resource consumption point).

3. **Build causal chain**
   String it together as "user action → event/request → handler → expensive operation → observed metric", so you do not end up seeing only the symptom without the trigger condition.

### Operation Methods

- For **text logs**: use search (grep/ripgrep, etc.) to filter by keyword, duration, error code, etc., then read the key fragments and call stacks.
- For **profiles**: first look at "wide bars" or "high-share" regions on the timeline or flame graph, then drill down to specific functions/components.
- For **code**: read the code, search call relationships, and combine with stack information from logs to clarify "who called whom, under what condition".

### Output

- **Anomaly summary**: where it is slow / high-volume / high-frequency, with approximate locations.
- **Causal chain**: one or two sentences, or a simple diagram, describing "action → … → bottleneck".
- **Hypotheses to verify** (initial directions): list 1–3 "possible root cause" hypothesis directions, and state what evidence each hypothesis needs in order to be confirmed or rejected. Refinement and categorization happens in Phase 3 (Performance Hypothesis).
- **Core bottleneck segment list**: 1–2 segments, with duration share or resource anomaly summary.

### Known Performance Pattern Quick Search (Optional, triggered when localization is stuck)

When any of the following is true, use WebSearch to search for known cases before entering Phase 3:
- The anomaly has been localized, but **cannot be categorized into a known pattern** (all entries in the "Common Patterns" table above have been ruled out, and no root cause direction is found);
- It involves **performance behavior of a specific framework/library** (e.g., a specific React version, a specific database driver, a specific ORM), suspected to be a known bug or limitation of that framework.

> 🔌 If the `effective-web-research` skill is available, the WebSearch in this step should follow its research discipline — first run Step 0 triage (confirm it is an external problem, not solvable via internal code), then apply the 4 maxims (official sources first / check recency / non-trivial dual-source cross-validation / avoid content farms). When the user requests strict research, switch to its strict mode and emit a report. When the skill is unavailable, follow the original WebSearch flow.

Execution: search with "symptom description + framework/library name + version + year"; prioritize GitHub Issues, official changelogs, and StackOverflow.

| Search conclusion | Handling |
| --- | --- |
| ✅ Found a known case or version bug | List the known solution directly as a Phase 5 candidate; Phase 3 focuses on verifying that direction |
| ⚠️ Found related discussion but no conclusion | Fold it in as a hypothesis direction in Phase 3 |
| ❌ Not found | Skip silently and enter Phase 3 normally |

---

## Phase 3: Performance Hypothesis (Root Cause Hypothesis)

### Goal

Distill the "anomalies + trigger chain" into verifiable **root cause hypotheses**, and categorize them into common performance problem patterns for easier downstream instrumentation and fix. Hypotheses must be verifiable and falsifiable — vague guesses are forbidden. Industry methodologies can be used for categorization (see below).

### Root Cause Derivation Reference

- **USE Method** (resource bottlenecks): judge whether resource saturation is the cause from three dimensions — utilization, saturation, error rate (e.g., CPU/memory/IO/network).
- **RED Method** (execution/request bottlenecks): judge whether it is an execution-logic or call-chain issue from three dimensions — request rate, error rate, duration.

Use these in conjunction with the "Common Patterns" table below; specific steps are not expanded here.

### Common Patterns (Technology-Agnostic Description)

| Pattern | Characteristics | Typical Trigger |
| --- | --- | --- |
| **Response scope too large** | Should be a local update, but triggers global or large-scale recompute / re-render | Coarse-grained events (e.g., "any change") drive wide-range updates; lack of fine-grained subscription or diff |
| **Updates not merged / cascaded** | One operation causes multiple independent recomputes or re-renders | Consecutive state updates not batched; async callbacks each triggering updates |
| **High-frequency triggering** | High-frequency event runs expensive logic every time | scroll / resize / mousemove, etc. not throttled/debounced; recompute on every frame or every event |
| **Backlog concentrated execution** | Main thread busy or queue backlog, multiple delayed tasks fire at once | Multiple throttle/debounce handlers firing at the same moment; timer/microtask backlog |
| **Resource leak** | Memory / connections / handles grow continuously without release | Unclosed connections, uncleared cache/timers, unbound listeners |
| **Synchronous blocking** | Main thread or critical path held by a synchronous operation for a long time | Synchronous I/O, lock contention, long transaction, large synchronous computation |
| **Duplicate / redundant computation** | Same result recomputed repeatedly without caching | Missing memo/cache, N+1 queries, repeated serialization/deserialization |

In a specific project these may show up as "a framework's setState", "a bus's emit", "an RPC", etc., but at the abstract level they all fall into the above categories.

### Output

- The most likely **1–2 root cause hypotheses**. Each hypothesis must be **verifiable and falsifiable** (e.g., a yes/no answer obtainable from "is there a full table scan" or "what value some variable takes"). Avoid unverifiable statements like "the query is slow because the SQL is poorly written".
- If there are multiple hypotheses, rank by "largest user-perceived impact + lowest verification cost", and verify the higher-ranked ones first.
- **Verification method** for each hypothesis: can existing logs determine it? If not, on which path and with which toggleable monitoring points should be added (see Phase 4 (Performance Monitoring)). Once the root cause is confirmed, enter Phase 5 (Performance Optimization) to implement the change, then verify the hypothesis and the optimization effect in Phase 6 (Performance Verification).

---

## Phase 4: Performance Monitoring (Build / Supplement Toggleable Monitoring)

### Goal

When existing data cannot verify a hypothesis, add **toggleable, formal** performance observation on the critical path. Monitoring logic is checked in as production code and is controlled by toggles for enable/disable. When off, it does not affect the production product; when analysis is needed, flip the switch to do performance monitoring.

### When to Supplement Monitoring

- Existing logs/profiles cannot show "who triggered it", "under what condition it was triggered", or "what value some variable had at that moment".
- Need to compare "when the hypothesis holds" vs. "when it does not" (e.g., behavior when a flag is true vs. false).
- The project does not yet have toggle-based performance monitoring for that path and needs to design and land one.

### Monitoring Design Principles (General)

1. **Toggle control**
   Use a runtime toggle (environment variable, config center, feature flag, local debug switch, etc.) to control whether it is enabled. Default off in production or formal environments, or only on for specific users/sessions; turn on only when analyzing, to avoid overhead or noise for normal users.

2. **Resident code, not temporary**
   Monitoring code is part of the formal capability. Do not use "add, verify, then delete". The logic stays long-term; behavior is fully determined by the toggle: off → no output, no sampling, no extra overhead (or only minimal); on → output or report in the agreed format, easy to align with existing logs and profiles.

3. **Alignable**
   Emit stable timestamps (e.g., `performance.now()` or server-side nanosecond time) and location identifiers, so they can be aligned with existing logs/profiles on the same timeline for causal and ordering analysis.

4. **Sufficient information**
   Each record contains at least: a location identifier, a timestamp, and a few key variables that can verify/reject the hypothesis (e.g., whether some branch was hit, an ID, a count, an error code). The format can reuse the project's existing performance log spec for unified analysis.

### Monitoring Point Location Selection

- **Priority**: the suspected "direct trigger point" (e.g., the call that updates state, the call that initiates the request, the function entry that runs the recompute).
- **Next**: intermediate nodes on the trigger chain (e.g., event handler entry, callback entry), to confirm call order and frequency.
- **Then**: entry/exit of expensive computations, to confirm per-call duration and call count.

### Output

- A list of monitoring points (file:line or function/API name), with the purpose of each and the recommended toggle name.
- Operations the user needs to perform: how to turn on the toggle, how to reproduce, how to collect and provide new logs / new profiles.
- If the root cause is confirmed, or will be verified in Phase 6, enter Phase 5 (Performance Optimization) to implement the change.

---

## Phase 5: Performance Optimization (Implement Optimization)

### Goal

Based on the Phase 3 root cause conclusion (and Phase 4 monitoring; if the hypothesis was already verified in Phase 6, fold that in too), implement code- or configuration-level optimizations to eliminate or alleviate the bottleneck. This phase only does "changes targeting the root cause" and the change list — multi-option evaluation or detailed task breakdown is not expanded here.

### Principles

- **Change for the root cause**: changes should map to the root cause pattern summarized in Phase 3 (e.g., narrow response scope, merge updates, throttle/debounce, etc.); avoid blanket optimization.
- **Use monitoring for comparison**: prefer the Phase 4 toggleable monitoring, and in Phase 6 use the same reproduction scenario to do a before/after comparison to confirm the change actually took effect.
- **Single-variable verification**: verify the root cause via a single-variable experiment before changing; each optimization should ideally touch only one root cause point, to make per-solution benefit verification easy in Phase 6.
- **Layering and cost-effectiveness**: consider business logic → application code → framework/dependency → system/hardware, high to low, and prefer upper layers. Prioritize "low transformation cost, high benefit" solutions (e.g., logic simplification, cache reuse).
- **Duration-share first**: prioritize optimizing high-duration-share segments. A segment with <10% duration share — even if optimized 100x — yields very limited overall benefit; skip it and focus on the real main bottleneck.
- **Stability**: do not change business semantics, do not introduce functional bugs, do not produce new performance side effects.

### Output

- **Change list**: file, location (function/module), key points of the change.
- **Recommended verification method**: which reproduction scenario to use, which metrics to observe (aligned with Phase 4 monitoring), to make Phase 6 optimization-effect verification easy.

---

## Phase 6: Performance Verification (Verify Hypothesis and Optimization Effect)

### Goal

1. Use the new data to make a **yes/no** judgment on the Phase 3 (Performance Hypothesis) hypotheses; revise the hypothesis or return to Phase 2 (Performance Localization) if needed.
2. If Phase 5 (Performance Optimization) has been completed, use the same reproduction scenario and Phase 4 monitoring data to do a **before/after comparison**, verify whether the optimization took effect, and whether metrics hit the target.

### Verification Methods

- For each hypothesis, spell out "if it holds, what should be seen in the logs/profiles" and "if it does not hold, what should be seen".
- Search or locate the corresponding pattern in the new logs and see whether it matches the "holds" expectation.
- If timestamps are available, align instrumentation across modules/layers onto the same timeline, and confirm ordering and whether they fall inside the same task/request.
- After optimization, compare key metrics (duration, call count, render volume, etc.) before vs. after under the same reproduction path, and state the bar for "meets target".
- **Effect verification** (applicable once Phase 5 is done):
  - Baseline re-test: compare all-dimension metrics under the same reproduction conditions and environment as before optimization.
  - Functional regression: confirm correct behavior under normal, boundary, and extreme load scenarios.
  - Side-effect check: confirm no secondary performance issues (e.g., using a cache to optimize response time but causing memory to rise).
  - If conditions allow: do online/gray verification and use real traffic to confirm the effect.

### Output

- Conclusion per hypothesis: **holds / does not hold / still uncertain**.
- If still uncertain: state what information is still missing, and whether the next step is to add more toggleable monitoring and collect data again, or to change the angle of analysis.
- If it holds: summarize the root cause in one or two sentences (who, under what condition, triggered what), as input for the subsequent fix plan and implementation.
- If Phase 5 (Performance Optimization) was done: output the before/after comparison conclusion and whether the target was met.
- **Closed-loop solidification (optional extension)**: after verification passes, recommend folding key metrics into routine monitoring and alerting; if CI/CD exists, add a performance baseline or gate to the pipeline to prevent regression; precipitate the metrics and best practices from this round into team conventions to drive continuous iteration.
- **Termination condition**: if all hypotheses have been verified, key metrics have met target, or the cost/benefit of optimizing the remaining bottleneck is too low (transformation cost far exceeds the benefit), this round of optimization can be closed.

---

## Output Detail Control (Adaptive)

- Simple problem, sufficient data: can be compressed to "anomaly + causal chain + root cause conclusion".
- Complex problem, multiple modules: each phase outputs a short note (what was collected, main anomalies, hypotheses, monitoring point list, optimization key points, verification conclusion and optimization-effect conclusion), with key log fragments or call-stack summaries attached when necessary.
- When a specific tech stack is involved, explain it in the current conversation in combination with the project; do not hardcode specific tags or commands in this SKILL.
