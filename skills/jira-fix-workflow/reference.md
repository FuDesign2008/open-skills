# Jira Fix Workflow — Output Format Reference

Per-stage output-format examples for the `jira-fix-workflow` skill, for the AI to follow when formatting output.

Stage 3 analysis methodology lives in `analysis-core`; the industry-wide-issue evaluation template is below under "Industry-Wide Issue Evaluation Report".

---

## Mode Differences Quick Reference

| Stage | 🤖 Auto | 👤 Manual |
|------|--------|--------|
| 0 Prerequisite check | P0 interception; dirty workspace→stash | Dirty workspace→prompt to handle |
| 2 Understanding alignment | Skip→3 | Restate, then wait for confirmation→3 |
| 4 Grading | 🔴 Extremely hard→terminate | 🔴 Extremely hard→A/B |
| 5 Solution review | Loop review ≤3 rounds; pause at cap | Pick solution→review→user verdict |
| 6 Plan | Normal auto-confirm; pause if hard/high-risk | Wait for confirmation |
| 7 Execute | Auto-creates branch; pause for review if hard | Single-repo creates directly; multi-repo confirms first |
| 8 Verify | Auto-rolls back ≤2 times, then pauses | Wait for confirmation, then→9 |
| 9 Submit | Auto push + PR/MR | Present the plan, execute once confirmed |
| 10 Merge | ⛔ Merge requires confirmation (same as manual) | Merge requires confirmation |
| Interruption recovery | Continue directly from checkpoint | Ask whether to resume |

---

## State Directory and state.json

Directory layout (`.jira-fix/{JIRA-ID}/`):

```
state.json           ← progress (mode, review_round, review_status)
00-branch.md         ← stage 7 pre-step (fix-branch creation)
01-jira-info.md      ← stage 1
02-alignment.md      ← stage 2 (manual mode)
02-analysis.md       ← stage 3
04-grade.md          ← stage 4
03-options.md        ← stage 5 (solutions + review record)
04-plan.md           ← stage 6
05-execution.md      ← stage 7
06-verification.md   ← stage 8
07-report.md         ← stage 9
08-merge.md          ← stage 10
```

`state.json` example:

```json
{
  "jira_id": "YNOTR-12345",
  "jira_url": "https://your-jira.example.com/browse/YNOTR-12345",
  "mode": "manual",
  "current_phase": 3,
  "completed_phases": [0, 1],
  "branch": "fix/jira-fix-YNOTR-12345",
  "grade": null,
  "selected_option": null,
  "review_round": 0,
  "review_status": null,
  "started_at": "ISO_TIMESTAMP",
  "last_updated": "ISO_TIMESTAMP"
}
```

- `review_round`: 0-3; `review_status`: null | in_progress | passed | failed_max_rounds

## Commit Message Format

```
<type>(<scope>): <Jira-ID> <subject>
```

Example: `fix(ai-summary): YNOTR-12167 修复分享链接中AI摘要按钮显示问题`

Type: fix, feat, refactor, perf, style, docs, test. Scope examples: ai-summary, share, auth, api, ui, core.

## Stage Exit Scripts

Stop points are in the SKILL.md "Quick Reference". When a fixed closing line is needed, use the wording below:

- **Stage 2 (manual)**: 请确认理解是否准确，或补充 Jira 描述中遗漏的信息。
- **Stage 6 (manual)**: ⏸️ 阶段6（制定计划）完成。是否进入**阶段7：执行计划**？回复「确认」继续，或说明需要调整。
- **Stage 7 branch (manual, single-repo)**: ✅ 修复分支已创建：`fix/jira-fix-[JIRA-ID]`，开始执行代码修改。
- **Stage 7 branch (manual, multi-repo)**: ⏸️ 多工程分支已创建，即将开始代码修改，回复「确认」继续。
- **Stage 7 (manual)**: ⏸️ 阶段7（执行计划）完成，请审查代码。是否进入**阶段8：检查验证**？回复「确认」继续，或告知需要调整。
- **Stage 9 (manual)**: ⏸️ 提交计划已就绪。确认后 AI 将执行 push + 创建 PR/MR。回复「确认」继续，或告知需要修改。
- **Stage 10 (auto/manual)**: ⏸️ PR/MR 已在阶段9创建，请完成 Code Review。确认合并后回复「确认」，AI 将执行合并并清理分支。
- **Stage 4 extremely-hard, choosing B (manual)**: ⚠️ 已知晓高风险，进入**阶段5：探索与审查方案**，回复「确认」继续，或回复「A」终止。

