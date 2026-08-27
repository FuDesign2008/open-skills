---
name: goal-driven-batch
version: "0.2.0"
user-invocable: true
description: "Batch orchestrator layer over the goal-driven-workflow engine. Triggers when the user says「goal 批量」「跑队列」「任务队列」「无人值守队列」「把需求加入队列」「空闲时段跑任务」/ goal-driven-batch, goal batch, run queue, unattended task queue. Orchestrates a persistent backlog of pre-approved goal tasks: serial consumption delegating each task to the goal-driven long-run engine, with intake-time approval capture, per-task branch isolation, queue-level budget caps, and an acceptance package for human review when the run ends. Use whenever the user wants requirements enqueued now and executed unattended later, or wants to start, inspect, or review a queue run — even casually phrased (「今晚让它自己跑」「我回来验收一下」). Do NOT use for a single ad-hoc long run (use goal-driven-workflow directly), Jira multi-issue fixes (jira-fix-batch), or setting up cron/schedulers themselves."
dependencies:
  - goal-driven-workflow
  - design-approval-gate
---

# Goal-Driven Batch

> This skill owns the **queue lifecycle**: persistent backlog, intake-time approval capture, serial consumption, queue-level caps, progress document, acceptance package.
> Single-run methodology lives in `goal-driven-workflow` (the engine); merge decisions stay human. Loading this skill MUST NOT start consumption by itself — consumption starts only on an explicit queue request or a scheduled pull.

The value proposition is the detach-run-accept cycle: a human drops approved goals into the backlog during spare moments, leaves, and returns later to a packaged result. Every design choice below serves that promise — nothing may stall waiting for an absent human, and nothing may proceed past what the human actually approved.

## Prerequisite Skill Check

Run at startup against frontmatter `dependencies`: scan available skills; abort immediately with install guidance (`npx skills add FuDesign2008/open-skills -g`) if `goal-driven-workflow` or `design-approval-gate` is missing. No silent downgrade — a missing engine means queued tasks cannot execute correctly.

## Queue Layout

```
.goal-driven/
├── <task-card>.md          # one pre-approved goal per file
└── runs/<batch-id>/progress.md   # per-run status document
```

Task-card status vocabulary (shared with the progress document):
`pending → in progress → done | failed | skipped (covered) | waiting dependency | conflict pending confirmation`

Card format and all output templates live in [reference.md](reference.md).

## Path Overview

| Stage | Tool permissions | Manual stop | Required output |
|-------|------------------|-------------|-----------------|
| 1 Enqueue & Pre-approve | ✅ Read; Write limited to `.goal-driven/` cards | ⛔ stop before starting any run | validated task card(s) |
| 2 Run the Queue | ✅ Everything, per child-run contract | auto-advance; stops at caps or empty queue | updated progress doc |
| 3 Acceptance Package | ✅ Bash; Write limited to `.goal-driven/runs/` | ⛔ stop, hand back to human | package path + summary |

## Stage 1: Enqueue & Pre-approve

This stage exists because approval is cheapest while the human is present. The card freezes exactly what will run and what it may cost — that frozen text is what makes unattended launches safe later, standing in for the launch approval the engine would otherwise demand from a person who is no longer there (`design-approval-gate` named-escape pattern; record the intake confirmation as the 留痕, e.g. in the card's approval line plus the git commit).

1. Shape the submitted requirement into a task card ([reference.md](reference.md) § Task Card): measurable goal condition with a mandatory budget clause, constraints, priority, status `pending`, plus a coarse duration estimate (advisory; derivation in [reference.md](reference.md)).
2. Confirm condition + budget with the human **once, now**; record approval in the card. Do not start a run unless they asked for one in the same breath.
3. Suggest committing the card so backlog changes stay reviewable.

Loading without a queue request: give a one-glance overview (pending/in-progress counts, total estimate of the remaining pending work, next actionable card) and wait.

## Stage 2: Run the Queue

Triggered by an explicit request («跑队列» variants) or by whatever the platform scheduler pulled in. Before dispatching, resolve queue-level caps from the trigger statement (max tasks and/or overall time; use the conservative default in [reference.md](reference.md) when unstated) — these exist so the worst case is a clean early stop with work left pending, never a runaway night. Then compare the summed card estimates against the resolved time cap and record both in the first progress-doc entry: estimates are advisory and stopping stays cap-driven, but the human should know upfront if the queue will not fit.

**Mode propagation**: a trigger containing 「自动」/"auto" runs every child invocation in auto mode; otherwise children keep their default mode. State this explicitly when invoking each child — do not rely on ambient inheritance, and treat each child's completion as final for continuity purposes (their auto-revert rules apply within their own run, not across the queue).

For each pending card in priority order, until caps hit or the queue drains:

1. **Consumption-entry check** — re-validate the card: budget clause present, constraints still hold against current repo state (target files/branches still exist, dependencies not yet merged away). A changed world invalidates the frozen approval, so park such cards as `conflict pending confirmation` instead of running them.
2. **Relationship pass** (light, across remaining cards): duplicate/equivalent of an already-done outcome → mark `skipped (covered)` pointing at the covering report; depends on an earlier task's change → run after it and hand its summary/branch to the child; overlap-conflict → park `conflict pending confirmation`. Re-check remaining cards after each completion since code state moved.
3. **Isolate** — put the child run on a dedicated branch (or linked worktree) based off latest main, per `git-worktree-discipline`. One task owns one branch; no task ever carries another's edits.
4. **Delegate** — invoke `goal-driven-workflow` for this single goal (auto mode if propagated). The card supplies the inputs for its requirements alignment (stage 1) and acceptance/goal-condition design (stage 2); sub-agent division (stage 3), launch companions, and fallback harness selection remain the engine's own calls. For unattended runs remind once per batch about the engine's unattended-companion setup (convention file, validation hooks, minimal tools).
5. **Record** — on child completion: update the card status + acceptance summary and the progress document immediately (per-status updates make crashes cheap to resume and the morning review honest). One task failing or capping out MUST NOT block later tasks.
6. **Re-assess the queue budget** spent so far before dispatching the next card.

When caps hit or the queue empties: stop cleanly — stopping mid-backlog is a feature, leftover cards simply stay `pending`.

## Stage 3: Acceptance Package

Assemble into `.goal-driven/runs/<batch-id>/`: the progress document, each executed task's engine completion report (its report-template output, referenced by path), and the branch list awaiting review. Then hand back:

- Present the summary: per-task result, evidence location, branch tip, and the outcome-type items only a human can judge (the engine separates those; never self-certify them).
- Stop at the branch list. Merge authority is exclusively human — propose an order and highlight conflicts, but do not merge, push to protected branches, or close anything irreversible.
- Route acceptance findings back into new or revised cards so the next run starts better informed.

## Red Flags

- Starting consumption just because the skill was loaded, or letting a child launch re-pause for approval the card already froze (silently re-approving changed conditions is worse than pausing)
- Reading the queue into memory once and never noticing mid-run that code state shifted under the remaining cards
- Running two children concurrently or letting one failed card cancel the rest
- Treating "budget exhausted" as task success — the report must say which acceptance tiers actually passed
