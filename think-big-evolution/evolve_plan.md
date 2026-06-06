# Evolution Plan: think-big Skill

## Overview

- **Skill**: `skills/think-big/SKILL.md`
- **Workspace**: `think-big-evolution/`
- **Target pass_rate**: 95% (dev set)
- **Session started**: 2026-06-06

## GT Split

| Split | Cases | Purpose |
|-------|-------|---------|
| dev.json | 8 cases | Optimizer sees every iteration |
| holdout.json | 2 cases (case-09, 10) | L3 only — overfitting detection |
| regression.json | 1 case (case-regression-01) | Must never regress |

## Baseline

| Metric | Value |
|--------|-------|
| Baseline pass_rate | TBD (iteration-0) |
| Target pass_rate | 0.95 (dev) |
| Starting layer | Layer 1 (wording tweaks) |

## Mutation Strategy

- **Layer 1** (max 10 iterations): Wording improvements, clarification hints
- **Layer 2** (after 5 consecutive discards): Restructure sections, add examples
- **Layer 3** (after 5 consecutive discards): Fundamental redesign

## Known Issues (Pre-Training)

1. Frontmatter has non-standard fields (`version`, `user-invocable`) — will remove as pre-training cleanup.
2. Skill 包含两种模式（快速模式和深度模式），GT expectations 需要覆盖两种模式的关键特征。
3. 输出格式使用【】方括号标题，需要确保 GT 期望与 SKILL.md 中的格式完全一致。

## Excluded Cases

(None yet — will populate if GT annotations are found incorrect)
