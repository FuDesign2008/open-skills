---
name: solve-workflow
version: "2.0.0"
user-invocable: true
description: "当用户说「明确问题」「分析问题」「探索方案」「审查方案」「制定计划」「执行计划」「检查验证」「回顾总结」，或「继续分析」「深入分析」「修改方案」「完善方案」「优化方案」「更新计划」「修订计划」「修改计划」，或「自动模式」「自动分析」「自动解决」时触发。适用于 bug 修复、代码重构、功能开发等需系统性分析的复杂任务。 / Seven-phase PDCA workflow triggered by Chinese phrases like 「分析问题」「执行计划」 or English equivalents."
---

# Seven-Phase Problem-Solving Workflow

> Seven-phase PDCA workflow. Phases 1–4 are read-only. Default is manual mode; say 「自动模式」 / "auto mode" or 「自动分析」 / "auto analyze" to run the full pipeline without confirmation gates.
>
> Output templates for each phase: see [reference.md](reference.md).

## Calling Convention

- **Default behavior**: When the user input does not contain any trigger phrase, default to Phase 1 (Analyze Problem) and treat the input as the problem statement.
- **Matching rule**: A trigger phrase contained anywhere in the input counts as a hit; exact match is not required.
- **Out of scope**: Single-step edits (e.g. renaming a variable) or quick-advice requests may bypass this workflow and be handled directly.
- **Related skills**: `perf-workflow` (performance-specific analysis), `jira-fix-workflow` (end-to-end Jira fix, built on this workflow).

## Triggers and Modes

| Example input | Mode | Description |
|---------------|------|-------------|
| 「分析问题」「探索方案」/ "analyze problem" `/solve xxx` | 👤 Manual | Default; user confirms between phases |
| 「自动分析 xxx」「自动解决 xxx」「自动模式」/ "auto analyze" "auto mode" | 🤖 Auto | Full pipeline runs without confirmation |

**Mode detection**: If the trigger contains 「自动」 / "auto", enter auto mode; otherwise default to manual mode. The user may switch at any time by saying 「切换自动模式」 / "switch to auto mode" or 「切换手动模式」 / "switch to manual mode". In 👤 manual mode each phase ends with a stop point waiting for user confirmation; in 🤖 auto mode the workflow runs end-to-end and only pauses when Phase 3 review exceeds 3 rounds. Per-phase differences are noted inline as [👤] / [🤖].

## Mode Lifecycle

> Defines how auto mode is entered, sustained, and exited, to prevent "mode stickiness" that causes unnoticed automatic decisions.

### Core rule: auto mode always recovers to manual

Auto mode **automatically falls back to manual mode** in any of these cases:

| Recovery trigger | Description |
|------------------|-------------|
| Phase 7 completes normally | Whether closing the loop or starting a new PDCA cycle |
| Workflow is interrupted for any reason | Failure termination, intractable-problem termination, user-initiated stop, user intervention after a review-cap pause |
| Phase 7 decides to loop back to Phase 2 or 3 | A new PDCA round defaults to manual mode |

### Re-entering auto mode

After recovery to manual, the user must **explicitly trigger** auto mode again:

- Say 「自动 xxx」「自动分析」「自动解决」 / "auto ..." / "auto analyze" / "auto solve"
- Say 「切换自动模式」 / "switch to auto mode"

Implicit continuations (e.g. 「继续」 / "continue", 「再改一下」 / "tweak again", 「深入分析」 / "dig deeper") do **not** reactivate auto mode.

### Batch scenarios

Batch orchestration scenarios (e.g. `jira-fix-batch`, `opsx-jira-fix-batch`) pass the mode parameter explicitly per child invocation based on the user's batch-level intent, and are not subject to the single-invocation recovery rule.

---

## ⚡ Quick Reference (read before execution; sync this table when modifying phases)

> Mode lifecycle rules: see "Mode Lifecycle" above — auto mode recovers to manual after one round or on interruption.

**Global notes**:

- **Stop points**: Unless otherwise noted in the "Manual stop point" column, each phase in manual mode ends with ⛔ — wait for user confirmation before proceeding. Auto mode skips these stop points (only the Phase 3 review cap pauses auto mode).
- **Enhancement capabilities (🔌)**: If environment capability exploration finds enhancement capabilities (🔍 debug, 🌐 web research, 💡 design, etc.), they are called at the corresponding phase. See "Environment Capability Exploration" for details. Enhancement calls never expand a phase's tool permissions and never block the workflow on failure.
- **Tool permission abbreviations**: ✅ allowed, ❌ forbidden. "Read/Grep" includes SemanticSearch and equivalent read-only tools.
- **Read-only phases (1–4)**: Bash commands that modify project state (e.g. `npm install`, `git checkout`, `git reset`) are forbidden alongside Edit/Write.

