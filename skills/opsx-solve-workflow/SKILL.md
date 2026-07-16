---
name: opsx-solve-workflow
version: "1.7.0"
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
---

# OPSX 七阶段问题解决工作流

> 将 `solve-workflow` 的七阶段 PDCA 纪律、OpenSpec/OPSX 的 artifact 持久化、Superpowers 的工程执行纪律组合起来。目标是：既不让 AI 跳过分析、方案、审查和验证，也不让关键结论只留在聊天上下文里。
>
> **输出格式参考**：各阶段输出模板见 [reference.md](reference.md)。

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

**强依赖 skill**（frontmatter `dependencies`）：
- `solution-review`（阶段 3 决策级审查）
- `code-design-review`（阶段 3 代码设计审查）
- `hybrid-debug`（阶段 1.2 Hybrid 全栈调试）
- `runtime-evidence-debug`（阶段 1.2 运行时证据调试）
- `browser-debug-toolkit`（阶段 1.2 + 阶段 6 浏览器 DevTools 调试）
- `learn-and-improve`（阶段 7 回顾总结与经验沉淀）

启动时须先通过「前置 skill 检查」，缺失即中止流程。

## 前置 skill 检查

> 本 skill 通过 frontmatter `dependencies` 声明对 7 个 skill 的强依赖。启动时（阶段 0 前置检查通过后、阶段 1 之前）必须执行本检查。

1. 扫描可用 skill（查 `<available_items>` 或用 `skill` 工具）
2. 核对 7 个 dependencies 是否都在可用列表中
3. 全部存在 → 继续后续流程
4. 任一缺失 → 输出结构化提示并**立即中止流程**（格式同 `solve-workflow` 的前置检查缺失提示，见 `solve-workflow/reference.md`「前置 skill 检查 — 缺失提示」）

> **不降级原则**：强依赖缺失即中止，不得用简化审查/调试降级运行。

## 模式生命周期

> 自动模式的进入、持续与退出规则，避免模式粘滞导致用户未察觉的自动决策。

### 核心规则：自动恢复手动

自动模式在以下情况**自动恢复为手动模式**：

| 恢复场景 | 说明 |
|---------|------|
| 正常完成阶段 1-7 全流程 | 无论收尾还是决定进入下一轮 PDCA 循环 |
| 流程被任意中断 | 失败终止、用户主动停止、审查超限暂停后终止 |

### 重新进入自动模式

恢复手动后，用户必须**显式触发**才能再次进入自动模式（如说「opsx 自动解决 xxx」「切换自动模式」）。隐式延续（如「继续」「再改一下」）**不会**重新激活自动模式。

### OpenSpec 特有说明

- 阶段 7 归档完成后，模式自动恢复手动
- 若用户决定进入下一轮 PDCA（回到阶段 2/3/4），默认手动模式
- 归档中断（如 `openspec-archive-change` skill 执行失败）也视为流程中断，恢复手动

---

## 阶段 0：环境检查与路径选择

本 skill 要求 OpenSpec 完整初始化，不设降级路径。启动后依次执行三道门禁（门禁 0 定位工程 → 门禁 1 检查 OpenSpec 目录 → 门禁 2 检查 OPSX skills）：

### 门禁 0：OpenSpec 工程定位

> 本步骤在门禁 1 之前执行，确定本次变更的目标工程根目录（后续简称**工程根**）。门禁 1、门禁 2 的检查以及后续所有阶段的 `openspec/` 路径解析和 CLI 命令执行，均基于此工程根。

**为什么需要**：在 Workspace（多工程工作区）场景下，当前工作目录（cwd）可能不是 OpenSpec 工程根——OpenSpec 初始化在 workspace 下的某个子工程目录中。本步骤负责定位到真正的工程根。

**定位优先级**（依次尝试，命中即停止）：

1. **cwd 即工程根**：cwd 下存在 `openspec/` 目录 → 工程根 = cwd。（单工程场景，行为与原有完全一致）
2. **当前编辑文件推断**：若可获取当前正在编辑的文件路径，从该文件所在目录向上逐级查找，第一个含 `openspec/` 的目录即为工程根。
3. **cwd 子目录扫描**：扫描 cwd 的直接子目录，查找含 `openspec/` 的目录：
   - 仅一个命中 → 工程根 = 该子目录
   - 多个命中 → 列出所有候选工程，让用户选择
4. **均未命中** → 输出："未在当前目录及其子目录中找到 OpenSpec 工程。请 cd 到已初始化 OpenSpec 的工程目录，或运行 `openspec init`。" 并停止。

**渐进增强**：若检测到 `ows:select` skill 或 `workspace_list` 工具，可利用其 workspace 工程列表辅助第 3 步的子目录扫描。不存在时按通用扫描逻辑执行。

**定位结果**（必须输出）：

```text
【工程定位结果】目标工程根：<绝对路径>
```

