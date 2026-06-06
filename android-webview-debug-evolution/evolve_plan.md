# Evolution Plan: android-webview-debug Skill

## Overview

- **Skill**: `skills/android-webview-debug/SKILL.md`
- **Workspace**: `android-webview-debug-evolution/`
- **Target pass_rate**: 95% (dev set)
- **Session started**: 2026-06-06

## GT Split

| Split | Cases | Purpose |
|-------|-------|---------|
| dev.json | 8 cases | Optimizer sees every iteration |
| holdout.json | 0 cases | L3 only — overfitting detection |
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

1. Frontmatter already clean — no `version` or `user-invocable` fields.
2. Skill 包含两个触发词（enable/revert）和完整流程，GT 覆盖关键步骤。
3. 状态文件格式包含多个必需字段，需要确保这些字段在 SKILL.md 中明确出现。

## Excluded Cases

(None yet — will populate if GT annotations are found incorrect)
