---
name: goal-driven-workflow
version: "0.1.0"
user-invocable: true
description: "Goal-Driven long-run workflow: run an agent autonomously for hours toward a verifiable goal. Five stages — ① clarify requirements & output contract ② layer acceptance criteria + design the /goal condition (measurable end state, stated check, constraints, turn/time cap) ③ sub-agent division & context management (context-rot mitigation) ④ launch the long run (/goal, claude -p non-interactive, or manual-loop fallback) ⑤ completion report & human acceptance. Built on top of Claude Code's native /goal harness, with a generic fallback for environments without /goal. Triggers — 「goal 长跑」「goal run」「goal-driven」「目标驱动长跑」「一个 goal 下去跑」「长跑目标」「无人值守跑任务」「goal-run」 / goal run, goal-driven, long-run goal, autonomous run, run until done."
dependencies:
  - clarifying-question-discipline
  - completion-evidence-discipline
---

# Goal-Driven Long-Run Workflow

> An execution workflow for running an agent autonomously for hours toward a **verifiable** goal. Built on top of Claude Code's native `/goal` harness (the condition + evaluator loop already live in the harness — this skill guides how to use it well and fills what it lacks: requirement alignment, acceptance layering, sub-agent context management, and post-run reporting).
> Stages 1–3 are read-only **design** stages; stage 4 is the run; stage 5 is reporting/acceptance. Default is manual mode (pause for confirmation at each stage exit); say 「自动模式」/「自动跑」 to advance without confirmation.
> **Output templates**: each stage's output format lives in [reference.md](reference.md).

## Invocation Conventions

- **Trigger words** (per `description`): 「goal 长跑」「goal run」「goal-driven」「目标驱动长跑」「一个 goal 下去跑」「长跑目标」「无人值守跑任务」「goal-run」 / goal run, goal-driven, long-run goal, autonomous run, run until done
- **Command form**: `/goal-driven-workflow xxx`, `/goal-run xxx`
- **Default behavior**: treat `xxx` as the task to run as a goal; enter stage 1 (clarify). If `xxx` already contains a concrete verifiable goal + acceptance criteria, skip ahead to stage 2.
- **Not applicable**: single-step edits, tasks with no verifiable end state, or tasks better served by `/loop` (recurring polling) or plain auto mode (single-turn tool approvals).

## Strong dependencies (frontmatter `dependencies`; prerequisite check must pass or the flow aborts)

- `clarifying-question-discipline`: stage 1 requirement clarification (one question per turn; clarify-first)
- `completion-evidence-discipline`: stage 2/5 acceptance evidence (no pass claims without fresh evidence)

**Related (informational)**: `solve-workflow` (full PDCA; this workflow is the "goal long-run" execution path), manual §8 of the 7×24-agent-reliability-handbook (methodology source).

## Prerequisite Skill Check

> Run at startup, before stage 1, against every strong dependency in frontmatter `dependencies`.

1. Scan available skills (check `<available_items>` or use the `skill` tool)
2. All present → continue
3. Any missing → print the missing-dependency notice (format in [reference.md](reference.md) § Prerequisite Skill Check — Missing Notice) and **abort immediately**

> **No-downgrade principle**: a missing strong dependency aborts the flow — never fall back to a simplified version.

---

## Stage overview

| Stage | Tool permission | Manual stop | Required output |
|-------|----------------|-------------|-----------------|
| 1 Clarify & output contract | ❌ Read/Write | ⛔ stop after, wait confirm | restatement + 模板1 |
| 2 Acceptance + goal condition | ✅ Read; ❌ Edit/Write | ⛔ stop after, wait confirm | 模板2 + 4-part condition |
| 3 Sub-agent division & context | ✅ Read; ❌ Edit/Write | ⛔ stop after, wait confirm | 模板3 |
| 4 Launch the long run | ✅ Everything | auto-advance when clean | 模板4 + run log |
| 5 Report & acceptance | ✅ Bash; ❌ Edit/Write | ⛔ stop after, wait confirm | 模板5 |

> Manual mode pauses at each ⛔. Auto mode advances 1→2→3→4→5; stage 5 always ends with a human acceptance point (the agent cannot self-verify outcome-level standards).

---

## Stage 1: Clarify Requirements & Output Contract

> ⚠️ 主动提问：遵循 `clarifying-question-discipline`（一次一问、多轮问清；问清优先，不急着答）。

1. **Restate the goal** in your own words; extract goal / deliverables / constraints / expected outcome.
2. **Ask exactly ONE most critical question per turn** (purpose → constraints → success criteria priority) until the goal is unambiguous. Use AskUserQuestion (or native equivalent) with a recommended answer.
3. **Output contract**: agree on the deliverable(s) and what "done" looks like.
4. **Pre-judge output vs outcome** (see stage 2): mark which standards the agent can self-verify (output-type) vs which need human judgment (outcome-type).
5. Fill **模板1 需求对齐清单** ([reference.md](reference.md) § Stage 1).

**Red Flags**: rushing past clarification into the run; fuzzy "just make it good" goals; skipping scope/out-of-scope boundaries.

---

## Stage 2: Acceptance Criteria + Goal Condition

1. **Layer the acceptance criteria** into three tiers ([reference.md](reference.md) § Stage 2 — 模板2):
   - 硬性（machine-verifiable）→ the agent self-verifies; these become the `/goal` condition
   - 软性（LLM-judge + deterministic checker）→ optional quality gate
   - 人工（outcome-type）→ human acceptance in stage 5
