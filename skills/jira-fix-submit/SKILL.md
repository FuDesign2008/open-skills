---
name: jira-fix-submit
version: "1.0.0"
user-invocable: false
description: 由 jira-fix-workflow 阶段7和阶段8调用。执行代码提交、PR/MR 创建、Jira 状态回写（含 jira_add_comment 陷阱规避）与合并清理。禁止独立调用。
---

# Jira 提交与合并（阶段7～8）

> 本 skill 由 `jira-fix-workflow` 在**阶段7和阶段8**调用，请勿独立使用。

---

## 阶段7：提交 PR/MR

**🔌 增强能力集成**：
- 若发现「✅ 完成验证」类能力（如 `verification-before-completion`、OMC `verifier`），在提交前执行独立验证（运行测试、确认修复、检查回归），**有证据再提交**
- 若发现「📋 代码审查」类能力（如 `requesting-code-review`、OMC `code-reviewer`），提交后自动发起代码审查

### [🤖 自动模式] 自动提交

1. 收集提交信息（Jira ID、根因、修复方案、修改文件、报告路径）
2. 调用 `git-commit` SKILL（execute=true，自动模式）：自动 add / commit / push
3. **创建 PR/MR**：push 成功后，根据 `git remote -v` 判断平台（URL 含 `github.com` → `gh pr create`；含 `gitlab` → `glab mr create`），标题格式与 commit message 保持一致；描述必须包含根因、修复方案、修改文件清单、验证场景（功能/边界/回归各 ≥2）、Jira 链接
4. **Jira 状态自动回写**：先调用 `jira_get_transitions` + `jira_transition_issue` 流转到「已修复」，再**独立调用** `jira_add_comment(issue_key=..., body=...)` 写修复评论。⚠️ **禁止通过 `jira_transition_issue` 的 `comment` 参数传评论**（该参数不可靠，评论可能被静默丢弃）；**禁止流转到"关闭"或"验证通过"**（QA 操作）；无匹配时跳过记警告

**修复评论字段**：修复分支、Commit、根因、修复方案、修改文件、分析报告路径、验证场景（功能/边界/回归各 ≥2）。

### [👤 手动模式] 确认后提交

收集提交信息，展示 commit 计划（分支、commit message、修改文件、验证场景各 ≥2 条）和 Jira 回写内容，等用户确认后，AI 执行：
1. add / commit / push + 创建 PR/MR
2. `jira_get_transitions` + `jira_transition_issue` 流转到「已修复」
3. **独立调用** `jira_add_comment(issue_key=..., body=...)` 写修复评论（⚠️ `body` 是评论内容的正确参数名）

修复评论字段同自动模式。

> ⛔ **[手动模式 — 阶段7 出口]** 展示提交计划和验证场景后**立即停止**，附：
> 「⏸️ 提交计划已就绪。确认后 AI 将执行 push + 创建 PR/MR + Jira 状态回写。回复「确认」继续，或告知需要修改。」
> 🤖 **[自动模式]** 无需确认，自动执行 push + 创建 PR/MR + Jira 状态回写。

### Commit Message 格式

```
<type>(<scope>): <Jira-ID> <subject>
```

示例：`fix(ai-summary): YNOTR-12167 修复分享链接中AI摘要按钮显示问题`

**Type**：fix、feat、refactor、perf、style、docs、test　**Scope 示例**：ai-summary、share、auth、api、ui、core

### 完成输出字段

修复分支、Commit Hash、推送状态、**PR/MR URL**、Jira 回写状态、分析报告路径；多项目时用表格。**错误处理**：回写失败不阻断流程，仅输出警告并记录到报告。

保存到 `.jira-fix/{JIRA-ID}/07-report.md`

---

## 阶段8：Review 与合并

> PR/MR 已在阶段7创建，等待 CI + Code Review，完成合并、分支清理与主分支同步

**🔌 增强能力集成**：若发现「📋 代码审查」类能力（如 `requesting-code-review`、OMC `code-reviewer`），可辅助推进正式 Code Review 流程。

### [🤖 自动模式] 自动合并

1. 等待 CI 检查通过
2. CI 通过后执行合并：**GitHub** `gh pr merge --merge`；**GitLab** `glab mr merge`（参数与团队策略一致）
3. 删除远程修复分支：`git push origin --delete fix/jira-fix-[JIRA-ID]`
4. 切换并同步默认分支：`git checkout main && git pull origin main`（`main` 换成本仓库默认分支名）
5. 删除本地修复分支：`git branch -d fix/jira-fix-[JIRA-ID]`

### [👤 手动模式] 确认后合并

1. 展示 PR/MR URL（来自阶段7 `07-report.md`）和描述摘要，**立即停止，等用户完成 Code Review 并确认合并**
2. 用户确认（说「合并」「merge」「OK」等）后，AI 依次执行：合并 → 删除远程分支 → 切换并同步默认分支 → 删除本地分支

> ⛔ **[手动模式 — 阶段8 出口]** 展示 PR/MR URL 后**立即停止**，附：
> 「⏸️ PR/MR 已在阶段7创建，请完成 Code Review。是否合并并清理分支？回复「确认」继续。」
> 🤖 **[自动模式]** CI 通过后自动合并，执行分支清理与主分支同步，无需用户干预。

### 完成输出字段

合并状态、分支清理状态（本地/远程）、主分支同步状态（PR/MR URL 已在阶段7 `07-report.md` 中记录）。

保存到 `.jira-fix/{JIRA-ID}/08-merge.md`，同时更新 state.json `current_phase: "completed"`。

---

## Red Flags — 禁止行为

- **[👤 手动]** 未等用户确认直接执行 git push
- Jira 回写时通过 `jira_transition_issue` 的 `comment` 参数传评论（必须独立调用 `jira_add_comment`）
- Jira 回写失败后未输出警告，静默跳过
- Commit message 遗漏 Jira ID
- 多项目场景只提交了部分项目
- PR/MR 创建失败后未输出警告直接进入阶段8
- **[👤 手动]** 未等用户确认合并直接执行 `gh pr merge`、`glab mr merge` 等平台合并命令
- CI 未通过时强制合并
- 合并后未清理本地和远程修复分支
- 合并后未同步主分支
