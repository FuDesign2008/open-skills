# Goal-Driven Batch — Templates & Defaults

Support file for SKILL.md. All templates are starting shapes; keep field names stable because the progress document and the acceptance package both reference them.

## Task Card

File name: `.goal-driven/<slug>.md` (slug = kebab-case goal summary; date prefix optional for ordering).

```markdown
# Goal: <one-line measurable goal>

- Status: pending
- Priority: P1
- Engine: goal-driven-workflow | solve-workflow | opsx-solve-workflow | jira-fix-workflow | opsx-jira-fix-workflow (REQUIRED — set by the mandatory engine ticket, no default; fixed at freeze; jira-fix children terminate at PR-open, opsx-jira children at archive+PR-open — merge + writeback stay human; a card without the field parks awaiting engine decision)
- Traceability: none | openspec/<change-name> (only when the user opted into OpenSpec sedimentation at enqueue)
- Stage-exit policy: manual | ai-proxy | auto (set by the interaction-budget first ticket; legacy `Counterpart: on` / `counterpart` values read as `ai-proxy`; legacy `manual-pause` / `auto-escape` read as `manual` / `auto`)
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

## Decisions I Made for You
- <self-answered decision> — impact: low (rationale: <one line>)
- <self-answered decision> — impact: high (kept only when no human touchpoint allowed a question)
(empty when the intake had no self-answers; the approval event displays this section)

## Acceptance Summary
<filled after the run: engine report path, branch name, result tier (done/failed/...), outcome items awaiting human judgment>
```

The budget clause mirrors the engine's own mandatory-budget rule — a card without one fails the consumption-entry check. The Frozen Decisions section mirrors `intake-interview-discipline` — it answers the child engine's stage 1 intake so the child never re-asks what was frozen; falsifying evidence mid-run produces a clean stop + ticket, not a silent pivot.

The estimate is advisory only: caps and the per-card budget stay authoritative, and estimate drift never invalidates an approval. Derive it from the card's budget ceiling plus visible scope (files/dirs touched, constraint complexity); prefer coarse bands over false precision.

Priority uses a three-level vocabulary: `P0` (urgent — consumed first), `P1` (normal — the default when unstated), `P2` (background — consumed last); within a level, cards run FIFO by `Created` timestamp. A card added while a run is in progress is discovered at the next post-completion re-scan and admitted by these same rules (Stage 2 step 7 in SKILL.md).

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
- Mid-run discovery: a re-scanned card missing its approval record stays `pending` with the progress note `awaiting approval (added mid-run)`; malformed cards likewise stay `pending` without stalling the loop; discovery events land in the progress document's Notes.
- Presence tiers: intake depth follows `intake-interview-discipline` §A — present (default) per-decision questioning with the three-part base; declared/structural absence keeps the once-confirm mode unchanged.
- OpenSpec archive timing (when `Traceability` is set): archive that task's change after its machine-verifiable evidence is complete; outcome-type findings flow back as new or revised cards, not as archive blockers.
- Stage-exit policy absent → legacy trigger-word mode propagation + proxy off (behavior identical to pre-policy versions). With `proxy`: checkpoints per the card's charter — absent-mode intake Q&A, approval event, record-step report check, conflict re-adjudication; every proxy decision is ledger-marked `proxy-made` and human-overturnable at acceptance.
- Factual Decisions-I-made entries are verified at the consumption-entry check (symbol-exists / branch-contains / merge-base); falsified entries park the card at the gate.
