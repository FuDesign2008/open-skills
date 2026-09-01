# Proposal: jira-fix engine integration

## Why

User decision: `jira-fix-workflow` joins `goal-driven-batch`'s Engine support with unattended capability, and the problems identified in the pre-analysis get fixed rather than routed around. Identified problems: no policy/counterpart/forecast wiring (the five question-leak root causes), stage-10 merge confirmation stalls any unattended run, Jira writeback is a reserved-list outbound operation, and the card→intake supply path was undefined.

## What Changes

- **Engine vocabulary gains a fourth value**: `jira-fix-workflow` (exact skill name; fixed at freeze like the others). Prerequisite: abort only when a card names it and the skill is missing.
- **Card→intake supply**: the card's goal condition carries the Jira issue link/key; the frozen-decisions block supplies jira-fix's stage 0–1 clarifications; its stage-4 difficulty grading runs unchanged (a 🔴 extremely-hard auto-termination maps to the queue's existing non-blocking-failure semantics).
- **PR-open terminal for queue children**: a queue-dispatched jira-fix child carries an explicit `queue-child` context flag and terminates at stage 9 (PR open + record-only closeout); stage 10 (merge + Jira writeback) is deferred to the human — merge authority stays human (queue red line + jira-fix's own both-modes-require-confirmation rule), writeback is a reserved-list outbound that follows the human merge via `--resume` or manual completion. The acceptance package lists the PR and the pending merge+writeback as explicit follow-ups. Independent (non-queue) use of jira-fix-workflow is unchanged — the short-circuit only activates on the explicit flag, never guessed.
- **Symmetric policy wiring**: `Stage-exit policy` semantics apply as with solve/opsx (manual-pause / counterpart → auto + counterpart-occupied exits / auto-escape); a thin "Queue-child mode" section in jira-fix-workflow plus the ai-counterpart dependency (abort only when policy = counterpart and missing); stop-point forecast on queue-child start.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `goal-queue`: 子任务引擎可选调度 gains the fourth engine value, the Jira-link goal supply, and the PR-open terminal semantics for queue-dispatched jira-fix children.
- `ai-counterpart`: PDCA 宿主出口接线 host list gains `jira-fix-workflow` (same seat rules, same forecast).

## Impact

- `skills/goal-driven-batch/` (0.9.0): Engine 4-value vocabulary, Delegate jira-fix branch, frontmatter dependency (opt-in abort), evals +1.
- `skills/jira-fix-workflow/` (3.28.0): ai-counterpart dependency + Queue-child mode thin section (input supply, policy semantics, counterpart exits, forecast, stage-10 short-circuit on explicit flag).
- `skills/ai-counterpart-discipline/` (1.2.0): PDCA host list += jira-fix-workflow.
- `AGENTS.md` rows; `docs/generated/skills-index.md`. `opsx-jira-fix-workflow` integration is an explicit non-goal (future symmetric change).
