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

工作流执行阶段的测试步骤 MUST 先检测项目测试基建（测试框架配置 / `scripts.test` 等）：**有基建** → 委托 `ensure-tests` 补全测试并运行（scope 为本次变更的逻辑文件）；**无基建** → 按一次一问纪律询问用户「是否增加测试基建」，同意则委托 `ensure-tests`（含脚手架搭建），不同意则在执行报告中提醒且不阻断流程。MUST NOT 使用「若项目配置了 ensure-tests」之类的错误表述（ensure-tests 为全局安装 skill）。

#### Scenario: 无测试基建的项目不擅自搭建

- **WHEN** 工作流执行阶段发现变更涉及业务逻辑但项目无任何测试框架配置
- **THEN** 工作流询问用户是否增加测试基建；用户不同意时仅在执行报告中提醒「建议补充单元测试」，流程继续

### Requirement: 工作流调用的 skill SHALL 声明为强依赖

工作流在任一阶段中按指令调用的 skill（含 `ensure-tests`、`env-capability-discovery`、`node-version-discipline`），MUST 声明在其 frontmatter `dependencies` 中并纳入前置 skill 检查（缺失即中止），不得「调用未声明」。

#### Scenario: 阶段 6 调用 ensure-tests 的工作流缺失该 skill 时中止

- **WHEN** 某工作流在测试步骤委托 `ensure-tests`，而运行环境未安装它
- **THEN** 该工作流前置检查不通过，启动即中止并提示安装，不做静默降级

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

### Requirement: 工作流合并前覆盖率门控 SHALL 在合并动作发生时启动

`solve` 家族工作流（`opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`）的合并前覆盖率门控 MUST 在 AI 即将执行合并动作时启动。合并动作的判定信号（满足任一）：分支收尾决策中选定「合并」/ 用户直接下达合并指令（「merge MR」「合并 MR」「准备合并」等）/ AI 准备调用 `glab mr merge` / `gh pr merge` / `git merge` 到保护分支。门控启动后，AI 先运行 test-coverage-analyzer，达标后再执行合并。「保留分支」「继续开发」属于非合并动作，门控不触发。

#### Scenario: 用户跳过分支收尾决策直接说合并

- **WHEN** 用户在工作流归档后跳过分支收尾决策，直接说「准备 merge MR #450」
- **THEN** 工作流触发合并前覆盖率门控，运行 test-coverage-analyzer，达标后再执行 `glab mr merge`

#### Scenario: 分支收尾决策为「保留分支」不触发门控

- **WHEN** 用户在分支收尾决策中选定「保留当前分支」或「继续开发」
- **THEN** 工作流不触发覆盖率门控，分支保留原状

### Requirement: 工作流 SHALL 处理门控隐式漏跑

工作流门控判定矩阵 MUST 包含「隐式漏跑」情况：门控未运行而合并动作已发生时，MUST 暂停合并、补跑门控。若合并已完成（无法回退），工作流 MUST 写入漏跑留痕（`【覆盖率门控漏跑】合并已发生但门控未运行。时间：<ISO 时间戳>。漏跑阶段：<合并前/合并后>。`），留痕位置与显式跳过留痕位置一致。

#### Scenario: AI 在合并前发现未跑门控

- **WHEN** AI 即将调用 `glab mr merge` 而意识到未运行覆盖率门控
- **THEN** 工作流判定为「隐式漏跑」，暂停合并、补跑门控

#### Scenario: AI 已合并后发现未跑门控

- **WHEN** AI 已执行 `glab mr merge` 完成合并，事后发现未运行覆盖率门控
- **THEN** 工作流如实报告漏跑（无法回退），按上述格式留痕写入 PR 描述和 design.md Verification Notes

### Requirement: 工作流 SHALL 在未发现 test-coverage-analyzer 时留痕并交用户决策

工作流门控前置检测未发现 `test-coverage-analyzer` skill 时，MUST 输出提示「门控不可用：未检测到 test-coverage-analyzer skill」，写入环境缺漏留痕（`【覆盖率门控跳过】未检测到 test-coverage-analyzer skill，门控不可用。时间：<ISO 时间戳>。决策人：系统（环境缺漏）。`），由用户决定是否继续合并。

#### Scenario: 未装 test-coverage-analyzer 的项目合并时留痕交用户决策

- **WHEN** 用户在工作流中选定合并意图，环境探索未发现 `test-coverage-analyzer` skill
- **THEN** 工作流输出「门控不可用」提示并写入留痕，由用户决定是否继续合并

### Requirement: 工作流 SHALL 提供合并前覆盖率门控检查清单

工作流 reference.md 的门控规范章节 MUST 提供显式的「合并前检查清单」，AI 执行合并前逐项确认：合并意图是否已确认 / test-coverage-analyzer 是否可用 / 门控是否已运行 / 门控结果如何（达标继续；不达标/崩溃/无报告/无测试→暂停；漏跑→按漏跑规则）/ 留痕是否写入。

#### Scenario: AI 执行合并前对照清单

- **WHEN** AI 准备执行 `glab mr merge` 或 `gh pr merge`
- **THEN** 工作流要求 AI 对照合并前检查清单逐项确认，任一项未满足则暂停合并

### Requirement: Jira 状态回写 SHALL 在 PR/MR 合并完成后执行

`solve` 家族 Jira 工作流（`jira-fix-workflow` / `opsx-jira-fix-workflow`）的 Jira 状态回写（流转到「已修复」+ 写修复评论）MUST 在 PR/MR 合并完成后执行，而非 PR/MR 创建时。PR 创建后可能被拒绝、需要修改或 Code Review 不通过；提前回写「已修复」会误导 QA。Jira 回写的操作内容（两步独立调用：① `jira_transition_issue` 流转状态，② `jira_add_comment` 写评论）保持不变。

#### Scenario: PR 创建时不同写 Jira

- **WHEN** 工作流执行到 PR/MR 创建步骤
- **THEN** 工作流只执行 commit + push + 创建 PR/MR，不执行 Jira 状态回写

#### Scenario: PR/MR 合并完成后回写 Jira

- **WHEN** PR/MR 已成功合并到目标分支
- **THEN** 工作流执行 Jira 状态回写：流转到「已修复」+ 独立调用 `jira_add_comment` 写修复评论