## Stage 7 Branch-Creation Details

- **Naming**: `fix/jira-fix-[JIRA-ID]` (e.g. `fix/jira-fix-YNOTR-12167`)
- **[🤖]**: match each repo's `.git` root against stage 6's file list → batch `git checkout -b …`; abort on failure
- **[👤 single-repo]**: create directly, append the "Stage 7 branch (manual, single-repo)" script
- **[👤 multi-repo]**: present repo/base-branch/branch-name, create once confirmed, append "Stage 7 branch (manual, multi-repo)"
- Write `00-branch.md`, update `state.json` `branch`; output template below under "Stage 7: Git Branch Created"

---

## Stage 0: Prerequisite Check Complete

```
## 阶段0完成：前置检查通过

**Jira ID**: YNOTR-12167
**Issue 标题**: [标题]（已确认存在）
**优先级**: P1
**执行模式**: 🤖 自动 / 👤 手动
**mcp-atlassian**: ✅ 已连接
**Git 仓库**: ✅

---
进入阶段1：读取 Jira 信息
```

---

## Stage 1: Read Jira Info

```
## 阶段1完成：Jira信息已读取

**Jira ID**: YNOTR-12167
**标题**: [标题]
**优先级**: P1
**状态**: 待处理
**数据来源**: API 最新 / 本地缓存

**问题描述**: [描述]
**复现步骤**: 1. ... 2. ...
**期望结果**: [期望]
**实际结果**: [实际]

**评论摘要**: 共 X 条
> 最新评论 - [用户]（[时间]）: [内容摘要]

---
[🤖 自动 / 👤 手动] 进入阶段2：理解对齐
```

---

## Stage 2: Understanding Alignment

```
【问题复述】我理解这个 Bug 是：...（一句话，不含技术判断）
【关键要素】触发条件：... / 期望行为：... / 实际行为：... / 复现环境：...
【歧义与假设】（若有）
[问题] A [...] B [...]
请确认我的理解是否准确，或补充 Jira 描述中遗漏的信息。
```

Save to `.jira-fix/{JIRA-ID}/02-alignment.md`.

---

## Stage 3: Analysis Complete

```
## 阶段3：分析完成

### 0. 存在性验证
**结论**: ✅ 问题存在（在 `path/file.js` 中确认）

### 1. 问题现象
**复现步骤**: 1. ... 2. ...
**期望结果**: [期望]
**实际结果**: [实际]

### 2. 相关代码定位
- `path/file.js:行号` - [说明]

### 3. 根因分析
**直接原因**: [描述]
**根本原因**: [描述]
**调用链**: [流程]

### 3.5 行业通病评估
**结论**: ✅ 非行业通病，属可修复问题

### 4. 影响范围
**受影响模块**: [列表]
**平台**: Web端 / Mobile端
**连带影响**: [列表]

### 5. 难度预判
**预估改动文件数**: X 个
**根因清晰度**: 清晰 / 基本清晰 / 模糊 / 未知

---
进入阶段4：难度分级
```

---

## Stage 4: Difficulty Grading

**[🤖 Auto] Extremely hard → termination report**:
```
## ⚠️ jira-fix 已终止：难度超出自动修复阈值

**Jira ID**: YNOTR-12167
**难度等级**: 🔴 极难
**命中条件**:
  - [x] 根因未知：分析后无法定位具体修改点
  - [ ] 涉及架构变更
  - [ ] 改动范围过大

**已完成工作**:
  - 分支已创建：fix/jira-fix-YNOTR-12167
  - 分析已保存：.jira-fix/YNOTR-12167/02-analysis.md

**建议后续行动**:
  1. 使用手动模式继续：jira-fix [URL] --manual --resume
  2. 跳过分级强制执行：jira-fix [URL] --force（风险自担）
  3. 团队评审后再修复
```

