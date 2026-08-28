# workflow-contract-sync Specification

## Purpose

solve 家族工作流（solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow）与调试方法论 skill（runtime-evidence-debug）的共享契约同步基线：browser 复现与验证口径、分析期打点权限门控、测试基建二分支、调用即声明强依赖、回顾阶段命名对齐。
## Requirements
### Requirement: 工作流引用 browser-debug-toolkit SHALL 以「浏览器可复现问题」为入口

工作流 skill（opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow / runtime-evidence-debug）引用 `browser-debug-toolkit` 时，MUST 以「问题可在浏览器中复现」为入口条件（UI/CSS/DOM 仅为典型场景子集），不得限定为「仅 UI/CSS/DOM 问题」；分析阶段 MUST 优先用其复现问题并观察运行时状态，检查验证阶段 MUST 用其验证解决方案是否生效（before/after 运行时状态对比）。

#### Scenario: 浏览器可复现的非 CSS 问题也走 browser 工具

- **WHEN** 工作流分析一个可在浏览器复现的交互异常（非 UI/CSS/DOM 类）
- **THEN** 该工作流同样委托 `browser-debug-toolkit` 复现与验证，不因「不是 CSS 问题」而退回纯静态分析

### Requirement: 工作流分析阶段 SHALL 允许分析辅助性临时改动并强制登记回滚

含分析阶段的工作流（opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow）MUST 允许 AI 直接添加打点代码、临时日志、复现脚本及验证性临时改动，并强制登记（文件 + 位置 + 原内容 + 目的）；进入下一阶段前 MUST 按登记回滚并输出「临时改动清单 + 回滚验证」，未回滚不得进入；修复实现的正式改动仍归执行阶段。

#### Scenario: 打点代码不再要求用户手动添加

- **WHEN** 工作流分析阶段需要添加打点代码定位根因
- **THEN** AI 直接添加并纳入登记，出口前回滚，不再要求「用户手动添加或经确认后 AI 添加」

### Requirement: 工作流测试步骤 SHALL 执行测试基建二分支

工作流执行阶段的测试步骤 MUST 先检测项目测试基建（测试框架配置 / `scripts.test` 等）：**有基建** → 委托 `test-suite-ensure` 补全测试并运行（scope 为本次变更的逻辑文件）；**无基建** → 按一次一问纪律询问用户「是否增加测试基建」，同意则委托 `test-suite-ensure`（含脚手架搭建），不同意则在执行报告中提醒且不阻断流程。MUST NOT 使用「若项目配置了 test-suite-ensure」之类的错误表述（test-suite-ensure 为全局安装 skill）。

#### Scenario: 无测试基建的项目不擅自搭建

- **WHEN** 工作流执行阶段发现变更涉及业务逻辑但项目无任何测试框架配置
- **THEN** 工作流询问用户是否增加测试基建；用户不同意时仅在执行报告中提醒「建议补充单元测试」，流程继续

### Requirement: 工作流调用的 skill SHALL 声明为强依赖

工作流在任一阶段中按指令调用的 skill（含 `test-suite-ensure`、`node-version-discipline`），MUST 声明在其 frontmatter `dependencies` 中并纳入前置 skill 检查（缺失即中止），不得「调用未声明」。

#### Scenario: 阶段 6 调用 test-suite-ensure 的工作流缺失该 skill 时中止

- **WHEN** 某工作流在测试步骤委托 `test-suite-ensure`，而运行环境未安装它
- **THEN** 该工作流前置检查不通过，启动即中止并提示安装，不做静默降级

#### Scenario: 工作流不再调用 env-capability-discovery

- **WHEN** 工作流已移除可选环境能力探索
- **THEN** 其 `dependencies` MUST NOT list `env-capability-discovery`，且正文 MUST NOT instruct loading that skill

### Requirement: 工作流回顾阶段 SHALL 以「复盘改进」命名对齐 learn-and-improve

工作流中委托 `learn-and-improve` 的回顾阶段或小节 MUST 使用「复盘改进」命名（旧称「回顾总结」可保留为别名触发词），使阶段语义与承载 skill 对齐。

#### Scenario: opsx 阶段 8 小节更名

- **WHEN** `opsx-solve-workflow` 执行归档后的经验沉淀小节
- **THEN** 该小节以「复盘改进（委托 learn-and-improve）」命名，不再使用「回顾总结与经验沉淀」

