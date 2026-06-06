# Evolution Plan: perf-workflow Skill

## Overview

- **Skill**: `skills/perf-workflow/SKILL.md`
- **Workspace**: `perf-workflow-evolution/`
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
2. Skill 包含 6 个阶段和触发词识别，GT 覆盖核心流程和关键原则。
3. 通用原则包含多个关键原则（数据驱动、自上而下、单一变量、全链路覆盖），需要确保这些原则在 SKILL.md 中明确出现。

## Excluded Cases

(None yet — will populate if GT annotations are found incorrect)
