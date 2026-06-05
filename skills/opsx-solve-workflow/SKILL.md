---
name: opsx-solve-workflow
version: "1.3.0"
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

## 与戴明环（PDCA）的对应

| PDCA | 阶段 | 说明 |
|------|------|------|
| **Plan** | 阶段 1～4 | 明确与分析问题、探索方案、审查方案、制定计划 |
| **Do** | 阶段 5 | 执行计划 |
| **Check** | 阶段 6 | 检查验证 |
| **Act** | 阶段 7 | 回顾归档 |

执行完成后进入阶段 6；若阶段 7 结论为「未达标需再改」，可回到阶段 1～3 开启下一轮循环。

## 调用约定

- **触发词**：opsx解决、OpenSpec解决、规范化解决、创建OpenSpec变更、创建opsx变更、用OpenSpec分析、用OpenSpec修复、opsx自动解决、OpenSpec自动解决、opsx-solve、opsx-solve-workflow
- **模式**：触发词含“自动”时进入自动模式；否则默认手动模式。
- **手动模式**：阶段 1、2、3、4、6、7 的关键出口必须等待用户确认。
- **自动模式**：自动推进到验证；阶段 3 审查最多循环 3 轮，超限暂停。

---

## ⚡ 快速参考（执行前必读，修改阶段时同步更新）

| 阶段 | 工具权限 | 手动停止点 | 必须输出 |
|------|---------|-----------|--------|
| 0 环境检查 | ✅ Read | ⛔ 门禁未通过时停止 | 门禁结果 + 路径选择 |
| 1.1 明确问题 | ✅ Read/Grep（仅用户引用内容） | ⛔ 输出后停止，等用户确认 | 问题复述／要素／change 名称 |
| 1.2 技术分析 | ✅ Read/Grep；✅ WebSearch（步骤 2.5/3.5/5.5 专用） | 继续进入阶段 2 | 存在性结论／根因／影响范围 |
| 2 探索方案 | ✅ Read；❌ Edit/Write | ⛔ 输出方案表后停止，等用户选择 | 方案对比表（≥2 个）+ OpenSpec artifacts |
| 3 审查方案 | ✅ Read；❌ Edit/Write | ⛔ 审查报告后停止，等用户判定 | 审查报告 + design.md |
| 4 制定计划 | ✅ Read；❌ Edit/Write/Bash | ⛔ 输出计划后停止，等用户确认 | tasks.md |
| 5 执行计划 | ✅ 全部 | 无坑时自动进入阶段 6 | 执行报告 + 测试套件 |
| 6 检查验证 | ✅ Bash；❌ Edit/Write | ⛔ 输出结果后停止，等用户确认 | 验证结果 |
| 7 回顾归档 | ✅ Edit/Write（归档/文档） | 结束 / 或循环回阶段 1～3 | 归档确认 + 沉淀建议 |

---

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

两道门禁通过后，各阶段委托原生 skill 前必须遵守：

1. **调用前先读取 SKILL.md**：每次委托前必须先读取对应 skill 的 SKILL.md，不得凭记忆调用。
2. **本 skill 保留阶段门禁**：原生 skill 执行完成后，本 skill 继续执行阶段确认、暂停、循环审查等门禁逻辑。
3. **CLI 工具调用不是降级**：`openspec validate` 等 CLI 工具命令可直接使用，不属于「绕过原生 skills」。

### 通过后的准备步骤

1. **环境能力探索**（跨平台自适应）：扫描当前环境中可用的增强能力（skill、agent、插件），按能力类型映射到对应阶段，记在会话上下文中供后续引用。探索失败时静默跳过，不阻断。
2. 扫描可用 Superpowers 类 skill；若存在则记录，后续阶段按需调用；若不存在则静默降级，不阻断。
3. 判断使用已有 change 还是新建 change，并只准备候选名称：
   - 用户指定 change 名称时，优先使用该 change。
   - 未指定时，为新工作生成 kebab-case 候选名称，并在手动模式下请用户确认。