#### Scenario: solve-workflow 阶段 8 小节更名

- **WHEN** `solve-workflow` 执行阶段 8 的复盘改进小节
- **THEN** 该小节以「复盘改进（委托 learn-and-improve）」命名，不再使用「回顾总结与经验沉淀」

### Requirement: 工作流阶段编号 SHALL 为「阶段 0 门禁 + 业务阶段 1-based 顺序整数」

工作流 skill 的阶段编号 MUST 遵循：前置检查/门禁类阶段编号为「阶段 0」（若无门禁阶段则从 1 开始）；业务阶段从 1 开始连续整数，MUST NOT 使用小数插号（如 1.5、2.5、6.4）作为独立阶段编号。小数编号仅允许用于阶段**内部**的小节或子步骤（如「阶段 6 的 6.2.5 小节」「阶段 8 的 8.1/8.2 子步骤」）。

#### Scenario: jira-fix-workflow 理解对齐与难度分级获得整数阶段

- **WHEN** `jira-fix-workflow` 执行理解对齐或难度分级
- **THEN** 二者分别以「阶段 2」「阶段 4」编号出现，不再使用「阶段 1.5」「阶段 2.5」

#### Scenario: opsx-jira-fix-workflow 验证与归档获得整数阶段

- **WHEN** `opsx-jira-fix-workflow` 执行检查验证或提交与归档
- **THEN** 二者分别以「阶段 7」「阶段 8」编号出现；提交子步骤以「8.1/8.2」编号，不再使用「6.4」「7.1/7.2」

### Requirement: 工作流合并前覆盖率门控 SHALL 在合并动作发生时启动决策

`solve` 家族工作流（`opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`）的合并前覆盖率门控 MUST 在 AI 即将执行合并动作时启动 **Part C 决策**（委托 `merge-discipline`）。合并动作的判定信号（满足任一）：分支收尾决策中选定「合并」/ 用户直接下达合并指令（「merge MR」「合并 MR」「准备合并」等）/ AI 准备调用 `glab mr merge` / `gh pr merge` / `git merge` 到保护分支。启动决策后，AI MUST 按 `merge-discipline` 的工程偏好（`always` / `never` / `ask`）与每次询问规则决定是否运行 `test-coverage-analyzer`；不得在未完成该决策时默认开跑。「保留分支」「继续开发」属于非合并动作，门控不触发。

#### Scenario: 用户跳过分支收尾决策直接说合并

- **WHEN** 用户在工作流归档后跳过分支收尾决策，直接说「准备 merge MR #450」
- **THEN** 工作流启动覆盖率门控决策；仅当偏好为 `always` 或用户在 `ask` 下选择「跑」时才运行 test-coverage-analyzer，再执行合并

#### Scenario: 分支收尾决策为「保留分支」不触发门控

- **WHEN** 用户在分支收尾决策中选定「保留当前分支」或「继续开发」
- **THEN** 工作流不触发覆盖率门控，分支保留原状

#### Scenario: ask 偏好下用户选择跳过仍可合并

- **WHEN** 合并意图已确认、工程未声明 `coverage-gate:`（或声明为 `ask`），且用户选择本次跳过覆盖率
- **THEN** 工作流写入显式跳过留痕后继续合并流程，不得因未跑 analyzer 而视为隐式漏跑

### Requirement: 工作流 SHALL 处理门控隐式漏跑

工作流门控判定矩阵 MUST 包含「隐式漏跑」情况：在用户或工程偏好已决定 **应当运行** 覆盖率门控（`always`，或 `ask` 下用户已选「跑」）之后，门控脚本未运行而合并动作已发生时，MUST 暂停合并、补跑门控。若合并已完成（无法回退），工作流 MUST 写入漏跑留痕（`【覆盖率门控漏跑】合并已发生但门控未运行。时间：<ISO 时间戳>。漏跑阶段：<合并前/合并后>。`），留痕位置与显式跳过留痕位置一致。合法的 `never` 偏好跳过或 `ask` 下用户显式跳过 MUST NOT 记为隐式漏跑。

#### Scenario: AI 在合并前发现应跑却未跑门控

- **WHEN** 用户已选择「跑」或偏好为 `always`，且 AI 即将调用 `glab mr merge` 而尚未运行覆盖率脚本
- **THEN** 工作流判定为「隐式漏跑」，暂停合并、补跑门控

#### Scenario: AI 已合并后发现应跑却未跑门控

