---
name: goal-driven-workflow
version: "0.2.0"
user-invocable: true
description: "Goal-Driven long-run workflow: run an agent autonomously for hours toward a verifiable goal. Five stages — ① clarify requirements & output contract ② layer acceptance criteria + design the /goal condition (measurable end state, stated check, constraints, turn/time cap) ③ sub-agent division & context management (context-rot mitigation) ④ launch the long run (/goal, claude -p non-interactive, or manual-loop fallback) ⑤ completion report & human acceptance. Built on top of Claude Code's native /goal harness, with a generic fallback for environments without /goal. Triggers — 「goal 长跑」「goal run」「goal-driven」「目标驱动长跑」「一个 goal 下去跑」「长跑目标」「无人值守跑任务」「goal-run」 / goal run, goal-driven, long-run goal, autonomous run, run until done."
dependencies:
  - clarifying-question-discipline
  - completion-evidence-discipline
  - design-approval-gate
---

# Goal-Driven Long-Run Workflow

> Run an agent autonomously for hours toward a **verifiable** goal. Primary harness example: Claude Code's native `/goal` (condition + evaluator loop). This skill adds requirement alignment, acceptance layering, sub-agent context management, and post-run reporting — plus a generic fallback when `/goal` is unavailable.
> Stages 1–3 are read-only **design**; stage 4 is the run; stage 5 is reporting/acceptance. Default is manual mode (pause at each stage exit); say 「自动模式」/「自动跑」 / "auto mode" to advance without confirmation (except the high-impact launch gate).
> **Output templates**: [reference.md](reference.md).

## Invocation Conventions

- **Trigger words** (per `description`): 「goal 长跑」「goal run」「goal-driven」「目标驱动长跑」「一个 goal 下去跑」「长跑目标」「无人值守跑任务」「goal-run」 / goal run, goal-driven, long-run goal, autonomous run, run until done
- **Command form**: `/goal-driven-workflow xxx`, `/goal-run xxx`
- **Default behavior**: treat `xxx` as the task to run as a goal; enter stage 1 (clarify). If `xxx` already has a concrete verifiable goal + acceptance criteria, skip ahead to stage 2.
- **Not applicable**: single-step edits, tasks with no verifiable end state, or tasks better served by recurring `/loop`-style polling or plain single-turn auto approvals.

## Strong dependencies

Frontmatter `dependencies`; prerequisite check must pass or the flow aborts:

- `clarifying-question-discipline` — stage 1 clarification
- `completion-evidence-discipline` — stage 2/5 acceptance evidence
- `design-approval-gate` — stage 4 launch approval pattern (see long-run divergence below)

**Related (informational)**: `solve-workflow` (full PDCA); handbook §8 of `docs/7x24-agent-reliability-handbook.md`.

## Prerequisite Skill Check

> Run at startup, before stage 1, against every strong dependency.

1. Scan available skills
2. All present → continue
3. Any missing → print the missing-dependency notice ([reference.md](reference.md) § Prerequisite Skill Check — Missing Notice) and **abort immediately**

> **No-downgrade**: missing strong dependency aborts — never silently simplify.

---

## Path Selection (lightweight)

Long-run scale is already expressed by the goal condition and budget in stage 2. For a single-file high-certainty change, keep stage 2/3 lean (one goal condition + minimal sub-agent planning); for multi-module / cross-domain work, plan sub-agent division and context technique in full. Stage 5 (report + human acceptance) is never skipped.

---

## Stage overview

| Stage | Tool permission | Manual stop | Required output |
|-------|-----------------|-------------|-----------------|
| 1 Clarify & output contract | ❌ Read/Write | ⛔ stop, wait confirm | restatement + Template 1 |
| 2 Acceptance + goal condition | ✅ Read; ❌ Edit/Write | ⛔ stop, wait confirm | Template 2 + 4-part condition |
| 3 Sub-agent division & context | ✅ Read; ❌ Edit/Write | ⛔ stop, wait confirm | Template 3 |
| 4 Launch the long run | ✅ Everything | auto-advance when clean | Template 4 + run log |
| 5 Report & acceptance | ✅ Bash; ❌ Edit/Write | ⛔ stop, wait confirm | Template 5 |

> Manual mode pauses at each ⛔. Auto mode advances 1→2→3→4→5; stage 5 always ends with human acceptance (the agent cannot self-verify outcome-level standards). Stage 4 high-impact launch still pauses under auto.

---

## Stage 1: Clarify Requirements & Output Contract

> ⚠️ Follow `clarifying-question-discipline` (one question per turn; multi-round until clear; clarify first, do not rush to answer).

1. **Restate the goal**; extract goal / deliverables / constraints / expected outcome.
2. **Ask exactly ONE most critical question per turn** until the goal is unambiguous (selection per `clarifying-question-discipline`). Prefer structured single-select with a recommended answer; fall back to prose if the host has no structured UI.
3. **Output contract**: agree on deliverable(s) and what "done" looks like.
4. **Pre-judge output vs outcome** (see stage 2): mark which standards the agent can self-verify (output-type) vs which need human judgment (outcome-type).
5. Fill **Template 1** ([reference.md](reference.md) § Stage 1).

**Red Flags**: dumping multiple clarifying questions/open points in one message; rushing to answer during clarification; rushing past clarification into the run; fuzzy "just make it good" goals; skipping scope/out-of-scope boundaries.

---

## Stage 2: Acceptance Criteria + Goal Condition

1. **Layer acceptance criteria** into three tiers ([reference.md](reference.md) § Stage 2 — Template 2):
   - **Hard** (machine-verifiable) → agent self-verifies; these become the goal-harness condition
   - **Soft** (LLM-judge + deterministic checker) → optional quality gate
   - **Human** (outcome-type) → human acceptance in stage 5
