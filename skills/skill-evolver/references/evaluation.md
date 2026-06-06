# 3-Layer Evaluation Pipeline

## Contents
- Overview
- L1 — Quick Gate (seconds, every iteration)
- L2 — Dev Eval (minutes, every iteration)
- L3 — Strict Eval (~10 min, conditional)
- LLM Evaluation Noise mitigation

## Overview

Evaluation is not a single pass. It's a pipeline of increasing cost and rigor:

| Layer | Cost | Frequency | What It Catches |
|-------|------|-----------|-----------------|
| L1 Quick Gate | Seconds | Every iteration | Structural breakage, safety violations |
| L2 Dev Eval | Minutes | Every iteration | Behavioral regressions, pass_rate changes |
| L3 Strict Eval | ~10 min | Conditional | Overfitting, holdout failures, A/B quality |

Cheap checks run first. If L1 fails, don't waste time on L2. If L2 shows no improvement, don't trigger L3.

---

## L1 — Quick Gate

Pure programmatic checks. No LLM calls. Target: <5 seconds.

### 4 Checks

1. **SKILL.md structure**: Frontmatter exists, `name` and `description` present, body is non-empty.

2. **quick_validate**: Run skill-creator's `quick_validate.py`:
   ```bash
   python <skill-creator-path>/scripts/quick_validate.py <skill-path>
   ```
   Must exit 0.

3. **Safety scan**: Run `scripts/safety_scan.py`:
   ```bash
   python <skill-evolver-path>/scripts/safety_scan.py <skill-path>
   ```
   See the script for the 11 rules. 2 are critical (immediate block), 9 are warnings.

4. **GT sample check**: Randomly pick 3 dev cases. Verify each has `id`, `prompt`, and at least 1 expectation. This catches corrupted GT files.

### Decision

- Any critical safety violation → BLOCK (L1 fails, skip L2)
- quick_validate fails → BLOCK
- GT sample corrupt → BLOCK
- Warnings only → PASS with warnings logged for Phase 2 reference

---

## L2 — Dev Eval

Run all dev set cases against the current skill version. This is the primary feedback signal.

### Execution

For each case in the dev set:

1. **Run the skill** against the case's prompt. Preferred methods (in order):
   - Spawn a subagent with the skill loaded, passing the prompt as the task
   - Use `claude -p "<prompt>" --skill-path <skill-path>` if running in a subprocess
   - The exact CLI flags depend on the claude version; check `claude --help` for current syntax

2. **Capture the output** — both the final result and the execution trace (full conversation log).

3. **Evaluate expectations** — for each expectation in the case:
   - Programmatic types (`[contains]`, `[regex]`, `[file_exists]`, etc.): run `scripts/evaluate_assertions.py`:
     ```bash
     python3 <skill-evolver-path>/scripts/evaluate_assertions.py \
       --output-file <path-to-output> --expectations '<json-array>'
     ```
   - Plain text expectations (no prefix): pass to skill-creator's grader agent, or use inline LLM YES/NO:
     ```
     Given this output: {output}
     Does it satisfy this criterion: {expectation}?
     Answer YES or NO only.
     ```
   - Count passes and compute per-case pass_rate

   `evaluate_assertions.py` handles programmatic expectations only. The caller must merge its output with LLM grading results and assemble the final L2 format below.

4. **Save trace** to `traces/iteration-{N}/case-{id}.md` — the full execution log. This is the raw material for Phase 2 diagnosis in the next iteration.

### Aggregation

- Per-case: `{id, passed_expectations, total_expectations, case_pass_rate}`
- Aggregate: `dev_pass_rate = sum(passed) / sum(total)` across all cases
- Regressions: compare per-case results with the previous best iteration (not the immediately previous iteration — discarded iterations are skipped) — any case that went from PASS to FAIL is a regression

### Output

Save to `iterations/iteration-{N}/l2_results.json`:
```json
{
  "iteration": 5,
  "dev_pass_rate": 0.86,
  "tokens": 12400,
  "duration_seconds": 91.3,
  "cases": [
    {
      "id": "case-01",
      "passed": 3,
      "total": 4,
      "pass_rate": 0.75,
      "failed_expectations": ["contains: '通讯录'"],
      "trace_path": "traces/iteration-5/case-01.md"
    }
  ],
  "regressions": ["case-03"],
  "new_passes": ["case-12"]
}
```

---

## L3 — Strict Eval

Expensive, high-confidence validation. Only triggered under specific conditions.

### Trigger Conditions

1. **Periodic**: Every N iterations (default N=5, configurable in evolve_plan.md)
2. **Threshold**: Dev pass_rate exceeds target threshold (default 0.9)
3. **Layer promotion**: Before moving from Layer K to Layer K+1

### What L3 Runs

1. **Holdout eval**: Same process as L2, but on the holdout set. The optimizer has never seen these cases' results.
   - If holdout pass_rate is >15% lower than dev pass_rate → overfitting warning
   - If holdout pass_rate drops below baseline → overfitting confirmed, consider reverting recent iterations

2. **Regression eval**: Run all regression set cases. Every single one must pass. Any failure is logged and the failing cases are added to the regression dimension (Dimension 3) for future iterations. L3 does NOT trigger an immediate DISCARD — it is a diagnostic signal.

3. **Blind A/B comparison** (optional): Use skill-creator's comparator agent to blind-compare current skill output vs baseline output on 3-5 randomly selected cases. This catches quality regressions that pass_rate alone misses.

### Output

Save to `iterations/iteration-{N}/l3_results.json`:
```json
{
  "holdout_pass_rate": 0.82,
  "dev_pass_rate": 0.86,
  "overfitting_gap": 0.04,
  "regression_pass_rate": 1.0,
  "ab_comparison": {
    "current_wins": 3,
    "baseline_wins": 1,
    "ties": 1
  }
}
```

---

## LLM Evaluation Noise

Same skill, same GT, same LLM — run 4 times and you might get pass_rates of 0.79, 0.85, 0.87, 0.92. This is inherent to LLM-as-judge.

### Mitigation Strategies

1. **Prefer programmatic expectations**: `contains` and `regex` are deterministic. Use them wherever possible.
2. **Multiple runs**: For LLM-judged expectations, run 3x and take majority vote. Costs 3x more but gives stable signal.
3. **Temperature 0**: When using LLM-as-judge, set temperature to 0.
4. **Significance threshold**: Don't count a pass_rate change <2% as meaningful. It's noise.

The gate's regression check (dimension 3) is the most vulnerable to noise. A case that "regressed" might just be LLM variance. If a single case flips pass→fail while everything else improves, run that case 3x before declaring regression.
