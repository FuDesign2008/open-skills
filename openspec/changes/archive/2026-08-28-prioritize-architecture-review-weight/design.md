# Design: prioritize architecture review weight

## Context

User-observed weight failure traced to four verified root causes (RC1 contract-drift clause in opsx-solve-workflow; RC2 depth-downgrade of long-term-cost strategic dimensions; RC3 code-first layer ordering in code-design-review; RC5 judgment-prone code trigger). The repo already elevated architecture weight once (2026-07-28 elevate-architecture-review-weight); this change completes that intent.

## Goals / Non-Goals

**Goals:** architecture-first attention in code-design-review (layer reorder with hard rename); contract compliance for opsx-solve-workflow; sharpened code trigger; depth floor for long-term-cost dimensions; zero dangling "Layer B" references in code-design-review contexts.

**Non-Goals:** moving architecture into solution-review's core four dimensions (framework philosophy preserved); changing any layer's applicability rules (ordering governs presentation/attention only); touching git-worktree-discipline's unrelated Layer A/B/C vocabulary; changing trigger words or routing.

## Decisions

1. **Hard rename over presentation-only reorder** — "Layer B printed before Layer A" is incoherent; the architecture layer becomes Layer A everywhere, with repo-wide hard-cut sync (4 hosts' pointer lines, 2 main specs, reference doc), per the rename discipline (zero dangling references; `git-worktree-discipline`'s own layer vocabulary explicitly exempt).
2. **Ordering = presentation + attention; applicability unchanged** — Layer A (architecture) still scales full/quick by scope; Layer B (code metrics) still runs on every code change; Layer C still conditional. Primacy comes from position, not from making the first layer always-run.
3. **RC1 fix is remediation, not new contract** — workflow-contract-sync already forbids the clause; opsx-solve-workflow's line is replaced with a criteria-ownership pointer (no new spec delta needed for opsx-solve-workflow).
4. **Depth floor lives in staged-review-flow** — it is orchestration-level (how deep solution-review runs for code solutions), not a solution-review framework change; encoded as a MODIFIED requirement.
5. **Renumbering is safe** — hosts reference the dependency-direction dimension by name, never number (verified: no numeric dimension references in active files).

## Risks / Trade-offs

- [Dangling Layer B references after rename] → closing grep: `grep -rn "Layer B"` scoped to code-design-review contexts must return only renamed-correct usages (git-worktree-discipline exempt)
- [Item renumbering breaks external numeric references] → verified none in active surfaces; archive exempt
- [Depth floor raises review token cost on everyday code fixes] → accepted; that cost IS the requested higher weight

## Migration Plan

Single branch `refactor/code-design-review-layer-reorder`; artifacts → edits → verification → archive+sync → PR. Rollback: git revert.

## Open Questions

None.
