---
name: jira-fix-batch
version: "2.0.0"
user-invocable: true
category: development
tags: [jira, batch, workflow]
description: "Triggers when the user says「批量修复」「批量 jira-fix」「jira-fix-batch」「批量修复多个 Jira」「批量修复以下 bug」/ batch fix, batch jira-fix. Thin trigger shell: parse Jira IDs/URLs and enqueue them into goal-driven-batch with Engine jira-fix-workflow. Does not run fixes or merge. Do NOT use for a single issue (jira-fix-workflow) or a non-Jira queue (goal-driven-batch)."
dependencies:
  - goal-driven-batch
---

# Jira Bug Batch Enqueue Shell

> Trigger-only shell. Queue lifecycle, relationship pass, isolation, caps, and acceptance live in `goal-driven-batch`. This skill parses a Jira list and hands it to that skill's **Jira list-enqueue shortcut** with `Engine: jira-fix-workflow` already frozen.

**Activate only when the user explicitly requests a batch Jira fix.** Loading this skill MUST NOT start a queue run.

## Prerequisite Skill Check

Scan available skills. If `goal-driven-batch` is missing, abort immediately with install guidance (`npx skills add FuDesign2008/open-skills -g --skill goal-driven-batch --yes`). No silent fallback — without the queue there is no place to put the cards.

## Duties

1. Split the input into distinct Jira IDs/URLs.
2. Load `goal-driven-batch` and run its **Jira list-enqueue shortcut** with `Engine: jira-fix-workflow` frozen on every card.
3. Stop when that shortcut stops (cards written, one batch approval event). Do not start consumption. Do not call `jira-fix-workflow`. Do not write `.jira-fix/` progress files.

## Red Flags

- Looping `jira-fix-workflow` from this skill
- Starting the queue because the list was parsed
- Re-implementing relationship detection, mode propagation, or a progress document here