2. **Design the `/goal` condition** using the official 4 parts. The evaluator **only reads the transcript — it does not run commands or read files** — so the condition must be phrased as something Claude's own output can demonstrate:

   ```
   <one measurable end state> + <stated check: how Claude proves it> + <constraints that must not change> + <budget clause: "or stop after N turns / N minutes">
   ```

   - Good: `all tests in test/auth pass and the lint step is clean`
   - Good: `every call site of the old API is migrated and the build succeeds, stop after 20 turns`
   - Bad: `the app is production-ready` (nothing verifiable in the transcript)
3. **Budget is mandatory** — `/goal` has **no built-in token budget**. Always add `or stop after N turns` (or a time clause) to the condition.
4. **Split compound objectives** into a **chain of sequential goals**, each with its own verifiable end state. One goal = one verifiable finish line.
5. Output **模板2 + the final 4-part condition** for confirmation.

**Red Flags**: vague conditions (infinite loop or hallucinated success), compound mega-goals in one `/goal`, no budget clause, constraints that could silently be violated.

---

## Stage 3: Sub-agent Division & Context Management

**Why**: **context rot** — recall accuracy drops as the transcript grows (the `n²` attention cost). Long runs that keep everything in one context degrade. Splitting is a requirement, not an optimization.

1. **Division principle**: the main agent holds the **high-level plan + synthesis** (and the `/goal` condition); sub-agents do deep work in **clean contexts** and return only a **condensed summary (1–2k tokens)**.
2. **Pick the context technique** that fits the task ([reference.md](reference.md) § Stage 3):
   - **Sub-agent architecture** — parallel exploration / multi-module work
   - **Compaction** — long conversational flows (summarize-and-reopen near the window limit)
   - **Structured note-taking** — milestone-driven iterative work (NOTES.md / memory)
3. Define each sub-agent's task, minimal tool set, output contract, completion condition, and failure handling. Prefer an **independent harness** (writer vs reviewer separation) to avoid cross-bias.
4. Fill **模板3 sub-agent 分工清单**.

**Red Flags**: main agent absorbing sub-agent details (context flows back in); sub-agents without output contracts; unbounded tool sets.

---

## Stage 4: Launch the Long Run

1. **Pre-flight** ([reference.md](reference.md) § Stage 4):
   - **CLAUDE.md at project root** — every turn reads it; encode architecture/coding conventions/acceptance rules there for consistency across a multi-turn run.
   - **PostToolUse hooks** for auto-validation (lint/type-check on each edit) — catches issues mid-run.
   - **Auto mode** (`/goal` + auto mode) — without it, a long run stalls waiting for file-write approvals.
   - Confirm budget (turns/time/token) from stage 2.
2. **Launch** (choose by environment):
   - Interactive: `/goal <condition>` (starts a turn immediately with the condition as directive).
   - Non-interactive (runs to completion in one invocation): `claude -p "/goal <condition>" --output-format stream-json --verbose` (stream-json + verbose to see live progress).
   - **Fallback** (no `/goal`, e.g. older version / other agent): run a manual goal loop — the agent iterates: do work → verify against acceptance checklist → if not met, continue (bounded by budget) → else stop; the loop must have an explicit stop clause.
3. **Monitor**: check `/goal` status anytime (elapsed, turn count, token spend, evaluator's latest reason); `Ctrl+C` (or `/goal clear`) to interrupt early.
4. Output **模板4 goal prompt/condition 记录** and start the run.

**Red Flags**: skipping auto mode (run stalls on approvals); no budget (tokens burn); no CLAUDE.md (context drifts across turns); one giant `/goal` instead of a chain.

---

## Stage 5: Completion Report & Human Acceptance

1. Main agent produces a **structured completion report** ([reference.md](reference.md) § Stage 5 — 模板5): goal recap, acceptance-criteria status (hard/soft/human), actual deliverables + verification evidence, leftovers/risks, spend.
2. **Human acceptance**:
   - Machine-verifiable items: reported by agent + spot-check.
   - Outcome-level items: **judged by the human** — the evaluator can only verify output, never outcome.
3. **Feedback loop**: acceptance findings feed back into the next run's 模板1 (requirements) — close the loop.

**Red Flags**: agent claiming "done" without evidence (per `completion-evidence-discipline`); outcome items auto-marked as passed by the agent.

---

## Mode Lifecycle

- **Manual (default)**: pauses at stages 1, 2, 3, 5 for confirmation.
- **Auto** 「自动模式」/「自动跑」: advances 1→2→3→4→5 without confirmation; stage 5 still ends at human acceptance.
- Auto always reverts to manual on completion or interruption; re-entering auto requires an explicit trigger.

---

## Common Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Vague goal condition | Infinite loop or evaluator hallucinates success | 4-part condition: measurable end state + stated check + constraints |
| Compound objective in one `/goal` | Evaluator overwhelmed; no clean finish | Split into sequential goals with individual verifiable end states |
| No budget clause | Tokens burn with no stop | Always add `or stop after N turns` |
| No auto mode | Run stalls on every file-write approval | `/goal` + auto mode |
| No CLAUDE.md / no hooks | Context drifts; issues found too late | CLAUDE.md + PostToolUse hooks |
| Self-correction without a deterministic checker | A fix "improves" a working result | Only iterate on deterministic-checker failures; re-run verification after each fix |
| Agent marks outcome items as passed | "Done" without real acceptance | Outcome-type standards are judged by the human in stage 5 |
