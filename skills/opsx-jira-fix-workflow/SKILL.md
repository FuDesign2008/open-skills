---
name: opsx-jira-fix-workflow
version: "1.0.0"
user-invocable: true
description: 当用户说"opsx-jira-fix"、"OpenSpec Jira 修复"、"规范化修复 Jira"、"opsx修复Jira"、"Jira OpenSpec 修复"、"opsx自动修复Jira"、"用OpenSpec修复Jira"或"opsx-jira-fix-workflow"时触发。适用于从 Jira issue 出发，并需要将根因、行为变更、修复计划、验证和归档沉淀到 OpenSpec artifacts 的端到端 Bug 修复。
---

# OPSX Jira Bug 修复工作流

> Jira 修复的规范化版本：保留 `jira-fix-workflow` 的端到端修复能力，引入 OpenSpec 作为行为事实源，并用 Superpowers 作为可选工程增强。

## 核心定位

本 skill 适用于“值得追溯”的 Jira Bug 修复：不仅要修代码，还要把问题根因、行为变更、设计取舍、任务清单、验证证据和归档结果沉淀下来。

职责分工：

- **Jira**：问题来源、业务上下文、状态流转和修复评论。
- **`.jira-fix/{JIRA-ID}/`**：执行日志、断点恢复、分析报告和 PR/MR 过程记录。
- **`openspec/changes/<change-name>/`**：行为契约、delta specs、设计、任务和最终 archive。
- **Superpowers**：可选增强，用于头脑风暴、计划细化、TDD、系统调试、审查和完成前验证。

不替代普通 `jira-fix-workflow`：

- 只需快速修复且无需长期规范沉淀时，使用 `jira-fix-workflow`。
- 需要行为契约、审计、团队协作、跨模块影响或长期追溯时，使用本 skill。

## 调用约定

- **触发词**：opsx-jira-fix、OpenSpec Jira 修复、规范化修复 Jira、opsx修复Jira、Jira OpenSpec 修复、opsx自动修复Jira、用OpenSpec修复Jira、opsx-jira-fix-workflow
- **自动模式**：触发词含“自动”或 `--auto` 时进入自动模式。
- **强制模式**：触发词含“强制”或 `--force` 时可跳过难度终止，但仍不得跳过验证和归档检查。
- **继续修复**：触发词含“继续修复”“再次修复”或 `--retry` 时，从阶段 2 重新分析，复用已有 Jira 上下文。
- **恢复修复**：触发词含“从上次继续”“恢复”或 `--resume` 时，从 `.jira-fix/{JIRA-ID}/state.json` 恢复。

## 阶段 0：前置检查

任一关键检查失败则暂停，不进入修复：

1. 解析 Jira URL / Jira ID，识别模式（manual / auto / force / retry / resume）。
2. 检查 Jira 数据可读：优先 `jira-read {JIRA-ID} --live` 或 mcp-atlassian；失败则读本地缓存；仍失败则终止。
3. 检查 Git 状态：自动模式可 stash；手动模式提示用户处理。
4. 检查 OpenSpec：确认存在 `openspec/`；不存在时询问是否运行 `openspec init`，不得静默初始化。
5. 检查 OpenSpec 命令：优先使用 `openspec list`、`openspec status`、`openspec validate`；不可用时可直接读写 `openspec/`，但必须说明降级。
6. 扫描 Superpowers 类增强能力；发现则记录，未发现则静默降级。

保存 `.jira-fix/{JIRA-ID}/state.json`：

```json
{
  "jira_id": "YNOTR-12345",
  "mode": "manual",
  "current_phase": 0,
  "change_name": null,
  "branch": null,
  "grade": null,
  "enhanced_capabilities": {}
}
```

## 双状态模型

两个目录必须职责分离：

| 目录 | 作用 | 是否长期事实源 |
|------|------|----------------|
| `.jira-fix/{JIRA-ID}/` | Jira 修复过程、断点恢复、阶段报告、PR/MR 记录 | 否，过程日志 |
| `openspec/changes/<change-name>/` | proposal、delta specs、design、tasks、archive 前变更事实 | 是，归档后进入 `openspec/specs/` |

不得只写 `.jira-fix/` 而不写 OpenSpec artifacts；也不得只写 OpenSpec 而遗漏 Jira 回写和修复报告。

## 阶段 1：读取 Jira

读取最新 Jira 数据，保存到 `.jira-fix/{JIRA-ID}/01-jira-info.md`：

- Jira ID、标题、优先级、状态
- 描述、复现步骤、期望结果、实际结果
- 附件、评论、历史补充信息
- 数据来源（live / cache / user-provided）

工具限制：允许 Jira API / jira-read；禁止 Edit/Write 业务代码；禁止执行会改变实现的 Bash 命令。

完成后自动进入阶段 2。若 Jira 描述信息不足，每次只问 1 个关键问题。

## 阶段 2：分析问题

只读分析，不修改业务代码。

必须执行：