2. **Design the goal condition** using four parts. Primary harness (`/goal`) evaluators **only read the transcript** — they do not run commands or read files — so the condition must be something the agent's own output can demonstrate:

   ```
   <one measurable end state> + <stated check: how the agent proves it> + <constraints that must not change> + <budget clause: "or stop after N turns / N minutes">
   ```

   - Good: `all tests in test/auth pass and the lint step is clean`
   - Good: `every call site of the old API is migrated and the build succeeds, stop after 20 turns`
   - Bad: `the app is production-ready` (nothing verifiable in the transcript)
3. **Budget is mandatory** — primary `/goal` harness has **no built-in token budget**. Always add `or stop after N turns` (or a time clause).
4. **Split compound objectives** into a **chain of sequential goals**, each with its own verifiable end state.
5. Output **Template 2 + the final 4-part condition** for confirmation.

**Red Flags**: vague conditions (infinite loop or hallucinated success); compound mega-goals in one harness run; no budget clause; constraints that could silently be violated.

---

## Stage 3: Sub-agent Division & Context Management

**Why**: **context rot** — recall accuracy drops as the transcript grows. Long runs that keep everything in one context degrade. Splitting is a requirement, not an optimization.

1. **Division principle**: the main agent holds the **high-level plan + synthesis** (and the goal condition); sub-agents do deep work in **clean contexts** and return only a **condensed summary (1–2k tokens)**.
2. **Pick the context technique** ([reference.md](reference.md) § Stage 3):
   - **Sub-agent architecture** — parallel exploration / multi-module work
   - **Compaction** — long conversational flows (summarize-and-reopen near the window limit)
   - **Structured note-taking** — milestone-driven iterative work (NOTES.md / memory)
3. Define each sub-agent's task, minimal tool set, output contract, completion condition, and failure handling. Prefer an **independent harness** (writer vs reviewer separation) to avoid cross-bias.
4. Fill **Template 3**.

**Red Flags**: main agent absorbing sub-agent details (context flows back in); sub-agents without output contracts; unbounded tool sets.

---

## Stage 4: Launch the Long Run

> **Launch approval**: load `design-approval-gate` for the approval pattern. **Long-run divergence**: when the launch is high-impact — unattended/scheduled, budget over threshold (e.g. >30 turns / >1h / large token), or irreversible (deploy / outbound messages / bulk production data) — **auto mode does not bypass**; pause and get explicit user approval of final goal condition + budget + companion checklist before starting. Low-impact launches may proceed after prior stage confirms without this high-impact pause.

1. **Pre-flight** (intent-first; [reference.md](reference.md) § Stage 4). Primary-harness examples in parentheses:
   - **Per-turn project convention file** at repo root (e.g. `CLAUDE.md`) — encode architecture, coding conventions, acceptance rules for multi-turn consistency.
   - **Post-edit validation hooks** (e.g. PostToolUse lint/type-check) — catch issues mid-run.
   - **Auto-approval mode** for routine tool writes — without it, long runs stall on every file write.
   - Confirm budget (turns/time/token) from stage 2.
2. **Launch** (choose by environment):
   - Interactive goal harness: e.g. `/goal <condition>` when available.
   - Non-interactive agent CLI wrapping the harness: e.g. `claude -p "/goal <condition>" --output-format stream-json --verbose`.
   - **Fallback** (no goal harness): manual bounded loop — do work → verify against acceptance checklist → continue if unmet (budget-bounded) → else stop; explicit stop clause required.
3. **Monitor**: check harness status (elapsed, turns, tokens, latest evaluator reason); interrupt early via the environment's cancel control (e.g. Ctrl+C / `/goal clear`).
4. Output **Template 4** and start the run.

**Red Flags**: skipping auto-approval mode (run stalls on writes); no budget; no per-turn convention file; one giant goal instead of a chain.

---

## Stage 5: Completion Report & Human Acceptance

> Follow `completion-evidence-discipline`: any "done / pass" claim needs **fresh current-turn evidence** (command output / test results / file diffs). Label each item `Executed` (command + output summary) or `Pending` (manual action required).

1. Main agent produces a **structured completion report** ([reference.md](reference.md) § Stage 5 — Template 5): goal recap, acceptance status (hard/soft/human), deliverables + verification evidence, leftovers/risks, spend.
2. **Human acceptance**:
   - Machine-verifiable items: reported by agent + spot-check.
   - Outcome-level items: **judged by the human** — harness evaluators verify output, never outcome.
3. **Feedback loop**: acceptance findings feed the next run's Template 1.

**Red Flags**: claiming "done" without evidence; agent auto-marking outcome items as passed.

---

## Mode Lifecycle

- **Manual (default)**: pauses at stages 1, 2, 3, the stage-4 high-impact approval gate, and stage 5.
- **Auto** (「自动模式」/「自动跑」 / "auto mode"): advances 1→2→3→4→5 without confirmation, **except** the stage-4 high-impact gate; stage 5 always ends at human acceptance.
- **Revert-to-manual**: auto always reverts to manual on completion (including after stage-5 acceptance) or on any interruption. Re-entering auto requires an explicit trigger; implicit continuation never re-activates it.
- **Long-run specific**: when a run ends (goal met or budget exhausted), return control to the human — do not auto-start a new goal or auto-extend the budget without explicit confirmation.

---

## Common Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Self-correction without a deterministic checker | A "fix" worsens a working result | Only iterate on deterministic-checker failures; re-verify after each fix |
| Agent marks outcome items as passed | "Done" without real acceptance | Outcome-type standards are judged by the human in stage 5 |
| Treating primary-harness CLI as the only platform | Other agents cannot run the skill | Follow intent-first launch + generic fallback in stage 4 |
