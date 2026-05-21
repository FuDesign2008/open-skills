---
name: opsx-solve-workflow
version: "1.1.0"
user-invocable: true
description: 当用户说"opsx解决"、"OpenSpec解决"、"规范化解决"、"创建OpenSpec变更"、"创建opsx变更"、"用OpenSpec分析"、"用OpenSpec修复"、"opsx自动解决"、"OpenSpec自动解决"、"opsx-solve"或"opsx-solve-workflow"时触发。适用于需要将分析、方案、计划、实现、验证和归档沉淀到OpenSpec artifacts的功能开发、Bug修复、重构和复杂工程任务。
---

# OPSX 七阶段问题解决工作流

> 将 `solve-workflow` 的七阶段 PDCA 纪律、OpenSpec/OPSX 的 artifact 持久化、Superpowers 的工程执行纪律组合起来。目标是：既不让 AI 跳过分析、方案、审查和验证，也不让关键结论只留在聊天上下文里。

## 核心定位

本 skill 用于“值得沉淀”的工程变更：需求、根因、行为变化、技术取舍、任务清单和验证结果都应写入 `openspec/changes/<change-name>/`，完成后通过 archive 合并到 `openspec/specs/`。

三者分工：

- **OpenSpec**：事实源与归档系统，回答“做什么、为什么”。
- **solve-workflow**：阶段门禁，回答“什么时候允许进入下一步”。
- **Superpowers**：可选工程增强，回答“怎么更可靠地执行”。

不替代普通 `solve-workflow`：

- 临时小修、单文件轻量修改、无需长期追溯的任务，优先用 `solve-workflow`。
- 涉及长期行为契约、团队评审、并行变更、需求审计、后续追溯的任务，使用本 skill。

## 调用约定

- **触发词**：opsx解决、OpenSpec解决、规范化解决、创建OpenSpec变更、创建opsx变更、用OpenSpec分析、用OpenSpec修复、opsx自动解决、OpenSpec自动解决、opsx-solve、opsx-solve-workflow
- **模式**：触发词含“自动”时进入自动模式；否则默认手动模式。
- **手动模式**：阶段 1、2、3、4、6、7 的关键出口必须等待用户确认。
- **自动模式**：自动推进到验证；阶段 3 审查最多循环 3 轮，超限暂停。

## 阶段 0：环境检查与路径选择

本 skill 要求 OpenSpec 完整初始化，不设降级路径。启动后依次执行两道硬性门禁：

### 门禁 1：OpenSpec 目录检查

检查当前项目根目录是否存在 `openspec/`：

- **存在** → 通过，继续门禁 2。
- **不存在** → **立即停止**，输出：

  ```
  本 skill 需要 OpenSpec 完整初始化。
  请先运行：openspec init
  完成后重新触发本 skill。
  ```

### 门禁 2：OPSX 原生 Skills 检查

扫描当前项目中所有已安装工具的 skills 目录（如 `.claude/skills/`、`.cursor/skills/` 等），检查是否存在以下必需的原生 OPSX skills：

| 所需 skill | 对应阶段 | 用途 |
|-----------|---------|------|
| `openspec-new-change` | 阶段 1.1 | 创建 change 目录 |
| `openspec-continue-change` | 阶段 1.2/2/3/4 | 逐步创建各 artifact |
| `openspec-apply-change` | 阶段 5 | 按 tasks 执行实现 |
| `openspec-archive-change` | 阶段 7 | 归档 change |

`openspec-verify-change` 为可选 skill，存在时在阶段 6 使用。

**扫描范围**：不同 AI 工具的 skills 目录不同（Claude Code 用 `.claude/skills/`，Cursor 用 `.cursor/skills/`，Cline 用 `.cline/skills/` 等）。应依次检查项目内所有存在的工具目录；只要在任一目录下找到对应 skill，即视为存在。