| Phase | Tool permissions | 👤 Manual stop point | Required output |
|-------|------------------|----------------------|-----------------|
| 1.1 Clarify Problem | ❌ Read/Grep (exceptions in 1.1 body) | ⛔ Stop after output, wait for user confirmation | Problem restatement / key elements / questions |
| 1.2 Technical Analysis | ✅ Read/Grep; ✅ WebSearch (steps 2.5 / 3.5 / 5.5 only); ❌ Edit/Write | Continue to Phase 2 | Existence conclusion / root cause / impact scope |
| 2 Explore Solutions | ✅ Read; ❌ Edit/Write | ⛔ Stop after solution table, wait for user choice | Solution comparison table (≥2 solutions, or 1 in streamlined path) |
| 3 Review Solution | ✅ Read; ❌ Edit/Write | ⛔ Stop after review report, wait for user verdict | Review report + pass/fail |
| 4 Make Plan | ✅ Read; ❌ Edit/Write/Bash | ⛔ Stop after plan output, wait for user confirmation | File change list + ordering |
| 5 Execute Plan | ✅ All (Edit/Write/Bash); use TodoWrite | Auto-advance to Phase 6 when no blockers | Execution report |
| 6 Check & Verify | ✅ Bash (test commands); ❌ Edit/Write | ⛔ Stop after result output, wait for user confirmation | Verification result |
| 7 Review & Summarize | ❌ Edit/Write (unless user confirms a write or a new round) | End / loop back to Phase 2 or 3 | Improvement suggestions + codification target |

---

## General Principles

### Investigate before advising

For uncertain problems, investigate first, then advise. No investigation, no recommendation. Back claims with data, facts, and evidence; avoid speculation.

### Ask one question at a time

Whenever information is insufficient to guarantee output quality, ask **only one most-critical question** at a time. Wait for the answer, then continue (or ask the next question).

**Question format**:
```
[One-sentence question stem]
- A option one
- B option two
```

The user may reply with just `A` or `B`; parse the letter and continue.

---

<!-- SYNC-SECTION: environment-capability-exploration -->
## Environment Capability Exploration (cross-platform self-adaptation)

> This workflow may run under Claude Code, OpenCode, Cursor, or other platforms. The skills, plugins, and agents installed in each environment differ. The workflow must **actively probe the current environment for available enhancement capabilities** and invoke them at the appropriate phase, rather than relying solely on its own built-in flow.

### When to probe

**At workflow startup (before entering Phase 1)**, perform one environment capability scan. Record the result in the session context so later phases can reference it without re-scanning.

### How to probe (cross-platform)

Use the current platform's skill discovery mechanism to inspect the available skill / agent / plugin list:

- **Claude Code / OpenCode**: Inspect the `<available_items>` list in the system prompt, or call the `skill` tool to list skills.
- **Cursor**: Inspect the skill list injected into the system prompt.
- **Generic fallback**: If none of the above is available, skip enhancement exploration and proceed with the native flow.

### Capability types and phase mapping

Match available skill/agent `name` and `description` against these keywords:

| Capability type | Match keywords | Phase | Purpose |
|------------------|----------------|-------|---------|
| 🔍 Debug analysis | debug, root-cause, investigate, systematic-debugging | Phase 1.2 (Technical Analysis) | Assists root-cause localization and hypothesis-driven investigation |
| 🌐 Web research | research, web, look up, investigate, web-research | Phase 1.2 (steps 2.5 / 3.5 / 5.5) | External web research discipline: Step 0 triage + 4 maxims + strict mode |
| 💡 Solution design | brainstorm, design, architect | Phase 2 (Explore Solutions) | Multi-solution generation and comparison |
| 📋 Code review | code-review, review, requesting-review | Phase 3 (Review Solution) | Deep solution review |
| 📝 Plan authoring | plan, writing-plan | Phase 4 (Make Plan) | Structured execution plan generation |
| ⚡ Code execution | execute, executing-plan, subagent, parallel | Phase 5 (Execute Plan) | Batch orchestration of multi-file changes |
| 🧪 Test-driven | test, tdd, test-driven | Phase 5 (Execute Plan) | Write failing tests before implementation |
| 🔧 Build fix | build-fix, build, linter, type-check | Phase 5 (Execute Plan) | Build / compile / type error fixes |
| ✅ Completion verification | verify, verification, complete | Phase 6 (Check & Verify) | Independent post-execution verification |
| 🎭 Browser / UI debug | browser, devtools, cdp, playwright, screenshot, dom, css, visual-qa | Phase 1.2 (Technical Analysis) + Phase 6 (Check & Verify) | For UI/CSS/DOM issues, prefer connecting a browser for live debugging (see `browser-debug-toolkit` skill) |

