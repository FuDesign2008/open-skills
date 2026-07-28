---
name: opsx-jira-fix-workflow
version: "1.9.0"
user-invocable: true
description: 当用户说"opsx-jira-fix"、"OpenSpec Jira 修复"、"规范化修复 Jira"、"opsx修复Jira"、"Jira OpenSpec 修复"、"opsx自动修复Jira"、"用OpenSpec修复Jira"或"opsx-jira-fix-workflow"时触发。适用于从 Jira issue 出发，并需要将根因、行为变更、修复计划、验证和归档沉淀到 OpenSpec artifacts 的端到端 Bug 修复。
dependencies:
  - solution-review
  - code-design-review
  - hybrid-debug
  - runtime-evidence-debug
  - browser-debug-toolkit
  - node-version-discipline
  - workflow-mode-lifecycle
  - clarifying-question-discipline
  - known-issue-research
  - analysis-core
  - env-capability-discovery
  - ensure-tests
  - merge-discipline
  - pdca-review-orchestration
  - openspec-workspace-gates
  - jira-status-writeback
---

# OPSX Jira Bug 修复工作流

> Jira 修复的规范化版本：保留 `jira-fix-workflow` 的端到端修复能力，引入 OpenSpec 作为行为事实源，并用 Superpowers 作为可选工程增强。
>
> **输出格式参考**：各阶段输出模板见 [reference.md](reference.md)。

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

**强依赖 skill**（frontmatter `dependencies`，共 16 个；启动时须先通过「前置 skill 检查」，缺失即中止流程）：
- `pdca-review-orchestration`（阶段 4 审查编排；依赖 `solution-review` 与 `code-design-review`）
- `hybrid-debug` / `runtime-evidence-debug` / `browser-debug-toolkit`（经 `analysis-core` 委托；阶段 2 + 阶段 7）
- `analysis-core`（阶段 2 分析方法论单源：临时改动门控 / 打点调试 / 分析步骤骨架 / 调试-验证闭环）
- `node-version-discipline`（阶段 6 执行验证前 Node 版本对齐）
- `workflow-mode-lifecycle`（自动/手动模式生命周期）、`clarifying-question-discipline`（主动提问硬纪律与调查优先）、`known-issue-research`（阶段 2 调研路由 / 已知问题快搜 / 行业通病评估）
- `env-capability-discovery`（环境能力探索：启动时一次扫描可用增强能力）
- `ensure-tests`（阶段 6.2.5 测试确保：有测试基建时补全并运行；无基建经用户确认后搭建）
- `merge-discipline`（阶段 8 合并纪律）
- `openspec-workspace-gates`（阶段 0 OpenSpec 工程与原生 skill 门禁）
- `jira-status-writeback`（阶段 8 合并后回写：状态流转 + 修复评论单源 SOP）

## 前置 skill 检查

> 本 skill 通过 frontmatter `dependencies` 声明对 16 个 skill 的强依赖。启动时（阶段 0 前置检查之前）必须执行本检查。

1. 扫描可用 skill（查 `<available_items>` 或用 `skill` 工具）
2. 核对 16 个 dependencies 是否都在可用列表中
3. 全部存在 → 继续阶段 0 前置检查
4. 任一缺失 → 输出结构化提示并**立即中止流程**（格式同 `solve-workflow` 的前置检查缺失提示，见 `solve-workflow/reference.md`）

> **不降级原则**：强依赖缺失即中止，不得用简化审查/调试降级运行。

## 模式生命周期

> 自动模式的进入、持续与退出规则，避免模式粘滞导致用户未察觉的自动决策。核心规则（自动恢复手动 / 显式重进 / 隐式延续不激活 / 批量场景）由强依赖 skill `workflow-mode-lifecycle` 承载（前置检查已保证可用），本节不再内联重复。本工作流的「全流程完成」= 正常完成阶段 0-8 全流程（以阶段 8 归档完成收尾）；失败终止、用户主动停止、审查超限暂停后终止均视为流程中断，恢复手动。

### 特有说明

- 阶段 8 归档完成后，模式自动恢复手动
- `--retry`（继续修复）：重置为手动模式
- `--resume`（断点恢复）：沿用断点时的模式
- OpenSpec archive 失败视为流程中断，恢复手动

## 环境能力探索（跨平台自适应）

