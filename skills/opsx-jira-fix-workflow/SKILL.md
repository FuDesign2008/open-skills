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
- **`openspec/changes/<change-name>/`**：Jira 上下文、根因、行为契约、方案、任务、验证和最终 archive。
- **PR/MR**：代码交付、验证证据、风险说明和 Review 入口。
- **Superpowers**：可选增强，用于头脑风暴、计划细化、TDD、系统调试、审查和完成前验证。

不替代普通 `jira-fix-workflow`：

- 只需快速修复且无需长期规范沉淀时，使用 `jira-fix-workflow`。
- 需要行为契约、审计、团队协作、跨模块影响或长期追溯时，使用本 skill。

## 调用约定

- **触发词**：opsx-jira-fix、OpenSpec Jira 修复、规范化修复 Jira、opsx修复Jira、Jira OpenSpec 修复、opsx自动修复Jira、用OpenSpec修复Jira、opsx-jira-fix-workflow
- **自动模式**：触发词含“自动”或 `--auto` 时进入自动模式。
- **强制模式**：触发词含“强制”或 `--force` 时可跳过难度终止，但仍不得跳过验证和归档检查。
- **继续修复**：触发词含“继续修复”“再次修复”“从上次继续”或 `--retry` 时，先定位现有 OpenSpec change，再从 `design.md`、`tasks.md` checkbox、当前 Git 分支和 PR/MR 状态恢复上下文。

## 阶段 0：前置检查

任一关键检查失败则暂停，不进入修复：

1. 解析 Jira URL / Jira ID，识别模式（manual / auto / force / retry）。
2. 检查 Jira 数据可读：优先 `jira-read {JIRA-ID} --live` 或 mcp-atlassian；失败则读本地缓存；仍失败则终止。
3. 检查 Git 状态：自动模式可 stash；手动模式提示用户处理。
4. 检查 OpenSpec：确认存在 `openspec/`；不存在时询问是否运行 `openspec init`，不得静默初始化。
5. 检查 OpenSpec 命令：优先使用 `openspec list`、`openspec status`、`openspec validate`；不可用时可直接读写 `openspec/`，但必须说明降级。
6. 继续修复时，先定位 OpenSpec change：优先从当前分支名推断；其次搜索 `openspec/changes/*/{proposal.md,design.md,tasks.md}` 中的 Jira ID；再次查看 PR/MR 描述中的 OpenSpec change 路径；仍无法唯一确定时只问用户 1 个问题确认 change 名称。定位后使用 `openspec status --change <name>`、`openspec show <change-name>`、`design.md`、`tasks.md` checkbox 和当前 Git 分支恢复进度。
7. 扫描 Superpowers 类增强能力；发现则记录，未发现则静默降级。

## OpenSpec 记录模型

本 skill 不创建额外运行态目录。单个 Jira Bug 的修复周期应保持短暂清晰，工程记录统一进入 OpenSpec artifacts：

| 目录 | 作用 | 是否长期事实源 |
|------|------|----------------|
| Jira issue | 问题来源、评论和状态流转 | 否，外部流程源 |
| `openspec/changes/<change-name>/` | proposal、delta specs、design、tasks、archive 前变更事实 | 是，归档后进入 `openspec/specs/` |
| PR/MR | 交付说明、验证证据、风险与回滚 | 否，交付沟通载体 |

不得再为 OPSX Jira 修复创建额外本地运行态目录。若需要继续修复，从 OpenSpec change、`tasks.md` checkbox、Git 分支和 PR/MR 状态恢复。

## 阶段 1：读取 Jira

读取最新 Jira 数据，并尽早写入 OpenSpec artifacts；不得只保留在对话上下文中。

- Jira ID、标题、优先级、状态
- 描述、复现步骤、期望结果、实际结果
- 附件、评论、历史补充信息
- 数据来源（live / cache / user-provided）

阶段 1 完成后必须确定或创建 OpenSpec change：

- 自动模式：按阶段 3 的命名规则创建 draft change，并将 Jira Context 写入 `design.md`。
- 手动模式：输出候选 change 名称并等待用户确认；确认前不得进入深度分析。
- 继续修复：使用阶段 0 的定位规则复用现有 change，并将最新 Jira Context 合并到 `design.md`。

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

输出进入 `openspec/changes/<change-name>/design.md` 的 Problem Analysis / Root Cause / Impact 小节。阶段 2 开始前必须已有已确认或已创建的 change；若没有，先回到阶段 1 的 change 确认/创建规则，不得只在对话中保留分析结论。

若问题不存在或 Jira 描述与代码不符，暂停，向 Jira 写评论前需用户确认。

### 🔬 打点调试（静态分析受阻时，主动升级为运行时调试）

**触发条件（满足任一即触发，在进入阶段 3 前优先处理）：**

- 根因置信度为「模糊」或「未知」——能定位到大概模块，但无法确定具体逻辑或触发路径
- 当前是重试场景（含「继续修复」`--retry`）——已基于静态分析修复过一次，但问题仍然存在

> **重试场景首选策略**：静态分析已做过一次，再次静态分析大概率触达同样的边界。应优先考虑打点调试，用运行时事实重新锚定根因，而不是重复上一轮的分析路径。

**触发时的处理方式：**

静态分析有其边界：代码可以被读懂，但运行时的实际数据流、调用顺序、变量取值只有在真实执行中才能观测到。当静态分析的置信度不足以支撑方案选择时，应主动升级为打点调试，用运行时事实锚定根因，再继续后续阶段。

**执行步骤：**

