# Evolution Plan: article-writer Skill

## Overview

- **Skill**: `skills/article-writer/SKILL.md`
- **Workspace**: `article-writer-evolution/`
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

1. Frontmatter has non-standard field (`version`) — will remove as pre-training cleanup.
2. Skill uses 4-step flow but GT checks may need clarification on what constitutes "contains" for each step.
3. Triggers are listed in frontmatter but not in main content — may need harmonization.

## Excluded Cases

(None yet — will populate if GT annotations are found incorrect)
