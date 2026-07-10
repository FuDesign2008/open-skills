---
name: solution-review
version: "1.0.0"
user-invocable: true
description: "Authoritative framework for reviewing any proposed solution (code, config, process, tooling, or architecture decision) before implementation. Covers four core dimensions (effectiveness, side-effects/risks, feasibility, spec compliance) plus five strategic dimensions that catch decision-level failures the core four miss: reversibility calibration (Bezos one-way/two-way doors), failure-mode analysis (FMEA), operability (SRE Production Readiness Review), cost-vs-value (CBAM/WSJF), and team cognitive fit (Team Topologies). Use this skill whenever you need to review, validate, stress-test, or approve a proposed solution, plan, design doc, or approach — before any code is written or change is applied. Triggers — 「审查方案」「方案审查」「评估方案」「方案评估」「review proposal」「方案可行吗」「这个方案靠谱吗」「方案有没有风险」「方案评审」「设计评审」「决策评审」 / solution review, proposal review, design review, decision review, stress-test a plan, validate an approach."
---

# Solution Review

> **Role**: A pre-implementation review framework for any proposed solution — code or non-code. It exists to catch decision-level failures (wrong problem, uncalibrated risk, ignored operability, poor cost-value tradeoff) before effort is spent building. It is a methodology enhancement: workflows like `solve-workflow` discover and invoke it through environment capability exploration, and it complements `code-design-review` (which handles code-level design quality when the solution involves code).
>
> **Detailed framework entries** (author, year, method, source) and the full blocking/non-blocking criteria live in [reference.md](reference.md).

## Why this skill exists

Most solution reviews stop at four questions: *Does it solve the problem? Any side effects? Is it feasible? Does it follow conventions?* These are necessary but not sufficient. They catch implementation-level problems but miss **decision-level** failures:

- A solution that solves the right problem but is **irreversible** when it did not need to be (a one-way door treated as a two-way door).
- A solution whose **failure modes** were never enumerated, so the first production incident is a surprise.
- A solution that works but is **un-operable** — no monitoring, no rollback path, on-call burden nobody accounted for.
- A solution whose **cost exceeds its value** but nobody ran the numbers.
- A solution that is technically correct but **exceeds the team's cognitive capacity** to maintain.

This skill adds five strategic dimensions that surface these failures, calibrated to the solution's reversibility. The meta-lesson:

> **A solution can pass all four core dimensions and still be the wrong decision. Review depth must scale with irreversibility, not with confidence.**

## When to use

Strong signals (any one):

- You are about to approve, reject, or iterate on a proposed solution, plan, or design — **before** implementation begins.
- A solution involves an **architecture decision**, a **migration**, a **dependency change**, or an **irreversible action** (schema change, data migration, public API contract).
- Someone asks "is this approach sound?" or "what could go wrong?" or "should we do this?"
- You need to produce a **review report** with structured pass/fail reasoning, not a gut feeling.

This skill reviews **proposed** solutions (pre-implementation). It is distinct from post-implementation code review skills (which review completed diffs against standards). Both matter; they run at different lifecycle stages.

## Relationship to other skills

| Skill | Responsibility | Relationship to this skill |
|-------|---------------|----------------------------|
| `code-design-review` | Code-level design quality (coupling, cohesion, complexity, security) | When the solution involves code, use **both**: this skill checks the decision; `code-design-review` checks the code craft. This skill is the superset. |
| `solve-workflow` | Full PDCA workflow (analyze → solve → execute → verify) | This skill is the deep-dive of its "review solution" phase. The workflow discovers this skill through environment capability exploration. |
| `review` (matt-pocock) | Post-implementation diff review (standards + spec) | Different lifecycle stage — reviews completed code, not proposed solutions. Use that after implementation; use this before. |

## The review framework

Nine dimensions, in two tiers. The four **core** dimensions are mandatory for every solution. The five **strategic** dimensions are mandatory for solutions above a reversibility threshold (see dimension 5) and recommended for all.

### Core dimensions (every solution, every time)

1. **Effectiveness** — Does the solution completely cover the root cause / requirement? Is the core logic sound? Are there gaps where the problem persists after the solution is applied?
2. **Side-effects & risks** — What breaks elsewhere (functional side-effects)? What non-functional regressions are possible (performance, security, maintainability)? Are identified risks paired with mitigation measures?
3. **Feasibility** — Are the change scope, dependencies, and affected files/modules concrete and actionable? Can this actually be built with current constraints (time, budget, knowledge, infrastructure)?
4. **Spec & standards compliance** — Does the solution match the originating requirement / spec / PRD? Does it follow existing project patterns and documented conventions?

### Strategic dimensions (calibrate depth by reversibility — see dim 5)