- 唯一命中（优先级 1/2/3a）：输出定位结果后继续门禁 1。
- 多候选（优先级 3b）：列出候选，等用户选择后输出定位结果，再继续门禁 1。

**后续使用约定**：本 skill 中所有 `openspec/`、`openspec/changes/`、`openspec/specs/` 等路径，均**相对于工程根**解析。`openspec` CLI 命令（init/validate/list/status/archive 等）均在工程根目录下执行。

**执行约定**：定位后，通过 Bash `cd "<工程根绝对路径>"` 切换工作目录。后续所有 Read/Write/Bash 操作、`openspec` CLI 命令、委托原生 OPSX skill 均在工程根下执行。若无法切换 cwd，则所有 `openspec/` 路径必须使用工程根的绝对路径。

### 门禁 1：OpenSpec 目录检查

> 基于门禁 0 定位到的工程根检查。

检查工程根目录是否存在 `openspec/`：

- **存在** → 通过，继续门禁 2。
- **不存在** → **立即停止**，输出：

  ```
  本 skill 需要 OpenSpec 完整初始化。
  请先运行：openspec init
  完成后重新触发本 skill。
  ```

### 门禁 2：OPSX 原生 Skills 检查

扫描工程根中所有已安装工具的 skills 目录（如 `.claude/skills/`、`.cursor/skills/` 等），检查是否存在以下必需的原生 OPSX skills：

| 所需 skill | 对应阶段 | 用途 |
|-----------|---------|------|
| `openspec-new-change` | 阶段 1.1 | 创建 change 目录 |
| `openspec-continue-change` | 阶段 1.2/2/3/4 | 逐步创建各 artifact |
| `openspec-apply-change` | 阶段 5 | 按 tasks 执行实现 |
| `openspec-archive-change` | 阶段 7 | 归档 change |

`openspec-verify-change` 为可选 skill，存在时在阶段 6 使用。

**扫描范围**：不同 AI 工具的 skills 目录不同（Claude Code 用 `.claude/skills/`，Cursor 用 `.cursor/skills/`，Cline 用 `.cline/skills/` 等）。应依次检查工程根内所有存在的工具目录；只要在任一目录下找到对应 skill，即视为存在。

> ⚠️ **判断规则（严格）**：必须按上表的**精确 skill 名称**逐一核查。
> 找到其他名称的 openspec skill（如旧版的 `openspec-propose`）**不算通过**，
> 不得以任何形式降级为手写 artifacts 或绕过原生 skill 流程。
> 版本不匹配与 skill 缺失属于同等严重的阻断条件。

- **全部必需 skills 存在** → 建立 OPSX 原生 Skills 能力表，通过。
- **任一必需 skill 不存在** → **立即停止**，输出：

  ```
  openspec/ 目录已存在，但未检测到完整的 OPSX skills。
  请运行以下命令生成所需 skills 后，重新触发本 skill：
    openspec init    （首次初始化）
    openspec update  （已有项目，补全 skills）
  ```

### OPSX 原生 Skills 使用约定

三道门禁通过后，各阶段委托原生 skill 前必须遵守：

1. **调用前先读取 SKILL.md**：每次委托前必须先读取对应 skill 的 SKILL.md，不得凭记忆调用。
2. **本 skill 保留阶段门禁**：原生 skill 执行完成后，本 skill 继续执行阶段确认、暂停、循环审查等门禁逻辑。
3. **CLI 工具调用不是降级**：`openspec validate` 等 CLI 工具命令可直接使用，不属于「绕过原生 skills」。

### 通过后的准备步骤

1. **环境能力探索**：使用当前平台的 skill 发现能力，检查可用的 skill、agent、插件列表。按以下能力类型关键词匹配可用 skill/agent 的 name 和 description：

   | 能力类型 | 匹配关键词 | 对应阶段 | 用途 |
   |---------|-----------|---------|------|
   | 🔍 调试分析 | debug, root-cause, investigate, systematic-debugging | 阶段 1（技术分析） | 辅助根因定位、假设驱动调查 |
   | 🌐 Web 调研 | research, web, look up, investigate, web-research, effective-web-research | 阶段 1.2（步骤 2.5/3.5/3.6/5.5） | 外部 web 调研纪律：Step 0 分流 + 4 口诀 + 严格模式（见 `effective-web-research` skill） |
   | 💡 方案设计 | brainstorm, design, architect | 阶段 2（探索方案） | 辅助多方案生成与对比 |
    | 📋 代码审查 | code-review, review, requesting-review | 阶段 3（审查方案） | 辅助方案深度审查（注：`solution-review`、`code-design-review`、`hybrid-debug`、`runtime-evidence-debug`、`browser-debug-toolkit` 均已通过 frontmatter `dependencies` 强绑定，不走环境探索） |
    | 📝 计划制定 | plan, writing-plan | 阶段 4（制定计划） | 辅助生成结构化执行计划 |
   | ⚡ 代码执行 | execute, executing-plan, subagent, parallel | 阶段 5（执行计划） | 多文件修改的批量编排 |
   | 🧪 测试驱动 | test, tdd, test-driven | 阶段 5（执行计划） | 先写测试再实现 |
   | 🔧 构建修复 | build-fix, build, linter, type-check | 阶段 5（执行计划） | 构建/编译/类型错误修复 |
   | ✅ 完成验证 | verify, verification, complete | 阶段 6（检查验证） | 执行后独立验证 |

   **探索结果处理**：

   - **匹配到增强能力**：记在会话上下文中，在对应阶段自动加载并调用
   - **未匹配到**：静默跳过，按原有流程执行。**不报错，不阻断**
   - **匹配到多个同类能力**：优先选择 description 更具体的

   **调用原则**：

   - **渐进增强，不替代核心流程**：增强能力是辅助手段，不改变阶段顺序和门控逻辑
   - **只读阶段不因增强能力获得写权限**：阶段工具约束不变（阶段 1～4 禁止 Edit/Write）
   - **增强能力失败不阻断流程**：调用增强 skill/agent 报错时，记录警告，按原有流程继续