**[👤 Manual] Extremely hard → risk notice + options**:
```
## ⚠️ 高风险提示：当前问题难度评级为「极难」

**命中条件**:
  - [x] [触发条件名称]: [具体说明]

**建议**：

  选项 A — 仅保留分析（推荐）
    保存分析至 .jira-fix/YNOTR-12167/02-analysis.md
    在 Jira 添加评论「AI 分析完成，需人工评估后继续修复」
    结束本次修复，等待人工接手

  选项 B — 继续执行（风险自担）
    阶段6制定计划后，强制要求二次确认才可进入阶段7
    阶段7执行完成后不自动提交，等用户审查代码后手动提交

请回复 A 或 B：
```

**[👤 Manual] Easy/medium → suggest switching to auto**:
```
💡 提示：此问题难度评级为「容易/中等」
预估改动 [X] 个文件，根因明确，风险可控。
可切换自动模式：「修复这个 bug [URL]」（不加手动模式即可）

继续手动流程请直接输入「继续」。
```

---

## Stage 5: Solution Evaluation

**[🤖 Auto]**:
```
## 阶段5：方案已自动选择

| 方案 | 核心思路 | 复杂度 | 风险 | 推荐度 |
|------|---------|--------|------|--------|
| 方案1 | [思路] | 低 | 低 | ⭐⭐⭐⭐⭐ |
| 方案2 | [思路] | 中 | 低 | ⭐⭐⭐ |

**AI 自动选择**：方案1
**选择理由**: 1. ... 2. ...

---
进入方案审查（第 1 轮）
```

**[👤 Manual]**:
```
## 阶段5：评估方案

[方案对比表]
[每个方案详细说明]

### 推荐方案：方案1
理由：...

---
请选择方案编号，进入方案审查
```

---

## Stage 5 Review: Output Template

The review report body and loop rules follow the strong dependency `pdca-review-orchestration` (full `solution-review` / conditional `code-design-review`, binary verdict, auto-mode ≤3 rounds, design summary). This file no longer maintains a full "four-dimension evaluation" example.

Append the review record to `.jira-fix/{JIRA-ID}/03-options.md` (`{artifact-sink}`).

**[🤖 Auto · pass]** Once the shared review concludes ✅, proceed to stage 6: make a plan.

**[🤖 Auto · fail]** Output the optimization notes → re-review; at the 3-round cap:
- **Non-batch**: pause, list a summary with "continue review / reselect solution / manual adjustment" options, wait for the user
- **Batch** (`{batch-overcap-behavior}`):

```
## ⚠️ [{JIRA-ID}] 方案审查超限，已跳过

**难度等级**: … → 标记为「审查未通过（超限）」
**审查轮次**: 3 / 3
**未解决问题**: …
**处理**: 跳过阶段7-9，继续处理下一个 issue
```

**[👤 Manual]** Append after the shared review report:

```
请判定：
- 说「通过」「确认」→ 进入阶段6
- 说「修改方案」「完善方案」「优化方案」→ 按指导优化后重新审查
- 说「重选方案」→ 回到方案选择
```

---

## Stage 7: Git Branch Created (execution pre-step)

**[🤖 Auto] Single project**:
```
## 阶段7前置：Git分支已自动创建

**Jira ID**: YNOTR-12167
**基础分支**: release/8.2.30
**修复分支**: fix/jira-fix-YNOTR-12167
**状态**: 已自动切换到修复分支

---
自动继续执行计划
```

