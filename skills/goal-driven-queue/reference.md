# Goal-Driven Batch — Templates & Defaults

Support file for SKILL.md. All templates are starting shapes; keep field names stable because the progress document and the acceptance package both reference them.

## Task Card

File name: `.goal-driven/queues/<queue-id>/<slug>.md` (slug = kebab-case goal summary; date prefix optional for ordering). Legacy cards may still sit at `.goal-driven/<slug>.md` as queue-id `default`.

```markdown
# Goal: <one-line measurable goal>

- Status: pending
- Priority: P1
- Engine: goal-driven-workflow | solve-workflow | opsx-solve-workflow | jira-fix-workflow | opsx-jira-fix-workflow (set by the engine ticket and fixed at freeze; no default **unless** every certainty signal is `factual` and verified and the derived band is high-certainty/low-cost, in which case the assessment's recommendation is pre-filled and the human or proxy confirms or overrides; jira-fix children terminate at PR-open, opsx-jira children at archive+PR-open — merge + writeback stay human; a card with neither a chosen nor a defaultable engine parks awaiting engine decision)
- Certainty/Difficulty: high-certainty/low-cost | uncertain | high-cost (derived from four signals — `reversibility`, `evidence`, `blast_radius`, `dependency_shape` — each marked `factual` or `preference`; the most conservative band wins on conflict; no numeric score)
- Waits-on: none | <card-slug> (machine-readable dependency edge; edges must stay acyclic)
- Reusable: no | yes (default `no`; `yes` yields an `approaches/<signature>.md` record)
- Traceability: none | openspec/<change-name> (only when the user opted into OpenSpec sedimentation at enqueue)
- Stage-exit policy: manual | ai-proxy | auto (set by the interaction-budget first ticket; pre-filled from the assessment recommendation only under the same all-factual high-certainty gate as `Engine`; legacy `Counterpart: on` / `counterpart` values read as `ai-proxy`; legacy `manual-pause` / `auto-escape` read as `manual` / `auto`)
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

Priority uses a three-level vocabulary: `P0` (urgent — consumed first), `P1` (normal — the default when unstated), `P2` (background — consumed last). Within a level the order is: **information leverage** descending (the card whose resolution retires the most other pending cards first), then the certainty/difficulty band (high-certainty/low-cost first), and FIFO by `Created` timestamp as the final tie-break. Leverage is recomputed at every completion boundary; a recomputation that moves the queue head is recorded as a `reordering` note. A card added while a run is in progress is discovered at the next post-completion re-scan and admitted by these same rules (Stage 2 step 7 in SKILL.md).

## Progress Document

Path: `.goal-driven/queues/<queue-id>/runs/<batch-id>/progress.md` (`batch-id` = run start timestamp `YYYYMMDD-HHMM`). Create at batch start; update on every status change. Legacy runs may still sit at `.goal-driven/runs/` when the bound id is `default`.

| Field | Meaning |
|-------|---------|
| Task | card slug |
| Mode | auto / default (as propagated to the child) |
| Estimate | coarse planned duration from the card |
| Status | pending / in progress / done / failed / skipped (covered) / waiting dependency / conflict pending confirmation |
| Result summary | one line: what happened, or why parked/failed |
| Branch | task branch tip |
| Report | path to the engine completion report |
| Notes | relationships (covered-by / waits-on), blockers, human asks, and a `reordering` note whenever a leverage recomputation moves the queue head |

Written into the bound queue directory as `triage-<timestamp>.md`: the **triage record** — the batch's merges, root-cause clusters, suggested kills and parked items, each with its basis (which card covers which, which member cards a cluster folded, what evidence produced a mechanical verdict, and which decisions the proxy made). A pre-run enqueue has no batch directory yet, so the record lives here rather than in `runs/<batch-id>/`. It rides the acceptance package, presented by path, and is the audit trail for "why did my card disappear".

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

## Approach Record (written only when `Reusable: yes`)

Path: `.goal-driven/queues/<queue-id>/approaches/<signature>.md` — queue-local and git-trackable. The queue never writes a shared carrier itself; promotion is `learn-and-improve`'s carrier decision tree, recommend-only and requiring an explicit user request.

```markdown
# Approach: <signature>

