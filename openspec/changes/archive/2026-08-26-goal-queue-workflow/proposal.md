## Why

The repo already has a single-goal unattended long-run engine (`goal-driven-workflow`, capability `goal-run`) and a Jira-bound batch orchestrator (`jira-fix-batch`), but nothing covers the detach-run-accept cycle users actually want during free time: requirements dropped into a persistent backlog, an agent consuming that queue unattended (scheduled or manually pulled), each task isolated so failures do not cascade, and a packaged handback for human acceptance. Verified by full enumeration of `skills/` and `openspec/specs/`: no queue-orchestration capability exists.

## What Changes

- Add a new user-invocable orchestration skill `goal-queue-workflow` that owns only the **queue lifecycle**: persistent backlog format, intake-time approval capture, serial consumption loop, per-task branch/worktree isolation directives, queue progress document, and the final acceptance package.
- Per-task execution is delegated to the existing `goal-driven-workflow` engine (same ownership split as `jira-fix-batch : jira-fix-workflow`). No engine behavior changes.
- Resolve the tension between unattended overnight launches and `goal-run`'s high-impact launch gate via **intake-time pre-approval**: explicit human sign-off of each task's final goal condition + budget captured when the task enters the backlog (the git commit serves as 留痕), so launches never stall waiting for an absent human mid-run.
- Scheduling stays platform-native by intent (cron / systemd / GitHub Actions / Claude Routines / manual command); the skill has no embedded scheduler and consumes whatever triggered it until the queue drains or budget caps hit.

## Capabilities

### New Capabilities

- `goal-queue`: Persistent goal-backlog queue lifecycle — backlog carrier format, intake-time high-impact pre-approval with 留痕, serial consumption with light relationship detection, per-task isolation, mode propagation into child runs, queue-level budget/stopping rules, progress document, and batch acceptance package.

### Modified Capabilities

(none — all existing contracts remain untouched; dependency edges are host-to-callee only)

## Impact

- New files: `skills/goal-queue-workflow/SKILL.md` (+ optional `reference.md` templates). No command file — routing is via description trigger words, mirroring `jira-fix-batch`.
- Regenerated: `docs/generated/skills-index.md`; AGENTS.md gains one Skill-list row.
- Frontmatter single-direction dependencies: `goal-driven-workflow`, `design-approval-gate` (pre-approval pattern), per `skill-dependency-direction`.
- Runtime artifacts created by skill users (not part of this repo): `.goal-queue/` backlog directory and run progress documents inside *their* projects.
- Methodology vocabulary aligns with `docs/7x24-agent-reliability-handbook.md` (L2–L4 layers; Propose-not-perform; stopping-is-a-feature) via thin reference, no duplication.
