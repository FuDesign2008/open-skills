# Solve Workflow — Output Format Reference

This file holds the per-stage output-format templates for the `solve-workflow` skill, for the AI to follow when formatting output.

---

## Stage 1 — Clarify the Problem

```
【问题复述】我理解您的问题是：...
(describe only the user's intent and symptoms — no root-cause judgment or fix suggestion; technical conclusions belong to stage 2)
【关键要素】目标：... / 约束：... / 背景：... / 期望结果：...
【Scope 拆解】(if applicable) modules, dependencies, order, first sub-problem: ...
【需要确认的点】(if any, one question at a time)
[question] A [...] B [...]
请确认我的理解是否正确。
```

---

## Stage 2 — Research Output Template

Analysis methodology lives in `analysis-core` (temporary-change gate / analysis steps / instrumentation debug). The "industry-wide issue evaluation report" and "upstream dependency fix evaluation" templates are in `known-issue-research/reference.md` — not duplicated here.

---

## Prerequisite Skill Check — Missing Notice

When a skill declared in frontmatter `dependencies` is missing, print the following and abort immediately:

```
⚠️ solve-workflow is missing a strong dependency and cannot run in full

【Missing skill(s)】
- [skill-name]: [what it is for]

【Why it's needed】
solve-workflow strongly depends on the following skills via frontmatter dependencies (missing = abort):
- `pdca-review-orchestration`: stage 4 review orchestration (full `solution-review` + conditional `code-design-review`)
- `solution-review` / `code-design-review`: review frameworks invoked by the orchestration skill
- `analysis-core`: single source of truth for stage 2's methodology (temporary-change gate / instrumentation debug / analysis step skeleton / debug-verify loop)
- `hybrid-debug` / `runtime-evidence-debug` / `browser-debug-toolkit`: debug skills delegated to via `analysis-core` (stage 2 + stage 7)
- `learn-and-improve`: stage 8 retrospective and knowledge sediment
- `workflow-mode-lifecycle`: core manual/auto mode lifecycle rules
- `clarifying-question-discipline`: hard clarifying-question discipline and investigation-first principle
- `known-issue-research`: stage 2 research routing / known-issue quick search / industry-wide evaluation
- `ensure-tests`: stage 6 test completion (`mode=advisory`)
- `node-version-discipline`: Node-version alignment before running tests in stage 7

Without them, stage 4 cannot run a deep review, stage 2 cannot load its analysis core and external research, stage 6 cannot complete test coverage, stage 7's test results are untrustworthy, and mode/questioning discipline loses its single source of truth — running anyway would produce unreviewed solutions with unclear root causes, defeating the point of a PDCA workflow.

【Install】
- Universal install (recommended, installs every skill):
  npx skills add FuDesign2008/open-skills -g --skill '*' --yes
- Full-capability install (Hooks/Commands/platform integration):
  see docs/INSTALL.md

Re-trigger this workflow after installing.
```

---

## Stage 4 — Review Report

The review report body and pass/fail verdict follow the strong dependency `pdca-review-orchestration` (full `solution-review` / conditional `code-design-review`, binary verdict, auto-mode ≤3 rounds, design summary). This file no longer maintains a "five-dimension / four-dimension" scoring table.

**[🤖 Auto]** Each round must include: review round (N of max 3), the structured conclusion from `solution-review` (and `code-design-review` for code-affecting solutions), issue list, ✅/❌. On fail, output the optimization notes and re-review.

**[👤 Manual]** After the shared review report, append this workflow's shell (pause for the user's verdict):

```
请确认审查结论：
- 说「通过」「确认」「OK」→ 进入阶段5
- 说「修改方案」「完善方案」「优化方案」→ 按指导优化后重新审查
- 说「重选方案」→ 回到阶段3
```

---

## Stage 5 — Make a Plan

```
【目标方案回顾】采用方案X：...
【文件修改清单】
1. 文件：xxx/yyy/zzz.js，位置：function abc()，改动：...
2. 文件：xxx/yyy/aaa.js，位置：class DEF.methodXYZ()，改动：...
【修改顺序】1. xxx/yyy/zzz.js（依赖项）→ 2. xxx/yyy/aaa.js（调用方）
【预期影响】范围：... / 风险点：...
```

---

## Stage 7 — Verification Results

```
【检查结果】
- 阶段 1 明确问题的期望结果达成情况：...
- 与阶段 5 计划对比：已做到 ... / 未做到 ...，原因 ...
- 验证要点/测试结论：...（若已执行测试，附上结果；若未执行，附上需人工测试的提醒）
- 副作用验证：改动是否在其他模块引入了新问题（功能副作用），是否带来性能/安全/可维护性等预期外影响（非功能副作用）
- 逻辑与整体流程审查：...
```

---

## Stage 8 — Improvement Suggestions

```
【改进建议】
- 可固化做法：...
- 不建议固化的内容：...
- 推荐沉淀载体：AGENTS.md / CLAUDE.md / .cursor/rules/ / 项目内 skill / 总结文档 / 暂不沉淀，理由：...
- 建议：进入下一轮 / 收尾。若收尾，遗留与后续改进：...
- 是否需要用户确认写入：需要 / 不需要；若需要，等待用户明确要求后再进入「制定计划 → 执行计划」
- [模式状态] 自动模式已完成本轮，已恢复为手动模式。如需下一轮继续自动，请显式说「自动 xxx」。
```

---

## Stage 8 — Pre-Merge Coverage Reminder (Non-Gating)

> ⚠️ solve-workflow **never performs any git merge operation** (all 8 stages are analysis/review/execution/verification/retrospective — there is no merge step). This reminder is **advisory, not a mandatory gate** — it does not run a script, does not block the flow, and is not a capability-discovery table entry.

**Trigger conditions** (all must hold):
1. Environment discovery finds the `test-coverage-analyzer` skill available
2. Stage 6's executed change touches code (not purely config/style/docs)

**Behavior**: append one non-blocking reminder line to the improvement suggestions:

```
💡 如本变更将通过 MR/PR 合并，建议合并前运行 test-coverage-analyzer
   （带 --base <目标分支>，避免源分支已推送导致默认检测误判为 0 变更）。
   本提示为建议性，solve-workflow 不执行合并，门控由实际执行合并的工作流
   （如 jira-fix-workflow / opsx-* 系列）在合并步骤前强制执行。
```

**Does not trigger when**:
- `test-coverage-analyzer` is not found → skip silently, no reminder
- The change is purely config/style/docs → no reminder
- The user has already stated they won't go through an MR/PR → no reminder

> **Boundary with mandatory gates**: solve-workflow only suggests "run this before merging" — it never runs the script or judges pass/fail. The mandatory gate (script run + decision matrix + audit trail) belongs to skills that own a merge step, executed right before their merge step.