2. 扫描可用 Superpowers 类 skill；若存在则记录，后续阶段按需调用；若不存在则静默降级，不阻断。
3. 判断使用已有 change 还是新建 change，并只准备候选名称：
   - 用户指定 change 名称时，优先使用该 change。
   - 未指定时，为新工作生成 kebab-case 候选名称，并在手动模式下请用户确认。
4. 准备创建方式，但不得在阶段 1.1 用户确认前创建目录：通过 `openspec-new-change` skill 创建 change（读取其 SKILL.md，按其指令执行）。

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

**⚠️ 一次只问一个关键问题（硬纪律，无条件适用）**：信息不足时，每次只问 **1 个最关键的问题**（优先级：目的 → 约束 → 成功标准），得到回答后再问下一个——**不得一次抛多个**。提问用「单问题 + 多选项」格式（见 solve-workflow「主动提问」提问格式）；优先用你所在 Agent 的原生结构化提问能力，无则用 prose。无论是否检测到 brainstorming skill，此纪律都必须遵守（brainstorming 的提问纪律是通用做法，不是触发条件）。

手动模式必须依次完成以下步骤：

1. **问题复述** - 用自己的话重新描述用户的问题
2. **关键要素提取** - 目标、约束、背景、期望结果
3. **疑问点列出** - 列出需要进一步确认的地方；**若向用户提问，一次只问 1 个最关键的**（见上方硬纪律），得到回答后再问下一个
3.5 **Scope 拆解**（若适用）- 若问题涉及多个独立子系统，先协助拆解：独立模块、依赖关系、建议处理顺序，再对首个子问题进入 1.2 技术分析
4. **等待用户确认**

**工具限制**：禁止 Read/Grep/SemanticSearch，以下情况**例外**：
- 用户消息中含 `@文件路径`（含可选行号）
- 用户消息中粘贴了代码片段
- 用户明确指出了「函数/类名 + 所在文件」的组合

例外时：**仅读取用户直接引用的文件与行号**，不得扩展到其他文件。读取结果仅用于辅助理解问题，**1.1 输出中不得出现技术分析结论**。

手动模式输出格式见 [reference.md](reference.md)「阶段 1.1 明确问题」。

用户确认前，不创建 change，不修改任何文件。用户确认后：

1. 通过 `openspec-new-change` skill 创建 change 目录（读取其 SKILL.md，按其指令执行）。
2. 记录本轮路径选择（完整 / 增量 / 精简）。
3. 再进入 1.2 技术分析。

自动模式可跳过确认，但也必须先完成候选名称生成，再立即创建 change 并继续。

### 1.2 技术分析

执行只读调查：

1. **存在性验证**（门控，必须最先执行）
   - 用 Read/Grep 定位问题相关代码
   - 判断结论并按下表处理：

   | 结论 | 处理方式 |
   |------|---------|
   | ✅ 问题存在 | 继续执行步骤 1.5（调研路由判断）→ 2～5 |
   | ❌ 问题已不存在 | 报告「在当前代码库中未发现该问题」，附相关代码位置，**停止分析，等待用户确认** |
   | ⚠️ 描述与代码不符 | 报告「代码行为与描述存在出入」，列出实际发现，**回到 1.1 重新对齐问题描述** |

