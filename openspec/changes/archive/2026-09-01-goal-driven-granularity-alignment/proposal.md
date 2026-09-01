# Proposal: goal-driven granularity alignment

## Why

A same-day, same-project head-to-head session (documented in `docs/goal-driven-intake-depth-analysis.md`) showed the goal-driven series checks far less with the human than solve-workflow: 2 confirmation events vs 6, with 4–6 decisions self-answered and frozen per card. The cost was real — one unfrozen assumption ("MR !3 is trustworthy and will land") forced a full rework round that a single intake question would have prevented. Two structural lines fall short: **intake depth** (self-answer incentives without impact tiering; a single "once-confirm" channel regardless of human presence; answer-list cards with no surfaced question list) and **verification granularity** (engine/batch verify by status reporting, not itemized checklists — no side-effect splits, no goal-vs-expected comparison). A third capability is missing entirely: optional OpenSpec sedimentation for traceability.

## What Changes

- **Presence-tier intake** (authoritative home: `intake-interview-discipline` §A): human present (default) → per-decision questioning until fog graduates, per solve-workflow-grade interaction; declared-away or structurally absent (batch child runs, scheduled pulls) → current once-confirm + full-ledger mode, preserved verbatim. The unattended value proposition is untouched — tiers only add depth when the human is there.
- **Impact-tiered self-answer gate** (§B): rung 3 conservative-default is restricted to explicitly low-impact choices; a high-impact-if-wrong decision skips to clean stop + ticket with options (or escalates at the next human touchpoint), never a silent default.
- **Decisions-I-made-for-you surfacing**: the freeze step reviews every self-answered item's impact tier; task cards / run contracts carry a "Decisions I made for you" section (with impact tiers) that approval events MUST display — moving ledger review from acceptance-time to approval-time.
- **Approval/run-start split** (batch Stage 1): card approval and run-start are two separate confirmation events; approval must show the Decisions-I-made list; run starts only on an explicit run instruction, even when consecutive.
- **Three-part base output** (batch Stage 1): intake emits the solve-workflow stage-1 shape (restatement / key elements / open questions) before freezing into the card — the card becomes the product of that display, not its replacement.
- **Itemized completion verification** (engine Stage 5 / Template 5): numbered checklist — goal-vs-restatement achievement, frozen-approach comparison + deviations, tests & evidence (Executed/Pending), side effects (functional + non-functional), logic end-to-end review.
- **Mid-run self-check cadence** (engine Stage 4): at budget milestones, re-check evaluator reason, remaining budget, and anomalies.
- **Queue-level acceptance checklist** (batch Stage 3): caps accounting, progress-doc completeness, discovery-log completeness, leftover pending inventory, per-task report-checklist status, archive status.
- **Optional OpenSpec sedimentation** (both hosts): an opt-in intake decision (`traceability: openspec | none`, default off; project policy may mandate; offered only when the target project has `openspec/` + a usable CLI). When on: stage artifacts map to an openspec change (proposal = frozen approach + why, design = acceptance + division, tasks = checklist); validate + archive (gated on machine-verifiable evidence) rides the completion report / acceptance package. When off or unavailable: behavior identical to today.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `intake-deep-interview`: 深谈入库访谈 gains presence-tier semantics + freeze-time impact review; 运行期自答优先级 gains the high-impact gate before the conservative-default rung.
- `goal-run`: 完成报告与人工验收 gains the itemized verification checklist; ADDED requirements for mid-run self-check cadence and optional OpenSpec sedimentation.
- `goal-queue`: 入库即预审批 gains presence tiers, approval/run-start split, and three-part base; 持久 backlog 载体 card gains the Decisions-I-made section and optional traceability field; ADDED requirement for the queue-level acceptance checklist and optional OpenSpec sedimentation.

## Impact

- `skills/intake-interview-discipline/` (0.1.0 → 0.2.0): §A presence precondition + freeze-time impact review; §B rung-3 restriction; reference templates (impact column, Decisions-I-made section).
- `skills/goal-driven-workflow/` (0.3.0 → 0.4.0): Stage 1 presence pointer + traceability decision; Stage 2/3 opt-in artifact mapping; Stage 4 self-check cadence + change path; Template 5 checklist + validate/archive step.
- `skills/goal-driven-batch/` (0.4.0 → 0.5.0): Stage 1 three-part base + approval/run split + traceability field; Stage 2 per-task checklist status + opt-in validate; Stage 3 queue-level checklist + archive status; Task Card template + evals additions.
- `docs/goal-driven-intake-depth-analysis.md` committed (evidence) + `docs/README.md` index row.
- No runtime code; engine/goal-condition semantics, intake discipline composition boundaries, and unattended-mode contracts unchanged.
