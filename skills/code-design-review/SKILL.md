---
name: code-design-review
version: "1.0.0"
user-invocable: true
description: "Authoritative framework for reviewing the design quality of proposed code changes — before implementation. Evaluates code-level metrics (accidental complexity, coupling via Myers/Connascence, cohesion, change amplification, tech debt, cyclomatic/cognitive complexity, Law of Demeter) and architecture-level quality attributes (testability, modularity, reliability, scalability, dependency direction via ISO 25010 + Clean Architecture + SDP) plus a security pass (OWASP Top 10). Use this skill whenever a proposed solution involves code changes and you need to assess whether the code is well-designed — not just whether it works, but whether it is maintainable, testable, and does not introduce design debt. Triggers — 「代码审查」「代码设计审查」「代码设计质量」「审查代码设计」「代码架构审查」「设计质量评估」「代码质量评审」「这个代码设计合理吗」「耦合度审查」「代码可维护性」 / code design review, code architecture review, design quality assessment, coupling analysis, maintainability review."
---

# Code Design Review

> **Role**: A pre-implementation design-quality review for solutions that involve code changes. It evaluates whether the proposed code is well-crafted — maintainable, testable, properly decoupled — not just whether it solves the problem. It is the code-specialized companion to `solution-review` (which handles decision-level review for any solution type). Workflows like `solve-workflow` discover and invoke it through environment capability exploration.
>
> **Detailed framework entries** (author, year, thresholds, source) and the full blocking/non-blocking criteria live in [reference.md](reference.md).

## Why this skill exists

A code solution can be correct (it solves the problem) and still be poorly designed — introducing coupling that makes the next change harder, complexity that exceeds what the problem demands, or tech debt the team does not know it holds. These design failures are invisible to "does it work?" testing; they surface months later as maintenance pain, regression cascades, and fear of change.

This skill applies software-engineering theory — not opinion — to evaluate code design quality before a single line is written. Every check item traces to a named framework (Brooks, Myers, Yourdon-Constantine, Fowler, McCabe, ISO 25010, Clean Architecture, OWASP). The meta-lesson:

> **Code that works but is poorly designed becomes tomorrow's maintenance crisis. Review design quality before implementation, when changing direction is still cheap.**

## When to use

Strong signals (any one):

- A proposed solution **involves code changes** and you need to assess its design quality before implementation.
- You are reviewing a design doc, technical proposal, or approach that includes code structure decisions (new modules, API design, refactoring, dependency changes).
- Someone asks "is this code well-designed?" or "will this be maintainable?" or "is the coupling acceptable?"
- A solution involves architecture-level decisions (new abstraction layers, dependency direction changes, module boundary shifts).

This skill is for **code** solutions only. For non-code solutions (config, process, tooling, architecture decisions without code), use `solution-review`. When a solution involves code, use **both**: `solution-review` for the decision, this skill for the code craft.

## Relationship to other skills

| Skill | Responsibility | Relationship to this skill |
|-------|---------------|----------------------------|
| `solution-review` | Decision-level review (effectiveness, risks, reversibility, operability, cost) | The superset. For code solutions, `solution-review` checks the decision; this skill checks the code design. Use both. |
| `solve-workflow` | Full PDCA workflow | This skill is the deep-dive of its "review solution" phase dimension "architecture & design quality." The workflow discovers this skill through environment capability exploration. |

## The code design quality model

Three layers, applied by scaling depth to the solution's scope.

### Layer A — Code-level design metrics (every code change, mandatory)

These are the metrics that apply to any code change, regardless of scale. Each traces to a named SE framework:

1. **Accidental complexity** (Fred Brooks, *No Silver Bullet*, 1986) — Does the solution introduce indirection, configuration, or abstraction that does not map to the problem's inherent complexity? Every new abstraction needs a reason that exists *now*; "might need it later" is accidental complexity — cut it at review.
2. **Coupling classification** (Myers coupling taxonomy + Connascence, Page-Jones 1996) — What type of coupling does the change introduce? Data coupling (passing data, acceptable) → Stamp (sharing composite structures, low risk) → Control (passing flags that direct another module's logic, leaks decisions) → Common (shared mutable state, high risk) → Content (directly manipulating another module's internals, unacceptable). Connascence sharpens this: name/type connascence is benign; algorithmic/execution/timing connascence is fragile.
3. **Cohesion gradient** (Yourdon & Constantine, *Structured Design*, 1979) — After the change, do the module's elements converge on one purpose (Functional cohesion, strongest) or are they bundled by time/logic/coincidence (Temporal / Logical / Coincidental, weakest)? A downgrade in cohesion is an early design-degradation signal.
4. **Change amplification** (Fowler, *Shotgun Surgery* code smell + Open-Closed Principle) — Does the solution localize frequent changes, or scatter one logical change across many files? Good design separates volatile decisions (business rules, config) from stable cores (data models, algorithms).
5. **Tech debt classification** (Fowler, Technical Debt Quadrant) — Is the debt Prudent-Deliberate (knowingly chosen with a repayment plan, acceptable) or Reckless-Inadvertent (introduced because a better design was unknown — God Object, Speculative Generality, Primitive Obsession)? Reckless-Inadvertent debt must be blocked because the holder does not know the debt exists and will never repay it.
6. **Complexity metrics** — **Cyclomatic complexity** (McCabe, 1976): count decision points + 1; threshold >10 warrants review, >15 is high risk, >20 is unacceptable for a single function. **Cognitive complexity** (SonarSource, 2016): weights nesting, recursion, and logical operators to capture human-readable difficulty; threshold >15 warrants review. Prefer cognitive complexity — it catches what cyclomatic misses (deep nesting reads as hard even with few branches).
7. **Law of Demeter** (Lieberherr & Holland, 1989) — A method should only talk to its immediate friends, not strangers: `a.b().c().d()` ("train wreck") couples the caller to the internal structure of distant objects. Flag chains deeper than 2 levels in the proposed design.

