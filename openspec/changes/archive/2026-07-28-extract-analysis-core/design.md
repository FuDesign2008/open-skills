## Context

Four PDCA workflows duplicate analysis-stage methodology. An archived assess change already added `workflow-contract-sync` Requirement「分析阶段核心方法论内容 SHALL 单源承载」(pending until `analysis-core` lands). Coverage-gate copies were later absorbed by `merge-discipline` (out of scope here). Authoritative near-verbatim blocks live in `solve-workflow` / `opsx-solve-workflow` analysis stages; jira / opsx-jira carry thinner instrumentation + debug-verify variants.

Constraints: AGENTS.md 铁律 3–6 (English skill body + Chinese triggers; skill-creator for new skill; opsx artifacts; platform-agnostic intent); shared-skill placeholder pattern already proven by `known-issue-research`; no silent dependency degrade.

## Goals / Non-Goals

**Goals:**
- Ship `analysis-core` as the single methodology source for temp-change gate, instrumentation-debug delegation, analysis step skeleton, debug-verify loop
- Migrate four workflows to reference + `{next-stage}` maps; declare strong deps
- Activate the existing workflow-contract-sync Requirement (drop pending-migration wording)
- Land three small fixes as separate commits (jira `solution-review` delegate; perf quick-search → `known-issue-research`; opsx-solve 常见错误 dedupe)

**Non-Goals:**
- Re-home coverage gate to `test-coverage-analyzer` (owned by `merge-discipline`)
- Merge intentional divergences (形似神异 list)
- Unify stage numbering across workflows
- Fix `upstream-dependency-debug` undeclared deps (separate change)
- Fix `merge-discipline` `--sha` vs `gh --match-head-commit` docs (separate)

## Decisions

1. **Canonical source text = solve/opsx-solve analysis blocks (prefer opsx-solve where they drift slightly toward shared wording; resolve conflicts toward the stricter gate).**  
   - Alternative: invent new prose → rejected (behavior drift risk).  
   - jira thin variants become references to the shared skill, not a second dialect.

2. **Placeholder `{next-stage}` only for the exit-gate “enter next stage” target; step numbers for known-issue-research keep existing `{root-cause step}` etc. maps at each workflow’s reference line.**  
   - Alternative: hardcode stage titles inside `analysis-core` → rejected (breaks jira’s different numbering).

3. **`analysis-core` is `user-invocable: false`, English body, Chinese triggers in description for completeness if ever surfaced; strong-deps on the three debug skills it delegates to (and any other hard loads).**  
   - Alternative: user-invocable standalone “分析问题” skill → rejected (orchestration stays in workflows).

4. **Creation path: `/skill-creator` draft + evals (intent from this design + archived analysis-report §3.1), then workflow edits.**  
   - Alternative: hand-write SKILL.md only → rejected (铁律 4).

5. **Commit sequence: (1) add `analysis-core` (2–5) one workflow per commit (6–8) three small fixes.** Enables bisect and review.  
   - Alternative: one giant commit → rejected.

6. **Debug-verify loop lives in `analysis-core` but is invoked from each workflow’s verify stage via the same load/reference** (wording: “apply analysis-core debug-verify rules”). Avoids copying the loop into two stage sections per workflow.

### `{next-stage}` map (authoritative for tasks)

| Workflow | `{next-stage}` |
|----------|----------------|
| solve-workflow | 阶段 3「探索方案」 |
| opsx-solve-workflow | 阶段 3「探索方案」 |
| jira-fix-workflow | 阶段 4「难度分级 + 模式决策网关」（分析结束后的下一阶段；方案探索在阶段 5） |
| opsx-jira-fix-workflow | 阶段 3「创建 OpenSpec Change」（analysis is stage 2; next orchestration stage after analysis） |

## Risks / Trade-offs

- **[Missed inline copy]** → Mitigation: bilingual residual grep after each workflow commit; stage-7 full-repo sweep.  
- **[Wrong `{next-stage}` map]** → Mitigation: table above + “号+名” on reference line; eval prompts assert map.  
- **[jira behavior drift when expanding thin section to shared skill]** → Mitigation: shared skill is the intended stricter gate; call out in PR; smoke via skill-creator evals comparing before/after instructions.  
- **[skill-creator eval cost / time]** → Trade-off: accept; can use lean eval set (trigger + one happy-path analysis + one missing-dep abort).  
- **[Token size of workflows drop but agent must load extra skill]** → Acceptable; same pattern as other shared skills.

## Migration Plan

1. Create `analysis-core` via skill-creator (draft from solve/opsx blocks + this Decisions section).  
2. Wire four workflows (reference + deps + delete copies), one commit each.  
3. Three small-fix commits.  
4. Regenerate skills-index; `openspec validate`; residual grep; archive sync on merge.  
5. **Rollback:** revert commits in reverse order; main spec Requirement can remain (pending wording only if skill removed — prefer keep skill and revert workflow wires only).

## Open Questions

- None blocking. jira stage-5 exact title string to be confirmed at edit time against current `SKILL.md` headings (map row above is intent-level).
