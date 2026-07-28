## Why

PR #247 English-rewrote six workflow skills with light verification only. Full skill-creator eval loops were deferred; we now need evidence that the English bodies preserve stage gates, Chinese triggers, and clarifying discipline versus the pre-rewrite Chinese snapshots.

## What Changes

- Add/refresh skill-creator eval workspaces for: `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`, `jira-fix-batch`, `opsx-jira-fix-batch`.
- Baseline each eval against the **pre-English Chinese snapshot** (git `1f7c837` / `641b79d^`).
- Lightweight set: **2–3 prompts per skill**; with_skill (current English) vs old_skill (Chinese snapshot).
- Grade, aggregate, open eval viewer; iterate skill text only if evals show regressions.
- Document eval harness expectations under OpenSpec (skill-authoring / eval process).

## Capabilities

### New Capabilities

- `skill-creator-eval-harness`: When an English (or major) rewrite of shipped skills defers full eval, a follow-up change MUST run skill-creator evals with an explicit baseline (here: prior Chinese snapshot) before treating the rewrite as fully validated.

### Modified Capabilities

- (none required unless harness findings force skill-authoring-language tweaks)

## Impact

- `skills/*-workspace/` eval artifacts (may be large; commit selectively per repo norms)
- Possible small skill body fixes if regressions found
- Does not re-translate remaining Chinese skills (perf/git/…)
