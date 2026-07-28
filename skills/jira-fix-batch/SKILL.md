---
name: jira-fix-batch
version: "1.2.0"
user-invocable: true
category: development
tags: [jira, batch, workflow]
description: "Triggers when the user says「批量修复」「批量 jira-fix」「jira-fix-batch」「批量修复多个 Jira」「批量修复以下 bug」/ batch fix, batch jira-fix. Orchestrates end-to-end fixes across multiple Jira issues."
---

# Jira Bug Batch Fix

> This skill owns **batch orchestration** rules. Per-issue end-to-end fix (stages 0–10) lives in `jira-fix-workflow`. Responsibilities here: split issues into tasks, detect relationships, invoke `jira-fix-workflow` in order, track batch progress.
>
> **Activate only when the user explicitly requests a batch fix.** Loading this skill MUST NOT start orchestration by itself.

## Orchestrator selection

When the user **explicitly requests batch fix**, the outer orchestrator picks a loop runner by platform-native capability (describe intent: “sequential loop over issues”). Do **not** hardcode platform-specific command names as required; prefer whatever loop/batch runner the current agent already has.

The orchestrator invokes `jira-fix [URL]` per issue. This skill does **not** run an internal loop itself.

## Orchestrator duties

1. Split input Jira IDs/URLs into independent issue tasks.
2. Before execution, detect duplicate / dependency / overlap / conflict relationships.
3. Invoke `jira-fix [URL]` for each issue in order.
4. After each issue completes, re-evaluate remaining issues against the latest code state.
5. One issue failing MUST NOT block later issues.
6. Track overall progress; emit a batch summary when done.

## Batch mode propagation

Per-issue mode is set **explicitly** from the user’s **batch-level** intent. The child skill’s “auto reverts to manual” rule MUST NOT break batch continuity.

### Propagation rules

| Batch trigger | Orchestrator behavior | Child mode |
|---------------|----------------------|------------|
| Contains「自动」/ "auto" (e.g.「批量自动修复」) | Attach `--auto` or use auto-mode triggers on each child call | Auto |
| No「自动」/ "auto" (e.g.「批量修复」) | Do not attach `--auto`; use default triggers | Manual |

### Why

- **Separation of concerns**: `jira-fix-workflow` need not know about batch context; “revert to manual after one round” stays consistent.
- **Explicit over implicit**: the orchestrator passes mode; do not rely on ambient inheritance.
- **User expectation**: “batch auto” means every child run is auto until the batch ends.

## Issue relationship detection

Before serial execution, run a light relationship pass; after each issue, re-check remaining issues. Do not treat every issue as fully independent by default.

1. **Duplicate / equivalent** — If B shares A’s symptom, root cause, or fix point and A’s fix already covers B, mark B **skipped (covered by duplicate)** with note “covered by A”; do not re-fix.
2. **Dependency** — If B requires A’s code/behavior change, mark B **waiting on dependency**; run only after A completes and verifies; when running B, read A’s fix summary, PR URL, and relevant diff.
3. **Overlap but not equivalent** — Same module, different root causes → analyze separately; note potential conflict; prefer serial handling.
4. **Conflict** — Contradictory expected behaviors, or one fix would break the other → pause, mark **conflict pending confirmation**, ask humans for product/tech direction.
5. **Derived** — Fixing A reveals B as follow-on impact or deeper root cause → record relationship; decide merge, depend, or split to a new Jira/PR.

Record judgments in the batch progress doc (at least in notes: related issue, type, rationale).

## Batch progress document

At batch start, create a progress file (suggested: `.jira-fix/batch-[YYYYMMDD-HHMM]/progress.md`). Update on every status change; emit a final summary at the end.

Minimum fields:

| Field | Meaning |
|-------|---------|
| Issue | Jira ID or URL |
| Mode | Auto / Manual |
| Status | pending / in progress / done / skipped (duplicate) / waiting dependency / conflict pending / review failed (cap) / failed |
| Current stage | Stages 0–9, or not started / skipped |
| Result summary | Fix result, failure reason, or review summary |
| PR URL | When a PR exists |
| Notes | Related issues, relationship type, blockers, human asks |

## Review over-cap handling

If an issue’s solution-review loop hits the 3-round cap without pass: mark **review failed (cap)**, skip later stages (do not enter stages 6/8/9), record the three-round review summary in the progress doc and final report, continue with the next issue.

## Call shape (illustrative)

```text
Orchestrator start
└── Detect relationships (PROJ-001, PROJ-002, PROJ-003)
    ├── PROJ-001: jira-fix-workflow → done → update progress
    ├── PROJ-002: evaluate deps → jira-fix-workflow → done → update progress
    └── PROJ-003: jira-fix-workflow → done → batch summary
```

Keep the progress doc updated throughout; when finished, print its path and the final summary.