1.5 **调研路由判断**（存在性验证通过后立即执行，决定后续步骤侧重）

   判断这个**已确认存在**的问题，根因更可能落在哪类——决定步骤 2.5/3/3.5/3.6 的执行侧重（不替换，只调优先级）：

   | 路由 | 判定信号 | 后续侧重 |
   |------|---------|---------|
   | 🟢 **内部为主** | 问题讲「我们的代码/逻辑/规范」；根因疑似本仓库实现 | 步骤 2 代码定位为主；2.5 可选兜底；步骤 3 根因分析为核心 |
   | 🔵 **外部为主** | 具名第三方库/框架/API + 版本；或问「怎么用/为什么/有没有已知问题」；或命中下方 2.5 触发条件（平台静默失败 / 宿主嵌套 / 代码层无嫌疑） | **2.5 升为首要动作**（先 web 搜已知案例）；搜到根因：若为上游已修复跳步骤 3.6，否则跳步骤 5；搜不到回步骤 3 |
   | 🟣 **Hybrid 先外后内** | 外部概念 +「我们的/应用到/检查我们」内部对象 | 先走 2.5 外部调研搞懂概念，再走步骤 3 内部分析应用 |

   > 判断不准时默认 **🟢 内部为主**（本工作流本质是改代码，根因多在仓库内）。
   > 🔌 若 `effective-web-research` skill 可用，本判断可参考其 Step 0 分流逻辑（它判断的是「单次检索本身要不要做外部」；本步骤判断的是「整个代码问题的调研成分」，两者互补）。

2. **相关代码定位** - 文件路径+行号、关键函数/类、调用链、数据流
2.5 **已知问题快搜**（路由判定为 🔵外部/🟣hybrid 时为**首要执行**；🟢内部时为**可选兜底**——保留下方触发条件作为内部路由下的回退信号）
   - **触发条件**（满足任一即触发，在步骤 3 根因分析之前执行）：
      - 问题涉及**平台/原生组件**（Android WebView、iOS UIPickerView、浏览器 API、OS 级控件等），且表现为**静默失败**（无报错、无 crash、调用正确但行为完全无响应）
      - 问题涉及**宿主环境嵌套**（React Native、Electron、Cordova、WebView in App 等），且前端代码逻辑看起来完全正确
      - 代码层面**找不到任何可疑点**（调用链完整、参数正确、日志显示执行到位），但运行时就是不生效
   - **执行**：用 WebSearch 以「症状关键词 + 平台/框架 + 年份」搜索 StackOverflow、GitHub Issues、官方文档中的已知案例，**并行动作（问题涉及具名第三方库/框架，或症状与平台/框架特定行为强相关时必做）**：查上游依赖的 Changelog / Release Notes / Issues，判断「是否已有修复版本」——若上游已修复，升级依赖可能是最简解法（见步骤 3.6）
  - 🔌 若 `effective-web-research` skill 可用，本步骤的 WebSearch 应用其调研纪律——先 Step 0 分流（确认是外部问题、非内部代码可解），再按 4 口诀执行（官方优先 / 查时效 / 非平凡双源印证 / 避内容农场）；用户要严格调研时转其严格模式出报告。skill 不可用时按原 WebSearch 流程执行。
   - **结果处理**：

   | 搜索结论 | 处理方式 |
   |---------|---------|
   | ✅ 找到已知案例，根因明确 | 输出【已知问题快搜结论】，**直接跳到步骤 5**（影响范围评估），跳过步骤 3～4 |
   | ✅ 找到上游已修复版本 | 输出【上游依赖修复评估线索】，**进入步骤 3.6** 确认升级可行性（不直接跳步骤 5——「上游已修复」只是线索，仍需 3.6 评估升级风险/包管理器/验证链才能成为方案） |
   | ⚠️ 找到相关讨论，根因部分明确 | 将搜索结论作为参考依据纳入步骤 3，继续根因分析 |
   | ❌ 未找到相关案例 | 静默跳过，继续步骤 3 |

   > 💡 与步骤 3.5 的区分：本步骤是「按症状提前搜索已知案例」（有解/无解均适用）；3.5 是「根因已明确后评估业界是否有公认解法」（专门处理无解场景）。两者时机与目的不同，不重叠。
   > 💡 与步骤 3.6 的关系：本步骤发现「上游已修复」线索 → 步骤 3.6 评估升级依赖的可行性（风险/包管理器/验证链）。2.5 是「发现」，3.6 是「评估能否安全升级」。

3. **问题根因分析** - 数据流和调用链分析
3.5 **行业通病评估**（可选，根因明确指向硬限制时触发）
   - 仅当根因**明确指向**平台/语言/协议/标准的硬性限制（如浏览器安全策略、JS 单线程、网络协议约束），且无明显应用层绕过路径时触发
   - 若触发，用 WebSearch 调研：业界是否有公认记录、主流框架/大厂如何处理、是否存在可行绕过方案
  - 🔌 若 `effective-web-research` skill 可用，本步骤的 WebSearch 应用其调研纪律——先 Step 0 分流，再按 4 口诀执行（官方优先 / 查时效 / 非平凡双源印证 / 避内容农场）；用户要严格调研时转其严格模式出报告。skill 不可用时按原 WebSearch 流程执行。
   - 按下表处理：

   | 结论 | 处理方式 |
   |------|---------|
   | 🚫 行业公认难题，目前无可行解 | 输出【行业通病评估报告】，**暂停，等用户决定**（继续探索绕过方案 / 接受现状） |
   | ⚠️ 存在局限但有绕过方案 | 在后续方案探索中将绕过方案列为候选，继续步骤 4 |
   | ✅ 非行业通病，属可修复问题 | 继续步骤 4 |

