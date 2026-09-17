## Why

The just-landed human per-card verification gate establishes that `done` (engine completed) is not acceptance, but the queue's **evidence consumers** still treat `done` as acceptance-grade: enqueue triage may mark a card `skipped (covered)` off a merely-`done` card, the dispatch relationship pass still compares against `done` reports, and a `Waits-on` target releases its dependent the moment it is `done`. A card that is `done` but `returned`, or still `awaiting`, can therefore mechanically suppress the very rework a human verdict routes back — silently undoing the gate.

## What Changes

- **Acceptance-grade evidence requires `verified`.** Covering evidence (triage `skipped (covered)` and the dispatch relationship pass) SHALL require the covering/source card to carry `Verification: verified`; a `done`-but-`awaiting` or `returned` card does not cover.
- **Dependency release requires `verified`.** A `Waits-on` dependent SHALL hold `waiting dependency` until its target is `verified`; a target that is `done` but `awaiting` holds the dependent; a `returned` target (or any terminal state other than `verified`) parks the dependent as `conflict pending confirmation`.
- Sync the affected requirements in `goal-queue` and `goal-queue-triage`, including requirements that merely mention the changed item (contract cross-reference).
- Sync the operative skill text (`skills/goal-driven-queue/SKILL.md` / `reference.md`) to match the accepted-evidence rule.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `goal-queue`: `derived 关系且禁止共用 change/分支` and `并发消费与非阻塞失败` — covering/dependency evidence requires `verified`, not merely `done`.
- `goal-queue-triage`: `入队批量 triage` and `信息杠杆排序` — the mechanically-provable covered outcome and the `Waits-on` release both key on `verified`.

## Impact

- Files: `openspec/specs/goal-queue/spec.md`, `openspec/specs/goal-queue-triage/spec.md` (via archive); `skills/goal-driven-queue/SKILL.md`, `skills/goal-driven-queue/reference.md`.
- Behavior: an unverified (`awaiting`/`returned`) card no longer covers another card nor releases a dependent — dependents wait for human acceptance instead of a mere `done`. Follow-up to `goal-queue-human-per-card-verification`.
- Out of scope: the verification gate itself (already landed); merge authority; scheduling.