- **全部必需 skills 存在** → 建立 OPSX 原生 Skills 能力表，通过。
- **任一必需 skill 不存在** → **立即停止**，输出：

  ```
  openspec/ 目录已存在，但未检测到完整的 OPSX skills。
  请运行以下命令生成所需 skills 后，重新触发本 skill：
    openspec init    （首次初始化）
    openspec update  （已有项目，补全 skills）
  ```

### OPSX 原生 Skills 使用约定

两道门禁通过后，各阶段委托原生 skill 前必须遵守：

1. **调用前先读取 SKILL.md**：每次委托前必须先读取对应 skill 的 SKILL.md，不得凭记忆调用。
2. **本 skill 保留阶段门禁**：原生 skill 执行完成后，本 skill 继续执行阶段确认、暂停、循环审查等门禁逻辑。
3. **CLI 工具调用不是降级**：`openspec validate` 等 CLI 工具命令可直接使用，不属于「绕过原生 skills」。

### 通过后的准备步骤

1. 扫描可用 Superpowers 类 skill；若存在则记录，后续阶段按需调用；若不存在则静默降级，不阻断。
2. 判断使用已有 change 还是新建 change，并只准备候选名称：
   - 用户指定 change 名称时，优先使用该 change。
   - 未指定时，为新工作生成 kebab-case 候选名称，并在手动模式下请用户确认。
3. 准备创建方式，但不得在阶段 1.1 用户确认前创建目录：通过 `openspec-new-change` skill 创建 change（读取其 SKILL.md，按其指令执行）。

### Superpowers 渐进增强

Superpowers 是增强能力，不是硬依赖。检测到以下 skill 时，在对应阶段使用；未检测到时按本 skill 内置流程执行：

| Superpowers 能力 | 使用阶段 | 用途 |
|------------------|----------|------|
| `brainstorming` | 阶段 1-2 | 需求模糊时，一次一问、提出 2-3 个方案、确认设计 |
| `writing-plans` | 阶段 4 | 将 `tasks.md` 拆到可执行工程脚本粒度 |
| `using-git-worktrees` | 阶段 5 前 | 复杂或高风险实现前创建隔离工作区 |
| `test-driven-development` | 阶段 5 | 有测试价值的任务先写失败测试再实现 |
| `systematic-debugging` | 阶段 5-6 | 测试、构建或行为失败时先找根因 |
| `requesting-code-review` | 阶段 3 / 阶段 5 | 审查 spec 覆盖、设计风险和代码质量 |
| `verification-before-completion` | 阶段 6 | 用新鲜命令输出支撑完成判断 |
| `finishing-a-development-branch` | 阶段 7 | 归档前辅助分支收尾和交付决策 |

### 路径选择

根据任务选择路径，并在继续前声明：

| 路径 | 适用场景 | 要求 |
|------|----------|------|
| 完整路径 | 全新功能、复杂模块、需求模糊 | 阶段 1-7 全部执行；优先使用 `brainstorming` |
| 增量路径 | 存量行为修改、重构、普通 Bug | 阶段 1-7 执行，但 proposal/spec 可保持精简 |
| 精简路径 | 热修复、小范围高确定性变更 | 保留 proposal、delta spec、tasks、验证和归档，不跳过验证 |

执行中发现范围扩大时必须升级路径：精简 → 增量，增量 → 完整。手动模式下升级需用户确认。

## 阶段与 Artifact 映射

