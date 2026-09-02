---
name: goal-driven-batch
version: "0.13.1"
user-invocable: true
description: "Queue orchestrator over child engines (goal-driven / solve / opsx-solve / jira-fix / opsx-jira-fix). Triggers when the user says「goal 批量」「跑队列」「任务队列」「无人值守队列」「把需求加入队列」「空闲时段跑任务」/ goal-driven-batch, goal batch, run queue, unattended task queue. Each conversation auto-isolates its backlog under .goal-driven/queues/; intake pre-approval, serial consumption, caps, acceptance. Jira lists enqueue here (also via jira-fix-batch / opsx-jira-fix-batch). Use to enqueue now and run later, or to start/inspect/review this conversation's queue. Do NOT use for a single ad-hoc long run (goal-driven-workflow), a single Jira issue (jira-fix-workflow / opsx-jira-fix-workflow), or setting up cron/schedulers themselves."
dependencies:
  - goal-driven-workflow
  - design-approval-gate
  - intake-interview-discipline
  - ai-proxy-discipline
  - jira-fix-workflow
  - opsx-jira-fix-workflow
---

# Goal-Driven Batch

> This skill owns the **queue lifecycle**: persistent backlog, intake-time approval capture, serial consumption, queue-level caps, progress document, acceptance package.
> Single-run methodology lives in `goal-driven-workflow` (the engine); merge decisions stay human. Loading this skill MUST NOT start consumption by itself — consumption starts only on an explicit queue request or a scheduled pull.

The value proposition is the detach-run-accept cycle: a human drops approved goals into the backlog during spare moments, leaves, and returns later to a packaged result. Every design choice below serves that promise — nothing may stall waiting for an absent human, and nothing may proceed past what the human actually approved.

## Prerequisite Skill Check

Run at startup against frontmatter `dependencies`: scan available skills; abort immediately with install guidance (`npx skills add FuDesign2008/open-skills -g`) if `goal-driven-workflow`, `design-approval-gate`, or `intake-interview-discipline` is missing; abort likewise for `ai-proxy-discipline` when any card records `Stage-exit policy: ai-proxy`, and for `jira-fix-workflow` / `opsx-jira-fix-workflow` when any card names them as `Engine` (missing with no such card is not a failure). No silent downgrade — a missing engine means queued tasks cannot execute correctly; a missing intake discipline means enqueue-time depth collapses to a shallow one-shot confirm; a missing proxy discipline means opted-in cards lose their checkpoint challenge.

## Queue Layout

```
.goal-driven/
├── queues/<queue-id>/
│   ├── <task-card>.md
│   └── runs/<batch-id>/progress.md
└── (legacy) <task-card>.md + runs/    # readable as queue-id `default`
```

Each conversation gets its own backlog automatically. The human never picks a queue name. Isolation is a folder under `.goal-driven/queues/<queue-id>/` (minted id, not a platform session UUID).

### Queue identity

Resolve the bound `queue-id` at every enqueue, Jira list-enqueue shortcut, and consume entry — never by asking the human to choose:

1. This conversation already bound an id → reuse it (same chat continues the same drawer).
2. Else mint `q-YYYYMMDD-HHMMSS` (append `-` plus four hex digits on collision), bind it for this conversation, and use that directory. First enqueue or 「跑队列」 mints; a mere load does not.
3. A scheduled / unattended pull with no conversation bind consumes `default` only (legacy root cards + `.goal-driven/queues/default/` if present). It does not mint and does not drain sibling `q-*` drawers.

**Scope:** card writes, consumption, relationship pass, mid-run re-scan, progress documents, and the acceptance package stay inside this conversation's directory. Sibling queues are invisible to those operations.

**Legacy:** markdown cards directly under `.goal-driven/` (not under `queues/` or `runs/`) plus `.goal-driven/runs/` belong to `default`. Interactive conversations do not auto-bind `default` (that would steal leftover cards). New writes always go to `.goal-driven/queues/<queue-id>/`.