1. **存在性验证**：搜索相关代码，判断 Jira 描述的问题在当前代码库是否仍存在。
2. **现象对齐**：复现条件、期望 vs 实际。
3. **代码定位**：文件路径、关键函数、调用链、状态流。
4. **根因分析**：区分直接原因和根本原因；必要时追问“为什么”至少 3 次。
5. **影响范围**：模块、平台、调用方、兼容性、风险面。
6. **难度分级**：容易 / 中等 / 困难 / 极难。

分级建议：

| 等级 | 触发条件 | 行为 |
|------|----------|------|
| 容易 | ≤3 个文件，根因清晰 | 可走精简路径 |
| 中等 | 4-10 个文件，根因基本清晰 | 走增量路径 |
| 困难 | 风险较高或影响范围较广 | 阶段 5 后暂停审查 |
| 极难 | 根因未知、架构变更、数据迁移、API 协议变更、跨仓库 | 自动模式终止；手动模式二次确认 |

输出保存：

- `.jira-fix/{JIRA-ID}/02-analysis.md`
- `.jira-fix/{JIRA-ID}/02-grade.md`

若问题不存在或 Jira 描述与代码不符，暂停，向 Jira 写评论前需用户确认。

## 阶段 3：创建 OpenSpec Change

将 Jira 问题转为 OpenSpec change。手动模式必须先确认 change 名称；自动模式可生成后继续。

命名建议：

```text
fix-<jira-id-lower>-<short-topic>
```

例如：

```text
fix-ynotr-12167-ai-summary-button
```

推荐创建方式：

```text
/opsx:new <change-name>
```

若当前环境没有 `/opsx:new`，可手动创建：

```text
openspec/changes/<change-name>/
```

必须写入：

```text
openspec/changes/<change-name>/proposal.md
openspec/changes/<change-name>/specs/<capability>/spec.md
openspec/changes/<change-name>/design.md
openspec/changes/<change-name>/tasks.md
```

`proposal.md` 必须包含：

- Why：Jira 问题、用户影响、为什么现在修
- What Changes：行为变化，而不是实现细节
- Capabilities：新增或修改的 capability
- Impact：代码、API、平台、风险

Delta spec 必须使用：

- `## ADDED Requirements`
- `## MODIFIED Requirements`
- `## REMOVED Requirements`
- `## RENAMED Requirements`

每个 requirement 必须包含至少一个 `#### Scenario:`。

## 阶段 4：探索与审查方案

基于阶段 2 根因和阶段 3 artifacts，输出 2-3 个方案：

- 核心思路
- 涉及文件 / 模块
- 对 OpenSpec requirement 的覆盖关系
- 优点、缺点、复杂度、风险
- 推荐方案

手动模式输出方案表后暂停，等待用户选择；自动模式自动选择最优方案。

选定方案后必须审查：

1. **根因覆盖**：是否完整解决 Jira 根因。
2. **Spec 覆盖**：是否覆盖 delta specs 中的 requirements 和 scenarios。
3. **副作用风险**：是否影响其他平台、模块、性能、安全或兼容性。
4. **实现可行性**：涉及文件和依赖是否明确。
5. **Jira 状态边界**：是否只会流转到“已修复”，不越权关闭。

审查不通过时，自动模式最多优化并重审 3 轮；手动模式等待用户决定修改、重选或继续。

输出追加到：

```text
.jira-fix/{JIRA-ID}/03-options.md
openspec/changes/<change-name>/design.md
```

## 阶段 5：制定计划

以 `openspec/changes/<change-name>/tasks.md` 为主任务清单，同时同步一份执行摘要到 `.jira-fix/{JIRA-ID}/04-plan.md`。

任务要求：

- 使用 checkbox：`- [ ] 1.1 ...`
- 每项足够小，可独立验证。
- 覆盖所有 delta spec requirements 和 scenarios。
- 包含必要测试、验证、回滚、Jira 回写和 OpenSpec archive 步骤。
- 禁止 `TBD`、`TODO`、`适当处理`、`类似上面` 这类不可执行描述。

若检测到 `writing-plans`，借鉴其粒度：目标文件、测试命令、预期输出、失败时处理。

手动模式输出计划后暂停；自动模式普通情况自动进入阶段 6。困难或极难继续场景必须暂停确认。

## 阶段 6：执行修复与验证

### 6.1 创建修复分支

分支命名：

```text
fix/jira-fix-<JIRA-ID>
```

多仓库场景需为每个仓库创建对应分支，并记录到 `.jira-fix/{JIRA-ID}/00-branch.md`。

### 6.2 执行任务

按 `tasks.md` 顺序执行：

1. 每次只处理当前任务。
2. 修改业务代码前确认 proposal、specs、design、tasks 已存在。
3. 完成任务后立即将 checkbox 改为 `[x]`。
4. 如发现 spec 或 design 错误，先回写 artifacts，再继续实现。
5. 偏离计划时说明原因；若影响行为契约，回到阶段 3 或 4。

可选追踪注释：

