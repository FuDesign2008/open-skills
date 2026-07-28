# Tasks: extract-analysis-core

## 1. Create analysis-core skill

- [x] 1.1 Run `/skill-creator` for `analysis-core`: capture intent from design.md + archived analysis-report §3.1 (methodology only; `{next-stage}` placeholder; `user-invocable: false`; Chinese triggers in description)
- [x] 1.2 Draft `skills/analysis-core/SKILL.md` from solve/opsx-solve canonical blocks (temp-change gate, instrumentation-debug delegation, analysis step skeleton, debug-verify loop); English body; no workflow orchestration
- [x] 1.3 Declare frontmatter `dependencies` for hard-loaded debug skills; implement missing-dep abort (no silent degrade)
- [x] 1.4 Add lean evals (trigger / happy-path analysis load / missing-dep abort); iterate until acceptable
- [x] 1.5 Regenerate `docs/generated/skills-index.md` (`node scripts/gen-skill-docs.mjs`) and commit skill + index as one logical commit

## 2. Migrate workflows to reference analysis-core

- [x] 2.1 `solve-workflow`: add `analysis-core` to dependencies; replace inline methodology with load/reference; map `{next-stage}` → 阶段 3「探索方案」; verify-stage points at analysis-core debug-verify rules; residual grep; commit
- [x] 2.2 `opsx-solve-workflow`: same as 2.1 with `{next-stage}` → 阶段 3「探索方案」; keep OPSX artifact orchestration in workflow; residual grep; commit
- [x] 2.3 `jira-fix-workflow`: replace thin 打点/闭环 copies with analysis-core reference; map `{next-stage}` → 阶段 4「难度分级 + 模式决策网关」（分析后的下一阶段；方案探索仍在阶段 5）; residual grep; commit
- [x] 2.4 `opsx-jira-fix-workflow`: same pattern; map `{next-stage}` → 阶段 3「创建 OpenSpec Change」; residual grep; commit

## 3. Small fixes (separate commits)

- [x] 3.1 `jira-fix-workflow`: replace inline solution-review four dimensions with explicit skill delegation (follow opsx-jira precedent)
- [x] 3.2 Fold `perf-workflow`「已知性能模式快搜」into `known-issue-research` as a §2 specialized variant; update perf-workflow to reference it
- [x] 3.3 Deduplicate `opsx-solve-workflow`「常见错误」table (drop rows that only restate stage Red Flags; keep non-obvious pitfalls)

## 4. Verification

- [x] 4.1 `openspec validate extract-analysis-core`
- [x] 4.2 Full-repo bilingual residual grep for removed inline headings / duplicated gate phrases (zero unexpected hits in the four workflows)
- [x] 4.3 Confirm stage heading order unchanged in each workflow; `git diff --exit-code` only expected files; skills-index includes `analysis-core`
- [x] 4.4 Spot-check `{next-stage}` maps against design table (号+名 on each reference line)
