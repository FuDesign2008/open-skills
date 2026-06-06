# 5-Dimension AND Gate

## Contents
- Why AND, Not Weighted Sum
- The 5 Dimensions (Structure, Progress, Regression, Cost, Safety)
- Gate Decision Matrix
- Edge Cases
- Logging Gate Decisions

## Why AND, Not Weighted Sum

Weighted scoring lets a large gain in one dimension compensate for a loss in another. This produces bad tradeoffs:

- Quality up 10% but token cost 3x → weighted sum might PASS
- Pass_rate up 5% but 2 regressions → weighted sum might PASS
- Safety warning appeared but pass_rate improved → weighted sum might PASS

AND logic prevents all of these. Every dimension must independently pass. No compensation across dimensions.

## The 5 Dimensions

### Dimension 1 — Structure

**Question:** Did L1 Quick Gate pass?

**How to check:** L1 result from Phase 5.

**PASS when:** quick_validate exits 0, no critical safety violations, GT sample valid.

**FAIL when:** Any L1 critical check failed.

This is the cheapest gate — if the skill is structurally broken, nothing else matters.

### Dimension 2 — Progress

**Question:** Is the dev pass_rate at least as good as the previous best?

**How to check:** Compare current dev_pass_rate with the best pass_rate recorded in results.tsv.

**PASS when:** `current_pass_rate >= previous_best_pass_rate`

**FAIL when:** `current_pass_rate < previous_best_pass_rate`

Note: "previous best" not "previous iteration". If iteration 5 was the best so far and iteration 6 was discarded, iteration 7 compares against iteration 5.

Ties are acceptable — a mutation that doesn't improve pass_rate but also doesn't hurt it may still be useful (e.g., simplifying instructions while maintaining quality).

### Dimension 3 — Regression

**Question:** Did any previously-passing case start failing?

**How to check:** Diff per-case results between current iteration and previous best.

**PASS when:** No case went from PASS to FAIL.

**FAIL when:** Any case regressed.

**Noise handling:** If exactly 1 case regressed while multiple others improved, run the regressed case 3x before declaring regression. If 2 of 3 runs pass, it's LLM noise — count as PASS. If 2 of 3 runs fail, it's a real regression — count as FAIL.

### Dimension 4 — Cost

**Question:** Is the resource cost acceptable?

**How to check:** Compare token count and execution time with baseline.

**PASS when:** Both token count and execution time are within 2x of baseline averages.

**FAIL when:** Either metric exceeds 2x baseline.

The 2x threshold is the default. The user can adjust this in evolve_plan.md. For optimization-focused evolutions (where the goal IS reducing cost), this dimension should be tightened.

Cost is measured per-case average, not total — if more cases pass, total cost naturally increases, and that's fine.

### Dimension 5 — Safety

**Question:** Are all safety rules satisfied?

**How to check:** `safety_scan.py` output from L1.

**PASS when:** Zero critical violations AND warning count did not increase from previous iteration.

**FAIL when:** Any new critical violation appeared, OR warning count increased.

Warnings that existed in the baseline don't cause failure — only NEW warnings do. This prevents the gate from blocking improvements to a skill that already had pre-existing warnings.

## Gate Decision Matrix

```
All 5 PASS → KEEP (changes stay, update "previous best")
Any 1+ FAIL → DISCARD (git revert HEAD, log failure reason)
```

## Edge Cases

**First iteration after baseline:** Previous best = baseline. No regression possible (no previous passing cases to regress from). Dimension 3 auto-passes.

**Tie on progress (same pass_rate):** PASS on dimension 2. A mutation that maintains quality while simplifying the skill is still valuable.

**L3 results:** L3 (holdout/regression) results inform future Phase 2 decisions but do NOT retroactively discard kept iterations. L3 is a diagnostic signal, not a gate. The gate operates on L1 and L2 only. Exception: if L3 regression set shows failures, those cases are added to the regression dimension for future iterations.

**Multiple consecutive discards:** After K consecutive discards at the same layer (K from evolve_plan.md, default 3), the layer is considered exhausted. Promote to the next layer.

## Logging Gate Decisions

Every gate decision is logged in experiments.jsonl with full details:

```json
{
  "gate_details": {
    "structure": true,
    "progress": true,
    "regression": true,
    "cost": true,
    "safety": true,
    "decision": "KEEP",
    "failure_reasons": []
  }
}
```

For DISCARD decisions, `failure_reasons` lists which dimensions failed and why:

```json
{
  "failure_reasons": [
    "regression: case-03 went from PASS to FAIL (assertion 'contains: 通讯录' no longer matches)"
  ]
}
```