3.6 **上游依赖修复评估**（可选，根因明确为上游依赖 bug 时触发——与 3.5 配对的「乐观分支」）
   - 触发条件：根因明确为上游依赖 bug；或步骤 2.5 找到上游已修复版本。
   - **加载 `upstream-dependency-debug` skill 执行**：4 步决策顺序（判断上游→查 Changelog→优先升级→不可行才 workaround）+ 通用升级工程纪律（包管理器一致性/验证链/semver/dedup）+ 结果处理表，见该 skill。
   - 结果：升级低风险→继续步骤 4，进阶段 2 时升级方案作为推荐；有风险→升级与 workaround 并列；未修复→workaround 注明临时性。
   > 💡 与步骤 3.5 的区分：3.5 是「无可行解」的悲观分支（暂停等用户决定）；3.6 是「上游已修复」的乐观分支（升级依赖即可）。两者时机相同（根因明确后），方向相反。

4. **影响范围评估** - 受影响的模块/功能
5. 判断是否需要新 capability 或修改已有 capability。

🔌 **OPSX Skills 集成**：技术分析阶段**不创建任何 artifact**。根因分析结论（Why / Impact）会在阶段 2 方案选定后，作为上下文一并写入 `proposal.md`。

若发现问题不存在或描述与代码不符，暂停并让用户重新确认，不进入方案阶段。

**工具限制**：✅ Read/Grep；✅ WebSearch（步骤 2.5 已知问题快搜、步骤 3.5 行业通病评估、步骤 3.6 上游依赖修复评估、打点失效逃生出口 5.5 专用）；❌ Edit/Write

### Red Flags — 阶段 1 禁止行为

- 用户未引用代码，却在 1.1 未完成时主动使用 Read/Grep 探索代码
- 以「用户已经说得很清楚」为由跳过 1.1
- 以「边分析边澄清」为由在 1.1 未完成时主动探索代码
- 在 1.1 的「问题复述」或「疑问点」中混入技术分析结论（如根因判断、修复建议）
- 1.1 一次抛出多个疑问点让用户回答（违反「一次只问一个关键问题」硬纪律）——每次只问 1 个最关键的，得到回答后再问下一个
- 路由判定为 🔵外部/🟣hybrid 却跳过 2.5（此时为首要动作，违反路由判定）；或 🟢内部路由下 2.5 触发条件命中，却以「先看代码」为由跳过 WebSearch（违反早搜原则）
- 根因涉及具名第三方库/框架，却未查上游 Changelog/Release Notes 就直接堆 workaround（违反「优先评估升级依赖」原则，导致 magic number 时序、UX 降级、平台强制行为 CSS 无解等技术债累积）

### 🔬 打点调试（静态分析受阻时，主动升级为运行时调试）

**触发条件**（满足任一即触发，优先于进入阶段 2 前）：
- 根因置信度为「模糊」或「未知」——能定位到大概模块，但无法确定具体逻辑或触发路径
- 当前是重试/继续场景——已基于静态分析处理过一次，但问题仍然存在

**加载以下强依赖 skill 按其方法论执行**（前置检查已保证可用）：

- `runtime-evidence-debug`：运行时证据采集全流程（升级决策→打点→复现→证据分析→置信度门控→逃生出口→修复验证）。根因仍模糊时的逃生出口（WebSearch 升级搜索等）也由该 skill 提供。
- `browser-debug-toolkit`：UI/CSS/DOM 问题优先用浏览器 DevTools 实时检查（DOM 树、计算样式、盒模型），比代码层打点更高效。
- `hybrid-debug`：Hybrid 应用（native + WebView/WKWebView/Electron + H5）问题的四层全链条分析，避免单层 whack-a-mole。

具体执行步骤、置信度门控阈值、逃生出口判定见各 skill 的 SKILL.md。

**工具限制**：✅ Read/Grep 辅助确定打点位置；❌ Edit/Write（打点代码由用户手动添加，或经用户明确确认后 AI 添加）；❌ 未经用户确认不得自行运行复现步骤

---

## 阶段 2：探索方案

> 原则：基于阶段 1 的分析，提供 2-5 个解决方案；方案中剔除非必要功能与过度设计（YAGNI）

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
- 每个 requirement 的标题格式必须是 `### Requirement: <描述 含 SHALL 或 MUST>`
- 每个 requirement 必须包含至少一个 `#### Scenario:` 块

> 常见错误：`### REQ-001:`（格式错）、`### Requirement: 初始化`（缺 SHALL/MUST）、无 Scenario（缺场景）。
> 这三类均会导致 `openspec validate` 失败。格式示例见 `openspec-continue-change` skill。

### Red Flags — 阶段 2 禁止行为

