# Design

## Context

Part R already has fail → block, post-fail → full depth, and wording that mentions “re-enter from Part A”, but the OpenSpec scenario and host contract still unlock on **fixed**, so agents skip a clean re-review. This change is a two-way-door skill/spec edit (easy to revert via git); no runtime services.

## Goals / Non-Goals

**Goals:**
- Part D only after Part R pass on the current tip, explicit Part R skip 留痕, or round-cap human outcome.
- Hard loop: fail → fix tip → re-run `pr-code-review`; max **3** rounds per merge attempt; then pause.
- Thin sync of `pr-code-review` host contract + checklist/evals.

**Non-Goals:**
- Forcing full A→B→C on every fix (optional re-entry from A remains for archive/rebase cases).
- New extracted skill or changing dual-axis ≥80 thresholds.
- Changing `pr-review-gate` preference semantics (`never` / ask-skip still bypass the loop).

## Decisions

1. **Loop ownership = Part R** — orchestration stays in `merge-discipline`; `pr-code-review` only reports fail and must not imply “fixed ⇒ merge”.
2. **Round counting** — each `pr-code-review` invocation in the merge attempt = 1 round (includes the initial review). Cap = 3. After round 3 still fails: pause with continue (one more round, then pause again if fail) / accept residual blocking with 留痕 / abort.
3. **Accept residual 留痕** — same family as explicit Part R skip (must record time, decision-maker, PR id, and that residual ≥80 Critical/Important were accepted); distinct template wording allowed.
4. **Fail matrix rewrite** — replace ambiguous “Fix …, re-enter from Part A, or skip” with: block Part D; fix tip then **mandatory** re-review; or explicit skip/accept 留痕; full A re-entry only when archive/rebase/tip association requires it (existing Part A/B rules).
5. **Iron rule 9** — at implement time grep `until fixed` / Fail matrix citations across openspec + skills; sync descriptive hits.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Agents still treat “fixed” as enough | Spec scenario “Fixes alone do not unlock Part D” + Fail matrix + eval case |
| Infinite “continue” after cap | Each continue = one review; fail → pause again (no silent multi-round) |
| Extra review cost | Cap 3; light/full unchanged except post-fail → full |
| Hosts duplicate loop prose | Keep one-line A→D pointers only |

## Stage 4 review (auto, round 1)

**Reversibility:** two-way door → standard depth.

### Standards axis
- Effectiveness: covers root cause (missing until-clean gate). Pass.
- Side-effects: longer merges when fixes churn — mitigated by cap + skip. Pass.
- Feasibility: edit SKILL/reference/evals/specs only. Pass.
- Cognitive fit / cost: low. Pass.
- code-design-review: markdown skill contract; no layer-boundary cross. Pass.

### Spec axis
- Matches proposal (loop + 3-round + thin pr-code-review). Pass.
- Delta scenarios cover fix-alone, skip, cap, depth. Pass.

### Extra (OpenSpec compliance)
- Why / delta / design / tasks coverage: design records decisions; tasks next. Pass.

**Overall: Pass** — no blocking issues. Proceed to Stage 5.
