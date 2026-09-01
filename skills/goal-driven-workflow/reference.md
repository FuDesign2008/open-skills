# Goal-Driven Workflow — Output Format Reference

Per-stage output templates for `goal-driven-workflow`, plus a primary-harness cheat sheet for Claude Code's `/goal` (examples — other agents use equivalents). Methodology source: 7×24-agent-reliability-handbook §8.

---

## Stage 1 — Requirements & Output Contract (Template 1)

```
【Goal restatement】I understand the goal as: ...
【Key elements】Deliverables: ... / Constraints: ... / Background: ... / Expected outcome: ...
【Frozen decisions】(per intake-interview-discipline: chosen approach one-liner; resolved tickets; deferred tickets + reason; initial assumptions; Decisions-I-made-for-you — self-answered decisions with impact tiers, shown at the approval event; pre-launch self-review pass/blocking doubt)
【Output vs Outcome pre-judge】
- Output-type (agent can self-verify): <e.g. build passes, tests green, no TODO>
- Outcome-type (needs human acceptance): <e.g. design fits team architecture norms>
【Points to confirm】(ask ONE question per turn, per clarifying-question-discipline)
```

**Requirements checklist** (fill every row):

| Item | Content |
|------|---------|
| Goal (one paragraph) | ... |
| Frozen approach (intake freeze) | ... |
| Deliverables | ... |
| Success criteria (machine-verifiable) | ... |
| Success criteria (human judgment) | ... |
| In scope | ... |
| Out of scope | ... |
| Constraints | ... |
| Budget (turn / time / token cap) | ... |
| Edge-case handling | ... |

---

## Stage 2 — Acceptance Criteria + Goal Condition (Template 2)

```
## Acceptance criteria
### Hard (machine-verifiable → becomes goal-harness condition)
- [ ] Build command passes: <command>
- [ ] Tests pass: <command> (coverage >= <threshold>)
- [ ] No TODO/FIXME left
- [ ] <other machine-verifiable items>

### Soft (LLM-judge + deterministic checker)
- [ ] <quality bar>
- [ ] <consistency bar>

### Human (outcome-type → stage 5 human acceptance)
- [ ] <business/architecture judgment>
- [ ] <experience judgment>

## Goal condition (official 4 parts)
<measurable end state> + <stated check> + <key constraints> + <budget: or stop after N turns>
Example: all tests in test/auth pass and the lint step is clean, stop after 20 turns
```

---

## Stage 3 — Sub-agent Division & Context Management (Template 3)

```
## Collaboration design
### Context technique
- [ ] Sub-agent architecture (parallel / multi-module) — subs do deep work; main keeps 1–2k summaries only
- [ ] Compaction — long conversational flows; summarize-and-reopen near window limit
- [ ] Structured note-taking — milestone iteration via NOTES.md / memory

### Sub-agent split
- [ ] By module: <A> / <B> ...
- [ ] By domain: <research> / <implement> / <verify>
- [ ] Independent harness: implementer vs reviewer separated

### Per sub-agent definition
- Task + deliverables
- Allowed tools (minimal set + allowlist)
- Output contract (summary + evidence + leftovers)
- Completion condition (machine-verifiable)
- Failure handling (how to report inability to finish)

### Main agent duties
- [ ] Keep high-level plan + progress tracking
- [ ] Receive summaries only, not details
- [ ] Synthesize into the completion report
```

---

## Stage 4 — Launch the Long Run (Template 4)

```
## Long-run launch sheet
- Approval: <approved / pending> (high-impact: unattended / large budget / irreversible — must approve before start; auto mode does not bypass)
- Environment: interactive / non-interactive CLI / manual-loop fallback
- Goal condition: <4 parts, including budget>
- Traceability: none | openspec/<change-name> (opt-in; the change path rides the launch contract)
- Companions:
  - [ ] Per-turn project convention file at repo root (e.g. CLAUDE.md)
  - [ ] Post-edit validation hooks (e.g. lint/typecheck on each edit)
  - [ ] Auto-approval mode enabled (unattended)
- Budget: <N turns / N minutes / token cap>
- Commands (primary-harness examples):
  - Interactive: /goal <condition>
  - Non-interactive: claude -p "/goal <condition>" --output-format stream-json --verbose
```

**Run log** (during execution): turn count / tokens spent / latest evaluator reason / anomalies — one line per budget milestone (every half/third of the budget), with early-interrupt flags on sustained no-progress.

---

## Stage 5 — Completion Report & Human Acceptance (Template 5)