- 只生成 1 个方案，以「方向已明确」为由跳过方案对比
- 手动模式下用户未选方案时自行推进到审查阶段
- 方案中包含非必要功能或过度设计（违反 YAGNI）

## 阶段 3：审查方案

对选定方案进行四维审查：

1. **解决有效性**：是否覆盖根因和目标行为。
2. **副作用与风险**：是否影响其他模块、性能、安全、兼容性。
3. **实现可行性**：涉及文件、依赖、迁移是否明确。
4. **规范符合度**：是否符合现有代码模式和 OpenSpec spec 约定。
5. **架构与设计质量**（若方案涉及代码修改）：加载 `code-design-review` skill，按其完整代码设计审查框架执行（Layer A 代码级指标 + Layer B 架构级属性 + Layer C 安全审查）。

若检测到 `requesting-code-review`，在通过前额外做一次“spec 合规审查”：proposal 是否解释 why，delta specs 是否覆盖行为变化，design 是否处理风险，tasks 是否覆盖 requirements。

🔌 **OPSX Skills 集成**：审查通过后，通过 `openspec-continue-change` skill 创建 `design.md`（先读取其 SKILL.md，再按其指令执行；proposal 完成后 design 即为 ready）。本 skill 不直接手写 design.md 内容。`design.md` 应覆盖的结构（由 skill 负责落实）：Context、Goals / Non-Goals、Decisions、Risks / Trade-offs、Migration Plan、Open Questions。

不通过时：

- 手动模式：输出审查报告，等待用户决定"修改方案 / 重选方案 / 继续"。
- 自动模式：根据问题自动优化方案并重新审查，最多 3 轮。

### 审查结论（二级制）

| 结论 | 判定标准 | 后续动作 |
|------|---------|---------|
| ✅ **通过** | 各项审查维度均无阻断问题，仅存在可接受的低风险 | 进入阶段 4 |
| ❌ **不通过** | 任一维度存在需解决的问题或不可接受的风险 | 进入优化→重新审查循环 |

**阻断问题判定指引**（满足任一即为 ❌ 不通过）：

- 方案无法完整覆盖根因，或解决质量明显低效低质（解决有效性不足）
- 存在已识别但未提出缓解措施的中/高风险
- 涉及的修改文件或依赖关系不明确，无法据此制定可执行计划
- 与项目现有设计模式或编码规范明显冲突
- 可能引入新 bug 或破坏现有功能的副作用未被处理

**非阻断问题**（可标注为建议，但不阻止通过）：

- 已有缓解措施的低风险项
- 代码风格偏好（不影响正确性）
- 可在后续迭代中优化的性能改进

### Red Flags — 阶段 3 禁止行为

- 跳过方案审查直接进入阶段 4（风险未识别）
- 在审查阶段修改代码（违反只读约束）
- 自动模式审查不通过时不优化方案，直接进入阶段 4
- 自动模式审查循环超过 3 轮上限仍不暂停
- 自动模式优化方案时未输出优化说明，导致审查记录不可追溯
- 手动模式下用户未明确判定通过/不通过，AI 自行推进

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
3. **完成任务后必须立即更新 checkbox**：使用 StrReplace 将 tasks.md 中对应的 `[ ]` 改为 `[x]`，不得延后到一批任务结束后再批量更新。若跳过此步骤，阶段 6 验证器将报 CRITICAL 虚假未完成。
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
**Node 版本对齐（前置，须在工程验证前完成）**：调用 `node-version-discipline` skill 对齐项目声明的 Node 版本（该 skill 按完整探测链 `.nvmrc` → `.node-version` → `.tool-versions` → `volta` → `engines.node` → CI 配置 定位；无声明时停下来询问用户，不猜测；单条命令内 `source ~/.nvm/nvm.sh && nvm use <版本> && <命令>`，`node -v` 确认）。下方所有测试/类型检查/lint/构建命令在对齐版本下执行，验证报告披露 `Node(声明版本 vX) ✅/⚠️`。

2. **工程验证**：运行项目相关测试、类型检查、lint 或构建（对齐版本下执行）。
3. **行为对照**：逐条对照 delta spec 的 requirements 和 scenarios，确认实现覆盖。
4. **调试-验证闭环**：若阶段 1.2 用了调试 skill 定位根因，本阶段须用**同一 skill** 验证修复（而非只跑测试）：
   - UI/CSS/DOM 问题（用了 `browser-debug-toolkit`）→ 用同一 skill 验证修复后渲染结果（DOM 树/计算样式/盒模型），确认异常消失
   - 运行时证据问题（用了 `runtime-evidence-debug` 打点）→ 用同一 skill 复验原打点位置，before/after 证据对比确认异常行为消失
   - Hybrid 跨端问题（用了 `hybrid-debug` 四层分析）→ 验证受影响各层（L1-L4）行为均正确，无新跨层副作用

若检测到 `verification-before-completion`，必须按其原则执行：只有刚运行过并亲自阅读过输出的命令，才能作为“通过”的证据。

