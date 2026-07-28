---
name: opsx-solve-workflow
version: "1.10.0"
user-invocable: true
description: 当用户说"opsx解决"、"OpenSpec解决"、"规范化解决"、"创建OpenSpec变更"、"创建opsx变更"、"用OpenSpec分析"、"用OpenSpec修复"、"opsx自动解决"、"OpenSpec自动解决"、"opsx-solve"或"opsx-solve-workflow"时触发。适用于需要将分析、方案、计划、实现、验证和归档沉淀到OpenSpec artifacts的功能开发、Bug修复、重构和复杂工程任务。
dependencies:
  - solution-review
  - code-design-review
  - hybrid-debug
  - runtime-evidence-debug
  - browser-debug-toolkit
  - node-version-discipline
  - learn-and-improve
  - workflow-mode-lifecycle
  - clarifying-question-discipline
  - known-issue-research
  - analysis-core
  - ensure-tests
  - merge-discipline
  - pdca-review-orchestration
  - openspec-workspace-gates
---

# OPSX 八阶段问题解决工作流

> 将 `solve-workflow` 的八阶段 PDCA 纪律与 OpenSpec/OPSX 的 artifact 持久化组合起来。目标是：既不让 AI 跳过分析、方案、审查和验证，也不让关键结论只留在聊天上下文里。
>
> **输出格式参考**：各阶段输出模板见 [reference.md](reference.md)。

## 核心定位

本 skill 用于“值得沉淀”的工程变更：需求、根因、行为变化、技术取舍、任务清单和验证结果都应写入 `openspec/changes/<change-name>/`，完成后通过 archive 合并到 `openspec/specs/`。

二者分工：

- **OpenSpec**：事实源与归档系统，回答“做什么、为什么”。
- **solve-workflow 式门禁**：阶段门禁，回答“什么时候允许进入下一步”。

不替代普通 `solve-workflow`：

- 临时小修、单文件轻量修改、无需长期追溯的任务，优先用 `solve-workflow`。
- 涉及长期行为契约、团队评审、并行变更、需求审计、后续追溯的任务，使用本 skill。

## 调用约定

- **触发词**：opsx解决、OpenSpec解决、规范化解决、创建OpenSpec变更、创建opsx变更、用OpenSpec分析、用OpenSpec修复、opsx自动解决、OpenSpec自动解决、opsx-solve、opsx-solve-workflow
- **模式**：触发词含“自动”时进入自动模式；否则默认手动模式。
- **手动模式**：阶段 1、2、3、4、5、7、8 的关键出口必须等待用户确认。
- **自动模式**：自动推进到验证；阶段 4 审查最多循环 3 轮，超限暂停。

**强依赖 skill**（frontmatter `dependencies`；启动时须先通过「前置 skill 检查」，缺失即中止流程）：
- `pdca-review-orchestration`（阶段 4 审查编排；依赖 `solution-review` 与 `code-design-review`）
- `hybrid-debug` / `runtime-evidence-debug` / `browser-debug-toolkit`（经 `analysis-core` 委托；阶段 2 + 阶段 7）
- `analysis-core`（阶段 2 分析方法论单源：临时改动门控 / 打点调试 / 分析步骤骨架 / 调试-验证闭环）
- `node-version-discipline`（阶段 7 Node 版本对齐）
- `learn-and-improve`（阶段 8 复盘改进与经验沉淀）
- `workflow-mode-lifecycle`（自动/手动模式生命周期）
- `clarifying-question-discipline`（主动提问硬纪律与调查优先）
- `known-issue-research`（阶段 2 调研路由 / 已知问题快搜 / 行业通病评估）
- `ensure-tests`（阶段 6 测试确保：有测试基建时补全并运行；无基建经用户确认后搭建）
- `merge-discipline`（阶段 8 合并纪律）
- `openspec-workspace-gates`（阶段 0 OpenSpec 工程与原生 skill 门禁）

## 前置 skill 检查

> 启动时（阶段 0 前置检查通过后、阶段 1 之前）核对 frontmatter `dependencies`：扫描可用 skill，任一缺失 → 结构化提示并**立即中止**（格式见 `solve-workflow/reference.md`「前置 skill 检查 — 缺失提示」）。

> **不降级原则**：强依赖缺失即中止，不得用简化审查/调试降级运行。

## 模式生命周期

> 自动模式的进入、持续与退出规则，避免模式粘滞导致用户未察觉的自动决策。核心规则（自动恢复手动 / 显式重进 / 隐式延续不激活 / 批量场景）由强依赖 skill `workflow-mode-lifecycle` 承载（前置检查已保证可用），本节不再内联重复。

