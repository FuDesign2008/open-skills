# Evolution Plan: opsx-solve-workflow Skill

## Overview

- **Skill**: `skills/opsx-solve-workflow/SKILL.md`
- **Workspace**: `opsx-solve-workflow-evolution/`
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
2. Skill 包含 7 个阶段（0-7）和 PDCA 对应，GT 聚焦核心阶段和关键概念。
3. 快速参考表使用 ⚡ emoji 和表格格式，需要确保 GT 期望与 SKILL.md 中的格式完全一致。

## Excluded Cases

(None yet — will populate if GT annotations are found incorrect)
