# Evolution Plan: chinese-format Skill

## Overview

- **Skill**: `skills/chinese-format/SKILL.md`
- **Workspace**: `chinese-format-evolution/`
- **Target pass_rate**: 95% (dev set) — 略低于 git-commit（因为例外情况更复杂）
- **Session started**: 2026-06-06

## GT Split

| Split | Cases | Purpose |
|-------|-------|---------|
| dev.json | 8 cases (case-01~08) | Optimizer sees every iteration |
| holdout.json | 2 cases (case-09, 10) | L3 only — overfitting detection |
| regression.json | 2 cases (case-11, 12) | Must never regress |

Stratification: Dev has 7 standard + 1 hard; Holdout has 1 standard + 1 hard; Regression has 1 standard + 1 hard.

## Baseline

| Metric | Value |
|--------|-------|
| Baseline pass_rate | TBD (iteration-0) |
| Target pass_rate | 0.95 (dev) |
| Starting layer | Layer 1 (wording tweaks) |

## Gate Thresholds

| Dimension | Threshold |
|-----------|-----------|
| Structure | L1 must pass (quick_validate + safety_scan) |
| Progress | dev pass_rate >= previous best |
| Regression | Zero regressions on regression.json |
| Cost | Within 2x baseline token cost |
| Safety | No new criticals from safety_scan |

## Mutation Strategy

- **Layer 1** (max 10 iterations): Wording improvements, clarification hints, reordering instructions
- **Layer 2** (after 5 consecutive discards at L1): Restructure sections, add/remove examples
- **Layer 3** (after 5 consecutive discards at L2): Fundamental redesign of a subsystem

## L3 Trigger Conditions

- Every 5 iterations (dev eval)
- Dev pass_rate exceeds target threshold (default 0.95)
- Before layer promotion

## Max Iterations Per Layer

| Layer | Max Before Escalation |
|-------|----------------------|
| Layer 1 | 10 |
| Layer 2 | 10 |
| Layer 3 | 10 |

## Known Issues (Pre-Training)

1. Frontmatter had non-standard fields (`version`, `user-invocable`) — removed as pre-training cleanup.
2. The skill has complex exception rules (代码、命令、URL、数字) — edge cases may fail.

## Excluded Cases

(None yet — will populate if GT annotations are found incorrect)
