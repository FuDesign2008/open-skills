# Design: goal-driven granularity alignment

## Context

The goal-driven series prices questions as cost (unattended-first design): `intake-interview-discipline` §B's self-answer ladder lets any decision collapse to "conservative default", the goal-driven-batch card is an answer list approved in one bundled event, and neither host distinguishes a present human from an absent one. Meanwhile engine/batch verification is status reporting, and there is no traceability path. The analysis doc (`docs/goal-driven-intake-depth-analysis.md`) root-causes the intake side with a first-hand rework case; the solve-workflow stage-7 checklist is the granularity benchmark for the verification side.

## Goals / Non-Goals

**Goals:**

- Match solve-workflow's checking granularity across all touchpoints: intake (present), mid-run (self-check cadence), completion (itemized checklists), acceptance (queue-level checks).
- Add optional OpenSpec sedimentation, user-selected at intake, with graceful no-op outside opt-in.
- Keep every absent-mode contract byte-identical.

**Non-Goals:**

- Literal transplantation of solve-workflow's stage-7 items (engine compares against the frozen approach, not a "stage-5 plan").
- Re-prioritization of queued cards; preemption; scheduler changes.
- Making OpenSpec a strong dependency of either host (it is an optional, detected enhancement).
- Changing frontmatter descriptions/triggers (routing is unaffected by in-flow depth and options).

## Decisions

1. **Presence tiers live in `intake-interview-discipline` §A** (single source), hosts thin-reference. Alternative rejected: per-host inline definitions (duplicated rules, and batch child runs inherit via the discipline anyway). Detection semantics: **default present**; absence = explicit declaration (「无人值守」「自动跑」/ "I'm leaving") or structural absence (batch child runs, scheduled pulls, card-inherited intake). Declared-away keeps today's once-confirm + full-ledger behavior verbatim.
2. **Impact gate at the self-answer ladder, not a question quota.** The doc's diagnosis is incentive structure, so the fix re-prices: rung 3 requires impact-if-wrong explicitly low; high-impact items either escalate at the next human touchpoint (batch discovery boundary, present intake) or clean-stop with options. A question floor (fixed N) was rejected — it contradicts fog-bounded depth (iron rule 1) and the discipline's own Forbidden list.
3. **Decisions-I-made section on the contract artifact** (task card / run contract), displayed at the approval event — the minimal correction to answer-list compression; the ledger (§C) keeps its acceptance role, this only front-loads visibility of what was self-decided.
4. **Approval ≠ run-start** as two events even when consecutive; approval shows the Decisions-I-made list. This unbundles the approve-and-run惯性 without forbidding back-to-back confirmation.
5. **Itemized checklists are domain-adapted additions**: engine Template 5 gains 5 numbered checks (goal achievement / frozen-approach comparison / evidence honesty / side effects split / logic review); batch Stage 3 gains queue-level checks. Both stay *additive* — existing report sections are not restructured.
6. **OpenSpec sedimentation is opt-in with detection**: offered only when `openspec/` exists and a usable CLI (or equivalent) is present; default off; project policy (AGENTS.md/CLAUDE.md) may mandate on; explicit user choice wins. Archive timing is gated on machine-verifiable evidence completion (output-type), aligned with merge-discipline Part A's archive-before-merge semantics — human outcome judgment does not block archiving behavior contracts. Opt-out guarantees byte-identical behavior.
7. **Skill-creator editing discipline** applied to all three skill edits: imperative voice, explain-the-why over MUST-stacking, progressive disclosure (templates stay in reference.md), eval prompts added where infra exists (goal-driven-batch).

## Risks / Trade-offs

- [Present-mode intake drags long] → Depth stays fog-bounded; escalation applies only to high-impact self-answers; clear tasks still graduate fast.
- [Presence misjudged] → Default present errs toward more checking; structural absence is mechanical (child runs/scheduled), not judgment-based.
- [OpenSpec offered where unusable] → Dual detection gate (dir + CLI); option simply not offered otherwise.
- [Archive before outcome judgment] → Specs are behavior contracts (output-type); outcome findings route back as new/revised changes — same loop as this repo's own practice.
- [Large diff regression] → Absent-mode contracts frozen verbatim; checklists additive; delta specs copy full MODIFIED blocks; verification chain reused from the prior change (gen-skill-docs diff, lint, validate, contract greps).

## Migration Plan

Markdown + git; skills reinstall via `npx skills update` / install script on release. Existing cards lack the Decisions-I-made section — treated as empty (no migration needed; section is generated at next enqueue). Rollback = revert the commit.

## Open Questions

None.
