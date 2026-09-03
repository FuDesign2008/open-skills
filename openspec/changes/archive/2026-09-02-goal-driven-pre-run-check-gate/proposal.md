## Why

Standalone `goal-driven-workflow` still lets auto mode skip stages 1–3 confirmation, and it treats Stage 4 launch approval as the same event as starting the long run. A human who finishes the pre-run check (or who is about to leave) cannot rely on those Q&A staying done, and cannot rely on the run staying unstarted until they explicitly say to launch.

## What Changes

- Add a standalone-only state machine: **Design-checked → Armed → Launch**.
  - Design-checked: stages 1–3 and Stage 4 launch approval (goal condition + budget + companion checklist) are human-checked.
  - Armed: Design-checked is complete; the long run MUST NOT start.
  - Launch: an explicit user launch instruction starts Stage 4 execute; those pre-run Q&A MUST NOT be re-asked.
- Incomplete Design-checked MUST refuse Launch (even if the user says 开跑 / launch).
- **BREAKING** (standalone only): auto mode (`「自动模式」` / `「自动跑」`) MUST NOT skip stages 1–3 confirmation.
- Stage 4 launch approval and Launch remain two events: approval → Armed; explicit instruction → Launch. No bundled “confirm to fire” control.
- No off-hours / 「下班」 trigger words. Queue-child invocations (this-turn dispatch supplied a frozen card) do not enter Armed; card approval is 留痕.
- Stage 5 human acceptance is unchanged.
- Scope: `skills/goal-driven-workflow/` plus this OpenSpec change. Do not change `goal-driven-batch` or extract a shared discipline.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `goal-run`: standalone pre-run gate (Design-checked → Armed → explicit Launch); auto mode no longer skips 1–3 on standalone; launch-approval split from firing; queue-child uses card approval as 留痕 (no second Armed).

## Impact

- Files: `skills/goal-driven-workflow/SKILL.md`, `skills/goal-driven-workflow/reference.md`, `openspec/specs/goal-run/spec.md` (via archive).
- Behavior: standalone auto-mode users must confirm stages 1–3; low-impact standalone no longer starts after stage 3 confirms alone; saying launch before the check completes is a hard stop, not a skip.
- Out of scope: `goal-driven-batch`, other workflows, new evals directory, merge of the implementing PR.