| 阶段 | 目标 | OpenSpec 落点 | 代码写入 |
|------|------|---------------|----------|
| 1. 明确与分析问题 | 对齐问题、验证存在性、定位根因 | 仅分析，不创建 artifact（结论留待阶段 2 落入 proposal） | 禁止 |
| 2. 探索方案 | 给出 2-5 个方案并选择 | `proposal.md`（完整）+ `specs/<capability>/spec.md`（delta specs），通过 `openspec-continue-change` | 禁止 |
| 3. 审查方案 | 审查有效性、风险、可行性 | `design.md`（通过 `openspec-continue-change`） | 禁止 |
| 4. 制定计划 | 拆成可执行任务 | `tasks.md`（通过 `openspec-continue-change`） | 禁止 |
| 5. 执行计划 | 按任务实现并勾选；任务全部完成后调用 `ensure-tests` 确保测试套件就位 | 更新 `tasks.md` checkbox（通过 `openspec-apply-change`）；测试文件（由 `ensure-tests` 生成） | 允许 |
| 6. 检查验证 | 测试、校验、对照 artifacts | 验证结论（通过 `openspec-verify-change` skill 或 `openspec validate`） | 禁止 |
| 7. 回顾归档 | 沉淀结果或进入下一轮 | `openspec/specs/` 更新 + `openspec/changes/archive/` 迁移（通过 `openspec-archive-change` skill） | 仅限归档/文档 |

阶段 1-4 禁止修改业务代码，但允许创建和更新 OpenSpec artifacts。若用户要求“只分析不落盘”，则仅输出阶段结论，不写 artifacts。

## 阶段 1：明确与分析问题

### 1.1 明确问题

若检测到 `brainstorming` 且需求模糊、范围较大或属于完整路径，先使用其提问和方案探索纪律：一次只问一个关键问题，优先明确目的、约束和成功标准。

手动模式必须先输出：

```text
【问题复述】...
【关键要素】目标：... / 约束：... / 背景：... / 期望结果：...
【OpenSpec 变更】建议 change 名称：...
【需要确认】是否按该 change 继续？
```

用户确认前，不创建 change，不修改任何文件。用户确认后：

1. 通过 `openspec-new-change` skill 创建 change 目录（读取其 SKILL.md，按其指令执行）。
2. 记录本轮路径选择（完整 / 增量 / 精简）。
3. 再进入 1.2 技术分析。

自动模式可跳过确认，但也必须先完成候选名称生成，再立即创建 change 并继续。

### 1.2 技术分析

执行只读调查：

1. 验证问题是否存在。
2. 定位相关代码、调用链、数据流。
3. 分析根因和影响范围。
4. 判断是否需要新 capability 或修改已有 capability。

🔌 **OPSX Skills 集成**：技术分析阶段**不创建任何 artifact**。根因分析结论（Why / Impact）会在阶段 2 方案选定后，作为上下文一并写入 `proposal.md`。

若发现问题不存在或描述与代码不符，暂停并让用户重新确认，不进入方案阶段。

### 🔬 打点调试（静态分析受阻时，主动升级为运行时调试）

**触发条件（满足任一即触发，在进入阶段 2 前优先处理）：**

- 根因置信度为「模糊」或「未知」——能定位到大概模块，但无法确定具体逻辑或触发路径
- 当前是重试/继续场景——已基于静态分析处理过一次，但问题仍然存在

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

5. **日志分析**：收到日志后，分析实际调用链和数据流，给出根因结论，更新 `proposal.md` 的 Why / Impact 小节

6. **打点清理建议**（可选）：根因确认后，说明哪些打点可删除，哪些值得转为正式的可开关监控

**工具限制**：✅ Read/Grep 辅助确定打点位置；❌ Edit/Write（打点代码由用户手动添加，或经用户明确确认后 AI 添加）；❌ 未经用户确认不得自行运行复现步骤

---

## 阶段 2：探索方案

基于阶段 1 输出 2-5 个方案，必须包含：

- 核心思路
- 涉及能力或行为变化
- 需要新增或修改的 OpenSpec capability
- 优点、缺点、复杂度、风险
- 推荐方案

若检测到 `brainstorming`，可用其“多方案 + 取舍 + 推荐”模式辅助阶段 2，但最终输出仍必须写入或准备写入 OpenSpec artifacts。

手动模式输出方案对比表后暂停，等用户选择。