> 探索时机、扫描方法、能力类型关键词表与调用原则由强依赖 skill `env-capability-discovery` 承载（前置检查已保证可用；其他工作流默认弱引用、不可用时静默跳过）。启动时执行一次扫描（阶段 0 步骤 8 的 Superpowers 类增强能力扫描即按该 skill 方法论执行），结果记录在会话上下文中，后续阶段直接引用，无需重复扫描；frontmatter `dependencies` 声明的强依赖 skill 不走环境探索（由「前置 skill 检查」保证可用）。

### 能力 → 阶段映射（opsx-jira-fix-workflow）

| 能力类型 | 对应阶段 | 用途 |
|---------|---------|------|
| 🔍 调试分析 | 阶段2（分析问题） | 辅助根因定位、假设驱动调查 |
| 🌐 Web 调研 | 阶段2（1.5 调研路由 / 打点逃生出口） | 经 `known-issue-research` 统一委托 `effective-web-research` |
| 💡 方案设计 | 阶段4（探索与审查方案） | 辅助多方案生成与对比 |
| 📝 计划制定 | 阶段5（制定计划） | 辅助生成结构化 tasks.md |
| ⚡ 代码执行 / 🧪 测试驱动 / 🔧 构建修复 | 阶段6（执行修复） | 批量编排 / 先写测试 / 构建错误修复 |
| ✅ 完成验证 | 阶段7（检查验证） | 执行后独立验证 |

## 阶段 0：前置检查

任一关键检查失败则暂停，不进入修复：

1. 解析 Jira URL / Jira ID，识别模式（manual / auto / force / retry）。
2. 检查 Jira 数据可读：优先 `jira-read {JIRA-ID} --live` 或 mcp-atlassian；失败则读本地缓存；仍失败则终止。
3. 检查 Git 状态：自动模式可 stash；手动模式提示用户处理。
4. **OpenSpec 工程与原生 skill 门禁**：加载 `openspec-workspace-gates`，执行工程定位、`openspec/` 检查和精确原生 OPSX skill 门禁；通过后继续本工作流。
5. 检查 OpenSpec 命令（在工程根下执行）：优先使用 `openspec list`、`openspec status`、`openspec validate`。
7. 继续修复时，先定位 OpenSpec change：优先从当前分支名推断；其次搜索 `openspec/changes/*/{proposal.md,design.md,tasks.md}` 中的 Jira ID；再次查看 PR/MR 描述中的 OpenSpec change 路径；仍无法唯一确定时只问用户 1 个问题确认 change 名称。定位后使用 `openspec status --change <name>`、`openspec show <change-name>`、`design.md`、`tasks.md` checkbox 和当前 Git 分支恢复进度。
8. 扫描 Superpowers 类增强能力（扫描方法论见上文「环境能力探索」）；发现则记录，未发现则静默降级。

   **Superpowers 增强能力调用原则**：调用增强 skill/agent 前，必须先读取其当前 SKILL.md 或说明文件，不得凭记忆调用。Skill 定义可能随版本更新变化，凭记忆调用容易使用过期规则。

## OpenSpec 记录模型

本 skill 不创建额外运行态目录。单个 Jira Bug 的修复周期应保持短暂清晰，工程记录统一进入 OpenSpec artifacts：

| 目录 | 作用 | 是否长期事实源 |
|------|------|----------------|
| Jira issue | 问题来源、评论和状态流转 | 否，外部流程源 |
| `openspec/changes/<change-name>/` | proposal、delta specs、design、tasks、archive 前变更事实 | 是，归档后进入 `openspec/specs/` |
| PR/MR | 交付说明、验证证据、风险与回滚 | 否，交付沟通载体 |

不得再为 OPSX Jira 修复创建额外本地运行态目录。若需要继续修复，从 OpenSpec change、`tasks.md` checkbox、Git 分支和 PR/MR 状态恢复。

### 阶段工具约束表