```text
// fix <JIRA-ID>
```

若项目规范不接受修复注释，不强制添加，但必须在执行报告中列出修复点。

### 6.3 Superpowers 增强

检测到对应能力时使用：

- `test-driven-development`：有可测试行为时先写失败测试。
- `systematic-debugging`：测试、构建、类型或行为失败时先定位根因。
- `subagent-driven-development`：独立任务可一任务一上下文执行。
- `requesting-code-review`：高风险任务完成后做代码质量和 spec 合规审查。
- `verification-before-completion`：完成前必须有刚运行过的验证证据。

### 6.4 验证

必须覆盖：

1. OpenSpec 校验：`openspec validate <change-name>` 或 `openspec validate --changes`
2. 工程验证：测试、lint、类型检查、构建
3. 行为对照：逐条核对 delta spec requirements 和 scenarios
4. Jira 对照：复现步骤、期望/实际是否已闭环
5. 副作用检查：相关模块和平台是否受影响

验证失败不得提交 PR。输出保存到：

```text
.jira-fix/{JIRA-ID}/05-execution.md
.jira-fix/{JIRA-ID}/06-verify.md
```

## 阶段 7：提交 PR、Jira 回写、Archive 与收尾

### 7.1 提交与 PR

提交前必须确认：

- 所有相关 `tasks.md` checkbox 已完成。
- OpenSpec artifacts、代码修改和 `.jira-fix/` 报告都在 diff 中。
- 验证通过或明确列出人工验证项。

Commit message：

```text
fix(<scope>): <JIRA-ID> <subject>
```

PR/MR 描述必须包含：

- Jira 链接
- 根因
- 修复方案
- OpenSpec change 路径
- 修改文件清单
- 验证证据
- 风险与回滚

### 7.2 Jira 回写

研发角色只能将 issue 流转到“已修复”。禁止流转到：

- 关闭
- 验证通过
- 已验证

Jira 评论必须包含：

- 修复分支 / PR URL / Commit
- 根因摘要
- 修复方案
- OpenSpec change 路径
- 验证场景
- 风险或待 QA 关注点

### 7.3 OpenSpec Archive

合并或准备合并前，必须确认 archive 策略：

- 若本次 PR 应包含最终 specs 更新：先执行 `openspec archive <change-name>`，检查 diff 后再提交/更新 PR。
- 若团队要求合并后归档：PR 描述必须写明 active change 路径和归档责任人，不得声称 specs 已更新。

默认推荐：验证通过后先 archive，确认 `openspec/specs/` 更新和 `openspec/changes/archive/` 迁移进入 diff，再完成 PR。

### 7.4 分支收尾

若检测到 `finishing-a-development-branch`，在验证、Jira 回写和 archive 检查完成后，再借鉴其流程做：

- 保留分支
- 创建 / 更新 PR
- 合并
- 清理本地和远程分支
- 同步主分支

完成后写入：

```text
.jira-fix/{JIRA-ID}/07-merge.md
```

并更新 `state.json`：

```json
{ "current_phase": "completed" }
```

## 常见错误

| 错误 | 后果 | 修正 |
|------|------|------|
| 只写 `.jira-fix/`，不写 OpenSpec | 修复无法进入长期行为事实源 | 必须创建 `openspec/changes/<change-name>/` |
| 只写 OpenSpec，不回写 Jira | Jira 流程断裂，QA 无法跟进 | 阶段 7 必须写 Jira 评论并流转到“已修复” |
| 未做存在性验证 | 修复不存在或已变化的问题 | 阶段 2 第一项必须验证 |
| `MODIFIED` 只写片段 | archive 时丢失 requirement 细节 | 复制完整 requirement block 再修改 |
| 先 PR/合并再 archive | specs 或 archive 目录可能不在最终 diff | 默认先 archive 并检查 diff，再完成 PR |
| Jira 状态越权 | 研发误关闭 issue | 只允许流转到“已修复” |
| Superpowers 缺失就中断 | 降低跨平台可用性 | Superpowers 只做渐进增强 |
| 验证失败仍提交 PR | 把未闭环修复交给 QA | 阶段 6 未通过不得提交 |

## 最小成功标准

一次完整执行至少产生或更新：

- `.jira-fix/{JIRA-ID}/01-jira-info.md`
- `.jira-fix/{JIRA-ID}/02-analysis.md`
- `.jira-fix/{JIRA-ID}/04-plan.md`
- `.jira-fix/{JIRA-ID}/05-execution.md`
- `.jira-fix/{JIRA-ID}/06-verify.md`
- `openspec/changes/<change-name>/proposal.md`
- `openspec/changes/<change-name>/specs/<capability>/spec.md`
- `openspec/changes/<change-name>/design.md`
- `openspec/changes/<change-name>/tasks.md`

完成后：

- PR/MR 已创建或更新。
- Jira 已评论并流转到“已修复”（如有权限）。
- OpenSpec 已 archive，或 PR 明确说明归档策略和责任人。
- 验证证据已记录。