🔌 **OPSX Skills 集成**：方案选定后，通过 `openspec-continue-change` skill 完成以下两步（每次调用创建一个 artifact，先读取其 SKILL.md，再按其指令执行）：

1. **创建 `proposal.md`**（change 的第一个 ready artifact）：把阶段 1.2 的根因分析（Why / Impact）和本阶段的方案选定（What Changes / Capabilities）整合成完整的 proposal。
2. **创建 delta specs**（proposal 完成后 specs 变为 ready）：在 `specs/<capability>/spec.md` 中写行为变化。

Delta spec 规范（由 `openspec-continue-change` skill 负责落实）：

- 只写行为变化：`## ADDED`、`## MODIFIED`、`## REMOVED`、`## RENAMED Requirements`
- 每个 requirement 必须包含至少一个 `#### Scenario:`

## 阶段 3：审查方案

对选定方案进行四维审查：

1. **解决有效性**：是否覆盖根因和目标行为。
2. **副作用与风险**：是否影响其他模块、性能、安全、兼容性。
3. **实现可行性**：涉及文件、依赖、迁移是否明确。
4. **规范符合度**：是否符合现有代码模式和 OpenSpec spec 约定。

若检测到 `requesting-code-review`，在通过前额外做一次“spec 合规审查”：proposal 是否解释 why，delta specs 是否覆盖行为变化，design 是否处理风险，tasks 是否覆盖 requirements。

🔌 **OPSX Skills 集成**：审查通过后，通过 `openspec-continue-change` skill 创建 `design.md`（先读取其 SKILL.md，再按其指令执行；proposal 完成后 design 即为 ready）。本 skill 不直接手写 design.md 内容。`design.md` 应覆盖的结构（由 skill 负责落实）：Context、Goals / Non-Goals、Decisions、Risks / Trade-offs、Migration Plan、Open Questions。

不通过时：

- 手动模式：输出审查报告，等待用户决定“修改方案 / 重选方案 / 继续”。
- 自动模式：根据问题自动优化方案并重新审查，最多 3 轮。

## 阶段 4：制定计划

🔌 **OPSX Skills 集成**：通过 `openspec-continue-change` skill 生成 `tasks.md`（先读取其 SKILL.md，再按其指令执行；specs + design 均完成后 tasks 变为 ready）。若同时检测到 `writing-plans` skill，先读取其 SKILL.md，将细化要求（目标文件、测试命令、预期结果、失败处理）作为上下文传递给 `openspec-continue-change` skill 执行。本 skill 不直接手写 tasks.md 内容。

tasks.md 规范（由 skill 负责落实）：

- 使用 checkbox，任务粒度足够小，顺序体现依赖关系
- 包含必要的测试、验证、文档或迁移步骤
- 禁止 `TBD`、`TODO`、`适当处理`、`类似上面` 等不可执行描述

手动模式输出计划并暂停，等待用户确认后才能进入执行。

## 阶段 5：执行计划

读取 `tasks.md`，按顺序实现：

1. 每次只处理当前最小任务。
2. 修改业务代码前确认相关 proposal、specs、design、tasks 已存在。
3. 完成任务后立即把 checkbox 改为 `[x]`。
4. 如果实现发现设计或 spec 不准确，先回写对应 artifact，再继续实现。
5. 偏离计划时说明原因；若偏离影响范围或行为契约，回到阶段 2 或阶段 3。

Superpowers 增强规则：

- 若检测到 `using-git-worktrees` 且任务复杂、高风险或用户要求隔离，执行前创建隔离 worktree。
- 若检测到 `test-driven-development` 且任务有可测试行为，先写失败测试，确认失败原因正确，再写实现。
- 若测试、构建、类型检查或行为验证失败，检测到 `systematic-debugging` 时先做根因分析，不得猜修。
- 若检测到 `requesting-code-review`，每完成一个高风险任务或一组相关任务后做代码质量审查。
- 若存在可并行任务且环境支持子代理，可借鉴 `subagent-driven-development`：一任务一上下文，完成后审查再合入。

