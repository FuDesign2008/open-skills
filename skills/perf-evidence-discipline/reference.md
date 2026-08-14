# Performance Evidence Discipline — Case Archive

Full battle-tested cases behind each discipline in [SKILL.md](SKILL.md). All cases come from one anonymized source campaign: a large web rich-text editor (React 16 codebase, driven through a browser debugging protocol) taken through a complete optimize-and-attribute loop (benchmark construction → 4 optimizations → four-path user-jank attribution → two special assessments). Numbers are real; project identifiers are stripped.

> Extension placeholder: cases from other stacks (native, server, compile-time) should be appended per discipline as they are validated in practice — the disciplines are platform-agnostic; the cases need not be.

## Discipline 1 — Environment-throttling artifacts

**Case (resize workload, controlled browser)**

- Symptom: first-version resize "frame latency" read ~728ms average, with a bimodal ~700-850ms distribution across resize rounds.
- Root cause: the automation browser's window was occluded; Chromium's background throttling clamps rAF to ~800ms and timers toward 1Hz. `bringToFront` and focus emulation did not lift it — occlusion is an OS window state.
- Detection: JS-profiler sampling during the "long frames" showed 99.9% idle → environmental, not product work.
- Correct method: same-task stimulus + measurement — change container width, then immediately force a synchronous layout read in the same JS task. The browser has no opportunity to complete layout in between.
- Result: 300-paragraph reflow measured ~9ms (and ~18ms at 600 paragraphs) — the throttled number was an ~80x artifact.
- Spillover: any span whose end boundary is a rAF callback contains throttled frames; phase conclusions must use synchronous spans + long tasks (see discipline 6).

## Discipline 2 — Monitor self-pollution

**Case (document-open workload)**

- Symptom: dev build (with render instrumentation + unminified code) showed a full-render burst of 745ms; production build of the same load showed 157ms (~4.7x).
- Root cause: the monitor walked the entire fiber tree on every commit (per-commit overhead), plus unminified code paths.
- Rule adopted: dev caliber is for relative A/B only; every optimization decision and acceptance number uses production caliber (production server mode + probe production flag).
- Cross-check habit: when monitor-caliber and browser-native long-task numbers disagree, the browser-native number wins — zero caliber pollution by construction.

## Discipline 3 — Framework counter ambiguity

**Case ("13,420 component renders per keystroke")**

- Symptom: a self-built render counter reported 13,420 components rendered per keystroke on a 2000-paragraph document — while the same window recorded only 2 long tasks (61ms + 53ms). If ~13k renders were real, ~15 long tasks should appear.
- Root cause (React 16 fiber audit): (a) fibers bailed out of rendering carry `alternate === null`, easily misread as mounts; (b) the `effectTag` "performed work" bit is not cleared when a fiber is reused via bailout, so a full-tree DFS re-counts stale bits on every commit.
- Outcome: an "SCU fully bypassed, architecture-wide penetration" conclusion drafted from the counter was withdrawn before any optimization was built on it; the real suspects (2 spike commits out of 19) were re-investigated instead.
- Generalized rule: any self-built statistic gets one small-scale audit (cross-reconcile mounts vs performed vs total against a native metric) before first use; counters are trend signals, not conviction evidence.

## Discipline 4 — Device-profile calibration

**Case (scroll attribution, conviction matrix)**

- Setup: CPU throttling via the debugging protocol's emulation domain; matrix of throttle (1x/8x/20x) × path × document scale; scrolling driven by real wheel events.
- Results on a 2000-paragraph document: 1x → 0 long tasks; 8x → 18 long tasks / 1089ms total blocking; 20x → 47 long tasks / 6282ms. On 300 paragraphs at 20x → 11 / 939ms.
- Companion path: typing under 8x and 20x → 0 long tasks (acquitted). Same machine, same loads — the verdict flips with the throttle cell.
- Profiler reading under conviction conditions: named JS functions totaled <120ms while `(program)` + GC dominated → blocking lived in the browser render pipeline (layout/style/paint/GC), not product JS (see discipline 8 for the follow-up).

## Discipline 5 — Input-event authenticity

**Case (synthetic keyboard)**