### OpenSpec 特有说明

- 阶段 8 归档完成后，模式自动恢复手动
- 若用户决定进入下一轮 PDCA（回到阶段 3/4/5），默认手动模式
- 归档中断（如 `openspec-archive-change` skill 执行失败）也视为流程中断，恢复手动

---

## 阶段 0：环境检查与路径选择

本 skill 要求 OpenSpec 完整初始化，不设降级路径。加载 `openspec-workspace-gates` 并执行其工程定位、`openspec/` 检查和精确原生 OPSX skill 门禁；通过后，本工作流保留阶段门禁与后续编排。

### 通过后的准备步骤

1. 判断使用已有 change 还是新建 change，并只准备候选名称：
   - 用户指定 change 名称时，优先使用该 change。
   - 未指定时，为新工作生成 kebab-case 候选名称，并在手动模式下请用户确认。
2. 准备创建方式，但不得在阶段 1 用户确认前创建目录：通过 `openspec-new-change` skill 创建 change（读取其 SKILL.md，按其指令执行）。

### 路径选择

根据任务选择路径，并在继续前声明：

| 路径 | 适用场景 | 要求 |
|------|----------|------|
| 完整路径 | 全新功能、复杂模块、需求模糊 | 阶段 1-8 全部执行 |
| 增量路径 | 存量行为修改、重构、普通 Bug | 阶段 1-8 执行，但 proposal/spec 可保持精简 |
| 精简路径 | 热修复、小范围高确定性变更 | 保留 proposal、delta spec、tasks、验证和归档，不跳过验证 |

执行中发现范围扩大时必须升级路径：精简 → 增量，增量 → 完整。手动模式下升级需用户确认。

## 阶段与 Artifact 映射

| 阶段 | 目标 | OpenSpec 落点 | 代码写入 |
|------|------|---------------|----------|
| 1. 明确问题 | 对齐问题、提取要素、澄清疑问 | 仅分析，不创建 artifact | 禁止 |
| 2. 分析问题 | 验证存在性、定位根因、评估影响 | 仅分析，不创建 artifact（结论留待阶段 3 落入 proposal） | 禁止 |
| 3. 探索方案 | 给出 2-5 个方案并选择 | `proposal.md`（完整）+ `specs/<capability>/spec.md`（delta specs），通过 `openspec-continue-change` | 禁止 |
| 4. 审查方案 | 审查有效性、风险、可行性 | `design.md`（通过 `openspec-continue-change`） | 禁止 |
| 5. 制定计划 | 拆成可执行任务 | `tasks.md`（通过 `openspec-continue-change`） | 禁止 |
| 6. 执行计划 | 按任务实现并勾选；任务全部完成后调用 `ensure-tests` 确保测试套件就位 | 更新 `tasks.md` checkbox（通过 `openspec-apply-change`）；测试文件（由 `ensure-tests` 生成） | 允许 |
| 7. 检查验证 | 测试、校验、对照 artifacts | 验证结论（通过 `openspec-verify-change` skill 或 `openspec validate`） | 禁止 |
| 8. 回顾归档 | 沉淀结果或进入下一轮 | `openspec/specs/` 更新 + `openspec/changes/archive/` 迁移（通过 `openspec-archive-change` skill） | 仅限归档/文档 |

阶段 1-5 禁止修改业务代码，但允许创建和更新 OpenSpec artifacts。若用户要求“只分析不落盘”，则仅输出阶段结论，不写 artifacts。

## 阶段 1：明确问题

**⚠️ 主动提问**：遵循 `clarifying-question-discipline`（一次一问、多轮问清；问清优先，不急着答）。

手动模式必须依次完成以下步骤：

1. **问题复述** - 用自己的话重新描述用户的问题
2. **关键要素提取** - 目标、约束、背景、期望结果
3. **疑问点列出** - 列出需要进一步确认的地方；若向用户提问，一次只问 1 个最关键的，得到回答后再问下一个
3.5 **Scope 拆解**（若适用）- 若问题涉及多个独立子系统，先协助拆解：独立模块、依赖关系、建议处理顺序，再对首个子问题进入阶段 2 技术分析
4. **等待用户确认**

**工具限制**：禁止 Read/Grep/SemanticSearch，以下情况**例外**：
- 用户消息中含 `@文件路径`（含可选行号）
- 用户消息中粘贴了代码片段
- 用户明确指出了「函数/类名 + 所在文件」的组合

