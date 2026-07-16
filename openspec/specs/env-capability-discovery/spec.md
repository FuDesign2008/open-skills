# env-capability-discovery Specification

## Purpose
定义环境能力探索的共享契约：扫描方法、能力类型关键词、渐进增强调用原则由 `env-capability-discovery` skill 单点承载；引用方工作流弱引用（不声明 dependencies、静默降级），仅保留各自阶段映射与结果存储。

## Requirements

### Requirement: 共享 skill SHALL 单点定义环境能力探索的方法与调用原则

`env-capability-discovery` skill MUST 单点承载：① 探索方法（查系统提示 `<available_items>` / 用 skill 发现工具 / 通用降级跳过）；② 通用能力类型与匹配关键词表（调试分析、Web 调研、方案设计、代码审查、计划制定、代码执行、测试驱动、构建修复、完成验证等）；③ 调用原则（渐进增强不替代核心流程、只读阶段不因增强获得写权限、增强能力失败不阻断、调用前先读最新说明、frontmatter `dependencies` 强依赖不走环境探索）。引用方工作流 MUST NOT 复制上述内容全文。

#### Scenario: 工作流引用探索方法

- **WHEN** 工作流 skill 需要执行环境能力扫描
- **THEN** 其正文以引用 `env-capability-discovery` 的方式生效扫描方法与调用原则，不内联复制

### Requirement: 环境能力探索 SHALL 为弱引用并保持静默跳过语义

`env-capability-discovery` MUST NOT 进入任何工作流的 frontmatter `dependencies`；引用方未匹配到增强能力、或该 skill 不可用时，MUST 静默跳过并按原有流程执行，不报错、不阻断。

#### Scenario: skill 不可用时静默降级

- **WHEN** 运行环境未安装 `env-capability-discovery`
- **THEN** 引用方工作流跳过增强能力探索，按原有流程执行，不输出错误、不中止

### Requirement: 引用方工作流 SHALL 仅保留自身阶段映射与结果存储

各引用方工作流 MUST 仅保留两项自身内容：① 能力类型 → 自身阶段编号的映射小表（各工作流阶段编号不同）；② 扫描结果的存储位置（如 solve-workflow 记会话上下文、jira-fix-workflow 记 state.json `enhanced_capabilities` 字段）。映射表之外的探索方法与原则 MUST 委托共享 skill。

#### Scenario: 阶段编号差异由各工作流自持

- **WHEN** jira-fix-workflow（分析=阶段 2）与 solve-workflow（分析=阶段 1）引用同一能力类型「🔍 调试分析」
- **THEN** 各自正文的小表将同一能力类型映射到各自阶段编号，共享 skill 不含任何具体阶段编号
