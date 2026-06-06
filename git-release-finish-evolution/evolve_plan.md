# Evolution Plan: git-release-finish Skill

## Overview

- **Skill**: `skills/git-release-finish/SKILL.md`
- **Workspace**: `git-release-finish-evolution/`
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
2. Skill 很长（600 行），包含 10 个阶段和多个子流程，GT 聚焦关键阶段和核心概念。
3. 平台 CLI 映射表包含 GitLab/GitHub/Gitea，需要确保工具名称（glab/gh/tea）在 SKILL.md 中明确出现。

## Excluded Cases

(None yet — will populate if GT annotations are found incorrect)