### Handling probe results

- **Matched**: Record in session context; load and invoke at the corresponding phase (call sites are noted inline per phase as 🔌).
- **No match**: Skip silently and proceed with the native flow. **Never error, never block.**
- **Multiple matches of the same type**: Prefer the one with the more specific description.

### Invocation principles

- **Progressive enhancement, not replacement**: Enhancement capabilities are auxiliary; they do not change phase ordering or gate logic.
- **Read-only phases do not gain write permission**: Phase tool constraints are unchanged (Phases 1–4 forbid Edit/Write).
- **Failure does not block**: If an enhancement skill/agent errors, log a warning and continue with the native flow.
- **Read the latest docs before calling**: Before invoking an enhancement skill/agent, read its current spec file (SKILL.md or equivalent). Never invoke from memory — rules may have drifted.
<!-- /SYNC-SECTION: environment-capability-exploration -->

---

## Path Selection

Select a path by task complexity and declare it in Phase 1.1 when confirming the problem:

| Path | Applicable scenarios | Requirements |
|------|----------------------|--------------|
| Full path | New feature development, multi-module integration, ambiguous requirements | Execute Phases 1–7 in full; prefer `brainstorming`-type enhancements |
| Incremental path | Behavioral changes to existing code, refactors, ordinary bugs | Execute Phases 1–7; solution and plan may stay concise |
| Streamlined path | Hot-fixes, single-file high-confidence changes | Concise output; solution may be 1 + risk note, plan may collapse into a description. Phases 6 and 7 are NOT skippable |

If scope expands mid-execution, the path MUST be upgraded: streamlined → incremental, incremental → full. In manual mode, upgrading requires user confirmation.

Under the streamlined path, Phase 2 may output only 1 solution + risk note, and Phase 4 may collapse the plan into the solution description. Phase 6 and Phase 7 are never skippable.

---

## Phase 1: Analyze Problem

> Principle: Clarify the problem before technical analysis. Read-only; do not modify implementation logic.

### 1.1 Clarify Problem (sub-section)

> **[🤖 Auto]** Skip this sub-section, enter 1.2 directly, treat user input as the confirmed problem statement.
>
> **[👤 Manual]** Must complete this sub-section and obtain user confirmation before entering 1.2 Technical Analysis.

1. **Restate the problem** — Paraphrase the user's problem in your own words.
2. **Extract key elements** — Goal, constraints, context, expected outcome.
3. **List open questions** — Points needing further confirmation.
3.5 **Scope decomposition** (if applicable) — If the problem spans multiple independent subsystems (e.g. "chat + file storage + billing"), help decompose first: independent modules, dependency relationships, suggested processing order, then analyze the first sub-problem. **This step stays inside this sub-section; do not proactively explore code. Content the user already referenced may be read.** Decomposition is based primarily on the user's description.
4. **Wait for user confirmation.**

**Tool restriction**: Read/Grep/SemanticSearch are forbidden, with these **exceptions**:

