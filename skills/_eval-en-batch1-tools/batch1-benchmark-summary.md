# Eval EN workflow skills batch1 — iteration-1 summary

Baseline: Chinese snapshot @ `1f7c837`. Grading: **keyword heuristic** (noisy across CN/EN).

| Skill | with_skill mean | old_skill mean | Δ |
|-------|----------------:|---------------:|--:|
| solve-workflow | 100% | 72% | +28% |
| opsx-solve-workflow | 56% | 44% | +11% |
| jira-fix-workflow | 100% | 100% | +0% |
| opsx-jira-fix-workflow | 78% | 78% | +0% |
| jira-fix-batch | 67% | 56% | +11% |
| opsx-jira-fix-batch | 89% | 33% | +56% |

## Per-eval deltas (with − old)

### solve-workflow
- `clarify-trigger-manual`: with 100% / old 50% (Δ +50%) ✅
- `auto-mode-revert`: with 100% / old 67% (Δ +33%) ✅
- `analysis-core-thin-ref`: with 100% / old 100% (Δ +0%)

### opsx-solve-workflow
- `opsx-trigger-and-change-gate`: with 67% / old 67% (Δ +0%)
- `clarify-first`: with 33% / old 33% (Δ +0%)
- `proposal-after-solution`: with 67% / old 33% (Δ +33%) ✅

### jira-fix-workflow
- `trigger-with-url`: with 100% / old 100% (Δ +0%)
- `auto-flag`: with 100% / old 100% (Δ +0%)
- `merge-then-writeback`: with 100% / old 100% (Δ +0%)

### opsx-jira-fix-workflow
- `opsx-jira-trigger-gates`: with 100% / old 100% (Δ +0%)
- `clarify-pointer`: with 33% / old 33% (Δ +0%)
- `archive-before-merge`: with 100% / old 100% (Δ +0%)

### jira-fix-batch
- `batch-trigger-orchestration`: with 67% / old 100% (Δ -33%) ⚠️
- `batch-auto-propagation`: with 33% / old 33% (Δ +0%)
- `relationship-skip-duplicate`: with 100% / old 33% (Δ +67%) ✅

### opsx-jira-fix-batch
- `opsx-batch-vs-plain`: with 100% / old 100% (Δ +0%)
- `cross-project-changes`: with 100% / old 0% (Δ +100%) ✅
- `conflict-pause`: with 67% / old 0% (Δ +67%) ✅

## Qualitative notes (from run agents)

- `opsx-solve-workflow` v1.10→1.11: Chinese→English only; Stage 0–3 gate behavior equivalent ([Eval opsx-solve-workflow](6aa8bf0f-b8da-4edf-8e64-69dba24f646c)).
- `jira-fix-batch` EN removes hardcoded platform loop commands (`ulw-loop`/`ralph`) — intentional platform-agnostic improvement; heuristic may score old higher on orchestration wording.
- Shared low scores on clarify evals (33% both sides) are mostly assertion-keyword misses vs prose answers that correctly cite `clarifying-question-discipline`.

## Recommendation

- **No skill body fixes** for clear EN regressions vs Chinese intent.
- Human review via static viewers under `skills/_eval-en-batch1-tools/viewers/`.
- Ready to archive/PR after user confirmation.