- Signature: <symptom class — not the one-off goal text>
- Approach: <one line: the frozen approach that worked>
- Verified by: <what proved it — check/test/report path>
- Falsified directions: <direction — why it failed; one per line; empty when none>

## Seeded Cards
- <card slug> — <YYYY-MM-DD>
```

A record seeds a new card's intake only when its `factual` entries still verify against the current code world; a record that fails verification is not used as a seed, and the card falls back to a full deep intake. The seeded card names the record in its frozen-decisions block. Recording falsified directions follows `evolution-review`'s record-the-failed-recipe vocabulary: the point is that the same dead end is not re-entered by a later card.

## Defaults

- Queue caps when the trigger states none: stop after **3 tasks** or **2 hours**, whichever comes first. State the resolved cap in the first progress-doc entry so the stopping rule is auditable.
- Gitignore hint when cards may contain private info: suggest `.goal-driven/` in the user project's `.gitignore` — queue content belongs to the local project owner.
- Mid-run discovery: a re-scanned card in the **bound** queue directory missing its approval record stays `pending` with the progress note `awaiting approval (added mid-run)`; malformed cards likewise stay `pending` without stalling the loop; sibling queues are not admitted; discovery events land in the progress document's Notes.
- Presence tiers: intake depth follows `intake-interview-discipline` §A — present (default) per-decision questioning with the three-part base; declared/structural absence keeps the once-confirm mode unchanged.
- OpenSpec archive timing (when `Traceability` is set): archive that task's change after its machine-verifiable evidence is complete; outcome-type findings flow back as new or revised cards, not as archive blockers.
- Stage-exit policy absent → legacy trigger-word mode propagation + proxy off (behavior identical to pre-policy versions). With `proxy`: checkpoints per the card's charter — absent-mode intake Q&A, the batch triage / batch approval event, approval event, record-step report check, conflict re-adjudication; every proxy decision is ledger-marked `proxy-made` and human-overturnable at acceptance. One reservation applies at the triage checkpoint: a value-judgment kill is outcome acceptance and stays human-only, so the proxy tickets and parks it instead of confirming.
- Jira list-enqueue shortcut: one interaction-budget ticket and one approval event for the whole parsed list; Engine frozen by `jira-fix-queue` / `opsx-jira-fix-queue` (or an already-frozen Engine on a Jira-ID list); never start consumption from the shortcut. Relationship type **derived** is recorded in progress Notes; opsx-jira children persist those notes as `## Related Issues` in each change's `design.md`. Duplicate/equivalent → skip; same root cause does **not** share a branch or OpenSpec change.
- Factual Decisions-I-made entries are verified at the consumption-entry check (symbol-exists / branch-contains / merge-base); falsified entries park the card at the gate.
- Triage defaults: only mechanical outcomes apply automatically — an exact problem-signature plus target-path match, or a `done` card's report already covering this outcome — and each is archived reversibly with `superseded-by` recorded. Every value judgment, including "not worth doing", stays in its current status until a human acts. Under declared absence or `ai-proxy` only the mechanical outcomes apply; the triage record carries the rest.
- Certainty band defaults: derived from the four signals per the change's design (most conservative band wins on conflict). A band derived from any `preference` signal is not treated as verified, and the routing defaults on `Engine` and `Stage-exit policy` unlock only when every signal is `factual` and verified.
- Reuse defaults: `Reusable` is `no`; a record seeds an intake only while its `factual` entries verify; promotion into a shared carrier (`AGENTS.md`, rules, project-local skill) follows `learn-and-improve`'s carrier decision tree — recommend-only, never written by the queue.
- `Waits-on` defaults: an unresolved target holds the card in `waiting dependency`; a cycle, or a target ending in any terminal state other than `done`, parks the affected cards as `conflict pending confirmation` without blocking other cards.