### 测试套件确保（必须，在执行报告前）

所有 `tasks.md` checkbox 全部勾选后，在输出执行报告前，强制执行以下步骤：

读取 `ensure-tests` skill 的 SKILL.md，按其指令执行：

1. 检测项目技术栈与现有测试框架
2. 若框架缺失，按技术栈选型安装并配置
3. 以本次变更涉及的逻辑文件为重点作用域，生成单元测试（必须，排除 UI 层）并运行
4. 若检测到 E2E 框架，生成并运行 E2E 测试（可选）

**阻断条件**：单元测试运行失败时，不得进入阶段 6；应先修复失败的测试或实现，再输出执行报告。

🔌 **OPSX Skills 集成**：调用 `openspec-apply-change` skill 执行任务（先读取其 SKILL.md，再按其指令逐项完成 tasks）。`openspec-apply-change` skill 内部会通过 CLI 查询 change 状态和获取执行指令；本 skill 不直接调用 CLI 推进执行。

## 阶段 6：检查验证

验证必须覆盖三层：

1. **OpenSpec 校验**：
   - 若检测到 `openspec-verify-change` skill → 读取其 SKILL.md，委托执行验证。
   - 若不存在 → 直接运行 `openspec validate <change-name>` 或 `openspec validate --changes`（CLI 工具调用，非降级）。
2. **工程验证**：运行项目相关测试、类型检查、lint 或构建。
3. **行为对照**：逐条对照 delta spec 的 requirements 和 scenarios，确认实现覆盖。

若检测到 `verification-before-completion`，必须按其原则执行：只有刚运行过并亲自阅读过输出的命令，才能作为“通过”的证据。

输出格式：

```text
【验证结果】
- OpenSpec 校验：...
- 工程验证：...
- 行为对照：...
- 与 tasks.md 对比：...
- 副作用检查：...
- 是否可归档：是 / 否
```

手动模式在此暂停，等待用户确认是否进入归档。验证失败时不得归档；应回到阶段 3、4 或 5。

## 阶段 7：回顾归档

若验证通过，执行归档前检查：

- `tasks.md` 是否全部完成。
- delta specs 是否代表实际实现。
- 主 specs 是否会被正确更新。
- 用户是否确认归档。

🔌 **OPSX Skills 集成**：归档前执行以下步骤：

1. **若存在 delta specs**：调用 `openspec-sync-specs` skill（若已安装）将 delta specs 合并到主 `specs/<capability>/spec.md`，或让 `openspec-archive-change` 在归档过程中提示并处理同步。
2. **执行归档**：调用 `openspec-archive-change` skill（先读取其 SKILL.md，再按其指令执行）。

若 `openspec-archive-change` skill 执行失败，**不得**手动操作 `openspec/` 目录；应停止并提示用户检查 openspec 安装状态。

归档后必须检查 diff，确认主 specs 更新和 archive 目录迁移都进入当前工作区变更。若检测到 `finishing-a-development-branch`，在归档和 diff 检查完成后，再借鉴其流程做分支收尾决策：保留当前分支、创建 PR、合并或继续开发。不得在测试未通过、归档未完成或 diff 未审查时宣布完成。

### AI 工程沉淀载体选择

| 载体 | 适用内容 |
|------|----------|
| `AGENTS.md` | 项目级、跨工具、团队共享的长期规则与工程约定 |
| `CLAUDE.md` | Claude Code 专属的行为约束、工作流偏好或工具使用约定 |
| `.cursor/rules/` | Cursor 专属规则、文件模式规则、编辑器内 AI 指导 |
| 项目内 skill | 步骤稳定、可复用、未来可被明确触发的工作流或领域知识 |
| 总结文档 | 一次性复盘、背景记录、暂不适合固化为规则的经验 |

### 判断沉淀价值

**OpenSpec artifacts**（`proposal.md`、`specs/`、`design.md`、`tasks.md`）是本 skill 的核心产出，正常归档流程落盘，不受以下门控限制。