| 阶段 | ✅ 允许 | ❌ 禁止 |
|------|---------|---------|
| 0 前置检查 | Read、Grep、Glob、Bash（只读检查）、Jira API（只读） | Edit、Write、Git 写操作 |
| 1 读取 Jira | Jira API、jira-read、Read、OPSX skills（创建 change） | Edit 业务代码、Write 业务代码、改变实现的 Bash |
| 2 分析问题 | Read、Grep、WebSearch；分析辅助 Edit/Write 按 `analysis-core` §1（须登记回滚） | 以实现修复为目的的业务代码改动 |
| 3 创建 Change | OPSX 原生 skills、Write（artifacts） | Edit 业务代码 |
| 4 探索方案 | Read、Grep | Edit、Write 业务代码 |
| 5 制定计划 | Read、Write（仅 tasks.md） | Edit 业务代码 |
| 6 执行验证 | 全部（Edit、Write、Bash、Git、测试）；运行构建/lint/tsc/test 前须按 `node-version-discipline` 对齐项目声明的 Node 版本（探测链见该 skill SOP） | 跳过验证、跳过 checkbox 更新 |
| 7 检查验证 | Read、Bash（仅测试命令）、OPSX skills（openspec-verify-change） | Edit、Write 业务代码 |
| 8 提交收尾 | Git、Jira API、OPSX skills、Bash（若 Part C 决定运行覆盖率，额外允许 test-coverage-analyzer 脚本） | 跳过 archive、跳过 Jira 回写 |

### 模式差异速查表

| 阶段 | 手动模式 | 自动模式 |
|------|---------|---------|
| 0 前置检查 | Git 不干净→提示用户处理 | Git 不干净→自动 stash |
| 1 读取 Jira | 输出候选 change 名称，等用户确认 | 自动创建 draft change |
| 2 分析问题 | 同自动模式 | 同手动模式 |
| 3 创建 Change | 等用户确认 change 名称后创建 | 自动生成并创建 |
| 4 探索方案 | 输出方案表后暂停，等用户选择 | 自动选择最优方案 |
| 5 制定计划 | 输出计划后暂停确认 | 普通：自动进入阶段 6；困难/极难：暂停 |
| 6 执行验证 | 同自动模式 | 同手动模式 |
| 7 检查验证 | 输出验证结果后暂停，等用户确认 | 自动判定通过/未达标；未达标自动回退（最多 2 次，超限暂停） |
| 8 提交收尾 | 同自动模式 | 同手动模式 |

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

完成后自动进入阶段 2。

> ⚠️ 主动提问：遵循 `clarifying-question-discipline`（一次一问、多轮问清）。
>
> 🚩 **Red Flag**：一次列出多个歧义点让用户回答（违反硬纪律，见 `clarifying-question-discipline`）——每次只问 1 个最关键的，得到回答后再问下一个。

### Scope 拆解（可选，多子系统时触发）

若 Jira issue 涉及 2 个以上子系统或模块（如前端 + 后端 + 数据库），在进入阶段 2 前先拆解：

1. 列出涉及的子系统 / 模块。
2. 为每个子系统标注：是否有独立根因、是否需独立 change、是否与主 change 有依赖。
3. 若子系统间有强依赖→合并为一个 change；若相互独立→可考虑拆分为多个 change，每个走独立的修复流程。

拆解结论写入 `design.md` 的 Scope 小节。

## 阶段 2：分析问题

> 分析方法论单源：`analysis-core`。修复实现归执行阶段。

### 委托 `analysis-core`

加载强依赖 `analysis-core`，按其 §§1–3 执行。本工作流映射（号+名）：

- `{next-stage}` = 阶段 3「创建 OpenSpec Change」
- `{root-cause step}` = 步骤 4；`{impact-assessment step}` = 步骤 5；`{upstream-eval step}` = 步骤 4.5

### 本工作流编排（保留）

在 `analysis-core` 骨架之上额外完成：

- **难度分级**（容易/中等/困难/极难）与**路径选择**（精简/增量/完整）；Scope 扩大时升级路径
- **产物落点**：写入 `design.md` 的 Problem Analysis / Root Cause / Impact（须已有 change；否则先回阶段 1）
- **存在性 ❌ / 描述不符**：暂停；写 Jira 评论前需用户确认

分级与路径表：

| 等级 | 触发条件 | 行为 |
|------|----------|------|
| 容易 | ≤3 个文件，根因清晰 | 可走精简路径 |
| 中等 | 4-10 个文件，根因基本清晰 | 走增量路径 |
| 困难 | 风险较高或影响范围较广 | 阶段 5 后暂停审查 |
| 极难 | 根因未知、架构变更、数据迁移、API 协议变更、跨仓库 | 自动模式终止；手动模式二次确认 |