输出格式见 [reference.md](reference.md)「阶段 6 检查验证」。

> ⚠️ **验证报告诚实原则**：每一项必须在括号中明确标注"已执行（命令+输出摘要）"
> 或"待执行（需人工操作的具体步骤）"，不得将"设计了验证场景"误写为"验证已通过"。
> AI 不能直接执行浏览器交互的步骤，必须诚实标注为"待执行"并给出具体操作指引。

手动模式在此暂停，等待用户确认是否进入归档。验证失败时不得归档；应回到阶段 3、4 或 5。

### 测试执行

若阶段 5 执行报告涉及测试（如单元测试、集成测试、手动验证步骤）：

- **AI 可执行**：使用 Bash 运行测试命令（如 `npm test`、`pytest`、`go test`），将结果纳入检查结论
- **AI 无法执行**（无 Bash、环境限制、测试需人工操作）：**明确提醒用户**：「本次修改涉及测试，请自行执行 [具体测试命令/步骤] 验证，确认通过后再收尾」

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

归档后必须检查 diff，确认主 specs 更新和 archive 目录迁移都进入工程根的 git 工作区变更。若检测到 `finishing-a-development-branch`，在归档和 diff 检查完成后，再借鉴其流程做分支收尾决策：保留当前分支、创建 PR、合并或继续开发。不得在测试未通过、归档未完成或 diff 未审查时宣布完成。

> **顺序约束**：归档 + diff 检查 → 分支收尾决策 → **仅当决策为「合并」时**触发合并前覆盖率门控（见下）→ 执行合并。选择「保留当前分支」「继续开发」**不触发**门控。

#### 合并前覆盖率门控（强制，仅当分支收尾决策为「合并」时触发）

> 触发条件：用户在分支收尾决策中已选定「合并」。本门控在合并执行前运行，是合并的强制前置。
> **执行门控前必须先读** [reference.md](reference.md)「合并前覆盖率门控（强制）规范」获取完整步骤，**不得仅凭下方摘要执行**。

**判定矩阵概要**（安全网，完整矩阵见 reference.md）：报告生成+达标→继续合并；不达标→暂停；脚本崩溃/无报告/退出码1→**视为门控未通过**（不得误判为通过）；无测试代码/0%通过→暂停。
**本步骤独立 Bash 权限**：运行 test-coverage-analyzer 脚本，不改变阶段 7「仅限归档/文档」的工具约束本质（门控是合并子步骤而非归档动作）。
**留痕位置**（显式跳过时）：PR 描述和 `design.md` 的 Verification Notes。

### 回顾总结与经验沉淀（委托 learn-and-improve）

归档与分支收尾完成后，加载 `learn-and-improve` skill 执行回顾总结与经验沉淀：
1. 结构化复盘（按场景选 SSC / KPT / AAR + 5Why 根因）
2. 沉淀价值判断（三道门：会否复现 × 已验证 × 团队级）
3. 沉淀载体选择（决策树：`AGENTS.md` / `CLAUDE.md` / `.cursor/rules/` / 项目内 skill / 总结文档）
4. 有效性验证 + 改进闭环（检索复用机制 + single/double-loop）

> **OpenSpec artifacts**（`proposal.md`、`specs/`、`design.md`、`tasks.md`）是本 skill 的核心产出，正常归档流程落盘，不受 `learn-and-improve` 的沉淀价值门控限制。
> **AI 工程知识**（`AGENTS.md`、`CLAUDE.md`、`.cursor/rules/`、项目内 skill 等）的沉淀价值判断与载体选择，由 `learn-and-improve` 的决策树负责；写入前必须等用户明确要求。