**AI 工程知识**（`AGENTS.md`、`CLAUDE.md`、`.cursor/rules/`、项目内 skill 等）须先过沉淀价值门控：

- ✅ **建议固化**：高复用、已验证、对团队或工程有长期价值的经验
- ❌ **不建议固化**：一次性经验、未验证判断、个人临时偏好、本次 change 专属配置
- **写入前必须等用户明确要求**：除非用户明确说「写入规则」「创建 skill」「更新文档」，否则只输出建议，不落盘

归档完成后输出：

```text
【回顾总结】
- 已完成变更：...
- 更新的 specs：...
- 归档位置：...
- 可复用经验：...
- 不建议固化的内容：...（一次性经验、未验证判断等，不写入长期规则）
- 推荐沉淀载体：AGENTS.md / CLAUDE.md / .cursor/rules/ / 项目内 skill / 总结文档 / 暂不沉淀，理由：...
- 是否需要用户确认写入：需要 / 不需要；若需要，等待用户明确要求后再落盘
- 后续建议：...
```

若不适合归档，保留 active change，并说明阻塞项和下一步。

## 常见错误

| 错误 | 后果 | 修正 |
|------|------|------|
| 只走 solve 流程，不写 artifacts | 下次会话丢失上下文 | 关键结论必须进入 `openspec/changes/<name>/` |
| 只写 OpenSpec 文件，不做阶段审查 | 规格看似完整但方案有风险 | 阶段 2、3 必须输出方案和审查结论 |
| 手动模式确认前创建 change | 破坏阶段 1.1 门禁，可能生成错误目录 | 阶段 0 只准备候选名称，确认后才创建 |
| 把 Superpowers 当硬依赖 | 非 Superpowers 环境无法使用 | Superpowers 只做渐进增强，缺失时降级 |
| 检测到 Superpowers 却凭记忆使用 | 规则可能过期 | 必须读取对应 skill 的当前说明后执行 |
| spec 写实现细节 | 行为契约污染，后续维护困难 | 实现细节放 `design.md` 和 `tasks.md` |
| `MODIFIED` 只写片段 | archive 时可能丢失原 requirement | 复制完整 requirement block 再修改 |
| 未验证就 archive | 主 specs 记录了未实现或错误行为 | 阶段 6 未通过不得归档 |
| 分支收尾早于 archive | 归档产生的 specs 或 archive 目录可能遗漏出最终 diff | 先 archive 并检查 diff，再做 PR/合并/保留决策 |
| 实现中发现设计错误却继续硬做 | artifacts 与代码分叉 | 回写 proposal/specs/design/tasks 后再继续 |
| `openspec/` 不存在却强行推进 | 无 schema/context，artifacts 结构混乱 | 阶段 0 门禁 1 未通过时必须停止，要求用户运行 `openspec init` |
| 检测到原生 OPSX skills 却直接调 CLI 或手写 artifacts | 绕过 schema 模板和 context injection，artifacts 不符规范 | 委托原生 skill（先读 SKILL.md）；CLI 仅允许作为工具命令（`openspec validate`、`openspec status` 等） |
| Phase 1.2 创建 proposal（根因未与方案结合） | proposal 的 Why 和 What 割裂，artifact 需重写 | proposal 在阶段 2 方案选定后才创建，通过 `openspec-continue-change` 一次性写完整 |
| 使用不存在的 skill 名称（如 `openspec-apply`、`openspec-archive`） | 读不到 SKILL.md，委托失败 | 正确名称：`openspec-apply-change`、`openspec-archive-change`、`openspec-verify-change` |
| 阶段7默认将可复用经验写入 AGENTS.md / CLAUDE.md / skill（OpenSpec artifacts 除外） | 长期规则被一次性经验污染 | 阶段7只输出沉淀建议；必须等用户明确要求后才落盘 |

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