| 难度 | 路径 | 要求 |
|------|------|------|
| 容易 | 精简路径 | proposal/delta specs 可精简，不跳过验证 |
| 中等 | 增量路径 | proposal/specs/design/tasks 全部产出 |
| 困难/极难 | 完整路径 | 阶段 1-8 全执行，可用 `brainstorming` |

> 🚩 **Red Flags**：未做存在性验证；根因过浅；结论未入 design.md；模糊却不触发打点（`analysis-core` §3）；未升级路径；违反 `analysis-core` / `known-issue-research` 门控

---

## 阶段 3：创建 OpenSpec Change

🔌 **OPSX Skills 调用纪律**：本阶段及后续各阶段委托原生 OPSX skill 前，必须先读取对应 skill 的 SKILL.md，不得凭记忆调用。

确认或创建 Jira 对应的 OpenSpec change。若阶段 1 已创建或复用 change，本阶段只校验并补全 artifacts；手动模式必须先确认 change 名称；自动模式可生成后继续。

- **命名**：`fix-<jira-id-lower>-<short-topic>`（例：`fix-ynotr-12167-ai-summary-button`）
- **创建**：委托 `openspec-new-change`（读其 SKILL.md；`/opsx:new` 为入口别名）。**不得**手写 `openspec/changes/` 绕过原生 skill（缺失时按 `openspec-workspace-gates` 停止并安装）
- **Jira 完整度**：`design.md` 至少含 Jira Context / Root Cause / Options / Risk / Verification Notes；proposal / delta spec / 字段细节见 [reference.md](reference.md)「阶段 3 Artifacts 字段清单」

## 阶段 4：探索与审查方案

基于阶段 2 根因和阶段 3 artifacts，输出 2-3 个方案：

- 核心思路
- 涉及文件 / 模块
- 对 OpenSpec requirement 的覆盖关系
- 优点、缺点、复杂度、风险
- 推荐方案

**YAGNI 原则**：方案必须严格聚焦于修复 Jira 根因和覆盖 delta specs，剔除非必要功能与过度设计。每增加一个超出根因范围的改动，必须显式标注为「额外优化」并说明为什么值得承担风险。

手动模式输出方案表后暂停，等待用户选择；自动模式自动选择最优方案。

加载 `pdca-review-orchestration` 并按其完整审查契约执行。本工作流映射：`{next-stage}` = 阶段 5「制定计划」；`{artifact-sink}` = `openspec/changes/<change-name>/design.md`；`{extra-dimensions}` = Spec 覆盖（requirements/scenarios）和 Jira 状态边界（仅流转至“已修复”）；`{batch-overcap-behavior}` = `N/A`。

> 🚩 **Red Flags（阶段 4）**：
> - ❌ 审查只覆盖根因，未检查 spec 覆盖和副作用
> - ❌ 只有 1 个方案就跳过对比和审查

## 阶段 5：制定计划

以 `openspec/changes/<change-name>/tasks.md` 为唯一任务清单。

任务要求：

- 使用 checkbox：`- [ ] 1.1 ...`
- 每项足够小，可独立验证。
- 覆盖所有 delta spec requirements 和 scenarios。
- 包含必要测试、验证、回滚、OpenSpec archive 和合并后 Jira 回写步骤。
- 禁止 `TBD`、`TODO`、`适当处理`、`类似上面` 这类不可执行描述。

若检测到 `writing-plans`，借鉴其粒度：目标文件、测试命令、预期输出、失败时处理。

手动模式输出计划后暂停；自动模式普通情况自动进入阶段 6。困难或极难继续场景必须暂停确认。

> 🚩 **Red Flags（阶段 5）**：
> - ❌ 任务项包含 `TBD`、`TODO`、`适当处理`、`类似上面` 等不可执行描述
> - ❌ 任务未覆盖所有 delta spec requirements 和 scenarios
> - ❌ 缺少测试、验证、回滚、archive 或合并后 Jira 回写步骤
> - ❌ 任务粒度过大，无法独立验证

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
3. **完成任务后必须立即更新 checkbox**：使用 StrReplace 将 `tasks.md` 中对应的 `[ ]` 改为 `[x]`，不得延后到一批任务结束后再批量更新。若跳过此步骤，阶段 7 验证器将报 CRITICAL 虚假未完成。
4. 如发现 spec 或 design 错误，先回写 artifacts，再继续实现。
5. 偏离计划时说明原因；若影响行为契约，回到阶段 3 或 4。