```
## Completion report
### Goal recap
- Original goal: <one paragraph>

### Status vs acceptance criteria
- Hard: all pass ✅ / failed: <list>
- Soft: <self-check conclusion>
- Human: <items left for human judgment>

### Verification checklist (numbered — one line per item, no merged "looks fine" verdict)
1. Goal achievement vs restated contract: <met / partial — gap>
2. Frozen-approach comparison: <frozen vs actual, deviations + reasons>
3. Tests & verification evidence: <per acceptance tier, Executed/Pending labels>
4. Side effects — functional: <unexpected behavior changes elsewhere> / non-functional: <performance / security / maintainability>
5. Logic & end-to-end review: <gaps or omissions found>

### Actual deliverables
- Change/artifact list (path + one-line note)
- Verification evidence (build/test output summaries, coverage, etc.) — per completion-evidence-discipline

### Leftovers and risks
- Incomplete items / known risks / decisions needed
- Next-step suggestions

### Decision & assumption ledger (from intake-interview-discipline)
- Surface for human judgment: unresolved tickets, low-confidence assumptions, high-impact-if-wrong entries, clean-stop tickets
- Remaining entries listed for spot-check; humans MAY overturn any entry

### Notes
- Wall time / turns / tokens / plan deviations
- Traceability (opt-in): openspec validate <result>; archived <yes/no — evidence complete>
```

---

## Primary harness cheat sheet (`/goal` — Claude Code)

Examples for the Claude Code `/goal` harness. Other agents: map to their goal/loop equivalent or use the manual fallback in the skill body.

| Command | Role |
|---------|------|
| `/goal <condition>` | Set completion condition and start a turn immediately; replaces any existing goal |
| `/goal` (no args) | Status: condition / elapsed / evaluated turns / tokens / latest reason |
| `/goal clear` | Clear unfinished goal (aliases: stop / off / reset / none / cancel) |
| `claude -p "/goal <condition>"` | Non-interactive; single invocation runs to exit |
| `claude -p "/goal ..." --output-format stream-json --verbose` | Non-interactive + live progress (default text mode looks stuck mid-run) |
| `Ctrl+C` | Interrupt non-interactive early |
| `--resume` / `--continue` | Resume session; unfinished goal kept (turn/token baselines reset) |

**Mechanics**:
- After each turn a small evaluator model (default Haiku; override via `ANTHROPIC_DEFAULT_HAIKU_MODEL`) reads the transcript only — no tools, no files → conditions must be output-provable.
- **No built-in token budget** → always include `or stop after N turns` or a time clause.
- Condition max length 4000 characters.
- One active goal per session; cleared when achieved.
- Requires Claude Code **v2.1.139+**; trust dialog; unavailable when `disableAllHooks` or managed-hooks-only blocks it.

**Four parts** (official recommendation):
1. One measurable end state (test result / build exit code / file count / empty queue)
2. Stated check (how the agent proves it, e.g. `npm test exits 0`)
3. Key constraints (must not change along the way)
4. Budget clause (`or stop after N turns`)

**Adjacent mechanisms**:
- `/goal` + **auto mode** = unattended long run (auto approves in-turn tool calls; `/goal` decides whether to open the next turn).
- `/goal` vs **Stop hook**: `/goal` is in-session; Stop hooks are global settings and can run deterministic scripts.
- `/goal` vs **`/loop`**: loop re-runs on a timer (polling); goal runs until done — different jobs.

**Reliability trio** (long runs are stabler with all three):
1. Per-turn convention file at project root (e.g. `CLAUDE.md`).
2. Post-edit validation hooks (lint/type-check each step).
3. Auto-approval mode — otherwise every file write stalls the run.

---

## Prerequisite Skill Check — Missing Notice

When a skill declared in frontmatter `dependencies` is missing, print the following and abort immediately:

```
⚠️ goal-driven-workflow is missing a strong dependency and cannot run in full

【Missing skill(s)】
- [skill-name]: [what it is for]

【Why it's needed】
goal-driven-workflow strongly depends on (missing = abort):
- `clarifying-question-discipline`: stage 1 requirement clarification
- `completion-evidence-discipline`: stage 2/5 acceptance evidence
- `design-approval-gate`: stage 4 launch approval pattern (long-run high-impact still pauses under auto)
- `intake-interview-discipline`: stage 1 deep intake (interview → approach freeze → pre-launch self-review); stage 4 in-run self-answer rules; stage 5 ledger surfacing

【Install】
  npx skills add FuDesign2008/open-skills -g --skill <name> --yes
```

---

## Sources

- Claude Code docs `/goal` — code.claude.com/docs/en/goal
- Anthropic, *Effective Context Engineering for AI Agents* — anthropic.com/engineering (context rot / sub-agent / compaction / note-taking)
- Yuval Yeret, *AI Agents Can Now Run Toward Goals* — yuvalyeret.com (output vs outcome)
- 7×24-agent-reliability-handbook §8 (methodology source for this skill)