4. 准备创建方式，但不得在阶段 1.1 用户确认前创建目录：通过 `openspec-new-change` skill 创建 change（读取其 SKILL.md，按其指令执行）。

#### 能力类型与阶段映射

扫描时，按以下能力类型关键词匹配可用 skill/agent 的 name 和 description：

| 能力类型 | 匹配关键词 | 对应阶段 | 用途 |
|---------|-----------|---------|------|
| 🔍 调试分析 | debug, root-cause, investigate, systematic-debugging | 阶段 1（技术分析） | 辅助根因定位、假设驱动调查 |
| 💡 方案设计 | brainstorm, design, architect | 阶段 2（探索方案） | 辅助多方案生成与对比 |
| 📋 代码审查 | code-review, review, requesting-review | 阶段 3（审查方案） | 辅助方案深度审查 |
| 📝 计划制定 | plan, writing-plan | 阶段 4（制定计划） | 辅助生成结构化执行计划 |
| ⚡ 代码执行 | execute, executing-plan, subagent, parallel | 阶段 5（执行计划） | 多文件修改的批量编排 |
| 🧪 测试驱动 | test, tdd, test-driven | 阶段 5（执行计划） | 先写测试再实现 |
| 🔧 构建修复 | build-fix, build, linter, type-check | 阶段 5（执行计划） | 构建/编译/类型错误修复 |
| ✅ 完成验证 | verify, verification, complete | 阶段 6（检查验证） | 执行后独立验证 |

#### 探索结果处理

- **匹配到增强能力**：记在会话上下文中，在对应阶段自动加载并调用（具体调用点见各阶段的「🔌」提示）
- **未匹配到**：静默跳过，按原有流程执行。**不报错，不阻断**
- **匹配到多个同类能力**：优先选择 description 更具体的

#### 调用原则

- **渐进增强，不替代核心流程**：增强能力是辅助手段，不改变阶段顺序和门控逻辑
- **只读阶段不因增强能力获得写权限**：阶段工具约束不变（阶段 1～4 禁止 Edit/Write）
- **增强能力失败不阻断流程**：调用增强 skill/agent 报错时，记录警告，按原有流程继续

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

手动模式必须依次完成以下步骤：

1. **问题复述** - 用自己的话重新描述用户的问题
2. **关键要素提取** - 目标、约束、背景、期望结果
3. **疑问点列出** - 列出需要进一步确认的地方
3.5 **Scope 拆解**（若适用）- 若问题涉及多个独立子系统，先协助拆解：独立模块、依赖关系、建议处理顺序，再对首个子问题进入 1.2 技术分析
4. **等待用户确认**

**工具限制**：禁止 Read/Grep/SemanticSearch，以下情况**例外**：
- 用户消息中含 `@文件路径`（含可选行号）
- 用户消息中粘贴了代码片段
- 用户明确指出了「函数/类名 + 所在文件」的组合

例外时：**仅读取用户直接引用的文件与行号**，不得扩展到其他文件。读取结果仅用于辅助理解问题，**1.1 输出中不得出现技术分析结论**。

手动模式输出格式：

