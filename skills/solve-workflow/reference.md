# Solve Workflow — Output Templates & Reference

Reference material for the `solve-workflow` skill. Contains per-phase output templates plus supplementary tables (PDCA correspondence, full common-pitfall table, detailed general principles) moved out of SKILL.md to keep the main file concise.

---

## PDCA Correspondence

The seven phases map onto the Deming cycle (PDCA) as follows:

| PDCA | Phase | Description |
|------|-------|-------------|
| **Plan** | Phases 1–4 | Analyze Problem (incl. Clarify Problem), Explore Solutions, Review Solution, Make Plan |
| **Do** | Phase 5 | Execute Plan |
| **Check** | Phase 6 | Check & Verify |
| **Act** | Phase 7 | Review & Summarize and AI-engineering sediment |

After execution completes, enter Phase 6; if Phase 7 concludes "goals not met, more changes needed", the workflow may loop back to "Analyze Problem", "Explore Solutions", or "Review Solution" to start the next round.

---

## Phase 1.1 Clarify Problem

```
[Problem Restatement] I understand your problem as: ...
(Describe only the user's intent and phenomenon. Do NOT include root-cause judgments or fix suggestions — technical conclusions belong in 1.2.)
[Key Elements] Goal: ... / Constraints: ... / Context: ... / Expected outcome: ...
[Scope Decomposition] (if applicable) Modules, dependencies, order, first sub-problem: ...
[Open Questions] (if any; ask only one per turn)
[Question stem] A [...] B [...]
Please confirm whether my understanding is correct.
```

---

## Phase 1.2 Industry-ailment Assessment Report

```
[Industry-ailment Assessment]
- Problem essence: ... (one-sentence root-cause summary)
- Industry status: ... (known public records, mainstream-framework stance, how major companies handle it)
- Research conclusion: This problem is a [platform limit / protocol constraint / language property / standard spec], and the industry currently has no viable solution.
- Recommendation: Accept status quo / evaluate alternatives (not a fix) / align product expectations on this constraint.
If you want to continue exploring bypasses, say 「继续」 / "continue"; otherwise the workflow pauses here.
```

---

## Phase 3 Review Report

**[🤖 Auto]** Every round **must output**:

- **Review round**: Round N of M (cap)
- **Four-dimension assessment**: Resolution effectiveness / Side effects and risks / Implementation feasibility / Coding-standard conformance — annotate each with ✅ or ❌ + specific issue
- **Issue list** (on fail): all issues to resolve, numbered + description + severity
- **Review conclusion**: ✅ Pass / ❌ Fail
- **[On ❌ Fail]** Optimization suggestions: concrete improvement direction for each issue

**[👤 Manual]** Output format:

```
[Selected Solution] Solution X: ...
[Solution Analysis] Core logic: ... / Resolution effectiveness: ... / Files and modules involved: ... / Key implementation points: ...
[Side Effects and Risks]
- Side effect / risk 1: ... Impact: ... Mitigation: ...
- Side effect / risk 2: ...
[Suggested Action] Recommend modify / refine / optimize, because ...
Please confirm whether this is acceptable, or say 「修改方案」「完善方案」「优化方案」 / "modify" "refine" "optimize" to iterate.
```

---

## Phase 4 Make Plan

```
[Goal Solution Recap] Adopt Solution X: ...
[File Change List]
1. File: xxx/yyy/zzz.js, Location: function abc(), Change: ...
2. File: xxx/yyy/aaa.js, Location: class DEF.methodXYZ(), Change: ...
[Modification Order] 1. xxx/yyy/zzz.js (dependency) → 2. xxx/yyy/aaa.js (caller)
[Expected Impact] Scope: ... / Risk points: ...
```

---

## Phase 6 Check Result

```
[Check Result]
- Goal attainment vs. Phase 1.1 expected outcome: ...
- Comparison to Phase 4 plan: Achieved ... / Not achieved ..., reason ...
- Verification points / test conclusion: ... (If tests were executed, attach the result; if not, attach the human-test reminder.)
- Side-effect verification: Did the change introduce new problems in other modules (functional side effects)? Did it introduce unexpected performance / security / maintainability impacts (non-functional side effects)?
- Logic and overall-flow review: ...
```

---

## Phase 7 Improvement Suggestions

```
[Improvement Suggestions]
- Practices worth codifying: ...
- Practices NOT recommended for codifying: ...
- Recommended sediment carrier: AGENTS.md / CLAUDE.md / .cursor/rules/ / in-project skill / summary doc / none for now, reason: ...
- Recommendation: Enter next round / close out. If close out, residual items and follow-ups: ...
- Whether user confirmation is needed before writing: Yes / No; if yes, wait for explicit user request before entering "Make Plan → Execute Plan".
- [Mode state] Auto mode has completed this round and recovered to manual. To run the next round in auto, explicitly say 「自动 xxx」 / "auto ...".
```

