---
name: opsx-jira-fix-workflow
version: "1.4.0"
user-invocable: true
description: 当用户说"opsx-jira-fix"、"OpenSpec Jira 修复"、"规范化修复 Jira"、"opsx修复Jira"、"Jira OpenSpec 修复"、"opsx自动修复Jira"、"用OpenSpec修复Jira"或"opsx-jira-fix-workflow"时触发。适用于从 Jira issue 出发，并需要将根因、行为变更、修复计划、验证和归档沉淀到 OpenSpec artifacts 的端到端 Bug 修复。
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

## 模式生命周期

> 自动模式的进入、持续与退出规则，避免模式粘滞导致用户未察觉的自动决策。

### 核心规则：自动恢复手动

自动模式在以下情况**自动恢复为手动模式**：

| 恢复场景 | 说明 |
|---------|------|
| 正常完成阶段 0-7 全流程 | 无论收尾（归档完成）还是中间任一阶段的最终终止 |
| 流程被任意中断 | 失败终止、用户主动停止、审查超限暂停后终止 |

### 重新进入自动模式

恢复手动后，用户必须**显式触发**才能再次进入自动模式（如说「opsx 自动修复 Jira」「切换自动模式」）。隐式延续（如「继续修复」「再改一下」）**不会**重新激活自动模式。

### 特有说明

- 阶段 7 归档完成后，模式自动恢复手动
- `--retry`（继续修复）：重置为手动模式
- `--resume`（断点恢复）：沿用断点时的模式
- OpenSpec archive 失败视为流程中断，恢复手动

## 阶段 0：前置检查

任一关键检查失败则暂停，不进入修复：

1. 解析 Jira URL / Jira ID，识别模式（manual / auto / force / retry）。
2. 检查 Jira 数据可读：优先 `jira-read {JIRA-ID} --live` 或 mcp-atlassian；失败则读本地缓存；仍失败则终止。
3. 检查 Git 状态：自动模式可 stash；手动模式提示用户处理。
4. **OpenSpec 工程定位与目录检查**：

   **工程定位**（workspace 多工程场景必须执行；依次尝试，命中即停止）：
   1. cwd 下存在 `openspec/` → 工程根 = cwd（单工程场景，零额外开销）
   2. 当前编辑文件所在目录向上查找 `openspec/` → 工程根 = 命中目录
   3. cwd 直接子目录中含 `openspec/`：仅一个 → 自动采用；多个 → 列出候选让用户选择
   4. 均未命中 → 输出"未找到 OpenSpec 工程"并停止

   定位后输出 `【工程定位结果】目标工程根：<绝对路径>`。通过 Bash `cd "<工程根>"` 切换工作目录，后续所有 `openspec/` 路径、CLI 命令、artifact 写入和委托原生 OPSX skill 均在工程根下执行。若无法切换 cwd，所有路径使用工程根的绝对路径。

   **目录检查**：确认工程根存在 `openspec/`；不存在时询问是否运行 `openspec init`，不得静默初始化。
5. 门禁 2：OPSX 原生 Skills 检查：

   扫描工程根中所有已安装工具的 skills 目录（如 `.claude/skills/`、`.cursor/skills/` 等），检查是否存在以下必需的原生 OPSX skills：

   | 所需 skill | 对应阶段 | 用途 |
   |-----------|---------|------|
   | `openspec-new-change` | 阶段 3 | 创建 change 目录 |
   | `openspec-continue-change` | 阶段 3/4/5 | 逐步创建各 artifact |
   | `openspec-apply-change` | 阶段 6 | 按 tasks 执行实现 |
   | `openspec-archive-change` | 阶段 7 | 归档 change |

   `openspec-verify-change` 为可选 skill，存在时在阶段 6.4 使用。

   > ⚠️ **判断规则（严格）**：必须按上表的**精确 skill 名称**逐一核查。找到其他名称的 openspec skill（如旧版的 `openspec-propose`）**不算通过**。

   - **全部必需 skills 存在** → 建立 OPSX 原生 Skills 能力表，通过。
   - **任一必需 skill 不存在** → **立即停止**，输出提示要求用户运行 `openspec init` 或 `openspec update` 补全 skills。

   **OPSX 原生 Skills 使用约定**：

   1. **调用前先读取 SKILL.md**：每次委托前必须先读取对应 skill 的 SKILL.md，不得凭记忆调用。
   2. **本 skill 保留阶段门禁**：原生 skill 执行完成后，本 skill 继续执行阶段确认、暂停、循环审查等门禁逻辑。
   3. **CLI 工具调用不是降级**：`openspec validate` 等 CLI 工具命令可直接使用，不属于「绕过原生 skills」。