**[🤖 Auto] Multi-project**:
```
## 阶段7前置：Git分支已自动创建（多项目）

| 项目 | 基础分支 | 修复分支 | 状态 |
|------|---------|---------|------|
| backend | release/8.2.30 | fix/jira-fix-YNOTR-12167 | ✅ 已创建 |
| frontend | release/8.2.30 | fix/jira-fix-YNOTR-12167 | ✅ 已创建 |

---
自动继续执行计划
```

**[👤 Manual]**:
```
## 阶段7前置：Git分支已创建

**Jira ID**: YNOTR-12167
**基础分支**: release/8.2.30（来源：main_branch 文件）
**修复分支**: fix/jira-fix-YNOTR-12167

---
开始执行代码修改
```

---

## Stage 9: Submission Complete

**Jira writeback comment template** (stage 10 step 2.3, rendered with `jira-status-writeback`'s field map):
```
**AI 自动修复报告**

- **修复分支**: fix/jira-fix-{JIRA-ID}
- **Commit**: {commit_hash}
- **PR/MR URL**: {pr_mr_url}
- **根因**: {root_cause_summary}
- **修复方案**: {solution_summary}
- **修改文件**: {file_list}
- **分析报告**: reports/{JIRA-ID}-analysis.md

代码已合并到主分支，请进行 QA 验证。
```

Manual mode additionally includes a "验证场景" (verification scenarios) section:
```
### 验证场景

1. [场景名称]
   操作：[具体步骤，1-3步]
   预期：[用户可观察到的结果]
2. ...
```

**Completion output [🤖 Auto]**:
```
## 阶段9完成：代码已自动提交并推送

**修复分支**: fix/jira-fix-[JIRA-ID]
**Commit**: [commit hash]
**推送状态**: ✅ 成功
**PR/MR URL**: [URL]
**分析报告**: reports/[JIRA-ID]-analysis.md
- [模式状态] 自动模式已完成本轮，已恢复为手动模式。阶段 10 合并仍需您确认。
```

**Completion output [🤖 Auto] multi-project**:
```
## 阶段9完成：代码已自动提交并推送（多项目）

| 项目 | Commit | 推送状态 | 改动 |
|------|--------|---------|------|
| backend | a1b2c3d | ✅ 成功 | +45/-12 (3 files) |
| frontend | e4f5g6h | ✅ 成功 | +23/-8 (2 files) |

**分析报告**: reports/[JIRA-ID]-analysis.md
```

---

## Pre-Merge Checklist

See the strong dependency `merge-discipline`'s [reference.md](../merge-discipline/reference.md) § Pre-Merge Checklist (single source, Part A-D — do not duplicate its body here).

---

## Industry-Wide Issue Evaluation Report

> Stage 3 delegates to `known-issue-research` via `analysis-core` for the industry-wide-issue evaluation; output this template when the conclusion is 🚫 "an industry-recognized hard problem, no viable fix". Evaluation methodology lives in `known-issue-research`; jira-fix's specific difference: this evaluation is a **gate** — a no-viable-fix conclusion stops the flow and writes a Jira comment.

```
【行业通病评估】
- 问题本质：...（根因一句话总结）
- 行业现状：...（已知公开记录、主流框架态度、大厂处理方式）
- 调研结论：该问题属于 [平台限制/协议约束/语言特性/标准规范]，业界目前无可行解
- 建议：接受现状 / 评估替代方案（非修复）/ 与产品对齐预期
流程已中断，不进入方案探索阶段。
```

---

## Stage 8: Verification Result

```
【验证结果】
- Jira 复现步骤验证：（逐项 ✅ / ❌）
- 与阶段6计划对比：已完成 … / 未完成 …
- 测试结论：（已运行附结果；无自动化则列手动要点）
- 副作用：Node / Linter / TS / 功能副作用
- 逻辑完整性：…
- 验证结论：✅ 通过 / ❌ 未达标（含返回路径）
```

## Stage 5: Solution Comparison

| 方案 | 描述 | 优点 | 缺点 | 复杂度 | 推荐度 |
|------|------|------|------|--------|--------|
| 方案1 | … | … | … | 低/中/高 | ⭐… |
