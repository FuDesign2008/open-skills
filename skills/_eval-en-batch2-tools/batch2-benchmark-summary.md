# Eval EN skills batch2 — iteration-1 summary

Baseline: Chinese snapshots taken at migration start. Grading: keyword heuristic (noisy across CN/EN).

| Skill | with_skill mean | old_skill mean | Δ |
|-------|----------------:|---------------:|--:|
| perf-workflow | 100% | 33% | +67% |
| frontend-perf | 83% | 83% | +0% |
| git-conflict-resolve | 100% | 56% | +44% |
| git-release-start | 100% | 83% | +17% |
| merge-discipline | 100% | 100% | +0% |

## Per-eval deltas

### perf-workflow
- `trigger-perf-analysis`: with 100% / old 33% (Δ +67%) ✅
- `stage-order-gate`: with 100% / old 0% (Δ +100%) ✅
- `clarify-discipline`: with 100% / old 67% (Δ +33%) ✅

### frontend-perf
- `trigger-frontend-perf`: with 100% / old 100% (Δ +0%)
- `metric-or-checklist`: with 67% / old 67% (Δ +0%)

### git-conflict-resolve
- `trigger-conflict`: with 100% / old 67% (Δ +33%) ✅
- `confidence-gate`: with 100% / old 33% (Δ +67%) ✅
- `build-artifact-shortcircuit`: with 100% / old 67% (Δ +33%) ✅

### git-release-start
- `trigger-release-branch`: with 100% / old 100% (Δ +0%)
- `multi-repo-sync`: with 100% / old 67% (Δ +33%) ✅

### merge-discipline
- `part-a-archive-gate`: with 100% / old 100% (Δ +0%)
- `tip-pin`: with 100% / old 100% (Δ +0%)

## Qualitative

- Agents report EN/CN semantic equivalence for P0 skills; remaining CJK is triggers/slogans/audit templates.
- No skill-body fixes applied for heuristic with-below-old cases (CN answers vs EN assertion keywords).

## Recommendation

- Ready for CJK scan + openspec validate, then **user confirm archive/PR**.
