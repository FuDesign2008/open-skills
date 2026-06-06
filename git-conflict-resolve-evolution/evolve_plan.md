# Evolution Plan: git-conflict-resolve Skill

## Overview

- **Skill**: `skills/git-conflict-resolve/SKILL.md`
- **Workspace**: `git-conflict-resolve-evolution/`
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
2. Skill 很长（418 行），GT expectations 聚焦核心流程和关键子阶段。
3. 使用了 emoji（🟢🟡🔴⚠️❌），GT 匹配需要精确一致。

## Excluded Cases

(None yet — will populate if GT annotations are found incorrect)
