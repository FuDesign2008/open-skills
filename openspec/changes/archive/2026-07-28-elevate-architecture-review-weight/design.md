## Context

AI-assisted coding lowers implementation cost; review skills still treat "superior architecture but near-term OK" as non-blocking. Scheme 1: tighten gates in `code-design-review` and `solution-review`, thin-sync four workflows; backlog fitness functions / new architecture skill.

## Goals / Non-Goals

**Goals**
- Weight long-term architecture/maintainability higher in both review skills
- Default Layer B for non-trivial code changes
- Workflows defer blocking rules to those skills (no stale near-term deferral)

**Non-Goals**
- Architecture fitness functions in CI
- New standalone `architecture-review` skill
- Changing analysis-core / merge-discipline / ensure-tests

## Decisions

1. Keep pass/fail binary; change **what counts as blocking**, not introduce weighted scores.
2. Replace blanket "elegant but maintainable → non-blocking" with: structural/architectural gaps that are feasible now are blocking unless Prudent-Deliberate debt is explicitly accepted.
3. Layer B default-on except documented quick-path (isolated, no new boundaries / dependency direction).
4. `solution-review` cost-vs-value: cheap build ≠ pass if long-term change amplification is clearly worse.
5. Workflows: thin pointer + remove conflicting non-blocking bullets only where they restate the old deferral.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| More review loops / false blocks | Require "clearly superior + feasible in scope + material long-term benefit"; allow explicit debt acceptance |
| Dual lists in SKILL vs reference.md drift | Update both in same tasks |
| Workflows still duplicate criteria | Prefer "defer to skill" over copying new bullets |

## Migration Plan

Single PR on `feat/elevate-architecture-review-weight`; archive change on same tip before merge (merge-discipline Part A).

## Open Questions

None.

## Verification Notes

- Skills markdown repo: coverage gate skip留痕 if merge analyzer fails.
