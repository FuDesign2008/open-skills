# Design: integrate effective-web-research into problem-solving workflows

> Spec for wiring the `effective-web-research` skill into the 5 problem-solving workflow skills, so that when those workflows hit a web-research moment, they route to `effective-web-research` (if available) instead of doing an undisciplined WebSearch.

## Context

`effective-web-research` (PR #190) encodes web-research discipline (Step 0 internal/external triage + 4 maxims + strict 7-dim mode). The problem-solving workflows already do WebSearch at specific analysis points but without that discipline. This integration routes those moments to the new skill.

## Constraint (AGENTS.md 铁律 4)

Every skill must remain independently installable. Cross-skill references must be **informational** ("if X is available, use it"), not directive. The pointers degrade gracefully: if `effective-web-research` is not installed, the workflow runs its original WebSearch flow unchanged.

## Approach (chosen: hybrid)

- **Inline 🔌 pointer** at every WebSearch moment in all 5 skills (the actual routing trigger at point of need)
- **Capability-table row** added to the 3 skills that have an `环境能力探索` mechanism (declares the capability at workflow start)

### Standard inline pointer text

> 🔌 若 `effective-web-research` skill 可用，本步骤的 WebSearch 应用其调研纪律——先 Step 0 分流（确认是外部问题、非内部代码可解），再按 4 口诀执行（官方优先 / 查时效 / 非平凡双源印证 / 避内容农场）；用户要严格调研时转其严格模式出报告。skill 不可用时按原 WebSearch 流程执行。

### Capability-table row (3 skills)

| 🌐 Web 调研 | research, web, look up, investigate, web-research | 阶段1.2（步骤 2.5/3.5/5.5） | 外部 web 调研纪律：Step 0 分流 + 4 口诀 + 严格模式 |

## Insertion map

| Skill | 🔌 inline points | Capability row | Has 环境能力探索 |
|-------|-----------------|----------------|-----------------|
| solve-workflow | 步骤 2.5 / 3.5 / 5.5 (3 points) | yes | yes |
| opsx-solve-workflow | 步骤 2.5 / 3.5 / 5.5 (3 points) | yes | yes |
| jira-fix-workflow | 已知快搜 / 行业通病 / 5.5 (3 points) | yes | yes |
| perf-workflow | 已知案例搜索 (1 point) | no | no |
| opsx-jira-fix-workflow | 打点逃生 WebSearch (1 point) | no | minimal |

Total: 11 inline pointers + 3 capability rows = 14 small edits across 5 files.

## Non-goals

- Hard dependency on `effective-web-research` (forbidden by 铁律 4)
- Modifying the workflows' stage structure or gating
- Integrating into non-problem-solving skills (article-writer etc.)

## Verification

- `node scripts/gen-skill-docs.mjs` stays stable (frontmatter untouched)
- grep confirms each 🔌 pointer + capability row in place
- Optional: subagent test that solve-workflow routes an external-research question to effective-web-research