```text
【问题复述】...
（只描述用户的意图与现象，不得出现根因判断或修复建议——技术结论留给 1.2）
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

1. **存在性验证**（门控，必须最先执行）
   - 用 Read/Grep 定位问题相关代码
   - 判断结论并按下表处理：

   | 结论 | 处理方式 |
   |------|---------|
   | ✅ 问题存在 | 继续执行步骤 2～5 |
   | ❌ 问题已不存在 | 报告「在当前代码库中未发现该问题」，附相关代码位置，**停止分析，等待用户确认** |
   | ⚠️ 描述与代码不符 | 报告「代码行为与描述存在出入」，列出实际发现，**回到 1.1 重新对齐问题描述** |

2. **相关代码定位** - 文件路径+行号、关键函数/类、调用链、数据流
2.5 **已知问题快搜**（可选，按症状特征判断是否触发）
   - **触发条件**（满足任一即触发，在步骤 3 根因分析之前执行）：
     - 问题涉及**平台/原生组件**（Android WebView、iOS UIPickerView、浏览器 API、OS 级控件等），且表现为**静默失败**（无报错、无 crash、调用正确但行为完全无响应）
     - 问题涉及**宿主环境嵌套**（React Native、Electron、Cordova、WebView in App 等），且前端代码逻辑看起来完全正确
     - 代码层面**找不到任何可疑点**（调用链完整、参数正确、日志显示执行到位），但运行时就是不生效
   - **执行**：用 WebSearch 以「症状关键词 + 平台/框架 + 年份」搜索 StackOverflow、GitHub Issues、官方文档中的已知案例
   - **结果处理**：

   | 搜索结论 | 处理方式 |
   |---------|---------|
   | ✅ 找到已知案例，根因明确 | 输出【已知问题快搜结论】，**直接跳到步骤 4**（影响范围评估），跳过步骤 3 |
   | ⚠️ 找到相关讨论，根因部分明确 | 将搜索结论作为参考依据纳入步骤 3，继续根因分析 |
   | ❌ 未找到相关案例 | 静默跳过，继续步骤 3 |

   > 💡 与步骤 3.5 的区分：本步骤是「按症状提前搜索已知案例」（有解/无解均适用）；3.5 是「根因已明确后评估业界是否有公认解法」（专门处理无解场景）。两者时机与目的不同，不重叠。

3. **问题根因分析** - 数据流和调用链分析
3.5 **行业通病评估**（可选，根因明确指向硬限制时触发）
   - 仅当根因**明确指向**平台/语言/协议/标准的硬性限制（如浏览器安全策略、JS 单线程、网络协议约束），且无明显应用层绕过路径时触发
   - 若触发，用 WebSearch 调研：业界是否有公认记录、主流框架/大厂如何处理、是否存在可行绕过方案
   - 按下表处理：

   | 结论 | 处理方式 |
   |------|---------|
   | 🚫 行业公认难题，目前无可行解 | 输出【行业通病评估报告】，**暂停，等用户决定**（继续探索绕过方案 / 接受现状） |
   | ⚠️ 存在局限但有绕过方案 | 在后续方案探索中将绕过方案列为候选，继续步骤 4 |
   | ✅ 非行业通病，属可修复问题 | 继续步骤 4 |

4. **影响范围评估** - 受影响的模块/功能
5. 判断是否需要新 capability 或修改已有 capability。

🔌 **OPSX Skills 集成**：技术分析阶段**不创建任何 artifact**。根因分析结论（Why / Impact）会在阶段 2 方案选定后，作为上下文一并写入 `proposal.md`。

若发现问题不存在或描述与代码不符，暂停并让用户重新确认，不进入方案阶段。

**工具限制**：✅ Read/Grep；✅ WebSearch（步骤 2.5 已知问题快搜、步骤 3.5 行业通病评估、打点失效逃生出口 5.5 专用）；❌ Edit/Write

### Red Flags — 阶段 1 禁止行为

- 用户未引用代码，却在 1.1 未完成时主动使用 Read/Grep 探索代码
- 以「用户已经说得很清楚」为由跳过 1.1
- 以「边分析边澄清」为由在 1.1 未完成时主动探索代码
- 在 1.1 的「问题复述」或「疑问点」中混入技术分析结论（如根因判断、修复建议）
- 步骤 2.5 已知问题快搜触发条件满足时，以「先看代码」为由跳过 WebSearch（违反早搜原则）

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

5.5 **打点失效升级**（逃生出口，日志分析后根因置信度仍为「模糊/未知」时触发）

   > 打点只能观测「代码层执行路径」，无法穿透平台层/宿主环境的静默拦截。根因仍不明确时，应立即转向网络搜索。

   **触发判定**：日志分析完成后根因置信度仍为「模糊/未知」，执行以下步骤：

   1. **升级搜索**：用 WebSearch 以「症状关键词 + 平台/框架版本 + 年份」搜索已知案例（StackOverflow、GitHub Issues、官方 bug tracker）
   2. **输出搜索结论**：
      - 找到已知案例 → 输出「已知案例结论」，更新根因假设，回到步骤 5 日志分析（以新假设重新解读已有日志，或设计新打点）
      - 未找到案例 → 输出「已排除假设清单」，**暂停，等用户决定**：
        - 继续针对新方向打点
        - 寻求外部支持（查阅官方文档、提 issue、询问团队）
        - 接受当前根因不明，带假设进入阶段 2 探索方案

6. **打点清理建议**（可选）：根因确认后，说明哪些打点可删除，哪些值得转为正式的可开关监控

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

若检测到 `requesting-code-review`，在通过前额外做一次“spec 合规审查”：proposal 是否解释 why，delta specs 是否覆盖行为变化，design 是否处理风险，tasks 是否覆盖 requirements。

🔌 **OPSX Skills 集成**：审查通过后，通过 `openspec-continue-change` skill 创建 `design.md`（先读取其 SKILL.md，再按其指令执行；proposal 完成后 design 即为 ready）。本 skill 不直接手写 design.md 内容。`design.md` 应覆盖的结构（由 skill 负责落实）：Context、Goals / Non-Goals、Decisions、Risks / Trade-offs、Migration Plan、Open Questions。

不通过时：

- 手动模式：输出审查报告，等待用户决定"修改方案 / 重选方案 / 继续"。
- 自动模式：根据问题自动优化方案并重新审查，最多 3 轮。

### 审查结论（二级制）

| 结论 | 判定标准 | 后续动作 |
|------|---------|---------|
| ✅ **通过** | 四项审查维度均无阻断问题，仅存在可接受的低风险 | 进入阶段 4 |
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
2. **工程验证**：运行项目相关测试、类型检查、lint 或构建。
3. **行为对照**：逐条对照 delta spec 的 requirements 和 scenarios，确认实现覆盖。

若检测到 `verification-before-completion`，必须按其原则执行：只有刚运行过并亲自阅读过输出的命令，才能作为“通过”的证据。

输出格式：

```text
【验证结果】
- OpenSpec 校验：已执行（openspec validate <name>，输出：...）/ 失败（原因：...）
- 工程验证：已执行（命令：...，结果：...）/ 待执行（需用户手动操作：...）
- 行为对照：已执行（逐条对比结果：...）/ 待执行（人工验证项：...）
- 与 tasks.md 对比：...
- 副作用检查（功能副作用：在其他模块引发新问题；非功能副作用：性能/安全/可维护性预期外影响）：...
- 是否可归档：是 / 否
```

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
| 步骤 2.5 触发条件满足但跳过早搜，仍依赖打点 | 浪费多轮调试时间，可能在已知解上反复踩坑 | 满足触发条件时必须先执行 WebSearch，再决定是否继续打点 |
| 多轮打点后根因仍不明确，继续增加打点而不升级 | 陷入打点死循环，根因永远无法通过代码观测定位 | 日志分析后置信度仍为「模糊/未知」时，必须触发步骤 5.5 逃生出口转向网络搜索 |
| 方案中包含非必要功能或过度设计 | 方案臃肿，OpenSpec 变更范围膨胀 | 剔除非必要功能（YAGNI），只写必要的行为变化 |

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

## 输出详细度控制（自适应）

- 简单问题（单文件修改）：精简输出
- 中等复杂度：标准输出
- 高复杂度（多模块联动）：详细输出 + 代码示例
