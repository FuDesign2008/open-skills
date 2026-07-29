## Context

Wave 3 of Superpowers∪Matt strengthening: S2 design approval hard gate, S4 feature-branch closeout menu, M6 invocation layering (AGENTS-only). Builds on merge-discipline and PDCA stage write forbids without duplicating them.

## Goals / Non-Goals

**Goals:**
- `design-approval-gate` with named escapes (auto / Jira auto-force / lean hotfix) + 留痕
- `feature-branch-closeout` menu SSOT; merge delegates to `merge-discipline`
- AGENTS M6 table for user-invocable layering
- Thin host refs on four PDCA workflows

**Non-Goals:**
- Wayfinder (M5), worktrees-as-primary (S5), SessionStart bootstrap
- Folding closeout into merge-discipline
- Forcing human approval in auto without escape

## Decisions

1. Two new skills + AGENTS-only M6 (no third skill).
2. Names: `design-approval-gate`, `feature-branch-closeout`.
3. S2 hangs at pre-impl / post-review exit; hosts one-line pointer before stage 6.
4. S4 hangs at post-archive / post-verify closeout; opsx already has prose → replace with load skill; solve/jira get thin pointer where closeout exists.
5. merge-discipline: ADDED composition requirement only; bump patch.
6. Auto mode: this change proceeds under named auto escape for its own implementation (skill markdown = behavior contract, not app production code — still follow test-first N/A for markdown).

### Stage 4 review — Pass (auto mode; solution 1)

## Risks / Trade-offs

- [Auto vs HARD-GATE] → Named escapes + 留痕
- [Closeout duplicates merge] → Menu only; Parts A–D stay in merge-discipline
- [Host miss] → tasks checklist

## Migration Plan

Implement → lint → validate → verify → user archive/PR.

## Open Questions

None blocking.