**Resume:** same conversation → same bound id via chat memory and the files in that folder. A **new** conversation mints a fresh queue and does not pick up another conversation's leftover cards. Jira list-enqueue inherits this bind — the shells do not keep a second layout.

Task-card status vocabulary (shared with the progress document):
`pending → in progress → done | failed | skipped (covered) | waiting dependency | conflict pending confirmation`

Card format and all output templates live in [reference.md](reference.md).

## Path Overview

| Stage | Tool permissions | Manual stop | Required output |
|-------|------------------|-------------|-----------------|
| 1 Enqueue & Pre-approve | ✅ Read; Write limited to `.goal-driven/queues/<queue-id>/` cards | ⛔ stop before starting any run | validated task card(s) |
| 2 Run the Queue | ✅ Everything, per child-run contract | auto-advance; stops at caps or empty queue | updated progress doc |
| 3 Acceptance Package | ✅ Bash; Write limited to `.goal-driven/queues/<queue-id>/runs/` | ⛔ stop, hand back to human | package path + summary |

## Stage 1: Enqueue & Pre-approve

This stage exists because both **questions and approval** are cheapest while the human is present. **Load `intake-interview-discipline`** and run its §A here (deep interview with **presence tiers** → approach freeze → pre-launch self-review); the card freezes exactly what will run, which way it will go, and what it may cost. That frozen text is what makes unattended launches safe later, standing in for the launch approval the engine would otherwise demand from a person who is no longer there (`design-approval-gate` named-escape pattern; record the intake confirmation as the 留痕, e.g. in the card's approval line plus the git commit).

### Jira list-enqueue shortcut

When invoked by `jira-fix-batch` or `opsx-jira-fix-batch`, or when the enqueue input is a list of Jira IDs/URLs with Engine already frozen to `jira-fix-workflow` or `opsx-jira-fix-workflow`, use this shortcut instead of one full deep-intake per issue:

1. Parse distinct issue IDs/URLs — **one card per issue**.
2. Ask **one** interaction-budget ticket for the whole list; write the same `Stage-exit policy` on every new card.
3. Skip the mandatory engine ticket — Engine is frozen by the caller; record it on each card.
4. Per card: Goal Condition = that issue's Jira link; Frozen Decisions = run the named engine as `queue-child`, remaining product/tech fog deferred to the child per `Stage-exit policy`; budget clause from the batch ticket or the conservative default in [reference.md](reference.md).
5. Open with a **batch** three-part base (issue table), then **one** approval event covering all new cards. Display Decisions-I-made for the batch. Approval is not run-start — stop here.
6. Do not share one branch or one OpenSpec change across the new cards.

### Default enqueue

1. **Deep intake interview** — per the loaded discipline, run its §A with its presence tiers. **Fixed first ticket — interaction budget** (before scope tickets): one three-way choice for how the child run's stage stop-points are handled — A. full-human (child manual mode, every exit asks) / B. AI-proxy (`Stage-exit policy: ai-proxy`: child auto mode + proxy checkpoints per charter, ledger trail, you review only the final acceptance package) / C. auto (child auto mode, named escapes + self-answer) — and state the layer split in the output: intake tickets freeze task-level WHAT; process-level forks that emerge during analysis belong to the layer this ticket assigns. Then per tier: present (default) → one question per turn until fog graduates, high-impact self-answers escalated to questions, and the intake output opens with the **three-part base** (restatement / key elements / open questions) so the human checks the unfolded understanding before anything is frozen — the card is the product of that display, not its replacement; declared/structural absence → once-confirm + full ledger, unchanged. Steps: (a) destination; (b) open-decision tickets, resolved **one question per turn until fog graduates**; (c) approach comparison — the human picks; (d) freeze into the task card ([reference.md](reference.md) § Task Card). Explicit-skip escapes are the discipline's own (recorded assumptions).
2. Shape the result into a task card ([reference.md](reference.md) § Task Card): measurable goal condition with a mandatory budget clause, frozen-decisions block (incl. the ticket list), the **Decisions-I-made-for-you** section (self-answered decisions + impact tiers; displayed at approval), constraints, the human-chosen priority (vocabulary per [reference.md](reference.md) § Task Card; default `P1` when unstated), status `pending`, plus a coarse duration estimate (advisory; derivation in [reference.md](reference.md)). When the project has an `openspec/` directory and a usable openspec CLI (or equivalent), offer `traceability: openspec | none` as an intake decision — default off; project policy may mandate on; the user's explicit choice wins — and record it as the card's `Traceability` field. Record the interaction-budget ticket's choice as the card's `Stage-exit policy: manual | ai-proxy | auto` field (legacy `Counterpart: on` / `counterpart` values read as `ai-proxy`; legacy `manual-pause` / `auto-escape` read as `manual` / `auto`); `proxy` = `ai-proxy-discipline` occupies the human seat at this card's enumerated checkpoints (absent-mode intake Q&A, approval event, record-step report check, conflict re-adjudication) under its bounded charter. Then the **mandatory engine ticket** (no default — the user must choose): which child executor runs the card, among `goal-driven-workflow | solve-workflow | opsx-solve-workflow | jira-fix-workflow | opsx-jira-fix-workflow` (exact skill names, fixed at freeze as the `Engine` field) — goal-harness loop / stage-gated PDCA (openspec variant needs the openspec environment) / end-to-end Jira fix flow with PR-open terminal / the same with native OpenSpec sedimentation and an archive+PR-open terminal; present fit guidance and a recommended answer, and state that a card without the field parks at dispatch (never silently defaulted).
3. **Approval event, distinct from run-start** — confirm condition + budget with the human **once, now** as one approval event closing the interview ("once" = one approval event, not one question total); the approval MUST display the card's Decisions-I-made-for-you section. With `Stage-exit policy: ai-proxy` and the human absent, the proxy grants the approval as bounded pre-authorization per `ai-proxy-discipline` (Decisions-I-made displayed to it; decision ledger-marked `proxy-made`). Starting a run is a **separate explicit instruction** — even when the two confirmations are consecutive, never bundle approve-and-run into one unreviewed step. Record approval in the card.
4. Suggest committing the card so backlog changes stay reviewable.

Loading without a queue request: if this conversation already bound a queue, give a one-glance overview of **that** queue (pending/in-progress counts, total estimate of remaining pending work, next actionable card) and wait; if not yet bound, say this conversation has no queue until the next enqueue or 「跑队列」 (do not mint, do not list sibling queues as a picker).

## Stage 2: Run the Queue

Triggered by an explicit request («跑队列» variants) or by whatever the platform scheduler pulled in. Resolve the bound `queue-id` first (Queue identity above) — consume only that directory. Before dispatching, resolve queue-level caps from the trigger statement (max tasks and/or overall time; use the conservative default in [reference.md](reference.md) when unstated) — these exist so the worst case is a clean early stop with work left pending, never a runaway night. Then compare the summed card estimates against the resolved time cap and record both in the first progress-doc entry: estimates are advisory and stopping stays cap-driven, but the human should know upfront if the queue will not fit.

**Mode propagation**: a card's `Stage-exit policy`, when present, overrides trigger-word propagation (manual → child manual; proxy → child **ai-proxy** — auto run + every manual stop proxy-occupied per `ai-proxy-discipline`; auto → child auto with named escapes); with no field, the legacy trigger rule applies — a trigger containing 「自动」/"auto" runs children in auto mode, otherwise children keep their default mode. State this explicitly when invoking each child — do not rely on ambient inheritance, and treat each child's completion as final for continuity purposes (their auto-revert rules apply within their own run, not across the queue).

For each pending card in priority order (vocabulary and FIFO tie-break per [reference.md](reference.md) § Task Card), until caps hit or the queue drains:

1. **Consumption-entry check** — re-validate the card: budget clause present, constraints still hold against current repo state (target files/branches still exist, dependencies not yet merged away); an `opsx-solve-workflow` or `opsx-jira-fix-workflow` engine additionally requires the openspec environment (`openspec/` + usable CLI) — a missing environment parks the card as `conflict pending confirmation`, never a silent engine downgrade. Decisions-I-made entries marked `factual` (branch baselines, dependency existence, target paths) are cheaply verified here against the current code world (symbol-exists grep / `git branch --contains` / merge-base topology) — a falsified entry parks the card now instead of surfacing as a mid-run clean stop. A card with no `Engine` field parks here as `conflict pending confirmation` (awaiting engine decision — one added line un-parks it; the queue never silently picks an engine). A changed world invalidates the frozen approval, so park such cards as `conflict pending confirmation` instead of running them (with `Stage-exit policy: ai-proxy`, the proxy may re-adjudicate continue/stop within the original frozen scope per `ai-proxy-discipline`; anything needing a scope change stays with the human).
2. **Relationship pass** (light, across remaining cards **in the bound queue**): duplicate/equivalent of an already-done outcome → mark `skipped (covered)` pointing at the covering report; depends on an earlier task's change → run after it and hand its summary/branch to the child; overlap-conflict → park `conflict pending confirmation`; **derived** (fixing A reveals B as follow-on or deeper root cause) → record in progress Notes and either depend, keep serial, or park for a human split — never merge two in-progress cards onto one branch or one OpenSpec change. Re-check remaining cards after each completion since code state moved. Pass the judgments into each child's card supply (opsx-jira children write them as `## Related Issues` in `design.md`).
3. **Isolate** — put the child run on a dedicated branch (or linked worktree) based off latest main, per `git-worktree-discipline`. One task owns one branch; no task ever carries another's edits.
4. **Delegate** — dispatch by the card's `Engine`. With `Engine: solve-workflow` or `Engine: opsx-solve-workflow`, invoke that skill for this single task instead: the card's problem + frozen-decisions block supplies its stage 1, the card's `Stage-exit policy` rides along and decides its exit behavior (proxy → child **ai-proxy**: auto run with every manual exit proxy-occupied per that skill's unattended-proxy-exits section; manual → manual mode; auto → auto with named escapes); queue contracts (isolation, recording, caps) apply unchanged. An `opsx-jira-fix-workflow` child receives the same supply plus the openspec environment gate, with an **archive + PR-open terminal**: it archives its OpenSpec change (archiving is native to its model and always happens), then stops at PR open — merge + Jira writeback defer to the human. A `jira-fix-workflow` child is invoked with the card's Jira link as the goal, the frozen decisions as its stage 0–1 supply, an explicit `queue-child` context flag, and a **PR-open terminal** — it stops after stage 9 (PR open, record-only closeout); merge + Jira writeback ride the acceptance package as pending human follow-ups, and a 🔴 difficulty-grading termination records as a normal non-blocking failure. For `Engine: goal-driven-workflow` — invoke `goal-driven-workflow` for this single goal, with the card's `Stage-exit policy` propagated the same way (proxy → ai-proxy checkpoints per its own skill; auto → auto mode; manual → manual). The card supplies the inputs for its requirements alignment (stage 1) and acceptance/goal-condition design (stage 2) — the frozen-decisions block answers the child's stage 1 intake, and the child MUST NOT re-pause to re-ask what the card already froze (the consumption-entry check above guards its continued validity). Sub-agent division (stage 3), launch companions, and fallback harness selection remain the engine's own calls. Mid-run decisions follow `intake-interview-discipline` §B: evidence falsifying the frozen approach → clean stop + ticket report, never a silent pivot; one task's stop never cancels the rest. For unattended runs remind once per batch about the engine's unattended-companion setup (convention file, validation hooks, minimal tools).
5. **Record** — on child completion: update the card status + acceptance summary and the progress document immediately (per-status updates make crashes cheap to resume and the morning review honest). Note the child report's **verification-checklist status** in the acceptance summary; with `Stage-exit policy: ai-proxy`, the checklist goes to a fresh-context proxy per `ai-proxy-discipline` (tagged verdicts; failing items bounce or ticket — never a silent `done`); when the card carries `Traceability`, run `openspec validate` for its change at this boundary. Clean-stop tickets and ledger entries ride the child's completion report; reference its path in the card's acceptance summary. A clean stop (falsified frozen approach) parks the card as `conflict pending confirmation` — distinct from the pre-run consumption-entry check. One task failing or capping out MUST NOT block later tasks.
6. **Re-assess the queue budget** spent so far before dispatching the next card.
7. **Re-scan for mid-run additions** — re-scan `.goal-driven/queues/<queue-id>/` (plus legacy root cards when the bound id is `default`) for newly added pending cards: admit a well-formed card carrying a budget clause and an approval record into the priority order for the remainder of the run (never preempting the in-flight child) and count it against the remaining task cap; a malformed card or one without approval stays `pending` with a progress note (`awaiting approval (added mid-run)`). Sibling queues are not admitted. Log each discovery in the progress notes.

