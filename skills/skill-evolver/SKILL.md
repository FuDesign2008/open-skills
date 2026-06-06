---
name: skill-evolver
description: Autonomously evolves an existing skill through iterative atomic mutations, trace-driven diagnosis, and multi-layer evaluation with automatic keep/revert decisions. Runs N iterations of changes against ground truth test cases, applying a 5-dimension AND gate to each mutation. Triggers on "evolve this skill", "train this skill", "optimize skill quality", "self-improve", "run evolution loop", "iterate on this skill automatically", or when a skill has ground truth test cases and pass_rate needs systematic improvement beyond manual tuning. Also triggers when a skill "works but isn't good enough" and data-driven improvement is needed.
---

# Skill Evolver

You are the evolution controller — plan mutations, execute them, evaluate results, and decide keep or revert. The user sets the goal and GT; you drive the loop.

## Prerequisites

Before starting, verify:
1. Target skill has a valid `SKILL.md` (run `quick_validate.py` from skill-creator)
2. Ground truth (GT) test cases exist or will be generated (see `references/gt-format.md`)
3. The skill directory is under git (or you will init it)
4. `skill-creator` is installed (hard dependency for evaluation infrastructure)

If GT cases don't exist, offer to generate them using skill-creator's eval generation capability, or help the user write them.

## Phase 0 — Setup (One-Time)

This phase runs exactly once per evolution session.

### 0.1 Workspace Initialization

Create workspace as a sibling to the skill directory:

```
<skill-name>-evolution/
├── evolve_plan.md          # Strategy document
├── results.tsv             # Per-iteration summary (append-only)
├── experiments.jsonl        # Structured experiment log (append-only)
├── gt/
│   ├── dev.json            # Development set (optimizer sees these)
│   ├── holdout.json        # Held-out set (optimizer never sees)
│   └── regression.json     # Regression guards (starts empty)
├── traces/                 # Per-iteration execution traces
└── iterations/             # Per-iteration snapshots
```

### 0.2 Git State Check

Four cases — handle each:
- Clean git repo → proceed
- Dirty git repo → error, ask user to commit or stash
- No git init → run `git init && git add -A && git commit -m "pre-evolution baseline"`
- No git installed → tell user to install git

### 0.3 GT Split

If user provides a single `evals.json`, split it:
- **Dev set (70%)**: Used every iteration for L2 evaluation
- **Holdout set (20%)**: Never shown to the mutation proposer; used only in L3
- **Regression set (10%)**: Cases that already pass — guards against regression

If the user already has split files, use them directly. Record the split in `evolve_plan.md`.

### 0.4 Baseline Run

Run L2 evaluation (see `references/evaluation.md`) on the current skill state against the full dev set. Record baseline scores. This is iteration 0 — the starting point all improvements are measured against.
Save per-case baseline traces to `traces/iteration-0/`, save baseline L2 results to `iterations/iteration-0/l2_results.json`, and write the iteration-0 record to `results.tsv` and `experiments.jsonl` using `scripts/results_tracker.py`.

### 0.5 Generate Evolution Plan

Analyze the skill structure, GT cases, and baseline results. Write `evolve_plan.md` containing:
- Current baseline pass_rate
- Target pass_rate (user-specified or inferred)
- Starting mutation layer (default: Layer 1)
- Gate thresholds (default: no regression + pass_rate >= baseline)
- Maximum iterations per layer before escalation
- L3 trigger conditions

Ask the user to confirm the plan before proceeding.

---

## Iteration Loop (Phases 1–8)

Each iteration follows these 8 phases in strict order. Do not skip or reorder phases.

Copy this checklist at the start of each iteration and check off items as you complete them:

```
Iteration {N} Progress:
- [ ] Phase 1: Review — read memory + traces
- [ ] Phase 2: Ideate — propose ONE atomic change with trace evidence
- [ ] Phase 3: Modify — execute the change
- [ ] Phase 4: Commit — git commit (before verify)
- [ ] Phase 5: Verify — run L1 → L2 (→ L3 if triggered)
- [ ] Phase 6: Gate — 5-dim AND check → KEEP or DISCARD
- [ ] Phase 7: Log — write results.tsv + experiments.jsonl + traces
- [ ] Phase 8: Loop — continue / promote / stop
```

### Phase 1 — Review

Read the evolution memory to understand where you are:

1. Last 20 lines of `results.tsv`
2. Last 10 entries from `experiments.jsonl`
3. Last 20 git log entries in the skill directory
4. Failed cases from the previous iteration's traces (skip on first iteration — no traces exist yet)

Extract 5 signals:
- Which mutation patterns succeeded → exploit them
- Which mutation patterns failed → avoid repeating
- Which cases persistently fail → prioritize them
- Which cases are fragile (flipped pass/fail recently) → treat as regression guards
- Whether you're stuck (3+ consecutive discards) → escalate strategy

### Phase 2 — Ideate

Propose ONE atomic change. Follow this priority ladder:

1. **Fix crashes** — Any case that errors out instead of producing output
2. **Exploit success patterns** — Apply a proven mutation type to a new failing case
3. **Attack persistent failures** — Cases that failed 3+ consecutive iterations
4. **Explore new directions** — Try an approach not yet attempted
5. **Simplify** — Remove instructions that aren't contributing to pass_rate
6. **Aggressive mutation** — Restructure a section (only after 5+ consecutive discards)

**Hard rule: evidence before action.** Before proposing any change, cite the specific trace evidence:

> "Case {id} failed because {observed behavior}. Trace at {path} shows {specific evidence}. If I change {X}, the output should change from {current} to {expected}."

No trace citation → no mutation allowed. Read `references/mutation.md` for layer rules.

