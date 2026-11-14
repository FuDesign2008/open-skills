# Spec Delta

## MODIFIED Requirements

### Requirement: 共享 skill SHALL 单点定义自动/手动模式核心生命周期

`workflow-mode-lifecycle` skill MUST 单点承载模式核心生命周期规则：① 核心规则「自动恢复手动」（正常完成全流程、流程被任意中断时自动恢复为手动模式，`observe` 同样恢复为手动）；② 重新进入自动模式必须显式触发（如「自动 xxx」「切换自动模式」），隐式延续（「继续」「再改一下」）MUST NOT 重新激活自动模式；③ 批量场景由编排工具为每个子调用显式传递模式参数，不受单次恢复规则影响。引用方工作流 MUST NOT 复制上述核心规则全文。

模式集合为 `manual` / `observe` / `auto`。`observe` 是第三控制流态，不是 `auto` 的子标志；它与 `ai-proxy` overlay 正交。

#### Scenario: 工作流引用而非复制核心规则

- **WHEN** 含模式概念的工作流 skill（solve-workflow、opsx-solve-workflow、jira-fix-workflow、opsx-jira-fix-workflow）描述模式生命周期
- **THEN** 其正文以引用 `workflow-mode-lifecycle` 的方式生效核心规则，仅保留自身触发词识别与「特有差异」块

#### Scenario: 隐式延续不重新激活自动模式

- **WHEN** 自动模式已恢复手动，用户说「继续」「再改一下」等隐式延续
- **THEN** 保持手动模式，不重新进入自动模式

#### Scenario: observe 结束同样恢复手动

- **WHEN** 一次 `observe` 运行正常完成或被中断
- **THEN** 模式恢复为 `manual`，重新进入需要显式触发

## ADDED Requirements

### Requirement: 共享 skill SHALL 提供 observe 模式

`workflow-mode-lifecycle` MUST 定义 `observe` 模式：完整执行判定、审查、计划与验证并记录每一步结论（含「若放行会做什么」），但不修改仓库、不发送对外消息、不执行合并或发布等不可逆动作。

引用方工作流的 `description` 列出 `observe` 触发词时识别该模式；未列出时保持原两态识别。

#### Scenario: observe 不产生副作用

- **WHEN** 工作流处于 `observe` 模式并完成一次判定
- **THEN** 运行记录包含结论与「若放行会做什么」，且仓库与外部状态未被修改

#### Scenario: observe 不自动升级为 auto

- **WHEN** `observe` 运行完成且每一步判定均与预期一致
- **THEN** 模式仍恢复为 `manual`，不自动切换为 `auto`

#### Scenario: 未声明触发词的宿主保持两态

- **WHEN** 宿主 `description` 未列出 `observe` 触发词
- **THEN** 该宿主按原有 `manual` / `auto` 两态识别，`observe` 触发词不改变其行为

### Requirement: 请求强度 SHALL 区分 explicit 与 inferred

工作流 MUST 区分请求强度：`explicit`（人明确要求：点名、直接指令、显式触发词）与 `inferred`（系统推断：上下文推论、队列 triage 建议、自动发现的问题）。未标注来源的请求 MUST 视为 `explicit`。

`inferred` 请求即使运行在 `auto` 模式，也 MUST 按 `observe` 执行。人查看记录后可显式提升为 `explicit`。

#### Scenario: inferred 请求在 auto 下降级

- **WHEN** 一个标注为 `inferred` 的请求在 `auto` 模式下被处理
- **THEN** 该请求按 `observe` 执行，只记录不产生副作用

#### Scenario: 未标注来源按 explicit 处理

- **WHEN** 请求没有标注强度
- **THEN** 视为 `explicit`，按当前模式执行

#### Scenario: 人可提升强度

- **WHEN** 人查看 `inferred` 请求的 observe 记录后明确要求执行
- **THEN** 该请求转为 `explicit`，按当前模式执行