### Layer B — Architecture-level quality attributes (scale by path: quick path may skip, full path mandatory)

These evaluate the solution's impact on system-level quality attributes:

8. **Testability** (Clean Architecture — Uncle Bob) — Can business logic be tested without the UI, database, web server, or external services? If the solution makes logic un-testable in isolation, that is an architecture violation. Hard-to-test signals: hidden dependencies, static method calls, singletons, law-of-Demeter violations.
9. **Modularity** (ISO/IEC 25010 — Maintainability → Modularity) — Does one change minimize impact on other components?
10. **Reliability / resilience** (ISO/IEC 25010 — Reliability → Fault tolerance, Recoverability) — Does the solution consider failure scenarios (degradation, retry, circuit breaking)?
11. **Scalability** (ISO/IEC 25010 — Performance efficiency → Capacity) — Can the solution handle expected data volume / concurrency growth, or does it embed a bottleneck?
12. **Dependency direction** (Stable Dependencies Principle + Clean Architecture Dependency Rule) — Do dependencies point toward stability (stable modules depended-on by unstable ones), or does a stable module depend on an unstable one (inverted, fragile)?

### Layer C — Security pass (when the solution touches a trust boundary)

13. **OWASP Top 10 lightweight review** — When the solution touches authentication, authorization, input handling, data storage, or external communication, run a lightweight OWASP pass: injection (unparameterized queries), broken auth, sensitive data exposure, XXE, broken access control, security misconfiguration. This is not a full security audit; it catches the design-level security mistakes before they become code.

> Detailed method, thresholds, and source citations for each item are in [reference.md](reference.md).

## How to apply

1. **Confirm the solution involves code.** If not, use `solution-review` instead.
2. **Run Layer A** for every code change. Produce a pass/fail for each of the 7 metrics with concrete reasoning tied to the proposed code structure.
3. **Run Layer B** scaled by path: quick path (small, isolated change) may do a fast pass; full path (cross-module, architecture-affecting) must assess all 5 attributes.
4. **Run Layer C** only if the solution touches a trust boundary (auth, input, data, external comms). Otherwise skip.
5. **Produce a structured review report** (see Output below) with per-item verdict, blocking/non-blocking classification, and overall conclusion.
6. **Gate on blocking issues.** Blocking issues mean the code design does not pass.

### Blocking vs non-blocking (summary)

**Blocking** (any one → code design does not pass):
- Content coupling (directly manipulating another module's internals) or Common coupling (shared mutable state) with no alternative.
- Reckless-Inadvertent tech debt — God Object / Speculative Generality / Primitive Obsession introduced without awareness of better design.
- A single business change requires cascading edits to 3+ modules with no direct business relationship (Shotgun Surgery), with no convergence strategy.
- Dependency direction inverted — a stable module depends on an unstable one (violates SDP).
- **(Full path)** Business logic cannot be tested in isolation from external dependencies (violates Clean Architecture testability), with no compensating measure.
- **(Security)** An OWASP Top 10 category is violated at the design level (e.g., design allows injection, broken access control).

**Non-blocking** (note as recommendation, do not block):
- A more elegant implementation exists, but the current one is correct and maintainable.
- Prudent-Deliberate tech debt with a documented repayment plan.
- A superior architecture exists, but the current one does not harm correctness or near-term maintainability (deferrable to a later iteration).
- Cyclomatic/cognitive complexity slightly above threshold in an inherently complex domain (document the reasoning).

> Full blocking/non-blocking criteria with framework-specific thresholds are in [reference.md](reference.md).

## Output

A code design review report with this structure:

```
【代码设计审查报告】
- 审查对象：[solution name / code area]
- 路径：[quick / full] + [security pass: yes/no]
- Layer A 代码级设计指标：
  1. 偶然复杂度：✅/❌ [reasoning]
  2. 耦合类型：✅/❌ [type identified + risk level]
  3. 内聚度：✅/❌ [cohesion level + trend]
  4. 变更传播半径：✅/❌ [shotgun surgery check]
  5. 技术债分类：✅/❌ [quadrant identified]
  6. 复杂度度量：✅/❌ [cyclomatic / cognitive estimate]
  7. Law of Demeter：✅/❌ [train-wreck check]
- Layer B 架构级质量属性（full path）：
  8. 可测试性：✅/❌/N/A
  9. 模块性：✅/❌/N/A
  10. 可靠性/韧性：✅/❌/N/A
  11. 可扩展性：✅/❌/N/A
  12. 依赖方向：✅/❌/N/A
- Layer C 安全审查（trust boundary）：
  13. OWASP 轻量审查：✅/❌/N/A
- 问题清单：[#] [description] [severity: blocking/non-blocking]
- 审查结论：✅ 通过 / ❌ 不通过
- [❌ 不通过时] 优化建议：[per-issue improvement direction]
```

## Anti-patterns (forbidden moves)

1. **Approving code that "works" without a design pass** — correctness is necessary but not sufficient; skipping Layer A/B/C entirely because tests are green is how design debt accumulates invisibly.
2. **Running Layer C (security) on everything** — the OWASP pass is for trust-boundary-touching changes only. Over-applying it wastes review effort; under-applying it on trust boundaries is dangerous.