---

## Common Pitfalls (full table)

The complete pitfall table. SKILL.md keeps only the non-obvious subset (entries an LLM would get wrong without explicit instruction); the full set lives here for human readers.

| Pitfall | Consequence | Fix |
|---------|-------------|-----|
| Skip 1.1 and read code directly | Misunderstands problem; invalid analysis | Manual mode must complete Clarify Problem and obtain confirmation; auto mode may skip 1.1 |
| Skip existence validation, jump into root-cause analysis | Analyzes a non-existent problem; wastes context | 1.2 must start with existence validation |
| Existence-validation conclusion is "does not exist / mismatch" but analysis continues | Entire direction is wrong | Stop immediately, report, wait for user confirmation |
| Industry-ailment conclusion is "no viable solution" but does not pause for user confirmation | May produce meaningless solutions | Pause after the assessment report, wait for user decision on whether to continue |
| Modify code during analyze / review / make-plan | Breaks read-only constraint | Use Read only; Edit/Write forbidden |
| Execute code without confirmation after planning | Direction drifts | Manual mode must wait for user confirmation; auto mode may auto-confirm |
| Ask multiple questions at once when information is insufficient | Cognitive overload on user; lower-quality answers | Ask only the 1 most-critical question per turn; wait for the answer before asking the next |
| "User mentioned = necessary" — fail to strip | Bloated solutions | Strip unnecessary features (YAGNI) |
| Review fails but enter Phase 4 directly | A flawed solution proceeds to execution; rework cost is high | Must loop review until pass or cap reached |
| Auto-mode review loop exceeds 3 rounds without pausing | Infinite loop wastes resources | Must pause at the 3-round cap and wait for user intervention |
| Review loop fails to record each round's optimization content | Review process is untraceable | Every round must output a complete review report |
| Enhancement-capability exploration failure blocks the flow | Unnecessary interruption | Enhancement capabilities are optional; on failure, skip silently |
| Enhancement capability breaks phase tool constraints | Read-only phase gets writes | Enhancement capabilities do not change phase tool constraints |
| Phase 7 default-writes rule files or creates skills | Pollutes long-term rules; breaks the "summarize only, don't force changes" boundary | Phase 7 outputs sediment suggestions only; only enter "Make Plan → Execute Plan" after explicit user request |
| Route decided as 🔵/🟣 but skipping 2.5; OR 🟢 internal route with triggers hit but skipping early search | Wastes many debugging rounds; may repeatedly step on a known-issue mine | Under 🔵/🟣, 2.5 is the primary action and must run first; under 🟢, when triggers are met, run WebSearch before instrumenting |

---

## Detailed General Principles

SKILL.md keeps the concise version (the parts an LLM might not apply by default). This section expands each principle for human readers and for contexts where deeper guidance is needed.

### Investigate before advising

1. **Investigate, then speak.** For uncertain problems, investigate first, then offer suggestions or solutions; no investigation, no right to speak.
2. **Evidence over speculation.** Back claims with data, facts, and evidence; avoid speculation and assumptions about code you have not read.

This is the meta-principle behind Phase 1's read-only constraint and the existence-validation gate. An LLM that "feels" the root cause from the symptom alone will routinely hallucinate; the gate forces a code-level confirmation before any analysis output is produced.

### Ask one question at a time

When information is insufficient to guarantee output quality, ask **only one most-critical question** per turn. Wait for the user's answer, then continue (or ask the next question).

**Question format**:
```
[One-sentence question stem]
- A option one
- B option two
```

The user may reply with just `A` or `B`; the AI parses the letter and continues.

**Why one at a time**: Multi-question dumps cause cognitive overload and lower answer quality. The user tends to answer the easiest question and skip the hardest (often the most critical) one. Sequential questioning keeps focus on the current blocker.

### Read-only phases do not gain write permission via enhancements

Enhancement capabilities (🔍 debug, 🌐 web research, 💡 design, etc.) are auxiliary: they extend reach (more sources, more comparisons) but never extend tool permissions. A read-only phase (1–4) that calls a code-review enhancement does not gain the right to apply edits. This invariant is enforced twice:

- The enhancement layer itself must be read-only when called from a read-only phase.
- Phase tool constraints override enhancement capabilities on conflict.

### Enhancement capabilities never block the workflow

If an enhancement skill/agent errors during invocation, the workflow must log a warning and continue with the native flow. Blocking the entire pipeline on an optional capability defeats the purpose of progressive enhancement.

### Read the latest spec before invoking any enhancement

Before invoking an enhancement skill/agent, read its current spec file (SKILL.md or equivalent). Never invoke from memory — rules may have drifted between sessions. This is especially important for skills that change behavior across versions (e.g. `effective-web-research`'s Step 0 triage logic).
