## Context

`goal-driven-workflow` (capability `goal-run`) solves one goal per invocation and pauses for human approval on every unattended launch. `jira-fix-batch` proves the thin-orchestrator-over-engine pattern but is Jira-bound and session-scoped. The 7×24 handbook (`docs/7x24-agent-reliability-handbook.md`) supplies L1–L4 vocabulary: scheduling belongs to the platform (L1); this change builds an L2–L4 orchestration layer that treats any platform trigger as its entry point.

Review verdict: passed (two-way door; standard depth). One spec-compliance tightening applied during review: dropped the command-file commitment from scope (routing via description triggers, mirroring `jira-fix-batch`).

## Goals / Non-Goals

**Goals:**
- Detach-run-accept cycle: humans enqueue approved goals anytime, agent consumes them unattended, humans return to an acceptance package.
- Queue lifecycle ownership only: backlog carrier, intake-time approval capture, serial loop, isolation directives, progress document, acceptance package.
- Safe unattended launches without weakening the engine's high-impact launch gate semantics.

**Non-Goals:**
- Parallel multi-agent consumption (v1 is serial; parallelism deferred).
- Embedded scheduling/daemon behavior — triggering stays platform-native.
- Jira/external-ticket integration (`jira-fix-batch` keeps that lane; no cross-calls either way).
- Intake requirement-refinement tooling beyond shaping a submitted requirement into a valid goal card (full intake polish is future work).

## Decisions

1. **New standalone orchestrator skill over in-engine queue mode.** A queue has a cross-session, persistent lifecycle foreign to a single-run methodology; extending `goal-run` would bloat a stable contract and enlarge conflict surface. Mirrors proven `jira-fix-batch : jira-fix-workflow` split. Alternative rejected: MODIFIED `goal-run`.
2. **Intake-time pre-approval as the launch-gate resolution.** Approval of final condition + budget happens when the card enters the backlog and is frozen there; the git commit is the 留痕 record. Mid-run re-pause occurs only on detected condition invalidation → park as `conflict pending confirmation`. This satisfies the *intent* of goal-run's high-impact gate (a human explicitly saw and approved exactly what will run and what it may cost) instead of bypassing it. Alternatives rejected: per-launch pause (breaks detach promise); MODIFIED goal-run requirement (blast radius on another capability).
3. **Plain-markdown task cards, no YAML frontmatter.** Fixed labeled sections keep cards LLM-readable and diff-friendly and avoid the repo's documented YAML parsing pitfalls. Fields: Goal Condition / Budget / Constraints / Priority / Status / Acceptance Summary (+ Notes). Status vocabulary shared across cards and progress doc: `pending → in progress → done | failed | skipped (covered) | waiting dependency | conflict pending confirmation`.
4. **Serial consumption with light relationship pass.** Duplicate/equivalent skip, dependency waiting, overlap-conflict parking — adapted from jira-fix-batch's five-type detection minus Jira-specific derived-issue handling. After each completion, remaining cards are re-checked against latest code state before dispatch.
5. **Queue-level caps at trigger time.** Max-tasks and/or overall time cap come from the trigger statement ("跑队列，最多跑 3 个任务") with a conservative default in the skill body; no separate config file in v1.
6. **Progress doc under `.goal-queue/runs/<batch-id>/progress.md`.** Batch-id = start timestamp; minimum fields identical to jira-fix-batch's status vocabulary plus Branch name. Acceptance package = progress doc + engine reports (referenced by path) + branch list.

## Risks / Trade-offs

- [Intake approval drifts into rubber-stamping, weakening gate intent] → Card must quote the exact condition+budget text the human confirmed; consumption-entry check re-validates constraints still hold before dispatch; changed conditions park the task.
- [Unattended auto-approval enables broad writes in user projects] → Engine's unattended-companion guidance (per-turn convention file, minimal tools, hooks) applies to every child run; orchestrator reminds at first auto run. Merge stays human-only.
- [Skill-body duplication of engine/handbook methodology] → Thin-reference requirement in delta spec; acceptance uses残留 grep for engine-stage titles during implementation verification.
- [Backlog dirs leak into consumers' public repos] → `.goal-queue/` is created in the *user's* project; docs suggest gitignoring if tasks contain private info, consistent with repo de-identification iron law for this repo's own content.

## Migration Plan

Pure addition on a feature branch; rollback = branch drop or revert commit. No data migration, no existing-contract modification. Consumers adopt by creating `.goal-queue/` lazily on first enqueue.

## Open Questions

- Parallel consumption cap semantics (deferred to a future change when demand appears).
- Whether queue state should ever sync to issue trackers (explicitly out of lane today).
