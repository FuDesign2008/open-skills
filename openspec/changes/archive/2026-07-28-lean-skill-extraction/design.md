## Context

Prior solve-workflow session selected scheme 3 (Wave 1 thin-ref debt → Wave 2a review orchestration → Wave 2b OpenSpec gates → Wave 2c ensure-tests modes). Review passed with constraints: no micro-skill for verification honesty; unify opsx-solve onto full `solution-review`; defer explore-options / jira-difficulty-path. This change implements that plan under OpenSpec persistence.

## Goals / Non-Goals

**Goals:**
- Lean four PDCA host SKILL.md bodies via shared orchestration skills + thin-ref cleanup
- SSOT for review loop and OpenSpec workspace gates
- Parameterized ensure-tests advisory vs mandatory
- Explicit behavior tighten: opsx-solve always runs full solution-review

**Non-Goals:**
- Extract pdca-explore-options / jira-difficulty-path / batch relation skill
- Merge solution-review with code-design-review or collapse debug family
- Rename Layer A/B letters
- Change merge-discipline Part semantics (only stop host restating them)

## Decisions

1. **Two new skills, not one mega-skill** — Review orchestration and OpenSpec gates have different audiences (4 vs 2 hosts). Splitting matches `analysis-core` / `merge-discipline` pattern.
   - Alternative considered: one `pdca-shared-orchestration` — rejected (low cohesion, larger dependency fan-out for jira-only users).

2. **Verification honesty folds into `pdca-review-orchestration`** — Avoids a ~40-line micro-skill; verification stages one-line pointer.
   - Alternative: standalone skill — rejected (accidental complexity).

3. **Placeholders for divergences** — `{next-stage}`, `{artifact-sink}` / extra dimensions, `{batch-overcap-behavior}`; never hardcode host stage numbers in shared skills.

4. **Wave order in one change, implement Wave 1 first in tasks** — Single OpenSpec change for one PR tip; tasks ordered W1→W2a→W2b→W2c for safer review diffs.

5. **ensure-tests mode in skill contract** — Hosts declare mode; do not flatten advisory and mandatory into one behavior.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Placeholder miss → silent wrong next stage | Thin-ref acceptance checklist + grep for leftover stage numbers in shared skill |
| opsx-solve behavior tighten surprises users | Called out in proposal/design; release notes in PR body |
| Host still restates Parts after Wave 1 | Residual grep in tasks; AGENTS already has thin-ref rule |
| Larger PR | Ordered tasks; reviewer can read wave-by-wave |

## Migration Plan

1. Land skills + host edits on feature branch `feat/lean-skill-extraction`.
2. Regenerate skills-index; `openspec validate lean-skill-extraction`.
3. Archive on same tip before merge (merge-discipline Part A).
4. Global install refresh after release.

Rollback: revert PR; archived specs only apply after archive—keep change active until merge.

## Open Questions

None blocking — deferred extractions tracked as future changes.