6. 检查 OpenSpec 命令（在工程根下执行）：优先使用 `openspec list`、`openspec status`、`openspec validate`；不可用时可直接读写 `openspec/`，但必须说明降级。
7. 继续修复时，先定位 OpenSpec change：优先从当前分支名推断；其次搜索 `openspec/changes/*/{proposal.md,design.md,tasks.md}` 中的 Jira ID；再次查看 PR/MR 描述中的 OpenSpec change 路径；仍无法唯一确定时只问用户 1 个问题确认 change 名称。定位后使用 `openspec status --change <name>`、`openspec show <change-name>`、`design.md`、`tasks.md` checkbox 和当前 Git 分支恢复进度。
8. 扫描 Superpowers 类增强能力；发现则记录，未发现则静默降级。

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
| 2 分析问题 | Read、Grep（打点调试：用户添加打点，AI 只读分析） | Edit、Write 业务代码 |
| 3 创建 Change | OPSX 原生 skills、Write（artifacts） | Edit 业务代码 |
| 4 探索方案 | Read、Grep | Edit、Write 业务代码 |
| 5 制定计划 | Read、Write（仅 tasks.md） | Edit 业务代码 |
| 6 执行验证 | 全部（Edit、Write、Bash、Git、测试） | 跳过验证、跳过 checkbox 更新 |
| 7 提交收尾 | Git、Jira API、OPSX skills | 跳过 Jira 评论、跳过 archive |

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
| 7 提交收尾 | 同自动模式 | 同手动模式 |

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

### Scope 拆解（可选，多子系统时触发）

若 Jira issue 涉及 2 个以上子系统或模块（如前端 + 后端 + 数据库），在进入阶段 2 前先拆解：

1. 列出涉及的子系统 / 模块。
2. 为每个子系统标注：是否有独立根因、是否需独立 change、是否与主 change 有依赖。
3. 若子系统间有强依赖→合并为一个 change；若相互独立→可考虑拆分为多个 change，每个走独立的修复流程。

拆解结论写入 `design.md` 的 Scope 小节。

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

路径选择（与难度分级关联）：

| 难度 | 路径 | 要求 |
|------|------|------|
| 容易 | 精简路径 | proposal 和 delta specs 可保持精简，不跳过验证 |
| 中等 | 增量路径 | proposal/specs/design/tasks 全部产出 |
| 困难/极难 | 完整路径 | 阶段 1-7 全部执行，`brainstorming` 辅助分析 |

执行中发现范围扩大时必须升级路径：精简 → 增量，增量 → 完整。手动模式下升级需用户确认。

输出进入 `openspec/changes/<change-name>/design.md` 的 Problem Analysis / Root Cause / Impact 小节。阶段 2 开始前必须已有已确认或已创建的 change；若没有，先回到阶段 1 的 change 确认/创建规则，不得只在对话中保留分析结论。

若问题不存在或 Jira 描述与代码不符，暂停，向 Jira 写评论前需用户确认。

> 🚩 **Red Flags（阶段 2）**：
> - ❌ 未做存在性验证就假设问题仍存在
> - ❌ 根因分析停在表面，未追问「为什么」至少 3 次
> - ❌ 分析结论只保留在对话中，未写入 design.md
> - ❌ 根因置信度模糊却不触发打点调试
> - ❌ Scope 扩大时未升级路径（精简→增量→完整）