When caps hit or the queue empties: stop cleanly — stopping mid-backlog is a feature, leftover cards simply stay `pending`.

## Stage 3: Acceptance Package

Assemble into `.goal-driven/queues/<queue-id>/runs/<batch-id>/`: the progress document, each executed task's engine completion report (its report-template output, referenced by path), and the branch list awaiting review. Before handing back, run the **queue-level verification checklist** — (1) caps accounting: tasks dispatched vs the resolved caps, which cap stopped the run; (2) progress-document completeness: every status change has an entry, discovery notes present for mid-run additions; (3) per-task report-checklist status: each executed task's engine report carries its numbered verification checklist, overall status recorded in the card's acceptance summary; (4) leftover pending inventory: what remains, at which priorities, for the next run; (5) archive status per task when `Traceability` is set. Surface failing items, never drop them. Then hand back:

- Present the summary: per-task result, evidence location, branch tip, and the outcome-type items only a human can judge (the engine separates those; never self-certify them).
- Roll up each task's decision/assumption ledger (`intake-interview-discipline` §C): "Needs your judgment" aggregates outcome-type items plus unresolved tickets, low-confidence assumptions, and high-impact-if-wrong entries; clean-stop tickets each carry their options for a one-glance decision.
- Stop at the branch list. Merge authority is exclusively human — propose an order and highlight conflicts, but do not merge, push to protected branches, or close anything irreversible.
- Route acceptance findings back into new or revised cards so the next run starts better informed.

## Red Flags

- Starting consumption just because the skill was loaded, or letting a child launch re-pause for approval the card already froze (silently re-approving changed conditions is worse than pausing)
- Shallow one-question intake ("confirm once" read as "ask once") that defers direction ambiguity into the unattended run; a child silently re-deciding or re-asking what the card froze
- Interviewing from the pointer line alone — `intake-interview-discipline` never loaded, so depth collapses to its five-word summary
- Reading the queue into memory once and never noticing mid-run that code state shifted under the remaining cards
- Running two children concurrently or letting one failed card cancel the rest
- Treating "budget exhausted" as task success — the report must say which acceptance tiers actually passed
- Running a mid-run discovered card that lacks an approval record, or letting a malformed half-written card stall the loop
- Consuming or re-scanning a sibling queue, asking the human to pick among queues, or writing a project-level current-queue pointer another conversation could overwrite
- Starting consumption from a Jira list-enqueue (or from `jira-fix-batch` / `opsx-jira-fix-batch`) without a separate run instruction
- Sharing one OpenSpec change or one branch across two in-progress Jira cards "because they share a root cause"