- **WHEN** AI 已执行 `glab mr merge` 完成合并，事后发现在应跑条件下未运行覆盖率门控
- **THEN** 工作流如实报告漏跑（无法回退），按上述格式留痕写入 PR 描述和 design.md Verification Notes

#### Scenario: 用户显式跳过不算漏跑

- **WHEN** 用户在 `ask` 决策中选择跳过并已写入跳过留痕后合并完成
- **THEN** 工作流不得将此次记为隐式漏跑

### Requirement: 工作流 SHALL 在未发现 test-coverage-analyzer 时留痕并交用户决策

当覆盖率决策结果为 **运行** 且门控前置检测未发现 `test-coverage-analyzer` skill 时，MUST 输出提示「门控不可用：未检测到 test-coverage-analyzer skill」，写入环境缺漏留痕（`【覆盖率门控跳过】未检测到 test-coverage-analyzer skill，门控不可用。时间：<ISO 时间戳>。决策人：系统（环境缺漏）。`），由用户决定是否继续合并。若决策结果为跳过（`never` 或用户显式跳过），MUST NOT 仅因未安装 analyzer 而阻断。

#### Scenario: 未装 test-coverage-analyzer 的项目在选择运行时留痕交用户决策

- **WHEN** 用户或偏好选择运行覆盖率，且环境探索未发现 `test-coverage-analyzer` skill
- **THEN** 工作流输出「门控不可用」提示并写入留痕，由用户决定是否继续合并

### Requirement: 工作流 SHALL 提供合并前覆盖率门控检查清单

工作流对合并前检查清单的权威来源 MUST 为 `merge-discipline/reference.md`（宿主仅保留一句指针）。清单 MUST 覆盖：合并意图是否已确认 / 工程 `coverage-gate` 偏好是否已解析 / `ask` 时是否已询问用户 / 若决定运行则 analyzer 是否可用且已执行 / 结果如何（达标继续；不达标/崩溃/无报告/无测试→暂停；应跑却漏跑→按漏跑规则）/ 跳过或环境缺漏留痕是否写入。

#### Scenario: AI 执行合并前对照清单

- **WHEN** AI 准备执行 `glab mr merge` 或 `gh pr merge`
- **THEN** 工作流要求 AI 对照 `merge-discipline` 合并前检查清单逐项确认，任一项未满足则暂停合并

### Requirement: Jira 状态回写 SHALL 在 PR/MR 合并完成后执行

`solve` 家族 Jira 工作流（`jira-fix-workflow` / `opsx-jira-fix-workflow`）的 Jira 状态回写 MUST 在 PR/MR 合并完成后执行，而非 PR/MR 创建时。PR 创建后可能被拒绝、需要修改或 Code Review 不通过；提前回写「已修复」会误导 QA。回写的操作内容与状态边界 MUST 委托强依赖 skill `jira-status-writeback`（两步独立 API、仅「已修复」、`jira_add_comment` 的 `body` 参数）；宿主 MUST NOT 在正文中保留完整两步 API 复述，仅保留加载指针与宿主字段映射。

#### Scenario: PR 创建时不同写 Jira

- **WHEN** 工作流执行到 PR/MR 创建步骤
- **THEN** 工作流只执行 commit + push + 创建 PR/MR，不执行 Jira 状态回写

#### Scenario: PR/MR 合并完成后回写 Jira

- **WHEN** PR/MR 已成功合并到目标分支
- **THEN** 工作流加载 `jira-status-writeback` 并按其 SOP 流转到「已修复」且独立调用 `jira_add_comment` 写修复评论

#### Scenario: Host does not restate the two-step API

- **WHEN** an agent opens the post-merge section of `jira-fix-workflow` or `opsx-jira-fix-workflow`
- **THEN** the section points at `jira-status-writeback` for API/status rules and does not paste the full two-step procedure


### Requirement: 分析阶段核心方法论内容 SHALL 单源承载

工作流 skill 的分析阶段核心方法论内容——临时改动权限与回滚门控、打点调试触发条件与调试 skill 委托、调试-验证闭环规则、分析步骤骨架——MUST 由共享 skill `analysis-core` 单源承载，各工作流以引用方式集成并在引用行声明差异映射（如 `{next-stage}` 占位符，须「号+名」），MUST NOT 在各工作流正文中逐字复制该内容。编排性内容（阶段出口、手动/自动模式差异、OpenSpec/Jira 产物落点、形似神异清单上的有意分歧）MUST 留在各工作流。本 Requirement 在 `analysis-core` 已落地的仓库状态下生效。

