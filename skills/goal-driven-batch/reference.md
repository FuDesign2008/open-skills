# Goal-Driven Batch — Templates & Defaults

Support file for SKILL.md. All templates are starting shapes; keep field names stable because the progress document and the acceptance package both reference them.

## Task Card

File name: `.goal-driven/<slug>.md` (slug = kebab-case goal summary; date prefix optional for ordering).

```markdown
# Goal: <one-line measurable goal>

- Status: pending
- Priority: P1
- Estimate: <coarse duration band, e.g. "<30min" / "~1h" / ">2h">
- Created: YYYY-MM-DD HH:MM
- Approved: <who/how the human confirmed condition + budget, e.g. "chat confirm 2026-08-26" / commit sha>

## Goal Condition
<measurable end state> + <stated check how it is proven> + <constraints that must not change> + <budget clause "or stop after N turns / N minutes">

## Frozen Decisions (intake)
- Chosen approach: <one line> (comparison table recorded at: <where>)
- Resolved tickets: <ticket → decision, one per line>
- Deferred tickets: <ticket — reason>
- Initial assumptions: <assumption — impact if wrong>
- Pre-launch self-review: pass / blocking doubt raised: <what>

## Constraints
- <files/dirs/scope boundaries; things the run must not touch>

## Acceptance Summary
<filled after the run: engine report path, branch name, result tier (done/failed/...), outcome items awaiting human judgment>
```

The budget clause mirrors the engine's own mandatory-budget rule — a card without one fails the consumption-entry check. The Frozen Decisions section mirrors `intake-interview-discipline` — it answers the child engine's stage 1 intake so the child never re-asks what was frozen; falsifying evidence mid-run produces a clean stop + ticket, not a silent pivot.

The estimate is advisory only: caps and the per-card budget stay authoritative, and estimate drift never invalidates an approval. Derive it from the card's budget ceiling plus visible scope (files/dirs touched, constraint complexity); prefer coarse bands over false precision.

## Progress Document

Path: `.goal-driven/runs/<batch-id>/progress.md` (`batch-id` = run start timestamp `YYYYMMDD-HHMM`). Create at batch start; update on every status change.

| Field | Meaning |
|-------|---------|
| Task | card slug |
| Mode | auto / default (as propagated to the child) |
| Estimate | coarse planned duration from the card |
| Status | pending / in progress / done / failed / skipped (covered) / waiting dependency / conflict pending confirmation |
| Result summary | one line: what happened, or why parked/failed |
| Branch | task branch tip |
| Report | path to the engine completion report |
| Notes | relationships (covered-by / waits-on), blockers, human asks |

## Batch Summary (closing output of Stage 3)

```markdown
## Queue Run <batch-id>
- Duration: <start → end> (planned ≈ <sum of card estimates>); caps hit: <none | max-tasks | time>
- Done: N   Failed: M   Skipped: K   Parked: P   Left pending: R
- Branches awaiting review:
  - <branch> — <task slug> — <result tier> — report: <path>
- Needs your judgment:
  - <outcome-type item per engine report>
  - <ledger rollup per intake-interview-discipline: unresolved tickets / low-confidence assumptions / high-impact-if-wrong entries; clean-stop tickets with options>
- Suggested merge order / conflicts: <short list>
```

## Defaults

- Queue caps when the trigger states none: stop after **3 tasks** or **2 hours**, whichever comes first. State the resolved cap in the first progress-doc entry so the stopping rule is auditable.
- Gitignore hint when cards may contain private info: suggest `.goal-driven/` in the user project's `.gitignore` — queue content belongs to the local project owner.
