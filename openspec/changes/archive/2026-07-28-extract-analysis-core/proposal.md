## Why

Four PDCA workflows (solve / opsx-solve / jira-fix / opsx-jira-fix) still copy analysis-stage methodology (temp-change gate, instrumentation debug delegation, analysis step skeleton, debug-verify loop). The archived assess change already added the contract that this content SHALL be single-sourced; `analysis-core` has not landed yet, so drift and multi-file sync cost continue. Coverage-gate single-sourcing is out of scope (already owned by `merge-discipline`).

## What Changes

- Create shared skill `analysis-core` (`user-invocable: false`) via `/skill-creator`, carrying analysis-stage methodology only; orchestration (exits, mode, artifact sinks, intentional divergences) stays in each workflow
- Parameterize exit target with `{next-stage}` (same placeholder pattern as `known-issue-research`); each workflow declares its mapping at the reference line
- Replace duplicated blocks in the four workflows with load/reference + mapping; declare `analysis-core` in frontmatter `dependencies` where the workflow hard-loads it
- Apply three small fixes as separate commits: jira-fix explicit `solution-review` delegation; perf-workflow known-perf quick-search folded into `known-issue-research`; opsx-solve「常见错误」table dedupe per AGENTS.md精简原则
- **Non-goals**: coverage-gate re-homing to `test-coverage-analyzer`; merging intentional divergences on the 形似神异 list; stage-number unification across workflows

## Capabilities

### New Capabilities

- `analysis-core`: Shared analysis-stage methodology skill — temp-change permission/rollback gate, instrumentation-debug triggers and debug-skill delegation, analysis step skeleton, debug-verify loop; placeholder `{next-stage}`; workflows integrate by reference

### Modified Capabilities

- `workflow-contract-sync`: Activate the existing「分析阶段核心方法论内容 SHALL 单源承载」Requirement (remove pending-migration wording); require the four workflows to reference `analysis-core` instead of inlining that methodology

## Impact

- New: `skills/analysis-core/SKILL.md` (+ evals as skill-creator produces)
- Modified: `skills/solve-workflow/`, `skills/opsx-solve-workflow/`, `skills/jira-fix-workflow/`, `skills/opsx-jira-fix-workflow/` (and possibly `skills/perf-workflow/`, `skills/known-issue-research/` for the small fixes)
- Specs: new `openspec/specs/analysis-core/` after archive; delta on `workflow-contract-sync`
- Behavior: analysis-stage rules stay equivalent; source of truth moves to one skill — regression risk is missed reference lines or wrong `{next-stage}` maps
- Docs index: `docs/generated/skills-index.md` regenerated on skill add