### 🔬 打点调试（静态分析受阻时，主动升级为运行时调试）

**触发条件**（满足任一即触发，优先于进入阶段 3）：
- 根因置信度为「模糊」或「未知」——能定位到大概模块，但无法确定具体逻辑或触发路径
- 当前是重试场景（含「继续修复」`--retry`）——已基于静态分析修复过一次，但问题仍然存在

若环境中存在 `runtime-evidence-debug` skill，其提供了完整的运行时证据采集方法论（升级决策 / 打点设计 / 复现指引 / 证据分析 / 置信度门控 / 逃生出口 / 修复验证）；以下为本工作流自带的简要流程。

**简要流程**：识别 2-5 个关键节点（函数入口/出口、状态变更点、数据流转点）→ 生成打点代码 `console.log('[DEBUG-<位置标识>]', { key: value, timestamp: Date.now() })` → 告知用户添加位置+复现步骤+日志查看位置 → ⛔ 等待用户提供日志 → 分析日志更新根因（更新 `design.md` 的 Problem Analysis 小节）→ 根因仍模糊时用 WebSearch 搜已知案例（若 `effective-web-research` 可用则应用其调研纪律），仍未找到则手动模式暂停与用户讨论 / 自动模式标注「根因未完全确认」并继续后续阶段

**工具限制**：✅ Read/Grep 辅助确定打点位置；❌ Edit/Write（打点代码由用户手动添加，或经用户明确确认后 AI 添加）；❌ 未经用户确认不得自行运行复现步骤

---

## 阶段 3：创建 OpenSpec Change

🔌 **OPSX Skills 调用纪律**：本阶段及后续各阶段委托原生 OPSX skill 前，必须先读取对应 skill 的 SKILL.md，不得凭记忆调用。

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
- Goals / Non-Goals：修复目标和明确排除的范围
- Options：候选方案、取舍、推荐方案
- Risk：副作用、回滚策略、QA 关注点
- Migration Plan：（涉及数据库/API/配置变更时必填）迁移步骤和回滚方案
- Verification Notes：验证场景、测试命令、人工验证项

Delta spec 必须使用：

- `## ADDED Requirements`
- `## MODIFIED Requirements`
- `## REMOVED Requirements`
- `## RENAMED Requirements`

每个 requirement 必须包含至少一个 `#### Scenario:`。

> 常见格式错误（会导致 `openspec validate` 失败）：
> - `### REQ-001:` → 格式错，标题必须是 `### Requirement: <描述>`
> - `### Requirement: 初始化` → 缺 SHALL/MUST，描述必须包含 SHALL 或 MUST
> - 无 `#### Scenario:` 块 → 每个 requirement 至少需要一个场景

## 阶段 4：探索与审查方案

基于阶段 2 根因和阶段 3 artifacts，输出 2-3 个方案：

- 核心思路
- 涉及文件 / 模块
- 对 OpenSpec requirement 的覆盖关系
- 优点、缺点、复杂度、风险
- 推荐方案

**YAGNI 原则**：方案必须严格聚焦于修复 Jira 根因和覆盖 delta specs，剔除非必要功能与过度设计。每增加一个超出根因范围的改动，必须显式标注为「额外优化」并说明为什么值得承担风险。

手动模式输出方案表后暂停，等待用户选择；自动模式自动选择最优方案。

选定方案后必须审查：

1. **根因覆盖**：是否完整解决 Jira 根因。
2. **Spec 覆盖**：是否覆盖 delta specs 中的 requirements 和 scenarios。
3. **副作用风险**：是否影响其他平台、模块、性能、安全或兼容性。
4. **实现可行性**：涉及文件和依赖是否明确。
5. **Jira 状态边界**：是否只会流转到“已修复”，不越权关闭。

