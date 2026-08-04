## Context

`write-workflow` exists (PR #262 branch) as a thin three-step host. Users confirmed 方案 3′: eight-stage writing-oriented PDCA skeleton, mode lifecycle aligned with solve, writing-source analysis **without** `analysis-core`, Path/QR/reference.md, and §1 hard gate preserved under auto mode.

## Goals / Non-Goals

**Goals:**

- Eight host stages with Quick Reference, Path Selection, `reference.md`
- Strong dependency on `workflow-mode-lifecycle`; Chinese/English auto triggers
- Stage 2 = writing source analysis only
- `tech-review-doc` documents auto-host contract; §1 gate unchanged

**Non-Goals:**

- Depending on `analysis-core` or debug skills
- Wiring into `solve-workflow`
- Delivery/closeout/learn-and-improve as strong deps (stage 8 stays lightweight prose)
- Skipping §1 in auto mode

## Decisions

1. **Eight named stages** (clarify → analyze sources → explore approach → review approach → outline → execute writer → verify → retrospect) — skeleton like solve; bodies stay thin and mostly point at writer / reference.
2. **Stage 6 delegates entirely to `tech-review-doc`** — do not copy Steps 0–5 into the host.
3. **Stage 4 is a host checklist**, not full `solution-review` — avoids pulling review frameworks into a writing host.
4. **Path maps to writing depth** (diagrams / §4 detail / optional sections), not code change size.
5. **Auto differences block**: pause only at writer §1 (and missing inputs); after approval, run through verify; retrospect brief; revert to manual per lifecycle.
6. **Stack on write-workflow branch** until #262 merges.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Host becomes as long as solve | Keep stages thin; move templates to reference.md |
| Agents skip §1 in auto | HARD-GATE in tech-review-doc + host differences + spec scenarios |
| Confusion with analysis-core | Explicit “MUST NOT depend” in SKILL and spec |
| Dual open PRs / branch stack | Base branch documents dependency on #262 |

## Migration Plan

- Additive edits to existing skills; bump `write-workflow` version to 1.1.0, `tech-review-doc` to 1.0.1 (patch for contract note).
- Rollback: revert commit / close PR.

## Open Questions

- None blocking.
