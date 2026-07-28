# 阶段级共享抽取可行性分析报告

> **性质**：分析结论，非实施授权。任何落地改动须另开独立 opsx change，且新 skill 须走 `/skill-creator` 流程。
> **数据基础**：对 solve-workflow（543 行）、opsx-solve-workflow（612 行）、jira-fix-workflow（949 行）、opsx-jira-fix-workflow（662 行）及扩围对象（jira-fix-batch、opsx-jira-fix-batch、perf-workflow、6 个既有共享 skill）的三路全文测绘（2026-07-19，对应 v1.77.0）。

## 1. 重复度矩阵

### 1.1 solve-workflow ↔ opsx-solve-workflow（~150-160 行，约 28% / 25%）

| # | 内容块 | solve 位置 | opsx 位置 | 重复行数 |
|---|--------|-----------|-----------|---------|
| 1 | **阶段 2 分析问题整体**（原则、临时改动权限与回滚门控、7 分析步骤含存在性验证表与调研路由契约映射段、4 Red Flags、打点调试） | :174-248 | :265-339 | **~70** |
| 2 | 环境能力探索委托段 + 6 行能力→阶段映射表 | :99-110 | :175-186 | ~13 |
| 3 | 阶段 1 五步骤 + 3 条工具例外 | :140-152 | :242-253 | ~13 |
| 4 | 阶段 4 二级制结论表 + 6 Red Flags + 3 轮上限语义 | :314-343 | :396-426 | ~14 |
| 5 | 阶段 7 调试-验证闭环 3 条 + Node 对齐 + 测试执行 2 条 | :462-474 | :480-504 | ~12 |
| 6 | 前置 skill 检查步骤 + 不降级原则 | :47-53 | :65-72 | ~8 |
| 7 | 路径选择表骨架 + 升级规则 | :116-124 | :213-219 | ~7 |
| 8 | 阶段 8 learn-and-improve 四步框架列表 | :505-508 | :538-541 | ~5 |
| 9 | 主动提问硬纪律要点段 | :91-93 | :236-238 | ~4 |
| 10 | 阶段 3 原则行 + 手动暂停语义 + 2 Red Flags | :253-290 | :345-376 | ~5 |
| 11 | 阶段 6 checkbox 即时勾选规则 + 偏离说明 | :424-432 | :446-448 | ~4 |
| 12 | 模式生命周期委托句 | :66-68 | :74-76 | ~3 |
| 13 | 常见错误共享行（~4 行） | :537-540 | :575-589 | ~4 |

### 1.2 jira-fix-workflow ↔ opsx-jira-fix-workflow（~75-80 行逐字 + ~50 行语义重复）

| # | 内容块 | 重复行数 | 备注 |
|---|--------|---------|------|
| 1 | **合并前覆盖率门控规范 v1** | **~32 行逐字 ×3 处副本**（jira reference.md:403-436、opsx-jira reference.md:58-89、opsx-solve reference.md） | 已声明「三处同步维护」但**无单一事实源** |
| 2 | 🔬 打点调试块（触发条件 + 3 debug skill 委托 + 登记回滚工具限制） | ~15 行近逐字 | **同样内容在 solve/opsx-solve 也存在**——4 个工作流各一份 |
| 3 | 验证报告诚实原则 | ~10 行语义重复 | 详略不一（11 行 vs 1 行浓缩） |
| 4 | Jira 回写两步骤 + 状态边界 | ~6 行近逐字 | transition 不传 comment 陷阱、body= 参数、禁流转「关闭」 |
| 5 | 调试-验证闭环块 | 4 行逐字 | **4 个工作流各一份** |
| 6 | ensure-tests 测试确保 | ~11 行语义重复 | **阻断强度相反（有意）** |
| 7 | 覆盖率门控 SKILL.md 内联摘要 | ~8 行近逐字 | 二次摘要（本体在 reference.md） |
| 8 | 调研路由委托段 + 步骤映射 | ~3 行 | 契约映射行允许各自保留 |
| 9 | Node 版本对齐 SOP 引用 | ~3 行 | 探测链已在 node-version-discipline |
| 10 | commit message 格式 + Jira 评论/PR 要素 | ~10 行语义重复 | opsx 多 OpenSpec 路径一项 |
| 11 | 分支命名 `fix/jira-fix-[ID]` + 多工程创建 | ~8 行语义重复 | |
| 12 | 模式生命周期/环境探索/前置检查委托引言 | 每处 ~3 行 | 机制已委托，引言措辞重复 |