- The user message contains `@filepath` (with optional line numbers, e.g. `@SKILL.md:83-89`).
- The user message contains a pasted code block (``` fenced or indented).
- The user explicitly provides a "function/class name + file path" combination.

When an exception applies: **read only the files and line ranges the user directly referenced**; do not expand to other files. Read results are used only to aid understanding; **the 1.1 output must not contain technical analysis conclusions**.

### 1.2 Technical Analysis

0. **Existence validation** (gate; must run first)
   - Use Read/Grep/SemanticSearch to locate the relevant code.
   - Decide the conclusion and act per the table below.

   | Conclusion | Action |
   |------------|--------|
   | ✅ Problem exists | Continue to step 0.5 (research routing) → steps 1–4 |
   | ❌ Problem no longer exists | Report "Problem not found in the current codebase; it may already be fixed or the logic may have changed", cite the relevant code locations, **stop analysis, wait for user confirmation** |
   | ⚠️ Description does not match code | Report "Code behavior differs from the description", list actual findings, **return to 1.1 to realign the problem statement** |

0.5 **Research routing** (run immediately after existence validation passes; determines the emphasis of subsequent steps)

   Judge whether the **confirmed-existing** problem's root cause is more likely internal or external — this adjusts the priority of steps 2.5 / 3 / 3.5 (it does not replace them):

   | Route | Signals | Subsequent emphasis |
   |-------|---------|---------------------|
   | 🟢 **Internal-first** | Problem talks about "our code/logic/conventions"; root cause suspected in this repo's implementation | Steps 1–2 code localization are primary; 2.5 is optional fallback; step 3 root-cause analysis is the core |
   | 🔵 **External-first** | Named third-party library/framework/API + version; or asks "how to use / why / known issues"; or matches any 2.5 trigger below (platform silent failure / host nesting / no code-level suspicion) | **2.5 becomes the first action** (web-search known cases first); if root cause is found, skip step 4; otherwise fall back to step 3 |
   | 🟣 **Hybrid, external then internal** | External concept + "our / apply to / check our" internal object (e.g. "does the X library we use have Y vulnerability" / "apply pattern X to our code") | First run 2.5 external research to understand the concept, then run step 3 internal analysis to apply it |

   > If uncertain, default to **🟢 Internal-first** (solve-workflow is fundamentally a code-change workflow; root causes are usually in the repo).
   > 🔌 If the `effective-web-research` skill is available, this routing decision may reference its Step 0 triage logic (that skill decides whether a single search should go external; this step decides the research component of an entire code problem — the two are complementary).

1. **Phenomenon description** — Reproduction conditions and steps.
2. **Relevant code localization** — File paths + line numbers, key functions/classes.
2.5 **Known-issue quick search** (when routing is 🔵 external or 🟣 hybrid, this is the **primary action**; under 🟢 internal it is an **optional fallback** — the triggers below still serve as fallback signals under the internal route)
   - **Triggers** (any one triggers, executed before step 3 root-cause analysis):
     - Problem involves a **platform / native component** (Android WebView, iOS UIPickerView, browser API, OS-level control, etc.) and manifests as **silent failure** (no error, no crash, call is correct but behavior is completely unresponsive).
     - Problem involves **host environment nesting** (React Native, Electron, Cordova, in-app WebView, etc.) and the front-end code logic appears entirely correct.
     - **No suspicious points found at the code level** (call chain complete, parameters correct, logs show execution reached the right place), yet it does not work at runtime.
   - **Execution**: Use WebSearch with "symptom keywords + platform/framework + year" to look up known cases on StackOverflow, GitHub Issues, and official docs.
     - 🔌 If `effective-web-research` is available, apply its research discipline to this WebSearch — Step 0 triage first (confirm this is an external problem, not solvable by internal code), then execute the 4 maxims (official sources first / check recency / cross-validate non-trivial claims with two sources / skip content farms); switch to its strict mode for a report when the user asks for rigorous research. If the skill is unavailable, follow the native WebSearch flow.
   - **Result handling**:

   | Search conclusion | Action |
   |-------------------|--------|
   | ✅ Known case found, root cause clear | Output [Known-issue quick-search conclusion], **jump directly to step 4** (impact evaluation), skip step 3 |
   | ⚠️ Related discussions found, root cause partially clear | Fold the search conclusion into step 3 as supporting evidence, continue root-cause analysis |
   | ❌ No related cases found | Skip silently, continue to step 3 |

   > 💡 Distinction from step 3.5: This step "pre-searches known cases by symptom" (applies whether or not a fix exists); 3.5 "evaluates whether the industry has a consensus fix after the root cause is clear" (specifically for unsolvable cases). Different timing and purpose; they do not overlap.

3. **Root-cause analysis** — Data flow and call-chain analysis.
3.5 **Industry-wide limitation assessment** (optional; triggered when the root cause clearly points to a hard limit)
   - Trigger only when the root cause **clearly points to** a hard limit of platform / language / protocol / standard (e.g. browser security policy, JS single-threadedness, network protocol constraint) AND no obvious application-layer bypass exists.
   - If triggered, use WebSearch to investigate: whether the industry has a recognized record, how mainstream frameworks / major companies handle it, whether any viable bypass exists.
     - 🔌 If `effective-web-research` is available, apply its research discipline — Step 0 triage first, then execute the 4 maxims (official sources first / check recency / cross-validate non-trivial claims / skip content farms); switch to its strict mode for a report when the user asks for rigorous research. If the skill is unavailable, follow the native WebSearch flow.
   - Handle per the table:

   | Conclusion | Action |
   |------------|--------|
   | 🚫 Industry-recognized hard problem, no viable solution | Output [Industry-wide limitation Assessment Report], **pause, wait for user decision** (continue exploring bypasses / accept status quo) |
   | ⚠️ Has limitations but a bypass exists | List the bypass as a candidate in subsequent solution exploration, continue to step 4 |
   | ✅ Not an industry ailment; fixable | Continue to step 4 |

4. **Impact scope assessment** — Affected modules / features.

### Output format

**1.1 Clarify Problem**: see [reference.md](reference.md) "Phase 1.1 Clarify Problem".

**1.2 Technical Analysis**: First report the existence-validation conclusion → 0.5 research routing (🟢 / 🔵 / 🟣) → then by route emphasis output phenomenon, localization, root cause; if step 3.5 was triggered, output the industry-wide limitation conclusion after the root cause; then output impact scope.

**Industry-wide limitation Assessment Report** (output when conclusion is "no viable solution"): see [reference.md](reference.md) "Phase 1.2 Industry-wide limitation Assessment Report".

### Red Flags — forbidden behaviors

- Proactively using Read/Grep to explore code in 1.1 before it is complete, when the user did not reference any code.
- Skipping the 1.1 sub-section with the excuse "the user already explained clearly".
- Exploring code in 1.1 before completion with the excuse "analyzing while clarifying".
- Mixing technical conclusions (root-cause judgments, fix suggestions) into 1.1 "problem restatement" or "open questions".
- **Routing decided as 🔵 external / 🟣 hybrid but skipping 2.5 known-issue quick search** (2.5 is the primary action under these routes; skipping it violates the routing decision); OR **under 🟢 internal routing, a 2.5 trigger is hit but skipped with the excuse "look at code first" / "instrument first"** (violates early-search principle; WebSearch for known cases is allowed before code-level suspicion is established).

**Violation of these is a principle violation. [👤 Manual] Must complete 1.1 Clarify Problem and obtain confirmation before entering 1.2. [🤖 Auto] Skipping 1.1 is not bound by this restriction.**

---

<!-- SYNC-SECTION: instrumentation-debugging -->
### 🔬 Instrumentation Debugging (when static analysis stalls, proactively upgrade to runtime debugging)

**Triggers** (any one triggers; takes priority over entering Phase 2):

- Root-cause confidence is "fuzzy" or "unknown" — the rough module is locatable, but the specific logic or trigger path cannot be determined.
- The current attempt is a retry — a fix based on static analysis has already been tried, but the problem persists.

> Static analysis has limits: runtime data flow, call ordering, and variable values can only be observed in real execution. When confidence is insufficient, proactively upgrade to instrumentation debugging and anchor the root cause with runtime facts.

> 🔌 **UI/CSS/DOM problems should prefer browser DevTools**: if the issue concerns styles, layout, rendering, or DOM structure, and a browser-debug capability is available (chrome-devtools-connect MCP / playwright / webapp-testing), prefer connecting a browser for live inspection (DOM tree, computed styles, box model) — far more efficient than `console.log` instrumentation. See the `browser-debug-toolkit` skill.

**Execution steps**:

| Step | Content |
|------|---------|
| 1. Design instrumentation | Identify 2–5 key nodes (function entry/exit, state-change points, data-flow points) |
| 2. Generate probe code | `console.log('[DEBUG-<location-id>]', { key: value, timestamp: Date.now() })` (adapt to project language; include location id, key variables, timestamp) |
| 3. User instructions | Tell the user: where to add the probes, reproduction steps, where to view logs (browser console / terminal / log file) |
| 4. Wait for logs | ⛔ Stop; wait for the user to execute and provide log output |
| 5. Log analysis | Analyze the actual call chain and data flow, produce a root-cause conclusion, update the Phase 1.2 output |
| 6. Cleanup suggestion | (Optional) After the root cause is confirmed, indicate which probes can be removed and which are worth keeping as permanent monitoring |

**Escape hatch 5.5** (triggers when the root cause is still "fuzzy/unknown" after step 5):

> Instrumentation can only observe "code-layer execution paths"; it cannot pierce silent interception by the platform layer / host environment.

1. **Escalate the search**: Use WebSearch with "symptom keywords + platform/framework version + year" to find known cases.
   - 🔌 If `effective-web-research` is available, apply its research discipline — Step 0 triage first, then execute the 4 maxims (official sources first / check recency / cross-validate non-trivial claims / skip content farms). If the skill is unavailable, follow the native WebSearch flow.
2. **Result handling**: Found → update the root-cause hypothesis, return to step 5; Not found → output "list of ruled-out hypotheses", **pause and wait for user decision** (continue instrumenting / seek external support / enter Phase 2 with a hypothesis).
<!-- /SYNC-SECTION: instrumentation-debugging -->

---

## Phase 2: Explore Solutions

> Principle: Based on Phase 1's analysis, provide 2–5 solutions. Strip unnecessary features and over-engineering from solutions (YAGNI).

### [🤖 Auto] Solution selection

Auto-generate 2–5 solutions; the AI auto-recommends and selects the best one (priority: more thorough fix > matches best practice > improves code quality > fewer changes), then enter Phase 3 directly.

### [👤 Manual] Solution selection

Output a solution comparison table; after the user selects, enter Phase 3.

### Output format

1. **Opening**: solution comparison table.
2. **Middle**: each solution expanded in detail (see "Each solution contains" below).
3. **Closing**: repeat the comparison table for quick review.

| Solution | Description | Pros | Cons | Complexity | Recommendation |
|----------|-------------|------|------|------------|----------------|
| Solution 1 | ... | ... | ... | Low/Med/High | ⭐⭐⭐⭐⭐ |
| Solution 2 | ... | ... | ... | Low/Med/High | ⭐⭐⭐ |

### Each solution contains

- Core idea (1–2 sentences).
- Files / modules to modify.
- Implementation difficulty assessment, potential risks, applicable scenarios.

### Red Flags — forbidden behaviors

- Generating only 1 solution with the excuse "the direction is already clear", skipping the comparison.
- **[👤 Manual]** Self-advancing to the review phase before the user picks a solution.

---

## Phase 3: Review Solution

> Principle: Deeply review the selected solution, clarify its specific content and risks, then decide whether to proceed to planning.

### Review dimensions (every round must cover all)

1. **Resolution effectiveness**: Does it fully cover the root cause, efficiently and with high quality? Core logic and key implementation points.
2. **Side effects and risks**: Does the change cause new problems in other modules (functional side effects)? Does it introduce performance / security / maintainability issues (non-functional side effects)? Are mitigation measures identified for known issues?
3. **Implementation feasibility**: Scope of changes, dependencies, are the files / modules involved clearly actionable?
4. **Coding-standard conformance**: Does it match the project's existing patterns and best practices?

### Review conclusion (two-level)

| Conclusion | Criteria | Next action |
|------------|----------|-------------|
| ✅ **Pass** | None of the four dimensions has a blocking issue; only acceptable low-risk items remain | Enter Phase 4 |
| ❌ **Fail** | Any dimension has an unresolved issue or an unacceptable risk | Enter optimize → re-review loop |

**Blocking-issue criteria** (any one means ❌ Fail):

- Solution cannot fully cover the root cause, or resolution quality is clearly inefficient or low-quality (resolution effectiveness insufficient).
- Identified medium/high risks without proposed mitigation.
- Files to modify or dependencies are unclear; an executable plan cannot be derived.
- Clear conflict with the project's existing design patterns or coding standards.
- Possible new bugs or breakage of existing functionality, with side effects unaddressed.

**Non-blocking issues** (may be noted as suggestions; do not block pass):

- Low-risk items with mitigation in place.
- Code-style preferences (not affecting correctness).
- Performance improvements that can be deferred to a later iteration.

### Loop flow

```
Solution selected → Review (round N) → Output review report
                       ↓
              Conclusion assessment
               ├── ✅ Pass → Enter Phase 4
               └── ❌ Fail → Optimize solution → Return to review (round N+1)
                                  ↓
                            [🤖 Auto] Cap reached?
                             ├── No → Continue loop
                             └── Yes → Pause, wait for user intervention
```

### [🤖 Auto] Review loop

- **Decider**: AI decides pass/fail automatically.
- **On fail**: AI auto-optimizes the solution based on the issue list in the review report, outputs an optimization note, then re-reviews.
- **Cap**: **3 rounds** (round 1 is the initial review; at most 2 optimize-and-re-review cycles).
- **Cap exceeded**: Pause, output a 3-round review summary (issues + optimization record per round), wait for user decision. User options:
  - Say 「继续审查」 / "continue review" → append review rounds (cap reset to +3 rounds).
  - Say 「重选方案」 / "re-pick solution" → return to Phase 2 solution selection.
  - Manually adjust the solution direction, then say 「重新审查」 / "re-review".

### [👤 Manual] Review loop

- **Decider**: User decides pass/fail.
- AI outputs the review report, then waits:
  - User says 「通过」「确认」「OK」 / "pass" "confirm" "OK" → Enter Phase 4.
  - User says 「修改方案」「完善方案」「优化方案」 / "modify solution" "refine solution" "optimize solution" → Optimize per the user's guidance, then re-review.
  - User says 「重选方案」 / "re-pick solution" → Return to Phase 2 solution selection.
- **Cap**: None (user-controlled).

### Review report output fields

See [reference.md](reference.md) "Phase 3 Review Report".

### Red Flags — forbidden behaviors

- Skipping the solution review and entering Phase 4 directly (risks go unidentified).
- Modifying code during the review phase (violates the read-only constraint).
- **[🤖 Auto]** Not optimizing the solution on fail, advancing directly to Phase 4.
- **[🤖 Auto]** Exceeding the 3-round cap without pausing.
- **[🤖 Auto]** Optimizing the solution without outputting an optimization note, making the review record untraceable.
- **[👤 Manual]** Self-advancing without an explicit user pass/fail verdict.

### Post-pass design summary

After the review passes, output a structured **design summary** for Phases 4 and 5 to reference:

```
[Design Summary]
- Goals: what this change achieves
- Non-Goals: explicitly out of scope
- Decisions: rationale and trade-offs for the chosen solution
- Risks: identified risks and mitigations
- Open Questions: items to confirm or follow up later
```

This summary is part of the Phase 3 output, not a separate file, and is referenced by later phases.

---

## Phase 4: Make Plan

> Principle: A detailed, executable change plan. Output plan text only; do not execute code changes.

1. **Goal solution recap** — Core idea of the review-approved solution.
2. **File change list** — File path, modification location, specific change description.
3. **Modification order** — Execution order accounting for dependencies.

### Output format

See [reference.md](reference.md) "Phase 4 Make Plan".

### Update Plan (sub-phase)

When the user says 「更新计划」「修订计划」「修改计划」 / "update plan" "revise plan" "modify plan", execute this phase and additionally annotate the **change diff** and **change reason**.

---

## Phase 5: Execute Plan

> Principle: Execute strictly per plan; confirm on completion.

### Execution flow

1. Modify files in the planned order.
2. After each modification, state what was completed.
3. If the Phase 4 plan uses checkbox format (`- [ ]` / `- [x]`), **flip the corresponding `[ ]` to `[x]` immediately after each item is completed** — do not defer to a batch update at the end.
4. After all modifications, output the execution report.
5. **Auto-advance to Phase 6**: When execution is smooth with no blockers or decisions needed, enter Phase 6 immediately after the report. If a problem arises or a decision is needed, confirm with the user first.

### Execution report

- List of modified files, key change notes.
- Suggested test steps.
- Whether any deviation from the plan was made (and why, if so).
- Verification checklist / self-check items (for Phase 6 to use).

### Test-suite suggestion (before the execution report)

After all modifications, before emitting the execution report, **check whether this change has test coverage**:

- If the change **already has test coverage** → continue.
- If the change **has no test coverage** and involves business logic → **explicitly flag in the execution report**: "This change touches business logic but no tests were generated. Consider adding unit tests to prevent regression."
- If the change is config / style / docs only → no reminder needed.

> 💡 This step is advisory and non-blocking. If the project has the `ensure-tests` skill, it may be delegated to handle test generation and execution.

---

## Phase 6: Check & Verify

> Principle: Output verification results only; do not output improvement suggestions. Improvement suggestions belong to Phase 7.

1. **Goal attainment** — Whether the expected outcome from Phase 1.1 is achieved.
2. **Plan comparison** — Compare against the Phase 4 plan.
3. **Verification and tests** — May cite the Phase 5 execution report; **if test-related content exists, execute the tests**.
4. **Side-effect verification** — Check whether the change introduced new problems or unexpected behavioral changes in other modules (functional side effects), and whether it introduced unexpected performance / security / maintainability impacts (non-functional side effects).
5. **Logic and flow review** — Check for gaps or omissions.

### Test execution

If the Phase 4 plan or Phase 5 execution report involves tests (e.g. unit tests, integration tests, manual verification steps):

- **AI-executable**: Use Bash to run test commands (e.g. `npm test`, `pytest`, `go test`); fold results into the verification conclusion.
- **AI-not-executable** (no Bash, environment limits, tests require human action): **Explicitly remind the user**: "This change involves tests; please run [specific test command/steps] yourself and confirm pass before closing out."

### Verification honesty principle

Every verification result must be annotated in parentheses with its **actual execution status**:

- **Executed**: Note the command and output summary (e.g. `Executed (npm test; result: 3 passed)`).
- **Pending**: Note the specific human-action steps required (e.g. `Pending (verify modal behavior in browser)`).

**Forbidden**:

- Writing "designed a verification scenario" as "verification passed".
- Using "the code logic should be fine" as a verification conclusion.
- Failing to annotate AI-unexecutable steps (e.g. browser interaction) as "Pending".

### Output format

See [reference.md](reference.md) "Phase 6 Check Result".

---

## Phase 7: Review & Summarize

> Principle: Only summarize, suggest codification, and propose next steps. Do not write files by default. If the user explicitly requests writing rules, creating a skill, or making further changes per the improvement points, enter a new round of "Make Plan → Execute Plan"; alternatively return to "Review Solution" to re-pick or adjust the solution.

1. **Retrospective on effective practices and failures** — Which practices are worth keeping; which should not be reused.
2. **Assess codification value** — Only codify high-reuse, already-validated, long-term-value experience for the team or engineering. One-off experience, unvalidated judgments, and personal temporary preferences should not be written into long-term rules.
3. **Recommend an AI-engineering codification target** — Indicate which type of carrier is recommended, and why.
4. **Next step when goals are not met** — Whether to enter the next round, and which phase to return to.
5. **Close-out and optional summary doc** — Record residual risks and follow-up improvements; after emitting [Improvement suggestions], proactively ask "Do you want a summary doc?"; if yes, generate one (path user-specified or AI-suggested), covering: problem restatement, solution selection, execution result, residual items and improvements.

### AI-engineering codification target selection

| Carrier | Applicable content |
|---------|--------------------|
| `AGENTS.md` | Project-level, cross-tool, team-shared long-term rules and engineering conventions |
| `CLAUDE.md` | Claude-Code-specific behavioral constraints, workflow preferences, or tool-usage conventions |
| `.cursor/rules/` | Cursor-specific rules, file-pattern rules, in-editor AI guidance |
| In-project skill | Stable, reusable workflows or domain knowledge that can be triggered explicitly in the future |
| Summary doc | One-off retrospective, background record, experience not yet suitable for codifying as rules |

### Output format

See [reference.md](reference.md) "Phase 7 Improvement Suggestions".

After output, proactively ask: 「是否需要生成总结文档？」 / "Do you want a summary doc?"

---

## Common Pitfalls (non-obvious; full table in reference.md)

Only entries an LLM would get wrong without explicit instruction are kept here. The full table is in [reference.md](reference.md) "Common Pitfalls (full table)".

| Pitfall | Consequence | Fix |
|---------|-------------|-----|
| Skipping 1.1 to read code directly | Misunderstands the problem, invalid analysis | Manual mode must complete Clarify Problem and obtain confirmation; auto mode may skip 1.1 |
| Skipping existence validation, jumping into root-cause analysis | Analyzes a non-existent problem, wastes context | 1.2 must start with existence validation |
| Existence-validation conclusion is "does not exist / mismatch" but analysis continues | Entire direction is wrong | Stop immediately, report, wait for user confirmation |
| Industry-wide limitation conclusion is "no viable solution" but does not pause for user confirmation | May produce meaningless solutions | Pause after the assessment report, wait for user decision on whether to continue |
| Asking multiple questions at once when information is insufficient | Cognitive overload on the user, lower-quality answers | Ask only the 1 most-critical question per turn; wait for the answer before asking the next |
| "User mentioned = necessary" — failing to strip | Bloated solutions | Strip unnecessary features (YAGNI) |
| Auto-mode review loop exceeds 3 rounds without pausing | Infinite loop wastes resources | Must pause at the 3-round cap and wait for user intervention |
| Review loop fails to record each round's optimization | Review process is untraceable | Every round must output a complete review report |
| Phase 7 default-writes rule files or creates skills | Pollutes long-term rules; breaks the "summarize only, don't force changes" boundary | Phase 7 outputs codification suggestions only; only enter "Make Plan → Execute Plan" after explicit user request |
| Route decided as 🔵/🟣 but skipping 2.5; OR 🟢 internal route with triggers hit but skipping early search | Wastes many debugging rounds; may repeatedly step on a known-issue mine | Under 🔵/🟣, 2.5 is the primary action and must run first; under 🟢, when triggers are met, run WebSearch before instrumenting |

---
