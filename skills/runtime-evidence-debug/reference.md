# Runtime Evidence-Driven Debugging — Framework Reference

> Companion to [SKILL.md](SKILL.md). This file holds the detailed framework entries (author, year, method, source), instrumentation code templates, and blocking criteria. All examples use generic placeholders.

## Contents

1. [Framework entries](#framework-entries)
2. [Instrumentation code templates](#instrumentation-code-templates)
3. [Blocking / non-blocking criteria](#blocking--non-blocking-criteria)
4. [Framework source index](#framework-source-index)

---

## Framework entries

### 1. Scientific debugging / Delta debugging

- **Framework**: Andreas Zeller, *Why Programs Fail: A Guide to Systematic Debugging* (2009, 2nd ed. 2022).
- **Contribution**: Applies the scientific method (hypothesis → experiment → observation → conclusion) to debugging; introduces delta debugging for automatic failure-inducing input minimization.
- **Core method**:
  1. Formulate a hypothesis about what causes the bug
  2. Design an experiment (instrumentation point) that would confirm or falsify the hypothesis
  3. Observe the result
  4. If confirmed → root cause found. If falsified → refine hypothesis and repeat.
  5. (Advanced) Delta debugging: systematically reduce the input/change-set to the smallest subset that still triggers the failure
- **Why it matters**: Prevents "fishing expedition" debugging — every instrumentation round is a controlled experiment with a clear pass/fail, not a random log dump.
- **Source**: [whyprogramsfail.com](https://www.whyprogramsfail.com/)

### 2. Observability triad

- **Framework**: Charity Majors et al., *Observability Engineering* (2022); Cindy Sridharan, *Distributed Systems Observability* (2018).
- **Contribution**: Three complementary signals for understanding runtime behavior — metrics, traces, logs — each answering a different question.
- **The triad**:
  - **Metrics** (numerical time-series): "what is happening?" — counters, gauges, histograms. Good for detecting anomalies and trends.
  - **Traces** (distributed request paths): "where is time spent?" — spans across service boundaries. Good for latency and cross-service issues.
  - **Logs** (structured event records): "what happened at this moment?" — discrete events with context. Good for root-cause drilling.
- **For AI-agent debugging**: logs (`console.log` / `print`) are the primary tool because the AI can read them directly. Metrics and traces are useful when the project already has them (Prometheus, Jaeger, etc.) — ask the user to check existing dashboards before adding new instrumentation.
- **Sources**: [Observability Engineering (O'Reilly)](https://www.oreilly.com/library/view/observability-engineering/9781492076726/)

### 3. Structured logging best practices

- **Framework**: OpenTelemetry semantic conventions (CNCF, 2019–present); Brian Kernighan, *Software Tools* (1976) — the origin of "printf debugging."
- **Contribution**: Standards for instrumentation that produces useful, correlatable output.
- **Best practices**:
  1. **Structured, not string**: `console.log('[DEBUG-auth]', { userId, hasToken })` not `console.log('user ' + userId + ' token ' + hasToken)`. Structured output is parseable and filterable.
  2. **Position identifier**: every log line starts with a location tag (`[DEBUG-<function-name>]`) so you can trace which instrumentation point produced it.
  3. **Semantic conventions**: use standard attribute names when they exist (`http.method`, `db.system`, `enduser.id`) so logs correlate with traces if the project uses OpenTelemetry.
  4. **Timestamps**: include `Date.now()` or equivalent — timing data is critical for race conditions and performance bugs.
  5. **Minimal noise**: log the variables your hypothesis concerns, not all variables. More data ≠ better — noise hides signal.
- **Source**: [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/)

### 4. Minimum Reproducible Example (MRE / MCVE)

- **Framework**: Stack Overflow MCVE methodology; Benjamin C. Haller, *Ten Simple Rules for Reporting a Bug*, PLOS Computational Biology (2022).
- **Contribution**: The discipline of reducing a bug to its smallest reproducing case — smaller reproduction = faster debugging.
- **Core method**:
  1. Start with the full reproduction
  2. Remove one element at a time (a feature, a dependency, a configuration)
  3. Test after each removal — does it still reproduce?
  4. Stop when removing anything else stops the reproduction
  5. The remaining minimal case is your MRE
- **Why it matters**: A 500-line reproduction with 20 dependencies produces noisy logs and slow iteration. A 20-line MRE produces clean, fast, unambiguous evidence.
- **Sources**: [Stack Overflow MCVE help](https://stackoverflow.com/help/minimal-reproducible-example) · [Haller 2022 (PLOS)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9562159/)

### 5. Evidence hierarchy

- **Concept**: Not all evidence is equal. Debugging conclusions should be weighted by the strength of the evidence behind them.
- **The hierarchy** (strongest to weakest):
  - **Tier 1 — Runtime observation**: direct observation via debugger, profiler, DevTools, or pixel sampling. "I watched the variable hold `null` at line 42."
  - **Tier 2 — Log output**: instrumented logging confirms a specific execution path or value. "The log shows `[DEBUG-auth]` fired with `hasToken: false`."
  - **Tier 3 — Code inference**: reading source code and inferring what should happen. "The code says `if (token) return true`, and token is set earlier, so it should return true."
  - **Tier 4 — Assumption/guess**: reasoning without direct code or runtime support. "It's probably the cache because cache issues are common."
- **The rule**: a root cause at Tier 1–2 is "confirmed." A root cause at Tier 3 is "suspected" — needs runtime upgrade. A root cause at Tier 4 is "hypothesis" — needs both code reading AND runtime evidence.

### 6. Confidence calibration (Bayesian reasoning)

- **Concept**: Bayesian reasoning applied to debugging — prior confidence + new evidence = posterior confidence.
- **How it works**:
  1. **Prior**: before adding instrumentation, estimate confidence in each hypothesis (e.g., H1: 60%, H2: 30%, H3: 10%)
  2. **Evidence**: add instrumentation designed to distinguish between hypotheses
  3. **Update**: if the evidence confirms H1, raise its probability; if it falsifies H1, redistribute to H2/H3
  4. **Threshold**: when one hypothesis exceeds ~80% confidence, it is safe to act. Below that, keep gathering evidence.
- **Practical signal**: if you can articulate "I am confident because [specific runtime evidence shows X]" — you have high confidence. If you can only say "I think it's probably X" — you are at low confidence and should not act yet.

### 7. Git bisect (binary search debugging)

- **Framework**: Git project, `git bisect` (Linus Torvalds et al., 2005–present).
- **Contribution**: Automated binary search through commit history to isolate the exact commit that introduced a regression.
- **Core method**:
  1. `git bisect start` — begin the session
  2. `git bisect bad` — mark the current (broken) commit
  3. `git bisect good <known-working-commit>` — mark a known good commit
  4. Git checks out the midpoint → test it → `git bisect good` or `git bisect bad`
  5. Repeat until git identifies the single introducing commit
  6. `git bisect reset` — end the session
- **When to use**: the problem is a regression (it used to work, now it doesn't) and you have a known-working commit to start from. Especially powerful for bugs that are hard to instrument directly — the diff itself is the evidence.
- **Source**: [git bisect docs](https://git-scm.com/docs/git-bisect)

### 8. Heisenbug handling

- **Concept**: A Heisenbug is a bug that changes or disappears when you try to observe it (e.g., adding `console.log` changes timing and masks a race condition). Named after the Heisenberg uncertainty principle.
- **Detection signals**:
  - The bug stops reproducing when you add logging, and returns when you remove it
  - The bug only appears in release builds, not debug builds (or vice versa)
  - The bug is intermittent and seemingly random
- **Handling strategies**:
  1. **Minimize observation footprint**: use fewer, more strategic instrumentation points to reduce timing impact
  2. **Use non-intrusive observation**: debugger breakpoints with conditional triggers; external monitoring (network capture, screenshot pixel sampling) that does not modify the code path
  3. **Reproduce in a different layer**: if code-layer instrumentation masks the bug, observe from the platform layer (DevTools network tab, OS-level tracing)
  4. **Stress testing**: increase concurrency or reduce delays to make timing-sensitive bugs more reproducible
  5. **Accept uncertainty**: if the bug is truly non-deterministic, document the conditions and add defensive logging that stays in production, then wait for the next occurrence

### 9. Blameless postmortem (fix verification + learning)

- **Framework**: Google SRE, *Site Reliability Engineering*, "Postmortem Culture" (2016).
- **Contribution**: After a fix, document what happened without blame — focusing on systemic causes and action items.
- **Core elements**:
  1. **Summary**: what was the impact?
  2. **Timeline**: when did it start, when was it detected, when was it resolved?
  3. **Root cause**: the systemic mechanism (not "someone made a mistake" — why did the system allow the mistake?)
  4. **Action items**: what will change to prevent recurrence? (tests, monitoring, code review checklist)
  5. **What went well / what went wrong**: in detection, response, and resolution
- **For AI-agent debugging**: after a complex debug session, a lightweight postmortem (root cause + prevention action item) is the output of Phase 7 fix verification + the workflow's retrospective phase.

### 10. Auxiliary root-cause tools

- **5 Whys** (Sakichi Toyoda, Toyota Production System, 1930s): iterative "why" questioning — ask "why did this happen?" 5 times to peel from symptom to systemic cause. Useful when the root cause chain is deeper than one level. Limitation: can diverge into subjective causal chains.
- **Kepner-Tregoe problem analysis** (Kepner & Tregoe, *The Rational Manager*, 1965): structured Is/Is Not matrix — define what the problem IS (what, where, when, extent) and what it IS NOT (what could be happening but isn't). Narrows the hypothesis space by eliminating what does not match.
- **Rubber duck debugging** (derived from *The Pragmatic Programmer*, Hunt & Thomas, 1999): explain the problem step-by-step to an inanimate object. The act of narration surfaces hidden assumptions. Relevant to AI agents: the AI's own analysis output IS a form of structured narration — reading it back critically can surface gaps.

---

## Instrumentation code templates

Templates for common languages. Adapt the structure (position identifier + key variables + timestamp) to the project's conventions.

### JavaScript / TypeScript (browser / Node.js)

```javascript
// At a hypothesis-targeted point:
console.log('[DEBUG-<function-name>]', {
  keyVar: value,           // the variable your hypothesis concerns
  state: this.currentState, // relevant state
  timestamp: Date.now()
});
```

### Python

```python
# Standard logging (preferred over print in production code):
import logging
logger = logging.getLogger(__name__)
logger.debug('[DEBUG-<function_name>] key_var=%s state=%s ts=%s', key_var, state, time.time())
```

### Java / Kotlin

```java
// Use SLF4J or project logger:
log.debug("[DEBUG-{}] keyVar={} state={} ts={}", "functionName", keyVar, state, System.currentTimeMillis());
```

### Instrumentation placement guide

| Hypothesis type | Where to instrument | What to observe |
|----------------|-------------------|-----------------|
| "Function not reached" | Function entry | Was the log emitted? |
| "Wrong branch taken" | Before the branch + inside each branch | Which branch's log appeared? |
| "Variable has wrong value" | At every assignment to the variable | What value, from what source? |
| "Timing/race condition" | At the start and end of each competing operation | Timestamps — which finishes first? |
| "Data corrupted in transit" | At sender + at receiver | Does the value match? |
| "External service returns unexpected" | Before and after the external call | Request payload + response payload |

---

## Blocking / non-blocking criteria

### Blocking (must resolve before proceeding to fix)

- Root cause is at **Tier 3 (code inference) or Tier 4 (assumption)** — no runtime evidence has been gathered. → Must add instrumentation and reproduce.
- Confidence is **"fuzzy" or "unknown"** after instrumentation. → Must escalate to escape hatch (Phase 6) or gather more evidence.
- The problem **cannot be reproduced** — no runtime evidence is possible. → Must establish reproduction before proceeding.
- A **Heisenbug** is suspected (instrumentation changes behavior) but the strategy has not been adjusted to non-intrusive observation.
- **Fix verification was skipped** — the fix was declared correct by reading code, not by reproducing with the same steps.

### Non-blocking (note as recommendation, do not block)

- The root cause is at Tier 1–2 but an alternative hypothesis was not fully falsified. → Document the remaining uncertainty; proceed if confidence is high enough to act.
- Instrumentation was not cleaned up (temporary `console.log` left in code). → Note for cleanup; does not block the fix itself.
- A postmortem was not written. → Recommend one for complex bugs, but do not block simple fixes.

---

## Framework source index

| # | Framework | Author | Year | Source |
|---|-----------|--------|------|--------|
| 1 | Scientific debugging / Delta debugging | Andreas Zeller | 2009/2022 | *Why Programs Fail* |
| 2a | Observability Engineering | Charity Majors et al. | 2022 | O'Reilly |
| 2b | Distributed Systems Observability | Cindy Sridharan | 2018 | O'Reilly |
| 3 | OpenTelemetry semantic conventions | CNCF | 2019–present | opentelemetry.io |
| 4 | MCVE / MRE methodology | Stack Overflow; Haller | 2022 | SO help / PLOS |
| 5 | Debugging by printf | Brian Kernighan | 1976 | *Software Tools* |
| 6 | Git bisect | Git project | 2005–present | git-scm.com |
| 7 | Blameless postmortem | Google SRE | 2016 | sre.google |
| 8 | 5 Whys | Sakichi Toyoda | 1930s | Toyota Production System |
| 9 | Kepner-Tregoe problem analysis | Kepner & Tregoe | 1965 | *The Rational Manager* |
| 10 | Rubber duck debugging | Hunt & Thomas | 1999 | *The Pragmatic Programmer* |
