# Proposal: goal-queue priority vocabulary & mid-run enqueue

## Why

`goal-driven-batch` was scoped around a drop-then-leave cycle: enqueue happens only before a run, and although the task-card template carries a `Priority` field and the consumption loop claims "priority order", the priority vocabulary (legal values, ordering direction, tie-breaking) is undefined and enqueue-time confirmation is implicit. Users need to append tasks to the queue at any time — including while a run is in progress — and to state each task's priority so consumption order reflects urgency.

## What Changes

- Define the card priority vocabulary: `P0` (highest / urgent) / `P1` (normal, default) / `P2` (background / lowest); same-priority tasks run FIFO by card `Created` timestamp. Defined once in the skill's `reference.md`; SKILL.md references it without restating.
- Enqueue (Stage 1) explicitly records the human-chosen priority during the intake freeze (default `P1` when unstated).
- Consumption loop (Stage 2) re-scans the backlog directory after each child completion and admits newly added pending cards into priority order — never preempting the in-flight child task.
- Mid-run discovered cards are validated before admission: budget clause + approval record present and card well-formed; a card missing approval stays `pending` with a progress-doc note (unapproved work is never executed unattended); a malformed card (e.g. still being written) also stays `pending` without stalling the loop.
- Late-admitted cards count against the remaining queue-level task cap; the time cap is unaffected. Discovery events are logged in the progress document notes.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `goal-queue`: the persistent-backlog requirement gains a defined priority vocabulary on cards; the serial-consumption requirement gains mid-run enqueue discovery (post-completion re-scan, priority insertion, approval/malformation guards, cap accounting) with new scenarios.

## Impact

- `skills/goal-driven-batch/SKILL.md` — Stage 1 freeze step records priority; Stage 2 re-check extends to backlog re-scan; one red-flag entry; version bump 0.3.0 → 0.4.0.
- `skills/goal-driven-batch/reference.md` — Task Card `Priority` field semantics (vocabulary + FIFO tie-break); Defaults section gains the mid-run discovery note convention.
- `docs/generated/skills-index.md` — auto-regenerated (version row).
- No changes to `goal-driven-workflow` (engine), `intake-interview-discipline`, or any runtime code; scheduling stays platform-native.