例外时：**仅读取用户直接引用的文件与行号**，不得扩展到其他文件。读取结果仅用于辅助理解问题，**阶段 1 输出中不得出现技术分析结论**。

手动模式输出格式见 [reference.md](reference.md)「阶段 1 明确问题」。

用户确认前，不创建 change，不修改任何文件。用户确认后：

1. 通过 `openspec-new-change` skill 创建 change 目录（读取其 SKILL.md，按其指令执行）。
2. 记录本轮路径选择（完整 / 增量 / 精简）。
3. 再进入阶段 2 技术分析。

自动模式可跳过确认，但也必须先完成候选名称生成，再立即创建 change 并继续。

## 阶段 2：分析问题

> 分析方法论单源：`analysis-core`。本阶段不留实现变更——修复归阶段 6。


### 委托 `analysis-core`

加载强依赖 `analysis-core`，按其 §§1–3 执行。本工作流映射（号+名）：

- `{next-stage}` = 阶段 3「探索方案」
- `{root-cause step}` = 步骤 5；`{impact-assessment step}` = 步骤 7；`{upstream-eval step}` = 步骤 6

🔌 **OPSX**：本阶段**不创建 artifact**；Why / Impact 在阶段 3 方案选定后写入 `proposal.md`。

若存在性失败或描述不符，暂停等用户确认，不进入方案阶段。

---

## 阶段 3：探索方案

> 原则：基于阶段 2 的分析，提供 2-5 个解决方案；方案中剔除非必要功能与过度设计（YAGNI）

基于阶段 2 输出 2-5 个方案，必须包含：

- 核心思路
- 涉及能力或行为变化
- 需要新增或修改的 OpenSpec capability
- 优点、缺点、复杂度、风险
- 推荐方案


手动模式输出方案对比表后暂停，等用户选择。

🔌 **OPSX Skills 集成**：方案选定后，通过 `openspec-continue-change` skill 完成以下两步（每次调用创建一个 artifact，先读取其 SKILL.md，再按其指令执行）：

1. **创建 `proposal.md`**（change 的第一个 ready artifact）：把阶段 2 的根因分析（Why / Impact）和本阶段的方案选定（What Changes / Capabilities）整合成完整的 proposal。
2. **创建 delta specs**（proposal 完成后 specs 变为 ready）：在 `specs/<capability>/spec.md` 中写行为变化。

Delta spec 规范（由 `openspec-continue-change` skill 负责落实）：

- 只写行为变化：`## ADDED`、`## MODIFIED`、`## REMOVED`、`## RENAMED Requirements`
- 每个 requirement 的标题格式必须是 `### Requirement: <描述 含 SHALL 或 MUST>`
- 每个 requirement 必须包含至少一个 `#### Scenario:` 块

> 常见错误：`### REQ-001:`（格式错）、`### Requirement: 初始化`（缺 SHALL/MUST）、无 Scenario（缺场景）。
> 这三类均会导致 `openspec validate` 失败。格式示例见 `openspec-continue-change` skill。

### Red Flags — 阶段 3 禁止行为

- 只生成 1 个方案，以「方向已明确」为由跳过方案对比
- 手动模式下用户未选方案时自行推进到审查阶段
- 方案中包含非必要功能或过度设计（违反 YAGNI）

## 阶段 4：审查方案

加载 `pdca-review-orchestration` 并按其完整审查契约执行。本工作流映射：`{next-stage}` = 阶段 5「制定计划」；`{artifact-sink}` = 通过 `openspec-continue-change` 创建的 `design.md`；`{extra-dimensions}` = Spec 合规（proposal why、delta specs 行为、design 风险、tasks 覆盖 requirements）；`{batch-overcap-behavior}` = `N/A`。审查通过后按原生 skill 创建 `design.md`。

**非阻断问题**（可标注为建议，但不阻止通过；**不得**把「有更优架构但近端可维护」当作非阻断）：

- 已有缓解措施的低风险项
- 代码风格偏好（不影响正确性与结构）
- 可在后续迭代中优化的非结构性性能改进
- 经明确接受的 Prudent-Deliberate 技术债（含还款计划）

### Red Flags — 阶段 4 禁止行为

- 跳过方案审查直接进入阶段 5（风险未识别）
- 在审查阶段修改代码（违反只读约束）
- 自动模式审查不通过时不优化方案，直接进入阶段 5
- 自动模式审查循环超过 3 轮上限仍不暂停
- 自动模式优化方案时未输出优化说明，导致审查记录不可追溯
- 手动模式下用户未明确判定通过/不通过，AI 自行推进

