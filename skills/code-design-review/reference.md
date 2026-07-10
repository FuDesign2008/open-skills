# Code Design Review — Framework Reference

> Companion to [SKILL.md](SKILL.md). This file holds the detailed framework entries (author, year, method, thresholds, source) and the full blocking/non-blocking criteria. All examples use generic placeholders — no internal identifiers.

## Contents

1. [Layer A — Code-level design metrics](#layer-a--code-level-design-metrics)
2. [Layer B — Architecture-level quality attributes](#layer-b--architecture-level-quality-attributes)
3. [Layer C — Security pass](#layer-c--security-pass)
4. [Full blocking / non-blocking criteria](#full-blocking--non-blocking-criteria)
5. [Framework source index](#framework-source-index)

---

## Layer A — Code-level design metrics

These apply to every code change. Each item has a named framework behind it.

### 1. Accidental complexity

- **Framework**: Fred Brooks, *No Silver Bullet: Essence and Accidents of Software Engineering*, 1986 (UNC Computer Science Technical Report).
- **What it evaluates**: Whether the solution introduces complexity that does not map to the problem's inherent (essential) complexity — indirection, configuration layers, premature abstraction.
- **How to apply on a proposed change**:
  1. For each new abstraction / layer / config mechanism the solution introduces, ask: "What current problem does this solve?" (not "what future problem might it solve?")
  2. If the only justification is "we might need it later," it is accidental complexity — flag for removal.
  3. Essential complexity (complexity inherent to the problem domain) is acceptable; accidental complexity (complexity introduced by the approach) is not.
- **Source**: Brooks, *No Silver Bullet*, IEEE Computer, 1987 (originally 1986 UNC technical report).

### 2. Coupling classification

- **Frameworks**: Myers coupling taxonomy (Glenford Myers, *Reliable Software Through Composite Design*, 1975); Connascence (Meilir Page-Jones, *What Every Programmer Should Know About Object-Oriented Design*, 1996).
- **What it evaluates**: The type and strength of coupling the change introduces between modules.
- **Myers coupling types** (ordered from acceptable to unacceptable):
  - **Data coupling** — modules communicate by passing data parameters. Acceptable; this is normal.
  - **Stamp coupling** — modules share a composite data structure but only some use all fields. Low risk; watch for over-sharing.
  - **Control coupling** — one module passes a flag/control signal that directs another module's logic. Leaks decision authority; review whether the decision belongs in the caller.
  - **Common coupling** — modules share global mutable state. High risk; breaks independent reasoning, makes changes ripple unpredictably.
  - **Content coupling** — one module directly reads/writes another module's internal data. Unacceptable; no module should reach into another's internals.
- **Connascence** (a sharper successor to coupling classification): Name/Type connascence (modules agree on a name or type — benign) → Meaning/Position connascence → Algorithmic connascence (modules must implement the same algorithm — fragile) → Execution/Timing connascence (modules must execute in a specific order or timing — very fragile). Higher connascence = more fragile coupling.
- **How to apply**: Identify the coupling type the change introduces. Only Content and Common coupling are blocking without alternatives.

### 3. Cohesion gradient

- **Framework**: Yourdon & Constantine, *Structured Design: Fundamentals of a Discipline of Computer Program and Systems Design*, 1979.
- **What it evaluates**: Whether the module's elements converge on one purpose.
- **Cohesion gradient** (strongest to weakest):
  - **Functional** — all elements contribute to a single, well-defined task. Strongest; aim here.
  - **Sequential** — elements share data in sequence (output of one feeds input of next). Acceptable.
  - **Communicational** — elements operate on the same data. Acceptable.
  - **Procedural** — elements follow a sequence of execution steps. Weaker.
  - **Temporal** — elements grouped by time of execution (e.g., all init code together). Weak.
  - **Logical** — elements grouped by logical category (e.g., all error handlers together). Weak.
  - **Coincidental** — elements grouped arbitrarily (no relationship). Weakest; a design smell.
- **How to apply**: After the change, does the module's cohesion level stay the same, improve, or degrade? A downgrade (e.g., Functional → Temporal) is an early design-degradation signal — flag it even if the code currently works.

### 4. Change amplification

- **Frameworks**: Fowler, *Refactoring* — "Shotgun Surgery" code smell; Open-Closed Principle (Bertrand Meyer, *Object-Oriented Software Construction*, 1988; SOLID — Uncle Bob).
- **What it evaluates**: Whether the solution localizes frequent changes or scatters them.
- **How to apply**:
  1. For the proposed change, count how many files/modules a single logical business change would touch.
  2. If one logical change cascades to 3+ modules with no direct business relationship, that is Shotgun Surgery — the design has not localized the volatile decision.
  3. Good design separates volatile decisions (business rules, configuration, policies) from stable cores (data models, core algorithms), so changes to the former do not ripple into the latter (Open-Closed Principle).
- **Blocking**: 3+ cascading modules with no convergence strategy.

### 5. Tech debt classification

- **Framework**: Fowler, Technical Debt Quadrant (martinfowler.com, 2009; expanded in *Refactoring*, 2nd ed., 2018).
- **What it evaluates**: Whether the debt introduced is deliberate-and-prudent or reckless-and-inadvertent.
- **The quadrant**:
  - **Prudent-Deliberate** — we know there is a better approach, but we consciously choose a faster one due to constraints, with a documented repayment plan. **Acceptable.**
  - **Prudent-Inadvertent** — we did not know the best design at the time, but now we do and will address it. Acceptable with awareness.
  - **Reckless-Deliberate** — we know the design is bad but ship it anyway without a plan. Review and challenge.
  - **Reckless-Inadvertent** — we do not know a better design exists (introducing God Object, Speculative Generality, Primitive Obsession without awareness). **Blocking** — the holder does not know the debt exists and will never repay it.
- **How to apply**: Classify the debt the solution introduces. Reckless-Inadvertent is always blocking.

### 6. Complexity metrics

- **Frameworks**: Cyclomatic Complexity (Thomas McCabe, *A Complexity Measure*, IEEE Transactions on Software Engineering, 1976); Cognitive Complexity (SonarSource, 2016).
- **Cyclomatic complexity**: Count decision points (if, for, while, case, &&, ||, catch) in a function + 1.
  - Threshold: 1–10 = low risk (acceptable); 11–15 = moderate (review warranted); 16–20 = high (refactor recommended); >20 = unacceptable for a single function.
  - Maps to testability: cyclomatic complexity = the minimum number of test paths needed for branch coverage.
- **Cognitive complexity** (SonarSource): Weights nesting depth (+1 per level of nesting), recursion, and logical operator sequences. Captures "how hard is this to read" better than cyclomatic, which treats a flat `a || b || c` the same as nested `if (a) { if (b) { ... }}`.
  - Threshold: ≤15 per function is the target; >15 warrants simplification; >30 is high risk.
  - Prefer cognitive complexity for readability assessment; use cyclomatic for testability estimation.
- **How to apply**: Estimate (do not require exact tooling) the complexity of the proposed code's hottest functions. Flag functions likely above threshold. Document reasoning for domain-inherent complexity that justifies a high score.
- **Sources**:
  - McCabe: [IEEE TSE 1976](https://ieeexplore.ieee.org/document/1702388)
  - Cognitive Complexity: [SonarSource white paper](https://www.sonarsource.com/docs/CognitiveComplexity.pdf)

### 7. Law of Demeter

- **Framework**: Lieberherr & Holland, *Assuring Good Style for Object-Oriented Programs*, 1989 (OOPSLA). Also known as "Principle of Least Knowledge."
- **What it evaluates**: Whether a method reaches too deeply into the object graph — coupling the caller to the internal structure of distant objects.
- **The rule**: A method `M` of object `O` should only invoke methods of: `O` itself, parameters passed to `M`, objects created within `M`, direct component objects of `O`. It should **not** call methods on objects returned by those calls (i.e., no `a.getB().getC().doSomething()` — "train wreck").
- **Why it matters**: A train wreck couples the caller to the internal structure of `B` and `C`. When `B` or `C` changes internally, the caller breaks — even though the caller "only used" `A`.
- **How to apply**: Scan the proposed design for method chains deeper than 2 levels. Each is a Law of Demeter violation. The fix: ask the intermediate object to perform the action (tell, don't ask).
- **Source**: [Lieberherr & Holland 1989](https://www2.ccs.neu.edu/research/demeter/papers/publications/demeter/assuring-good-style/)

---

## Layer B — Architecture-level quality attributes

These evaluate the solution's impact on system-level quality. Scale by path: quick path (small isolated change) may do a fast pass; full path (cross-module, architecture-affecting) must assess all.

### 8. Testability

- **Framework**: Clean Architecture — Robert C. Martin (Uncle Bob), *Clean Architecture*, 2017. ISO/IEC 25010 Maintainability → Testability subcharacteristic.
- **What it evaluates**: Whether business logic can be tested in isolation from external dependencies (UI, database, web server, external services).
- **The testability principle**: "The business rules can be tested without the UI, Database, Web Server, or any other external element." (Clean Architecture, ch. 5)
- **Hard-to-test signals** (flag these in the proposed design):
  - Hidden dependencies (the logic reaches out to a singleton, static method, or global state that cannot be substituted in a test).
  - Tight coupling to external systems (the logic directly calls a database or HTTP client instead of depending on an interface).
  - "New" operator used inside logic (creating concrete dependencies that cannot be injected/mocked).
  - Law of Demeter violations (the logic reaches through objects to their dependencies, coupling to internals).
- **How to apply**: Trace the proposed business logic. Can it be unit-tested by substituting its dependencies with test doubles? If not, flag a testability violation.
- **Blocking (full path)**: logic cannot be tested in isolation and no compensating measure (e.g., integration test coverage) is provided.

### 9. Modularity

- **Framework**: ISO/IEC 25010 — Software Quality Model (2011, revised 2023) — Maintainability characteristic → Modularity subcharacteristic.
- **What it evaluates**: Whether one change minimizes impact on other components.
- **How to apply**: Trace the blast radius of the proposed change. If the change forces edits in modules that have no logical relationship to the change, modularity is poor. (Overlaps with Shotgun Surgery in Layer A — Layer B looks at the system level; Layer A at the code level.)

### 10. Reliability / resilience

- **Framework**: ISO/IEC 25010 — Reliability characteristic → Fault tolerance, Recoverability subcharacteristics.
- **What it evaluates**: Whether the solution considers failure scenarios.
- **How to apply**: For the proposed change, ask: what happens when a dependency fails? When data is malformed? When load spikes? Does the solution degrade gracefully, retry with backoff, or circuit-break? An absence of failure-mode handling in a fault-sensitive path is a reliability gap.

### 11. Scalability

- **Framework**: ISO/IEC 25010 — Performance efficiency → Capacity subcharacteristic.
- **What it evaluates**: Whether the solution can handle expected growth in data volume or concurrency.
- **How to apply**: Estimate the order-of-magnitude load the solution will face. Does the proposed approach (e.g., an N+1 query, a full-table scan, a synchronous lock) embed a bottleneck that will break at 10× or 100× current load? If so, flag it — even if it works today.

### 12. Dependency direction

- **Frameworks**: Stable Dependencies Principle (SDP) + Stable Abstractions Principle (SAP) — Robert C. Martin; Clean Architecture Dependency Rule.
- **What it evaluates**: Whether dependencies point toward stability.
- **The rule**: Dependencies should point from unstable (frequently changing) modules toward stable (rarely changing) modules. A stable module depending on an unstable one creates fragility — the stable module changes whenever the unstable one does, defeating its stability.
- **Clean Architecture Dependency Rule**: dependencies must point inward toward the domain/core, never outward toward frameworks, UI, or infrastructure.
- **How to apply**: Draw the dependency arrows for the proposed change. If any arrow points from a stable module to an unstable one, or outward (toward infrastructure) instead of inward (toward domain), it is a dependency-direction violation.
- **Blocking**: a stable module depends on an unstable module (violates SDP).
- **Source**: [Uncle Bob — Principles of OOD](http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod)

---

## Layer C — Security pass

Run this layer only when the solution touches a **trust boundary** — authentication, authorization, input handling, data storage, external communication, or any path where untrusted data enters the system.

### 13. OWASP Top 10 lightweight design review

- **Framework**: OWASP Top 10 (Open Web Application Security Project, 2021 edition; 2025 revision available).
- **What it evaluates**: Whether the proposed design has security flaws at the architecture level — before they become code.
- **How to apply** (lightweight — not a full audit, design-level only):
  1. **Injection** — Does the design parameterize all queries / commands, or does it allow string concatenation of untrusted input into queries/commands?
  2. **Broken authentication** — Does the design handle credentials, sessions, tokens correctly? Are there weak points (transmitting credentials in cleartext, predictable tokens)?
  3. **Sensitive data exposure** — Does the design store or transmit sensitive data without encryption? Does it log secrets?
  4. **Broken access control** — Does the design enforce authorization on every protected resource, or does it rely on client-side hiding?
  5. **Security misconfiguration** — Does the design default to secure settings, or does it require manual hardening?
  6. (If the solution is complex, expand to the full Top 10 — but for most design reviews, these 6 catch the architecture-level mistakes.)
- **Blocking**: any category violated at the design level (e.g., design allows injection, broken access control, unencrypted sensitive data).
- **Source**: [OWASP Top 10](https://owasp.org/Top10/)

---

## Full blocking / non-blocking criteria

### Blocking (any one → code design does not pass)

**Layer A:**
- Content coupling (directly manipulating another module's internals) or Common coupling (shared mutable state) with no alternative design.
- Reckless-Inadvertent tech debt — God Object / Speculative Generality / Primitive Obsession introduced without awareness of a better design (Fowler Reckless-Inadvertent quadrant).
- A single business change requires cascading edits to 3+ modules with no direct business relationship (Shotgun Surgery), with no convergence strategy proposed.
- Cyclomatic complexity >20 or cognitive complexity >30 in a function that is not inherently complex (no domain justification documented).

**Layer B (full path only):**
- Dependency direction inverted — a stable module depends on an unstable one (violates Stable Dependencies Principle).
- Business logic cannot be tested in isolation from external dependencies (violates Clean Architecture testability), with no compensating measure.
- A scalability bottleneck is embedded with no mitigation plan for expected growth.

**Layer C (trust-boundary changes only):**
- An OWASP Top 10 category is violated at the design level (injection, broken access control, sensitive data exposure, etc.).

### Non-blocking (note as recommendation, do not block)

- A more elegant implementation exists, but the current one is correct and does not harm maintainability.
- Prudent-Deliberate tech debt with a documented repayment plan.
- A superior architecture exists, but the current one does not harm correctness or near-term maintainability (deferrable to a later iteration).
- Complexity slightly above threshold in an inherently complex domain (document the reasoning — domain complexity is essential, not accidental).
- Code style preferences that do not affect correctness or maintainability.

---

## Framework source index

| # | Framework | Author | Year | Source |
|---|-----------|--------|------|--------|
| 1 | No Silver Bullet (accidental complexity) | Fred Brooks | 1986 | IEEE Computer / UNC TR |
| 2a | Coupling classification | Glenford Myers | 1975 | *Reliable Software Through Composite Design* |
| 2b | Connascence | Meilir Page-Jones | 1996 | *What Every Programmer Should Know About OO Design* |
| 3 | Cohesion gradient | Yourdon & Constantine | 1979 | *Structured Design* |
| 4a | Shotgun Surgery (code smell) | Martin Fowler | 1999 | *Refactoring* |
| 4b | Open-Closed Principle | Bertrand Meyer | 1988 | *Object-Oriented Software Construction* |
| 5 | Technical Debt Quadrant | Martin Fowler | 2009 | martinfowler.com |
| 6a | Cyclomatic Complexity | Thomas McCabe | 1976 | IEEE TSE |
| 6b | Cognitive Complexity | SonarSource | 2016 | SonarSource white paper |
| 7 | Law of Demeter | Lieberherr & Holland | 1989 | OOPSLA |
| 8 | Clean Architecture (testability) | Robert C. Martin | 2017 | *Clean Architecture* |
| 9–11 | ISO/IEC 25010 quality model | ISO/IEC | 2011 | ISO standard |
| 12 | Stable Dependencies Principle | Robert C. Martin | — | butunclebob.com |
| 13 | OWASP Top 10 | OWASP | 2021/2025 | owasp.org |
