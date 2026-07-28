---
name: opsx-jira-fix-batch
version: "1.3.0"
user-invocable: true
category: development
tags: [jira, openspec, batch, workflow]
description: "Triggers when the user says「opsx 批量修复」「批量 opsx-jira-fix」「opsx-jira-fix-batch」「批量 OpenSpec Jira 修复」/ opsx batch fix, batch OpenSpec Jira fix. Orchestrates multi-issue end-to-end fixes and records relationship judgments in OpenSpec artifacts."
---

# OPSX Jira Bug Batch Fix

> OpenSpec-flavored **batch orchestration**. Per-issue flow (stages 0–8) lives in `opsx-jira-fix-workflow`. Responsibilities here: split issues, detect relationships, invoke `opsx-jira-fix-workflow` in order, and persist relationship judgments into OpenSpec artifacts.
>
> **Activate only when the user explicitly requests a batch fix.** Loading this skill MUST NOT start orchestration by itself.
>
> Unlike plain `jira-fix-batch`, relationship judgments MUST land in OpenSpec artifacts — not only in a temp progress file or chat context.

## Batch orchestration duties

1. Split input Jira IDs/URLs into independent issue tasks.
2. Before execution, detect duplicate / dependency / overlap / conflict / derived relationships.
3. For each issue that needs a fix: **locate the target project root** first (multi-workspace; see `opsx-jira-fix-workflow` stage 0), then confirm or create an independent OpenSpec change in that project. If several issues share one root cause **and** one project, they MAY reuse one change, but `design.md` MUST state coverage. Cross-project issues get separate changes and cross-link in each `design.md`.
4. Invoke `opsx-jira-fix-workflow` per issue; do not skip OpenSpec recording, verification, or archive requirements of stages 0–8.
5. After each issue, re-evaluate remaining issues using latest code, PR/MR diff, and OpenSpec artifacts.
6. One failure MUST NOT block later issues; **conflict pending confirmation** MUST pause for human product/tech direction.
7. At batch end, summarize each issue’s Jira status, OpenSpec change, PR/MR, verification, and archive state.

## Batch mode propagation

Per-issue mode is set **explicitly** from batch-level user intent. Child “auto reverts to manual” MUST NOT break batch continuity.

| Batch trigger | Orchestrator behavior | Child mode |
|---------------|----------------------|------------|
| Contains「自动」/ "auto" (e.g.「opsx 批量自动修复」) | Attach `--auto` on each child call | Auto |
| No「自动」/ "auto" (e.g.「opsx 批量修复」) | Do not attach `--auto` | Manual |

- **Separation of concerns**: `opsx-jira-fix-workflow` need not know batch context.
- **Explicit over implicit**: orchestrator passes mode parameters.

Optionally note the mode used in each change’s `design.md`.

## Issue relationship detection

1. **Duplicate / equivalent** — Same symptom, root cause, behavior contract, or fix point; A’s fix covers B → mark B **skipped (covered by duplicate)** with “covered by A / `<change-name>`”; do not open another fix PR.
2. **Dependency** — B needs A’s code, behavior, or spec → mark **waiting on dependency**; continue B only after A verifies and archive strategy is clear; when running B, read A’s `design.md`, `tasks.md`, PR/MR diff, and verification evidence.
3. **Overlap but not equivalent** — Same module/capability, different root cause/contract/scenarios → analyze separately; cross-link in each `design.md` Risks/Dependencies; prefer serial handling.
4. **Conflict** — Contradictory expected behaviors or scenarios → pause, **conflict pending confirmation**, wait for human direction.
5. **Derived** — Fixing A reveals B as follow-on, deeper root cause, or new scenario on the same capability → record derivation; decide merge into one change, depend, or split Jira/OpenSpec change.

Write relationships into the corresponding `design.md` at least as:

```text
## Related Issues

- <JIRA-ID>: duplicate / dependency / overlap / conflict / derived; conclusion; related PR/MR or OpenSpec change.
```

If the orchestrator also keeps a progress file, suggested statuses: pending / in progress / done / skipped (duplicate) / waiting dependency / conflict pending / review failed (cap) / failed.