可选追踪注释：

```text
// fix <JIRA-ID>
```

若项目规范不接受修复注释，不强制添加，但必须在执行报告中列出修复点。

### 6.2.5 测试套件确保（必须，在进入阶段 7 验证前）

所有 `tasks.md` checkbox 全部勾选后，在进入阶段 7 验证前，强制执行以下步骤：

读取并调用 `ensure-tests`，声明 `mode=mandatory`，作用域为本次修复的逻辑文件；其失败或拒绝必要脚手架时阻断进入阶段 7。

### 6.3 Superpowers 增强

检测到对应能力时使用：

- `test-driven-development`：有可测试行为时先写失败测试。
- `systematic-debugging`：测试、构建、类型或行为失败时先定位根因。
- `subagent-driven-development`：独立任务可一任务一上下文执行。
- `requesting-code-review`：高风险任务完成后做代码质量和 spec 合规审查。
- `verification-before-completion`：完成前必须有刚运行过的验证证据。

> 🚩 **Red Flags（阶段 6）**：
> - ❌ 单元测试失败仍进入阶段 7 验证
> - ❌ 实现中发现设计错误却继续硬做，未回写 artifacts
> - ❌ 偏离计划时未说明原因，或影响行为契约却未回到阶段 3/4

## 阶段 7：检查验证

必须覆盖：

1. OpenSpec 校验：
   - 若检测到 `openspec-verify-change` skill → 读取其 SKILL.md，委托执行验证。
   - 若不存在 → 直接运行 `openspec validate <change-name>` 或 `openspec validate --changes`（CLI 工具调用，非降级）。
**Node 版本对齐（前置）**：调用 `node-version-discipline` 对齐项目声明的 Node 版本后，再运行下方验证命令。

2. 工程验证：测试、lint、类型检查、构建（对齐版本下执行）
3. 行为对照：逐条核对 delta spec requirements 和 scenarios
4. Jira 对照：复现步骤、期望/实际是否已闭环
5. 副作用检查：相关模块和平台是否受影响；验证报告须披露 `Node(声明版本 vX) ✅/⚠️ 未对齐`
6. 调试-验证闭环：若阶段 2 用了调试 skill 定位根因，按 `analysis-core` §4 用**同一 skill** 验证修复（而非只跑测试）

> 按 `pdca-review-orchestration` 的验证报告诚实规则标注每项结果。

验证输出格式：

输出格式见 [reference.md](reference.md)「阶段 7 验证结果」。

验证失败不得提交 PR。执行记录以 `tasks.md` checkbox、PR/MR 描述和 `design.md` 的 Verification Notes 为准。

## 阶段 8：提交 PR、Archive、合并与收尾

### 8.1 提交与 PR

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

### 8.2 OpenSpec Archive

归档前同步步骤：

1. **若存在 delta specs**：调用 `openspec-sync-specs` skill（若已安装）将 delta specs 合并到主 `specs/<capability>/spec.md`，或让 `openspec-archive-change` 在归档过程中提示并处理同步。
2. **执行归档**：调用 `openspec-archive-change` skill（先读取其 SKILL.md，再按其指令执行）。

若 `openspec-archive-change` skill 执行失败，**不得**手动操作 `openspec/` 目录；应停止并提示用户检查 openspec 安装状态。

合并或准备合并前，必须确认 archive 已完成（与 `merge-discipline` Part A 一致）：

- 关联 active OpenSpec change 时：**必须**先 archive（同步主 specs + 迁入 `openspec/changes/archive/`），确认 diff 后再合并；**不得**以「合并后再归档」作为正常路径。
- 无关联 change 的 PR：Part A 放行，不要求 archive。

默认：验证通过后先 archive，确认 `openspec/specs/` 更新和 `openspec/changes/archive/` 迁移进入 diff，再完成 PR/合并。
### 8.3 分支收尾

若检测到 `finishing-a-development-branch`，在验证和 archive 检查完成后，再借鉴其流程做：

- 保留分支
- 创建 / 更新 PR
- 合并
- 清理本地和远程分支
- 同步主分支

