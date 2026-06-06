# Evolution Plan: typescript-check Skill

## Overview

- **Skill**: `skills/typescript-check/SKILL.md`
- **Workspace**: `typescript-check-evolution/`
- **Target pass_rate**: 95% (dev set) — TypeScript 依赖环境，略低于纯文本 skill
- **Session started**: 2026-06-06

## GT Split

| Split | Cases | Purpose |
|-------|-------|---------|
| dev.json | 9 cases | Optimizer sees every iteration |
| holdout.json | 2 cases (case-05, 10) | L3 only — overfitting detection |
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

1. Frontmatter had non-standard fields (`version`, `user-invocable`) — removed as pre-training cleanup.
2. The skill has complex conditional logic (智能检测命令) — may need clarification in GT expectations.
3. 修复方案格式涉及多个步骤 — GT may need to split into multiple expectations.

## Excluded Cases

(None yet — will populate if GT annotations are found incorrect)