#### Scenario: 新增工作流复用分析阶段核心

- **WHEN** 新增一个 PDCA 工作流需要分析阶段
- **THEN** 其正文以引用 `analysis-core` 的方式获得临时改动门控、打点调试与调试-验证闭环规则，仅保留自身编排（出口、模式、产物落点）与差异映射，不复制共享内容全文

#### Scenario: 既有四工作流完成迁移

- **WHEN** `solve-workflow` / `opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow` 的分析阶段被打开
- **THEN** 上述方法论块来自对 `analysis-core` 的加载/引用，工作流 frontmatter 将 `analysis-core` 列为强依赖（硬加载路径），且正文无该块的逐字副本

### Requirement: Workflow review stages SHALL defer architecture-weight gates to review skills

PDCA workflows that strongly depend on `solution-review` and `code-design-review` (solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow) MUST NOT embed outdated non-blocking guidance that allows deferring a superior architecture solely because near-term maintainability is acceptable. They MUST point agents to those skills for blocking/non-blocking criteria and, for code-affecting solutions, MUST require `code-design-review` Layer A (architecture layer) at the depth that skill defines.

#### Scenario: Workflow drops near-term architecture deferral prose

- **WHEN** a workflow's review-stage section lists non-blocking examples
- **THEN** it does not include "better architecture but near-term OK → non-blocking"; instead it states that architecture-weight and long-term maintainability gates live in `code-design-review` / `solution-review`

### Requirement: Workflow hosts SHALL thin-ref shared orchestration and gates

PDCA workflows MUST thin-reference `staged-review-flow` (all four) and `opsx-workspace-gate` (opsx pair only) per AGENTS thin-ref rules: load + placeholder map + host-only orchestration. They MUST NOT expand `merge-discipline` Part A–D steps, learn-and-improve four-step lists, clarifying-question long restatements, or node-version probe chains in host bodies.

#### Scenario: Merge hosts drop Part expansions

- **WHEN** Wave 1 completes
- **THEN** `jira-fix-workflow` / `opsx-solve-workflow` / `opsx-jira-fix-workflow` contain at most a one-line pointer to `merge-discipline` Parts A→D, not inline Part bullets

### Requirement: Workflow review stages SHALL NOT embed outdated review blocking lists

After `staged-review-flow` lands, host review sections MUST NOT keep a parallel blocking/non-blocking bullet list that can drift from `solution-review` / `code-design-review`.

#### Scenario: Inline blocking guide removed from opsx-solve

- **WHEN** Wave 2a completes
- **THEN** `opsx-solve-workflow` no longer maintains its own「阻断问题判定指引」list duplicating review skills

### Requirement: Jira fix hosts SHALL thin-reference merge and env discovery

`jira-fix-workflow` and `opsx-jira-fix-workflow` MUST NOT embed full `merge-discipline` Part C/D step lists or Red Flag catalogs that duplicate that skill; they MUST keep at most a one-line load pointer plus host order constraints (e.g. writeback after merge, archive-before-merge for opsx). They MUST NOT restate optional environment-capability discovery methodology or maintain a capability-to-stage enhancement mapping table.

#### Scenario: merge Red Flags removed from host

- **WHEN** an agent reads Red Flags near merge in either Jira host after this change
- **THEN** coverage/tip/archive merge pitfalls are directed to `merge-discipline`, not duplicated as multi-bullet host catalogs

#### Scenario: Jira host has no env enhancement mapping

- **WHEN** an agent reads `jira-fix-workflow` or `opsx-jira-fix-workflow` preamble
- **THEN** there is no capability→stage table or load note for `env-capability-discovery`


### Requirement: Hosts MUST NOT orchestrate optional enhancement discovery

`solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` MUST run on built-in stages and frontmatter strong dependencies only. They MUST NOT instruct scanning for optional enhancement skills (including Superpowers-branded skills) and MUST NOT list third-party enhancement skill names as progressive hooks.

#### Scenario: Opsx-solve has no Superpowers section

- **WHEN** an agent loads `opsx-solve-workflow`
- **THEN** the skill has no Superpowers progressive-enhancement table and no “scan Superpowers skills” startup step

