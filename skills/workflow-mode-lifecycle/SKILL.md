---
name: workflow-mode-lifecycle
version: "1.0.0"
user-invocable: false
description: "Shared lifecycle contract for manual/auto modes in PDCA-style workflow skills: auto mode always reverts to manual on completion or interruption, re-entering auto requires an explicit trigger, implicit continuation never re-activates it, and batch orchestrators pass mode explicitly. Referenced via frontmatter dependencies by solve-workflow, opsx-solve-workflow, jira-fix-workflow, opsx-jira-fix-workflow; load when a workflow delegates its mode rules."
---

# Workflow Mode Lifecycle

> Internal shared skill. Prevents **mode stickiness** — the user being unaware that the AI is still making automatic decisions. Referencing workflows declare it in frontmatter `dependencies` and abort at startup if it is missing.

## Mode recognition

- Trigger contains "自动" (auto) → **auto mode**; otherwise → **manual mode** (default).
- Mid-run switching: user says "切换自动模式" / "切换手动模式" to switch.
- Manual: pause at each stage exit for user confirmation. Auto: proceed end-to-end, pausing only at workflow-defined limits (e.g. review-loop cap).

## Core rule: auto always reverts to manual

Auto mode **automatically reverts to manual mode** when:

| Scenario | Note |
|----------|------|
| Full flow completes normally | Including the case where a new cycle is decided — a new cycle starts in manual by default |
| Flow is interrupted in any way | Failure abort, user-initiated stop, termination after a review-cap pause |

The workflow-specific completion point (e.g. PR merged, archive done) is defined by each workflow's own differences block, but the revert rule itself is universal.

## Re-entering auto mode: explicit only

After reverting to manual, re-entering auto mode requires an **explicit trigger**:

- "自动 xxx" / "自动分析" / "自动解决" / "切换自动模式"

Implicit continuation — "继续", "再改一下", "深入分析" — **must NOT** re-activate auto mode.

## Batch scenarios

In batch orchestration (e.g. jira-fix-batch, opsx-jira-fix-batch), the orchestrator passes the mode **explicitly per sub-invocation** based on the user's batch-level intent. The single-run revert rule above does not propagate across sub-invocations.

## Integration guide (for referencing workflows)

- **Keep in your own body**: your trigger-word table (triggers differ per workflow), the manual/auto stop-point summary per stage, and a **workflow-specific differences** block.
- **Delegate to this skill**: the revert-to-manual core rule, explicit re-entry, implicit-continuation prohibition, and the batch rule. Do NOT copy their full text inline.
- **Differences block examples** (stay in the workflow, never move here): `--retry` resets to manual; `--resume` keeps the checkpoint mode; validation-failure rollback keeps mode within N attempts; archive failure counts as interruption.
