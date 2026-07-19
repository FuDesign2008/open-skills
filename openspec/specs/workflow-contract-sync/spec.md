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

