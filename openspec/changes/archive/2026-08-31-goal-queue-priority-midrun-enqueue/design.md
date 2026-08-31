# Design: goal-queue priority vocabulary & mid-run enqueue

## Context

`goal-driven-batch` v0.3.0 owns the queue lifecycle over the `goal-driven-workflow` engine: intake-time pre-approval, serial consumption, per-task isolation, queue-level caps. The task-card template already carries a `Priority` field (default `P1`) and the consumption loop already claims "priority order", but the vocabulary is undefined (legal values, direction, tie-break) and enqueue is scoped to pre-run only ("空闲时段提交"). The queue is a plain directory of markdown cards (`.goal-driven/`); there is no runtime daemon — the consumption loop is agent-orchestrated, which makes directory re-scans the natural discovery mechanism.

## Goals / Non-Goals

**Goals:**

- Make "priority order" well-defined: three-level vocabulary + deterministic tie-breaking.
- Allow appending tasks at any time, including while a run is in progress, with the confirmed semantics: never preempt the in-flight child; newly discovered cards enter priority order at the next post-completion re-scan.
- Preserve the intake-time pre-approval invariant: unapproved work is never executed unattended.

**Non-Goals:**

- Re-prioritizing or reordering already-enqueued cards (human may edit a card file directly, but no orchestrator command is added).
- Preemption/interruption of a running child task.
- Changes to the engine (`goal-driven-workflow`), the intake discipline, or scheduling (stays platform-native).

## Decisions

1. **Three-level vocabulary `P0`/`P1`/`P2` over numeric priority.** `P0` = urgent/highest, `P1` = normal (default when unstated), `P2` = background/lowest; same-priority cards run FIFO by card `Created` timestamp. A human-managed backlog reads better as three familiar levels than an open numeric scale; a "jump the queue" ask maps to `P0`. Rejected: numeric scale (no extra expressive power that matters here — YAGNI), filename-only ordering (cannot express urgency).
2. **Post-completion directory re-scan over file-watching.** Discovery rides the existing after-completion re-check point: re-scan `.goal-driven/` for new pending cards, validate, admit into priority order. No daemon exists to watch files, and the confirmed semantics explicitly exclude preemption, so a completion boundary is the only correct admission point. Rejected: watcher (over-engineering for an agent loop), next-run-only pickup (fails "随时添加").
3. **Admission guards at discovery.** A discovered card must be well-formed and carry a budget clause plus an approval record before it may run. A card still being written (malformed) or lacking approval stays `pending` with a progress-doc note; the loop is never stalled and unapproved work is never launched. This preserves the「入库即预审批」invariant for the dynamic path.
4. **Single definition site.** The vocabulary is defined once in `skills/goal-driven-batch/reference.md` (Task Card field); SKILL.md references the term without restating values (repo rule: rules written once).
5. **Cap accounting.** Late-admitted cards consume the remaining queue-level task-count cap; the time cap is wall-clock and unaffected. Discovery events land in the progress document notes so the morning review sees what happened.
6. **Session-agnostic append path.** Any session — or a direct file edit in `.goal-driven/` — may add cards; discovery is purely directory-state based, keeping the contract platform-agnostic (no platform-specific tooling hard-coded).

## Risks / Trade-offs

- [Unapproved mid-run card executed unattended] → admission guard requires the approval record; missing → stays `pending` + progress note, never runs.
- [Re-scan reads a half-written card] → well-formedness validation; malformed cards stay `pending` without stalling the loop.
- [`P2` starvation under continuous inflow] → bounded by queue caps; leftover cards persist as `pending` across runs and surface in the acceptance package.
- [Priority direction misread (`P0` vs lowest)] → vocabulary states the direction explicitly at its single definition site.
- [Late cards blow past the intended batch size] → they count against the remaining task cap, so the worst case is the same clean early stop as any oversized backlog.

## Migration Plan

Markdown + git only. Existing cards already say `Priority: P1`, which conforms to the vocabulary (P1 default) — no data migration. Rollback = revert the change commit.

## Open Questions

None.
