# Evolution Plan: frontend-perf Skill

## Overview

- **Skill**: `skills/frontend-perf/SKILL.md`
- **Workspace**: `frontend-perf-evolution/`
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
2. Skill 是知识库型，包含大量表格和列表，GT expectations 需要精确匹配章节标题和关键词。
3. Case 04 检查框架版本特性，包含版本号（如 React 18、Angular Signals），需要确保这些内容在 SKILL.md 中明确出现。

## Excluded Cases

(None yet — will populate if GT annotations are found incorrect)