On the first iteration (no traces yet), cite baseline L2 results (from `iterations/iteration-0/`) as evidence instead of per-case traces.

**Atomicity test:** If describing the change requires the word "and", split it into two iterations.

### Phase 3 — Modify

Execute the proposed change. Rules:
- Stay within the current mutation layer (see `references/mutation.md`)
- Touch only the files relevant to the change
- After modifying, run `git diff --stat` — if >5 files changed, the change is probably not atomic

### Phase 4 — Commit

Commit BEFORE verifying. This preserves the audit trail even for failed mutations.

```bash
git add <skill-directory>/ && git commit -m "evolve: iteration-{N} — {one-line description of change}"
```

Only stage files inside the skill directory. Never use `git add -A` — workspace artifacts (traces, results, GT) must not be committed to the skill repo.

The commit message must describe WHAT changed and WHY (citing the case that motivated it).

### Phase 5 — Verify

Run the 3-layer evaluation pipeline. Read `references/evaluation.md` for full details.

**L1 Quick Gate (every iteration):**
- Run `quick_validate.py` on the skill
- Run `scripts/safety_scan.py` on the skill directory
- Check 3 random GT cases for structural validity
- If L1 fails → skip L2, go directly to Phase 6 with DISCARD

**L2 Dev Eval (every iteration):**
- Run all dev set GT cases through the skill using skill-creator's grader
- Record per-case pass/fail with evidence
- Save traces to `traces/iteration-{N}/`
- Calculate aggregate pass_rate

**L3 Strict Eval (conditional):**
Only trigger when:
- Every N iterations (N from evolve_plan.md, default 5)
- Dev pass_rate exceeds a threshold (default 0.9)
- Before layer promotion

L3 runs the holdout set and regression set. If holdout pass_rate is significantly lower than dev pass_rate, the skill is overfitting.

### Phase 6 — Gate

Apply the 5-dimension AND gate. Read `references/gate.md` for details. ALL five must pass:

| Dimension | Question | How to Check |
|-----------|----------|--------------|
| Structure | Did L1 pass? | L1 result |
| Progress | Is dev pass_rate >= previous best? | Compare with results.tsv |
| Regression | Did any previously-passing case start failing? | Diff per-case results |
| Cost | Is token/time cost within 2x of baseline? | Timing data |
| Safety | Are all safety rules satisfied? | No new criticals, warning count not increased (see gate.md) |

- All YES → **KEEP** (this iteration's changes stay)
- Any NO → **DISCARD** (`git revert HEAD`)

This is AND logic, not weighted scoring. A 10% quality gain that doubles token cost is a DISCARD.

### Phase 7 — Log

Append results regardless of keep/discard:

**results.tsv** — one row per iteration:
```
iteration	layer	mutation_type	description	pass_rate	delta	decision	tokens	duration_s	timestamp
```

**experiments.jsonl** — one JSON object per iteration:
```json
{
  "iteration": 5,
  "layer": 2,
  "mutation": "Added disambiguation hint for leave-related queries",
  "target_cases": ["case-12", "case-41"],
  "pass_rate_before": 0.82,
  "pass_rate_after": 0.86,
  "regressions": [],
  "decision": "KEEP",
  "gate_details": {"structure": true, "progress": true, "regression": true, "cost": true, "safety": true}
}
```

**Per-case traces** — save to `traces/iteration-{N}/case-{id}.md`:
- The full execution log for each evaluated case
- These feed Phase 1 of the next iteration

### Phase 8 — Loop Decision

Three outcomes:

1. **Continue** — More cases to fix at the current layer
2. **Layer promotion** — Current layer exhausted (K consecutive discards at this layer, K from plan). Promote to next layer. Run L3 before promoting.
3. **Stop** — All three layers exhausted with no improvement, OR target pass_rate reached, OR max iterations hit

On stop, generate a final evolution report:
- Starting vs ending pass_rate (dev + holdout)
- Total iterations (kept vs discarded)
- Per-layer breakdown
- Cases that remain unfixable (candidates for GT review)
- Recommended next steps

---

## Human Intervention

This loop runs autonomously, but the user can intervene at any time:

- **Redirect**: "Focus on case X" → next Phase 2 prioritizes that case
- **Inject mutation**: "Try restructuring the routing logic" → next Phase 3 applies it
- **Adjust gate**: "Relax the cost constraint" → update evolve_plan.md
- **Pause**: "Stop after this iteration" → complete current iteration, then stop
- **Mark unfixable**: "Case X has bad GT" → move to a separate `excluded` list in `evolve_plan.md`, removed from all evaluation sets. Do NOT move known-bad cases to the regression set — regression cases must all pass.

This is agent-style collaboration — you execute, the user steers.

---

## Reference Files

Read these when entering the relevant phase:
- `references/gt-format.md` — GT case format, 8 assertion types, split strategy
- `references/evaluation.md` — 3-layer evaluation pipeline details
- `references/gate.md` — 5-dimension AND gate decision logic
- `references/mutation.md` — Layered mutation strategy and priority ladder

## Scripts (execute, don't read)

Run these scripts directly — do not load their source into context:

- **Run** `scripts/safety_scan.py <skill-path>` — L1 safety rule checker (11 rules, 2 critical)
- **Run** `scripts/results_tracker.py <workspace> log ...` — Append to results.tsv + experiments.jsonl
- **Run** `scripts/evaluate_assertions.py --output-file <path> --expectations '<json>'` — Evaluate programmatic expectations

## Dependencies

- **skill-creator** — Hard dependency. Uses `quick_validate.py`, grader agent, comparator agent.
- **git** — Required for commit/revert/audit trail.
- **claude CLI** (`claude -p`) — Used to run skill against GT cases in isolated subprocesses.