5. **Reversibility calibration** (Bezos, *Type 1 vs Type 2 Decisions*, 2016 Amazon Shareholder Letter) — Is this a one-way door (irreversible: data migration, public API, schema change) or a two-way door (easily rolled back)? One-way doors demand maximum review rigor; two-way doors favor speed. Misclassifying a one-way door as two-way is the most expensive review error.
6. **Failure-mode analysis** (FMEA — *Failure Mode and Effects Analysis*, ASQ/NASA) — Enumerate how the solution can fail: for each component, what failure modes exist? What is the severity × likelihood × detectability? High-Risk-Priority-Number failures need mitigation before approval.
7. **Operability** (Google SRE, *Production Readiness Review*, 2016) — If this ships, can it be operated? Are there SLIs/SLOs? Is there monitoring and alerting? Is there a rollback path? What is the on-call burden? A solution that works but cannot be operated is a future incident.
8. **Cost vs value** (CBAM — SEI/CMU, *Cost Benefit Analysis Method*, 2003; and WSJF — Reinertsen, *Principles of Product Development Flow*, 2009) — Is the effort worth the outcome? What is the cost of delay (does delivering this late lose economic value)? Is there a cheaper alternative that achieves 80% of the value?
9. **Team cognitive fit** (Skelton & Pais, *Team Topologies*, 2019) — Does the solution fit the team's current cognitive capacity? Does it require knowledge the team does not have and cannot quickly acquire? A technically superior solution the team cannot maintain is a liability, not an asset.

> Detailed method, application steps, and source citations for each dimension are in [reference.md](reference.md).

## How to apply

1. **Classify reversibility first.** Before reviewing anything else, determine: is this a one-way door or a two-way door? This sets the review depth for all subsequent dimensions. (See reference.md → Reversibility.)
2. **Run the four core dimensions.** These are non-negotiable for any solution. Produce a pass/fail for each with concrete reasoning.
3. **Run the five strategic dimensions** at the depth the reversibility classification demands. For two-way doors, a quick pass is sufficient; for one-way doors, each strategic dimension deserves a dedicated assessment.
4. **Produce a structured review report** (see Output below) with: per-dimension verdict, identified issues ranked by severity, blocking vs non-blocking classification, and an overall conclusion.
5. **Gate on blocking issues.** Any blocking issue means the solution does not pass. Non-blocking issues are noted as recommendations but do not block.

### Blocking vs non-blocking (summary)

**Blocking** (any one → solution does not pass):
- The solution does not completely cover the root cause / requirement (effectiveness gap).
- An identified medium/high risk has no mitigation measure.
- The change scope or dependencies are unclear — no executable plan can be derived.
- The solution conflicts with existing design patterns or coding conventions.
- A likely side-effect could introduce new bugs or break existing functionality, unhandled.
- **(One-way doors only)** A failure mode with high severity × high likelihood has no mitigation.
- **(One-way doors only)** The solution has no rollback path and is irreversible.
- **(One-way doors only)** The cost clearly exceeds the value and no cheaper alternative was considered.

**Non-blocking** (note as recommendation, do not block):
- Low-risk items that already have mitigation.
- Style preferences that do not affect correctness.
- Performance improvements deferrable to a later iteration.
- A more elegant approach exists, but the current one is correct and maintainable.
- Deliberate, documented technical debt with a repayment plan.

> The full blocking/non-blocking criteria with framework-specific thresholds are in [reference.md](reference.md).

## Output

A review report with this structure:

```
【方案审查报告】
- 审查对象：[solution name / summary]
- 可逆性分类：[one-way door / two-way door] → review depth: [maximum / standard]
- 核心维度评估：
  1. 解决有效性：✅/❌ [reasoning]
  2. 副作用与风险：✅/❌ [reasoning]
  3. 实现可行性：✅/❌ [reasoning]
  4. 规范符合度：✅/❌ [reasoning]
- 战略维度评估（按可逆性深度）：
  5. 可逆性校准：[classification + rationale]
  6. 失效模式分析：✅/❌/N-A [top failure modes + RPN]
  7. 可运维性：✅/❌/N-A [monitoring/rollback/on-call assessment]
  8. 成本 vs 价值：✅/❌/N-A [cost-value assessment]
  9. 团队认知适配：✅/❌/N-A [team fit assessment]
- 问题清单：[#] [description] [severity: blocking/non-blocking]
- 审查结论：✅ 通过 / ❌ 不通过
- [❌ 不通过时] 优化建议：[per-issue improvement direction]
```

## Anti-patterns (forbidden moves)

1. **Treating a one-way door as a two-way door** — under-reviewing an irreversible decision because it "seems fine." This is the most expensive review mistake.
2. **Skipping strategic dimensions for non-code solutions** — config/process/tooling changes can be one-way doors too (a migration run is irreversible; a process change is hard to undo). Reversibility, not solution type, determines depth.
3. **Reviewing only for "does it work"** — operability, cost-value, and team fit are decision-level concerns that "it works" does not address.
4. **Vague risk assessment** — "there might be some risk" without enumerating failure modes, severity, and likelihood. Use FMEA structure.
5. **Blocking on non-blocking issues** — a more elegant alternative or a deferrable improvement is not grounds to reject a correct, maintainable solution.
6. **Approving without a rollback plan for one-way doors** — if you cannot undo it, you must be able to mitigate forward.
