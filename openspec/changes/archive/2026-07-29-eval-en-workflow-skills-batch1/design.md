## Context

Validate #247 English workflow skills via skill-creator evals vs Chinese snapshots at `1f7c837`.

## Goals / Non-Goals

**Goals:** 2–3 evals × 6 skills; with_skill vs old_skill; grade + aggregate + viewer; fix only clear regressions.

**Non-Goals:** without_skill baseline; remaining Chinese→English migration; description-optimizer loop unless triggers fail.

## Decisions

1. **Baseline SHA** `1f7c837` (parent of English commit) copied into each `skills/<name>-workspace/skill-snapshot/`.
2. **Workspace layout** per skill-creator: `skills/<name>-workspace/iteration-1/eval-*/{with_skill,old_skill}/`.
3. **Prompts** focus on triggers, clarifying one-question, stage read-only / mode — not full end-to-end bug fixes.
4. **Parallel runs** via subagents; timing.json when available.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Eval cost / time | Cap 2–3 prompts; parallelize |
| Old workspace evals outdated | New iteration-1 folder; refresh evals.json |
| False fail from Chinese output templates | Assertions check behavior, not language of user-facing templates |

## Open Questions

None blocking.