归档完成后输出格式见 [reference.md](reference.md)「阶段 7 回顾归档」。

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
| 分支收尾决策为「保留/继续开发」却触发覆盖率门控 | 门控误触发，干扰非合并场景 | 门控仅「合并」决策触发；保留/继续开发不触发 |
| 覆盖率门控脚本崩溃却继续合并 | 崩溃被误判为「覆盖率通过」，未验证代码进入主分支 | 崩溃/无报告/退出码1 一律视为门控未通过，暂停等用户 |
| 覆盖率不达标自动模式强行合并 | 绕过用户决策强制合并不达标代码 | 不达标必须暂停等用户决策（强制合并/补测试/放弃） |
| 显式跳过门控未留痕 | 事后无法追溯门控被跳过、责任不清 | 跳过必须在 PR 描述和 design.md 写入留痕（时间+决策人） |
| `--base` 获取失败未输出降级警告 | MR 场景误判为 0 变更，门控形同虚设 | 降级时必须显式警告「未指定 base，MR 可能误判为 0 变更」 |
| archive 未完成或 diff 未审查就触发覆盖率门控 | 顺序错乱，门控基于不完整状态 | 顺序：archive+diff → 收尾决策 → 门控 → 合并 |
| 实现中发现设计错误却继续硬做 | artifacts 与代码分叉 | 回写 proposal/specs/design/tasks 后再继续 |
| `openspec/` 不存在却强行推进 | 无 schema/context，artifacts 结构混乱 | 阶段 0 门禁 1 未通过时必须停止，要求用户运行 `openspec init` |
| workspace 多工程下未先定位工程根 | 门禁检查在 workspace 根执行而非工程目录，artifact 写入错误位置 | 阶段 0 必须先执行门禁 0 工程定位，确定工程根后再执行门禁 1/2 |
| 检测到原生 OPSX skills 却直接调 CLI 或手写 artifacts | 绕过 schema 模板和 context injection，artifacts 不符规范 | 委托原生 skill（先读 SKILL.md）；CLI 仅允许作为工具命令（`openspec validate`、`openspec status` 等） |
| Phase 1.2 创建 proposal（根因未与方案结合） | proposal 的 Why 和 What 割裂，artifact 需重写 | proposal 在阶段 2 方案选定后才创建，通过 `openspec-continue-change` 一次性写完整 |
| 使用不存在的 skill 名称（如 `openspec-apply`、`openspec-archive`） | 读不到 SKILL.md，委托失败 | 正确名称：`openspec-apply-change`、`openspec-archive-change`、`openspec-verify-change` |
| 阶段7默认将可复用经验写入 AGENTS.md / CLAUDE.md / skill（OpenSpec artifacts 除外） | 长期规则被一次性经验污染 | 阶段7只输出沉淀建议；必须等用户明确要求后才落盘 |
| 门禁 2 找到旧版 skill（如 `openspec-propose`）就判断通过 | 以旧版 schema 手写 artifacts，validate 多次失败 | 门禁 2 只接受精确的四个名称，其他名称的 openspec skill 不算通过 |
| 阶段 5 执行完一批任务后才批量勾选 tasks.md checkbox | 阶段 6 验证器报 CRITICAL 虚假未完成，需额外修复轮次 | 每个任务完成后立即用 StrReplace 将对应 `[ ]` 改为 `[x]` |
| 阶段 6 验证报告将"设计了场景"写成"验证已通过" | 用户接受虚假的通过结论 | 报告中每项必须标注"已执行（命令+输出摘要）"或"待执行（操作指引）" |
| delta spec requirement 不包含 SHALL/MUST | `openspec validate` 报错，需多轮修复 | requirement 描述必须含 SHALL 或 MUST；使用 `#### Scenario:` 添加场景 |
| 浏览器断言条件基于猜测而非观察实际 DOM | waitForFunction 超时，测试失败 | 先 evaluate 目标元素的真实值，再决定断言写法 |
| 跳过 1.1 直接读代码 | 误解问题、无效分析 | 手动模式必须先完成明确问题并获确认 |
| 跳过存在性验证直接进入根因分析 | 分析不存在的问题、浪费上下文 | 1.2 必须以存在性验证为第一步 |
| 存在性验证结论为「不存在/描述不符」但继续分析 | 方向全错 | 立即停止并报告，等待用户确认 |
| 行业通病评估结论为「无可行解」但未暂停等用户确认 | 可能产出无意义方案 | 输出评估报告后暂停，等用户决定是否继续 |
| 只生成 1 个方案 | 方案无对比，遗漏更优解 | 必须输出 2-5 个方案对比表 |
| 审查不通过仍直接进入阶段 4 | 带问题的方案进入执行，返工成本高 | 必须循环审查直到通过或达到上限 |
| 自动模式审查循环超过 3 轮不暂停 | 无限循环浪费资源 | 达到 3 轮上限必须暂停等用户介入 |
| 增强能力探索失败后阻断流程 | 不必要的中断 | 增强能力是可选的，探索失败必须静默跳过 |
| 增强能力突破阶段工具约束 | 只读阶段被写入 | 增强能力不改变阶段工具约束 |
| 路由判定为 🔵/🟣 却跳过 2.5；或 🟢内部路由下触发条件命中却跳过早搜 | 浪费多轮调试时间，可能在已知解上反复踩坑 | 🔵/🟣 路由下 2.5 为首要动作必须先执行；🟢 路由下满足触发条件时先执行 WebSearch 再打点 |
| 多轮打点后根因仍不明确，继续增加打点而不升级 | 陷入打点死循环，根因永远无法通过代码观测定位 | 日志分析后置信度仍为「模糊/未知」时，必须触发步骤 5.5 逃生出口转向网络搜索 |
| 方案中包含非必要功能或过度设计 | 方案臃肿，OpenSpec 变更范围膨胀 | 剔除非必要功能（YAGNI），只写必要的行为变化 |
| 根因涉及具名第三方库却未查上游 Changelog 就堆 workaround | 在已修复的上游 bug 上反复踩坑、堆出无效 workaround 技术债 | 优先查上游 Changelog/Release Notes，走步骤 3.6 评估升级依赖 |

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