- Symptom: protocol-level key dispatch reported success for 40 keys; zero characters reached the document.
- Root cause: the dispatched events took an event path that never entered the editor's text-processing chain.
- Correct drivers: text via the host's native typing API; IME via a composition-capable protocol API; scrolling via real wheel events (programmatic `scrollBy` does not exercise the full scroll pipeline).
- Rule adopted: after every input load, assert content delta == intended change (document length delta == characters sent). No delta → the load is void, whatever the driver reported.

## Discipline 6 — Instrumentation toggle lifecycle

**Case (toggle read at module load)**

- Symptom: setting the debug toggle in storage after page load produced no instrumentation output.
- Root cause: the toggle was read exactly once at module-load (constructor-time evaluation); later changes are invisible.
- Fix: inject toggles through the debugging protocol's evaluate-on-new-document capability so they exist before any page script runs.
- Related caliber rule: open-phase spans terminated by rAF callbacks contained one/two ~800ms throttled frames (~1000ms/~2000ms signatures in the controlled environment) — phase conclusions switched to synchronous spans (deserialize/load-data phases) + long-task counts, which are immune to rAF throttling.

## Discipline 7 — Single-sample extrapolation ban

**Case (note-size profile)**

- Event: local single-account statistics (2,596 notes, 96.1% <10KB, one >100KB) were used to argue against large-document optimization.
- Rebuttal: field evidence from the product side — years of continuous jank complaints plus users routinely holding tens-of-thousands-of-character notes (~1000-3000 paragraph class).
- Correction: test scale re-aligned to the field class; the large-document attribution work that followed located the real user-facing problem (scroll-path blocking under throttle, disciplines 4 and 8).
- Rule: developer data is not a user profile; negative-ROI conclusions require user-profile evidence (aggregate telemetry, support feedback, field data).

## Discipline 8 — Ultimate control experiment

**Case (scroll blocking: physical cost vs product code)**

- Question: profiler showed no JS hotspot (`(program)` dominant) — is the blocking product code cost or the physical cost of DOM scale?
- Experiment: clone the live editor DOM (~11,363 nodes) into a static overlay — zero framework, zero editor logic, same injected styles — and run the same wheel-scroll load under the same 8x throttle.
- Reading: static copy 792ms vs live editor 1089ms (same order) → the bulk is base rendering cost of DOM scale × style environment; product-code margin ~30%. Optimization direction shifted from "find the code hotspot" to "cut base rendering cost" (style scoping, containment exclusion, virtualization), with the difference (≈300ms) as the ceiling of code-level gains.
- Ablation rider: manually activating the project's dormant big-document optimization (a content-visibility mechanism, gated off by a size threshold in normal operation) made scrolling 1089ms → 7139ms — a negative optimization (collapse/expand double layout + estimated-size jitter). "Mechanism exists" ≠ "mechanism works".

## Discipline 9 — Negative results and caliber corrections leave traces

**Case (three invalidation rows in one campaign)**

- Row 1: resize rafMs ~728ms — invalid, environment throttling artifact; correct caliber: same-task synchronous measurement (~9ms).
- Row 2: open-phase dev burst 745ms — invalid for decisions; correct caliber: production 157ms.
- Row 3: "13,420 renders per keystroke" — invalid, counter artifact; correct reading: 2 spike commits out of 19.
- Each row lives in the benchmark log next to the data it invalidates, with reason and correct caliber, so later readers cannot cite the contaminated numbers by accident. The campaign's durable output includes what it excluded, not only what it found.

## Generic detection toolkit (platform-agnostic intents)

| Intent | Typical realization |
|--------|--------------------|
| Distinguish throttling artifact from real long task | JS-profiler sampling during the suspect window (idle-dominant ⇒ artifact) |
| Same-task stimulus + measurement | Mutate, then force a synchronous layout read in the same JS task |
| CPU-throttle matrix | Debugging protocol CPU-throttling emulation (1x/8x/20x) × path × scale |
| Native-metric cross-check | Browser long-task observer vs any self-built counter |
| Early toggle injection | Debugging protocol evaluate-on-new-document, before page scripts |
| Input authenticity assert | Content-length delta == intended change, after every load |
| Static-copy control experiment | `cloneNode(true)` into a style-identical overlay, same load, same throttle |
| Invalidation warning row | Benchmark log row: what/why/correct caliber |