### 1.3 扩围结论

- **jira-fix-batch / opsx-jira-fix-batch**：纯编排，**0 行** PDCA 阶段重复（批量模式传播为 workflow-mode-lifecycle 指定的编排侧职责，非重复）
- **perf-workflow**（286 行）：阶段概念与 PDCA 神似但全部为域化重写；唯一真重复 = `已知性能模式快搜`（:137-151，~15 行，known-issue-research §2 的性能特化实例，连结果表结构都同构）

## 2. 既有共享 skill 的边界判定

仓库已验证的范式：**共享 skill 承载阶段方法论（"怎么做好 X"），工作流承载阶段编排（"何时/顺序/门控/模式/循环"）**。`solution-review` 与 `learn-and-improve` 是深吸收先例。

| 共享 skill | 已承载 | 能否吸收更多阶段内容 | 边界理由 |
|-----------|--------|---------------------|---------|
| clarifying-question-discipline | 一次一问纪律 | ❌ 不能吸收整个「明确问题」阶段（复述/要素/Scope/门控/出口皆编排） | 其 Integration 指南明确工作流保留 3 个触点 |
| workflow-mode-lifecycle | 模式核心规则 | ❌ | 正交横切面，spec 明确边界 |
| learn-and-improve | Act 阶段全部方法论 | 已到上限（最强先例） | 其 Two modes 明确「阶段序列归宿主」 |
| known-issue-research | 调研路由/快搜/通病评估 | ✅ 唯一干净增量：吸收 perf 快搜 ~15 行 | 边界为「分析阶段的调研路由」 |
| solution-review | 9 维度审查方法论 | ❌ 不吸收审查循环编排（循环/3 轮上限/判定者） | 与 learn-and-improve 同型边界 |
| env-capability-discovery | 能力扫描与关键词表 | ❌ | 正交增强发现，spec 明确各工作流自持映射 |

**推论**：阶段正文里尚未委托的内容中，**80% 是编排（门控、出口、模式差异、产物落点），工作流特有，不可抽**；可抽的只是少数方法论性规则块。

## 3. 结论：方案 A —— 定向双抽取（背书）

### 3.1 抽取一：分析阶段核心共享 skill（候选名 `analysis-core`，以 skill-creator 定名为准）

**下沉内容（方法论性，4 个工作流高度同文）**：
- 临时改动权限与回滚门控（允许项/禁止项/登记四要素/出口门控三步骤）
- 打点调试触发条件（根因模糊/重试场景）+ 3 个 debug skill 的委托段 + 工具限制
- 调试-验证闭环规则（同 skill 复验、before/after 对比）
- 分析步骤骨架（存在性验证门控 → 调研路由 → 现象/定位/根因/上游评估/影响范围；调研路由本体仍归 `known-issue-research`）

**留存工作流的内容（编排性，禁止下沉）**：
- 出口停点与手动/自动行为差异、OPSX artifact 集成（proposal 回写）、Jira 产物落点（02-analysis.md）
- 行业通病评估的处理（jira 门控停止 vs opsx 暂停，**有意分歧**）
- 难度分级（jira 独立阶段 4 vs opsx-jira 内联）
- ensure-tests 与覆盖率门控的强度差异

**占位符设计**：
- `{next-stage}`：出口门控的「进入下一阶段前」目标（各工作流不同）——沿用 `known-issue-research` 的占位符契约（引用行声明「号+名」映射）。映射表草案：

| 工作流 | `{next-stage}` 映射 |
|--------|--------------------|
| solve-workflow | 阶段 3「探索方案」 |
| opsx-solve-workflow | 阶段 3「探索方案」 |
| jira-fix-workflow | 阶段 5「探索与审查方案」 |
| opsx-jira-fix-workflow | 阶段 3「创建 OpenSpec Change」（其分析在阶段 2，方案在阶段 4，先经阶段 3 建 change） |

- 步骤号映射继续留在各工作流（既有 known-issue-research 机制已覆盖）。

