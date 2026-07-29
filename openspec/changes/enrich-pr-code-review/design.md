## Context

PR #256 already ships `pr-code-review` v1.0 as a Claude `/code-review` port and wires it into `merge-discipline` Part R. This change enriches that skill with mattpocock dual-axis reporting and Superpowers plan/severity calibration, and updates Part R pass semantics — still on the same branch/PR.

## Goals / Non-Goals

**Goals:**

- Dual-axis Standards∥Spec reports (no cross-axis merge-rank).
- Pin fixed-point / PR base; resolve Spec sources with explicit skip.
- Keep eligibility, multi-perspective scan, ≥80 confidence, permalink comments.
- Critical/Important/Minor + plan alignment; strengths before issues.
- Thin reception pointer only (not Part R hard gate).
- Part R blocks on either axis with ≥80 Critical/Important.
- Smell baseline in `reference.md`, subordinate to repo docs.

**Non-Goals:**

- Rename to `code-review`; force receiving flow before merge; host-specific model tiers.

## Decisions

1. **Single skill enrichment** (not split reception skill) — matches user solution 1.
2. **Smell list lives in reference.md** — keep SKILL.md under progressive-disclosure budget.
3. **Severity maps into confidence** — Critical/Important typically ≥75–100 band; Minor often filters out below 80 unless guidance-hard.
4. **merge-discipline**: thin Part R wording update + sync main OpenSpec `merge-discipline` / new `pr-code-review` on archive.
5. **Ship on #256** — one PR tip for port + enrich.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Longer reviews / more tokens | Cap axis reports; reference for smells |
| Spec source hunting stalls merge | Ordered lookup + explicit skip |
| Dual-axis blocks “green CI” merges | Intentional; explicit skip 留痕 |

## Migration Plan

1. Implement skill + Part R text on `feat/merge-discipline-pr-code-review`.
2. Sync/update OpenSpec main specs on archive.
3. Push to #256; merge via merge-discipline (Part R will exercise the new skill).

## Open Questions

None blocking.