审查不通过时，自动模式最多优化并重审 3 轮；手动模式等待用户决定修改、重选或继续。

审查通过后，确认 `design.md` 的以下内容完整反映了审查结论：

- **Goals / Non-Goals**：审查中确认的修复范围和排除范围是否已更新
- **Decisions**：方案取舍的关键决策是否已记录
- **Risks**：审查中识别的风险缓解措施是否已补充
- **Open Questions**：遗留问题是否已列出并标注责任人

若 `design.md` 缺少以上任一项，补充后再进入阶段 5。

输出追加到：

```text
openspec/changes/<change-name>/design.md
```

> 🚩 **Red Flags（阶段 4）**：
> - ❌ 审查只覆盖根因，未检查 spec 覆盖和副作用
> - ❌ 只有 1 个方案就跳过对比和审查

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

> 🚩 **Red Flags（阶段 5）**：
> - ❌ 任务项包含 `TBD`、`TODO`、`适当处理`、`类似上面` 等不可执行描述
> - ❌ 任务未覆盖所有 delta spec requirements 和 scenarios
> - ❌ 缺少测试、验证、回滚、Jira 回写或 archive 步骤
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
3. **完成任务后必须立即更新 checkbox**：使用 StrReplace 将 `tasks.md` 中对应的 `[ ]` 改为 `[x]`，不得延后到一批任务结束后再批量更新。若跳过此步骤，阶段 6.4 验证器将报 CRITICAL 虚假未完成。
4. 如发现 spec 或 design 错误，先回写 artifacts，再继续实现。
5. 偏离计划时说明原因；若影响行为契约，回到阶段 3 或 4。

可选追踪注释：

```text
// fix <JIRA-ID>
```

若项目规范不接受修复注释，不强制添加，但必须在执行报告中列出修复点。

### 6.2.5 测试套件确保（必须，在进入 6.4 验证前）

所有 `tasks.md` checkbox 全部勾选后，在进入阶段 6.4 验证前，强制执行以下步骤：

读取 `ensure-tests` skill 的 SKILL.md，按其指令执行：

1. 检测项目技术栈与现有测试框架
2. 若框架缺失，按技术栈选型安装并配置
3. 以本次修复涉及的逻辑文件为重点作用域，生成单元测试（必须，排除 UI 层）并运行
4. 若检测到 E2E 框架，生成并运行 E2E 测试（可选）

**阻断条件**：单元测试运行失败时，不得进入阶段 6.4 验证；应先修复失败的测试或实现。

### 6.3 Superpowers 增强

检测到对应能力时使用：

- `test-driven-development`：有可测试行为时先写失败测试。
- `systematic-debugging`：测试、构建、类型或行为失败时先定位根因。
- `subagent-driven-development`：独立任务可一任务一上下文执行。
- `requesting-code-review`：高风险任务完成后做代码质量和 spec 合规审查。
- `verification-before-completion`：完成前必须有刚运行过的验证证据。

### 6.4 验证

必须覆盖：

1. OpenSpec 校验：
   - 若检测到 `openspec-verify-change` skill → 读取其 SKILL.md，委托执行验证。
   - 若不存在 → 直接运行 `openspec validate <change-name>` 或 `openspec validate --changes`（CLI 工具调用，非降级）。
2. 工程验证：测试、lint、类型检查、构建
3. 行为对照：逐条核对 delta spec requirements 和 scenarios
4. Jira 对照：复现步骤、期望/实际是否已闭环
5. 副作用检查：相关模块和平台是否受影响

> ⚠️ **验证报告诚实原则**：每一项必须在括号中明确标注"已执行（命令+输出摘要）"或"待执行（需人工操作的具体步骤）"，不得将"设计了验证场景"误写为"验证已通过"。AI 不能直接执行浏览器交互的步骤，必须诚实标注为"待执行"并给出具体操作指引。

验证输出格式：

输出格式见 [reference.md](reference.md)「阶段 6.4 验证结果」。

