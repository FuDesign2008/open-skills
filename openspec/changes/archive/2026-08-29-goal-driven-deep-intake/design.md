# Design — goal-driven-deep-intake

## Context

User need: keep the unattended promise of the goal-driven family (detach-run-accept; nothing stalls mid-run) while reaching solve-workflow-grade question depth. Confirmed direction at clarification: **deep interview moved up front (human present) + runtime self-answer with recorded assumptions (human absent) + ledger review on return**.

## Goals / Non-Goals

**Goals**
- Interactive-grade intake depth for both goal-driven hosts (mechanisms M1–M7 from the gap analysis wired).
- Zero mid-run waiting preserved; zero silent direction changes.
- One source of truth, thin host wiring (repo architecture convention: clarifying-question-discipline / analysis-core / staged-review-flow pattern).

**Non-Goals**
- No changes to `solve-workflow` (one-way fusion).
- No new mid-run human-pause capability for unattended hosts.
- No scheduler, no platform-specific tool hardcoding (铁律 6).
- No fixed question count — depth is fog-bounded, never round-bounded.

## Decisions

1. **New shared discipline skill vs in-body duplication** — chosen: new `intake-interview-discipline` (SoT + thin pointers). Rejected: in-body edit per host (methodology duplicated ×2, drifts); delegating intake to solve-workflow stages 1–4 (host-in-host crop violates its no-downgrade principle, intake becomes heavy); minimal patch (leaves M3/M4 gap = half the requirement).
2. **Composed, not restated** — the new skill composes `clarifying-question-discipline` (asking) + `decision-fog-discipline` (graduation) via its own frontmatter dependencies and thin pointers; it adds only what unattended hosts lack (freeze / self-answer / ledger).
3. **"Confirm once" semantics** (review issue #3) — queue intake keeps a single approval event, but that event closes a fog-bounded interview (many one-per-turn questions as fog demands), not a one-question confirm. Evals aligned.
4. **Falsified approach → clean stop** (review issue #4) — priority-4 branch of §B: safe-point stop, no half-edits, ticket report with options, host status vocabulary; never improvise a new direction. In queues a stop never cancels sibling tasks.
5. **Bounded pre-launch self-review included** (review issue #1) — checklist-level, one fix-and-recheck cycle; a remaining blocking doubt returns to the human while they are still present. This is the M4 (pre-launch review) equivalent at intake depth, not solve-workflow's full stage-4 review — full review stays owned by interactive workflows.
6. **Interview-cost tension** (review issue #2) — depth is fog-bounded with explicit-skip escape (record assumptions, proceed); clear tasks graduate fast, so the detach-run-accept cycle is not slowed by ceremony.
7. **Ledger carrier** — no new mandatory file format: the ledger rides the host's existing artifacts (queue task card acceptance summary / engine completion report); clean-stop tickets ride the child report and are referenced by path.
8. **Attended hosts excluded by design** — hosts that pause at every gate (solve-workflow-style) do not declare this skill; their humans are present. Auto-mode intake with nobody present runs §A in self-answer mode (flag everything as assumptions; the "interview" happens on return via ledger review).

## Risks / Trade-offs

- **+1 dependency edge** on both hosts (abort-on-missing enforced, missing-notice lists updated) — accepted for SoT consistency.
- **Longer enqueue conversations** for foggy tasks — bounded by fog graduation + explicit skip; the alternative (direction ambiguity discovered unattended) costs more.
- **Ledger noise at acceptance** — mitigated by the surfacing rule: only unresolved + low-confidence + high-impact-if-wrong entries demand judgment; the rest are spot-check list.

## Open Questions

(none blocking — review round 1 passed with 4 non-blocking issues, all incorporated above)