1. **打点位置设计**：基于当前代码定位，识别 2-5 个关键节点
   - 函数入口/出口：确认是否被调用、调用频率、调用顺序
   - 状态变更点：记录变更前后的值
   - 数据流转点：追踪数据在模块间传递时的实际取值

2. **生成打点代码**：提供可直接使用的日志语句（示例格式，按项目语言调整）
   ```js
   console.log('[DEBUG-<位置标识>]', { key: value, timestamp: Date.now() })
   ```
   要求：含位置标识（便于日志搜索定位）、含关键变量、含时间戳

3. **操作指引**：明确告知用户
   - 在哪些文件/行添加打点
   - 如何触发问题场景（复现步骤）
   - 在哪里查看日志（浏览器控制台 / 终端 / 日志文件）

4. **等待日志**：⛔ 停止，等用户执行并提供日志输出

5. **日志分析**：收到日志后，分析实际调用链和数据流，给出根因结论，更新 `design.md` 的 Problem Analysis 小节

6. **打点清理建议**（可选）：根因确认后，说明哪些打点可删除，哪些值得转为正式的可开关监控

**工具限制**：✅ Read/Grep 辅助确定打点位置；❌ Edit/Write（打点代码由用户手动添加，或经用户明确确认后 AI 添加）；❌ 未经用户确认不得自行运行复现步骤

---

## 阶段 3：创建 OpenSpec Change

确认或创建 Jira 对应的 OpenSpec change。若阶段 1 已创建或复用 change，本阶段只校验并补全 artifacts；手动模式必须先确认 change 名称；自动模式可生成后继续。

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

- Why：Jira 链接、问题摘要、用户影响、为什么现在修
- What Changes：行为变化，而不是实现细节
- Capabilities：新增或修改的 capability
- Impact：代码、API、平台、风险

`design.md` 必须包含：

- Jira Context：Jira 标题、关键描述、复现路径、期望和实际结果
- Problem Analysis：存在性验证、根因、影响范围、难度分级
- Options：候选方案、取舍、推荐方案
- Risk：副作用、回滚策略、QA 关注点
- Verification Notes：验证场景、测试命令、人工验证项

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
openspec/changes/<change-name>/design.md
```

## 阶段 5：制定计划

以 `openspec/changes/<change-name>/tasks.md` 为唯一任务清单。

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

多仓库场景需为每个仓库创建对应分支，并在 PR/MR 描述中列出仓库、分支和对应 OpenSpec change。

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

验证失败不得提交 PR。执行记录以 `tasks.md` checkbox、PR/MR 描述和 `design.md` 的 Verification Notes 为准。

## 阶段 7：提交 PR、Jira 回写、Archive 与收尾

### 7.1 提交与 PR

提交前必须确认：

- 所有相关 `tasks.md` checkbox 已完成。
- OpenSpec artifacts、代码修改和必要验证说明都在 diff 或 PR/MR 描述中。
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

⚠️ **必须分两步独立调用**：① `jira_transition_issue` 流转状态（不传 `comment` 参数）；② `jira_add_comment(issue_key=..., body=...)` 写修复评论。禁止通过 `jira_transition_issue` 的 `comment` 参数传评论——该参数不可靠，评论可能被静默丢弃；`jira_add_comment` 的评论内容参数名为 `body`（非 `comment`）。

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

收尾记录以 PR/MR、Jira 评论和 OpenSpec archive 结果为准。

## 批量 OPSX Jira 修复

批量修复场景请使用 `opsx-jira-fix-batch` skill。

## 常见错误

| 错误 | 后果 | 修正 |
|------|------|------|
| 创建额外本地运行态目录 | 形成 OpenSpec 之外的第二套记录 | 统一记录到 OpenSpec artifacts、PR/MR 和 Jira 评论 |
| 只写 OpenSpec，不回写 Jira | Jira 流程断裂，QA 无法跟进 | 阶段 7 必须写 Jira 评论并流转到“已修复” |
| 未做存在性验证 | 修复不存在或已变化的问题 | 阶段 2 第一项必须验证 |
| `MODIFIED` 只写片段 | archive 时丢失 requirement 细节 | 复制完整 requirement block 再修改 |
| 先 PR/合并再 archive | specs 或 archive 目录可能不在最终 diff | 默认先 archive 并检查 diff，再完成 PR |
| Jira 状态越权 | 研发误关闭 issue | 只允许流转到“已修复” |
| 通过 `jira_transition_issue` 的 `comment` 参数传评论 | 评论被静默丢弃 | 独立调用 `jira_add_comment`，transition 的 comment 参数不可靠 |
| Superpowers 缺失就中断 | 降低跨平台可用性 | Superpowers 只做渐进增强 |
| 验证失败仍提交 PR | 把未闭环修复交给 QA | 阶段 6 未通过不得提交 |
| OpenSpec artifacts 写得过薄 | 后续无法复盘根因和验证 | `design.md` 必须包含 Jira Context、Root Cause、Options、Risk 和 Verification Notes |
| 批量修复只按列表机械执行 | 重复修复、依赖丢失或行为冲突 | 执行前后识别 issue 关系，并写入 Related Issues / Risk / Dependencies |

## 最小成功标准

一次完整执行至少产生或更新：

- `openspec/changes/<change-name>/proposal.md`
- `openspec/changes/<change-name>/specs/<capability>/spec.md`
- `openspec/changes/<change-name>/design.md`
- `openspec/changes/<change-name>/tasks.md`

完成后：

- PR/MR 已创建或更新。
- Jira 已评论并流转到“已修复”（如有权限）。
- OpenSpec 已 archive，或 PR 明确说明归档策略和责任人。
- 验证证据已记录。