验证失败不得提交 PR。执行记录以 `tasks.md` checkbox、PR/MR 描述和 `design.md` 的 Verification Notes 为准。

> 🚩 **Red Flags（阶段 6）**：
> - ❌ 单元测试失败仍进入 6.4 验证
> - ❌ 实现中发现设计错误却继续硬做，未回写 artifacts
> - ❌ 偏离计划时未说明原因，或影响行为契约却未回到阶段 3/4

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

归档前同步步骤：

1. **若存在 delta specs**：调用 `openspec-sync-specs` skill（若已安装）将 delta specs 合并到主 `specs/<capability>/spec.md`，或让 `openspec-archive-change` 在归档过程中提示并处理同步。
2. **执行归档**：调用 `openspec-archive-change` skill（先读取其 SKILL.md，再按其指令执行）。

若 `openspec-archive-change` skill 执行失败，**不得**手动操作 `openspec/` 目录；应停止并提示用户检查 openspec 安装状态。

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

### 7.5 AI 工程沉淀

**OpenSpec artifacts**（`proposal.md`、`specs/`、`design.md`、`tasks.md`）是本 skill 的核心产出，正常归档流程落盘，不受以下门控限制。

**AI 工程知识**（`AGENTS.md`、`CLAUDE.md`、`.cursor/rules/`、项目内 skill 等）须先过沉淀价值门控：

- ✅ **建议固化**：高复用、已验证、对团队或工程有长期价值的经验（如困难/极难 bug 的排查模式）
- ❌ **不建议固化**：一次性经验、未验证判断、个人临时偏好、本次 change 专属配置
- **写入前必须等用户明确要求**：除非用户明确说「写入规则」「创建 skill」「更新文档」，否则只输出建议，不落盘

推荐沉淀载体：

| 载体 | 适用内容 |
|------|----------|
| `AGENTS.md` | 项目级、跨工具、团队共享的长期规则与工程约定 |
| `CLAUDE.md` | Claude Code 专属的行为约束、工作流偏好 |
| `.cursor/rules/` | Cursor 专属规则 |
| 项目内 skill | 步骤稳定、可复用的工作流 |
| 总结文档 | 一次性复盘、背景记录 |

> 🚩 **Red Flags（阶段 7）**：
> - ❌ 验证未通过就提交 PR
> - ❌ Jira 评论通过 `jira_transition_issue` 的 `comment` 参数传递（会被丢弃）
> - ❌ Jira 状态越权流转到「关闭」「验证通过」等
> - ❌ archive 失败后手动操作 `openspec/` 目录
> - ❌ PR 描述缺少 OpenSpec change 路径或验证证据

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
| 检测到原生 OPSX skills 却直接调 CLI 或手写 artifacts | 绕过 schema 模板，artifacts 不符规范 | 委托原生 skill（先读 SKILL.md）；CLI 仅允许作为工具命令（`openspec validate`、`openspec status` 等） |
| 阶段 2 分析后就创建 proposal（根因未与方案结合） | proposal 的 Why 和 What 割裂，artifact 需重写 | proposal 在阶段 4 方案选定后才创建，一次性写完整 |
| 使用不存在的 skill 名称（如 `openspec-apply`） | 读不到 SKILL.md，委托失败 | 正确名称：`openspec-apply-change`、`openspec-archive-change`、`openspec-verify-change` |
| 实现中发现设计错误却继续硬做 | artifacts 与代码分叉 | 回写 proposal/specs/design/tasks 后再继续 |

| 快速修复走了 OPSX 路径 | 流程过重，浪费时间 | 只需快速修复无需规范沉淀时，使用 `jira-fix-workflow` |
| workspace 多工程下未先定位工程根 | 门禁检查在 workspace 根执行而非工程目录，artifact 写入错误位置 | 阶段 0 第 4 步必须先做工程定位，确定工程根后再检查 openspec/ 和 OPSX skills |

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