### 3.2 抽取二：覆盖率门控规范单源化

- 规范 v1 本体迁至 **`test-coverage-analyzer` skill**（其脚本的所有者与天然载体）
- 3 处 reference.md（jira / opsx-jira / opsx-solve）各保留一句引用：「门控规范见 `test-coverage-analyzer`（含判定矩阵、降级警告与留痕要求）」
- SKILL.md 内联摘要（~8 行 × 2 处）同步改为指向同一出处
- 实施前置验证：`test-coverage-analyzer` 的 PromptScript 类型与全局安装限制是否影响 3 个工作流的前置检查（其当前非任何工作流的强依赖，仅环境探索发现后使用——单源化不改变该可选性）

### 3.3 顺手修复（与抽取同批、独立 commits）

1. `jira-fix-workflow` 阶段 5 内联的 solution-review 4 维度 → 改为显式委托（其 deps 已声明，`opsx-jira-fix-workflow:366` 为正确先例）
2. `perf-workflow` 的 `已知性能模式快搜`（~15 行）→ 并入 `known-issue-research` 作为 §2 特化变体
3. `opsx-solve-workflow` 常见错误表（45 行）按仓库精简原则去重（删除复述自身阶段 Red Flags 的行，保留非直觉陷阱）

## 4. 成本收益评估

| 项 | 量 |
|----|-----|
| 减行（4 个工作流合计） | ~150-200 行（分析核心 ~70×2+15×2 下沉、门控规范 ~64 行副本消除、摘要 ~8×2、小修复 ~30） |
| 新增契约 | 1 个共享 skill（`analysis-core`）+ 占位符 `{next-stage}`（机制已验证） |
| 一致性维护先例成本 | 本仓库刚用 3 个 PR 修复编号/引用不一致——重复块每多存在一天，此类成本持续累积 |
| 净评估 | **为正**：两处抽取都打在「已发生过多处同步事故」的块上 |

## 5. 实施路线（未来独立 change）

1. `/skill-creator` 创建 `analysis-core`（意图捕获 → 草稿 → 测试用例 → 新旧对照 eval）
2. opsx change：4 个工作流逐一下沉 + 引用替换（沿用双语残留 grep 门控），每工作流独立 commit
3. 覆盖率门控单源化（同 change 或独立小 change）
4. 3 个顺手修复各自独立 commit
5. 全量验证：残留清扫、阶段标题顺序、validate、skills-index、新旧行为对照

## 6. 形似神异清单（禁止合并的有意分歧）

| 内容 | 两侧形态 | 性质 |
|------|---------|------|
| 覆盖率门控 | solve-workflow 建议性提示（非门控）vs opsx 系强制门控 | 有意，合并会破坏各自语义 |
| ensure-tests | solve/jira-fix 建议性不阻断 vs opsx 系阻断（失败不得进验证） | 有意 |
| 行业通病评估 | jira-fix 门控（停止 + 写 Jira 评论）vs opsx 系暂停等用户 | 有意 |
| 追踪注释 `// fix [JIRA-ID]` | jira-fix 强制 vs opsx-jira 可选 | 有意 |
| 审查维度来源 | solve 委托 solution-review vs opsx-solve 内联判定指引 | 现状分歧（见 §7-① 的不一致项） |

## 7. 意外发现登记（建议独立小修）

1. **`jira-fix-workflow` 声明 `solution-review` 依赖却内联其 4 维度未委托**——与同文件内「调用即声明」及 opsx-jira 的显式委托先例不一致（属待修不一致，非有意分歧）
2. **`opsx-solve-workflow` 常见错误表 45 行**大量复述自身阶段 Red Flags，违反 AGENTS.md「参考表/速览表不重复阶段详情」精简原则
3. **`upstream-dependency-debug` 在 solve-workflow 与 opsx-solve-workflow 正文被「加载执行」（阶段 2 上游评估步骤）但未声明于两者 frontmatter `dependencies`**——与 workflow-contract-sync「调用即声明」Requirement 冲突（jira 系为「可选委托、静默跳过」语义，可豁免；solve/opsx 为硬调用，应补声明或改可选语义）
4. `skills/opsx-solve-workflow-workspace/` 等 evolution 快照含旧编号文本（gitignore 本地目录，无行动）