> **顺序约束**：archive（8.2）→ 分支收尾决策（8.3）→ 合并纪律 `merge-discipline`（8.3.1）→ 执行合并 → Jira 回写（8.4）。选择「保留分支」「继续开发」不触发合并纪律，也跳过 Jira 回写。

#### 8.3.1 合并纪律（merge-discipline skill）

> 合并动作执行前加载 `merge-discipline`，按 Part A → B → C → D 执行；合并前检查清单见 `merge-discipline/reference.md`。用户直接说 merge 也必须加载，不得隐式跳过。

### 8.4 Jira 回写（合并完成后）

PR/MR 已成功合并，代码已进入主分支，此时回写 Jira 状态准确反映修复已合入。加载强依赖 `jira-status-writeback`，按其 SOP 执行状态流转与修复评论，本工作流提供以下字段映射：

| jira-status-writeback 字段 | 取值 |
|------|------|
| Fix branch / Commit / PR/MR URL | 修复分支名 / 合并后主干 SHA / PR/MR 链接 |
| Root cause | 阶段 2 根因摘要 |
| Fix summary | 修复方案 |
| Changed files | 修改文件清单 |
| Verification | 阶段 7 验证场景 |
| Extra | OpenSpec change 路径、风险或待 QA 关注点 |

收尾记录以 PR/MR、Jira 评论和 OpenSpec archive 结果为准。

### 8.5 AI 工程沉淀

OpenSpec artifacts 正常归档。`AGENTS.md` / 规则 / skill 等 AI 工程知识：**写入前须用户明确要求**；一次性/未验证经验不建议固化。

> 🚩 **Red Flags（阶段 8）**：
> - ❌ 验证未通过就提交 PR
> - ❌ Jira 评论通过 `jira_transition_issue` 的 `comment` 参数传递，或状态越权流转到「关闭」「验证通过」等（SOP 见 `jira-status-writeback`）
> - ❌ archive 失败后手动操作 `openspec/` 目录
> - ❌ PR 描述缺少 OpenSpec change 路径或验证证据
> - ❌ `ask` 偏好下未询问用户就默认跑 analyzer（见 `merge-discipline` Part C）
> - ❌ archive（8.2）未完成就触发合并纪律（顺序：8.2 archive → 8.3 分支收尾 → 8.3.1 合并纪律 merge-discipline → 合并 → 8.4 Jira 回写）

## 批量 OPSX Jira 修复

批量修复场景请使用 `opsx-jira-fix-batch` skill。

## 常见错误

> 只记本 skill 非直觉陷阱。合并/覆盖率/archive → `merge-discipline`；工程根/`openspec/`/原生 skill → `openspec-workspace-gates`；增强能力 → `env-capability-discovery`；Jira 回写 SOP → `jira-status-writeback`。不复述阶段正文已写明的规则。

| 错误 | 后果 | 修正 |
|------|------|------|
| 创建额外本地运行态目录 | OpenSpec 之外第二套记录 | 统一记到 OpenSpec artifacts、PR/MR 与 Jira 评论 |
| 只写 OpenSpec，不回写 Jira | Jira 流程断裂，QA 无法跟进 | 阶段 8.4 合并完成后必须加载 `jira-status-writeback` 完成回写 |
| Jira 回写复述两步 API 细节或状态越权判断 | 与 `jira-status-writeback` 漂移，评论丢失或误关单 | 阶段 8.4 只传字段映射，SOP 细节以 `jira-status-writeback` 为准 |
| 快速修复误走 OPSX 路径 | 流程过重 | 无需规范沉淀时用 `jira-fix-workflow` |
| 批量修复只按列表机械执行 | 重复修、丢依赖或行为冲突 | 执行前后识别 issue 关系，写入 Related Issues / Risk / Dependencies |
| 阶段 2 分析后立刻创建 proposal | Why/What 割裂，artifact 重写 | proposal 在阶段 4 方案选定后一次写完整 |
| `design.md` 缺 Jira Context / Root Cause / Options / Risk / Verification Notes | 无法按单复盘 | 上述五块为 Jira×OPSX 最低完整度 |
| `MODIFIED` 只写片段或 skill 短名错误 | archive 丢 requirement / 读不到 SKILL | 整块复制再改；用 `openspec-*-change` 精确名 |

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