## 阶段 5：制定计划

🔌 **OPSX Skills 集成**：通过 `openspec-continue-change` skill 生成 `tasks.md`（先读取其 SKILL.md，再按其指令执行；specs + design 均完成后 tasks 变为 ready）。本 skill 不直接手写 tasks.md 内容。

tasks.md 规范（由 skill 负责落实）：

- 使用 checkbox，任务粒度足够小，顺序体现依赖关系
- 包含必要的测试、验证、文档或迁移步骤
- 禁止 `TBD`、`TODO`、`适当处理`、`类似上面` 等不可执行描述

手动模式输出计划并暂停，等待用户确认后才能进入阶段 6 执行。

## 阶段 6：执行计划

读取 `tasks.md`，按顺序实现：

1. 每次只处理当前最小任务。
2. 修改业务代码前确认相关 proposal、specs、design、tasks 已存在。
3. **完成任务后必须立即更新 checkbox**：使用 StrReplace 将 tasks.md 中对应的 `[ ]` 改为 `[x]`，不得延后到一批任务结束后再批量更新。若跳过此步骤，阶段 7 验证器将报 CRITICAL 虚假未完成。
4. 如果实现发现设计或 spec 不准确，先回写对应 artifact，再继续实现。
5. 偏离计划时说明原因；若偏离影响范围或行为契约，回到阶段 4 或阶段 5。

### 测试套件确保（必须，在执行报告前）

所有 `tasks.md` checkbox 全部勾选后，在输出执行报告前，强制执行以下步骤：

读取并调用 `ensure-tests`，声明 `mode=mandatory`，作用域为本次变更的逻辑文件；其失败或拒绝必要脚手架时阻断进入阶段 7。

🔌 **OPSX Skills 集成**：调用 `openspec-apply-change` skill 执行任务（先读取其 SKILL.md，再按其指令逐项完成 tasks）。`openspec-apply-change` skill 内部会通过 CLI 查询 change 状态和获取执行指令；本 skill 不直接调用 CLI 推进执行。

## 阶段 7：检查验证

验证必须覆盖三层：

1. **OpenSpec 校验**：
   - 若检测到 `openspec-verify-change` skill → 读取其 SKILL.md，委托执行验证。
   - 若不存在 → 直接运行 `openspec validate <change-name>` 或 `openspec validate --changes`（CLI 工具调用，非降级）。
**Node 版本对齐（前置）**：调用 `node-version-discipline` 对齐项目声明的 Node 版本后，再运行下方工程验证命令。

2. **工程验证**：运行项目相关测试、类型检查、lint 或构建（对齐版本下执行）。
3. **行为对照**：逐条对照 delta spec 的 requirements 和 scenarios，确认实现覆盖。
4. **调试-验证闭环**：若阶段 2 用了调试 skill 定位根因，按 `analysis-core` §4 用**同一 skill** 验证修复（而非只跑测试）

验证结论须基于本轮刚运行并亲自阅读过输出的命令；不得把「设计了场景」写成「已通过」。

输出格式见 [reference.md](reference.md)「阶段 7 检查验证」。

> 按 `pdca-review-orchestration` 的验证报告诚实规则标注每项结果。

手动模式在此暂停，等待用户确认是否进入归档。验证失败时不得归档；应回到阶段 4、5 或 6。

### 测试执行

若阶段 6 执行报告涉及测试（如单元测试、集成测试、手动验证步骤）：

- **AI 可执行**：使用 Bash 运行测试命令（如 `npm test`、`pytest`、`go test`），将结果纳入检查结论
- **AI 无法执行**（无 Bash、环境限制、测试需人工操作）：**明确提醒用户**：「本次修改涉及测试，请自行执行 [具体测试命令/步骤] 验证，确认通过后再收尾」

## 阶段 8：回顾归档

若验证通过，执行归档前检查：

- `tasks.md` 是否全部完成。
- delta specs 是否代表实际实现。
- 主 specs 是否会被正确更新。
- 用户是否确认归档。

🔌 **OPSX Skills 集成**：归档前执行以下步骤：

1. **若存在 delta specs**：调用 `openspec-sync-specs` skill（若已安装）将 delta specs 合并到主 `specs/<capability>/spec.md`，或让 `openspec-archive-change` 在归档过程中提示并处理同步。
2. **执行归档**：调用 `openspec-archive-change` skill（先读取其 SKILL.md，再按其指令执行）。