### Requirement: Jira fix hosts SHALL relocate bulky templates to reference.md

Bulky output templates, OpenSpec artifact field checklists, and long exit-speech examples that exceed short inline needs MUST live in each host’s `reference.md` (or the shared writeback skill). The host `SKILL.md` MUST keep orchestration, gates, intentional divergences, and one-line pointers. Target after this change: `jira-fix-workflow/SKILL.md` roughly 420–520 lines and `opsx-jira-fix-workflow/SKILL.md` roughly 350–450 lines (approximate, not a hard CI gate).

#### Scenario: opsx stage-3 field list moves to reference

- **WHEN** `opsx-jira-fix-workflow` documents required design.md / proposal fields
- **THEN** the detailed field checklist is in `reference.md` and the SKILL keeps naming, creation order, and minimum completeness headings

#### Scenario: jira-fix analysis template not fully inlined

- **WHEN** `jira-fix-workflow` documents analysis-stage output shape
- **THEN** full templates are referenced from `reference.md` rather than pasted as long inline blocks in SKILL.md

### Requirement: Host reference.md SHALL NOT restate shared analysis or industry-research skeletons

PDCA host `reference.md` files MUST NOT paste the full `analysis-core` step skeleton or the full `known-issue-research` industry-wide evaluation report template. They MUST use one-line (or short) pointers to those skills' authoritative docs. Host-only fields MAY remain (e.g. jira `02-analysis.md` path, difficulty pre-assessment, OpenSpec-specific verify bullets).

#### Scenario: jira Stage 3 leans on analysis-core

- **WHEN** an agent formats jira-fix stage 3 analysis output
- **THEN** methodology steps come from `analysis-core`; the host reference keeps jira-specific artifact/gate/difficulty fields without re-listing the full shared skeleton

#### Scenario: Industry template points to known-issue-research

- **WHEN** jira-fix needs an industry-wide hard-problem report format
- **THEN** it points to `known-issue-research/reference.md` for the shared template and keeps only the jira gate divergence (stop flow + Jira comment) in the host reference

### Requirement: Prerequisite missing-notice dependency lists SHALL match frontmatter

When a host documents a Prerequisite Skill Check missing-notice that enumerates strong dependencies, that enumeration MUST include every skill listed in the host's current frontmatter `dependencies` (or state "see frontmatter dependencies" without a stale partial list). It MUST NOT omit newer shared disciplines that the frontmatter already declares.

#### Scenario: solve-workflow missing notice stays current

- **WHEN** `solve-workflow` frontmatter gains new strong dependencies
- **THEN** its reference.md missing-notice list is updated in the same change (or replaced by an explicit "enumerate from frontmatter" instruction) so install hints do not lie

### Requirement: solve 家族探索方案阶段 SHALL 先做架构边界预检再权衡短期成本

`solve` 家族工作流（`solve-workflow` / `opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`）的探索方案阶段，当候选方案涉及跨进程或跨层调用时，MUST 在评估短期成本（改动量、复用已有实现、同仓/单仓改动、协作范围）之前先完成**架构边界预检**，决策顺序为：能力运行时初始化位置 → 边界合法性（跨层 import 是否把依赖树拉入调用方，含打包器静态预扫描使动态 `require`/`import` 无法绕过循环依赖）→ 能力归属分类（系统能力 vs 数据/产品能力，与调用方定位是否一致）→ 然后才评估短期成本。预检的核查项名称内联在各宿主正文（约两行），方法论单一来源为 `code-design-review` Layer A 依赖方向维度（薄引用，MUST NOT 复制其完整核查方法）；预检结论（各候选的边界判定）MUST 随方案对比表一同呈现，短期成本理由 MUST NOT 单独作为跨边界方案的推荐依据。纯仓内/单层方案不触发本预检。

#### Scenario: 跨进程方案先过边界预检再进对比表

- **WHEN** 探索方案阶段生成的一个候选方案需要主进程调用仅在服务子进程初始化的能力
- **THEN** 该宿主先回答能力初始化位置与边界合法性，边界判定随对比表呈现；「复用已有实现 + 同仓改动」不得先于该判定成为推荐理由

#### Scenario: 四宿主预检表述保持薄且一致

- **WHEN** 任一 solve 家族宿主的探索方案阶段被打开
- **THEN** 其正文只保留决策顺序规则与核查项名称内联（约两行），完整核查方法指向 `code-design-review` Layer A，不逐字复制
