# Evolution Plan: git-commit Skill

## Overview

- **Skill**: `skills/git-commit/SKILL.md`
- **Workspace**: `git-commit-evolution/`
- **Target pass_rate**: 85% (dev set) — conservative first goal
- **Session started**: 2026-06-06

## GT Split

| Split | Cases | Purpose |
|-------|-------|---------|
| dev.json | 7 cases (case-01~06, 09) | Optimizer sees every iteration |
| holdout.json | 2 cases (case-08, 10) | L3 only — overfitting detection |
| regression.json | 1 case (case-07) | Must never regress |

Stratification: Dev has 6 standard + 1 hard; Holdout has 1 standard + 1 hard.

## Baseline

| Metric | Value |
|--------|-------|
| Baseline pass_rate | TBD (iteration-0) |
| Target pass_rate | 0.85 (dev) |
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
- Dev pass_rate > 0.9
- Before layer promotion

## Max Iterations Per Layer

| Layer | Max Before Escalation |
|-------|----------------------|
| Layer 1 | 10 |
| Layer 2 | 10 |
| Layer 3 | 10 |

## Known Issues (Pre-Training)

1. Frontmatter had non-standard fields (`version`, `user-invocable`) — removed as pre-training cleanup.
2. The skill does live git operations; eval runs in open-skills repo context.

## Excluded Cases

(None yet — will populate if GT annotations are found incorrect)