若 `openspec-archive-change` skill 执行失败，**不得**手动操作 `openspec/` 目录；应停止并提示用户检查 openspec 安装状态。

归档后必须检查 diff，确认主 specs 更新和 archive 目录迁移都进入工程根的 git 工作区变更。再做分支收尾决策：保留当前分支、创建 PR、合并或继续开发。不得在测试未通过、归档未完成或 diff 未审查时宣布完成。

> **顺序约束**：归档 + diff 检查 → 分支收尾决策 → 合并纪律 `merge-discipline` → 执行合并。选择「保留当前分支」「继续开发」不触发合并纪律。

#### 合并纪律（merge-discipline skill）

> 合并动作执行前加载 `merge-discipline`，按 Part A → B → C → D 执行；合并前检查清单见 `merge-discipline/reference.md`。用户直接说 merge 也必须加载，不得隐式跳过。

### 复盘改进（委托 learn-and-improve）

归档与分支收尾完成后，加载 `learn-and-improve` 并按其框架复盘；OpenSpec artifacts 正常归档不受其沉淀价值门控限制。

> **OpenSpec artifacts**（`proposal.md`、`specs/`、`design.md`、`tasks.md`）是本 skill 的核心产出，正常归档流程落盘，不受 `learn-and-improve` 的沉淀价值门控限制。
> **AI 工程知识**（`AGENTS.md`、`CLAUDE.md`、`.cursor/rules/`、项目内 skill 等）的沉淀价值判断与载体选择，由 `learn-and-improve` 的决策树负责；写入前必须等用户明确要求。

归档完成后输出格式见 [reference.md](reference.md)「阶段 8 回顾归档」。

若不适合归档，保留 active change，并说明阻塞项和下一步。

## 常见错误

> 只记本 skill 非直觉陷阱。合并/覆盖率/tip → `merge-discipline`；工程根/`openspec/`/原生 skill 门禁 → `openspec-workspace-gates`。不复述阶段正文已写明的规则。

| 错误 | 后果 | 修正 |
|------|------|------|
| 手动模式确认前创建 change | 破坏阶段 1 门禁，可能生成错误目录 | 阶段 0 只准备候选名称，确认后才创建 |
| 根因分析后立刻创建 proposal（方案未定） | Why/What 割裂，artifact 需重写 | proposal 在阶段 3 方案选定后才创建，经 `openspec-continue-change` 一次写完整 |
| 门禁把旧名/短名当通过（如 `openspec-propose`、`openspec-apply`） | 旧 schema 手写或读不到 SKILL.md | 只接受精确四名：`openspec-new-change` / `openspec-continue-change` / `openspec-apply-change` / `openspec-archive-change`（verify 可选） |
| `MODIFIED` 只写片段 | archive 时丢失原 requirement | 复制完整 requirement block 再改 |
| 分支收尾选「保留/继续开发」却跑覆盖率门控 | 非合并场景误触发门控 | 门控仅「合并」决策触发 |
| `ask`/未配置时未询问就默认跑 analyzer | 强迫无覆盖率需求的工程跑门控 | 见 `merge-discipline` Part C：先解析偏好，`ask` 必须询问 |
| 一批任务做完才批量勾 `tasks.md` checkbox | 验证器报 CRITICAL 虚假未完成 | 每完成一项立刻把对应 `[ ]` 改为 `[x]` |
| 验证报告把「设计了场景」写成「验证已通过」 | 用户接受虚假通过 | 每项标注「已执行（命令+输出摘要）」或「待执行（操作指引）」 |
| delta requirement 无 SHALL/MUST 或无 Scenario | `openspec validate` 反复失败 | 描述含 SHALL/MUST；用 `#### Scenario:` 补场景 |
| 浏览器断言基于猜测 DOM 而非实察 | waitForFunction 超时 | 先 evaluate 真实值再写断言 |

## 最小成功标准

一次完整执行至少产生或更新：

- `openspec/changes/<change-name>/proposal.md`
- `openspec/changes/<change-name>/specs/<capability>/spec.md`
- `openspec/changes/<change-name>/design.md`
- `openspec/changes/<change-name>/tasks.md`

完成后：

- 所有 tasks 已勾选。
- `ensure-tests` 执行完成：单元测试全部通过；E2E 测试通过或已说明跳过原因。
- OpenSpec 校验通过。
- 项目验证通过或明确列出人工验证项。
- 用户确认后归档，或保留 active change 并说明未归档原因。


