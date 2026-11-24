# workflow-mode-lifecycle Specification

## Purpose
定义自动/手动模式生命周期的共享契约：核心规则（自动恢复手动、显式重进、批量场景）由 `workflow-mode-lifecycle` skill 单点承载，引用方工作流以其为准并仅追加各自特有差异。
## Requirements
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

### Requirement: 引用方工作流 SHALL 以特有差异块形式保留自身模式规则

各引用方工作流 MUST 将其特有的模式行为（如 jira-fix-workflow 的 `--retry` 重置手动、`--resume` 沿用断点、验证回退保持模式；opsx 系列的归档完成恢复手动、archive 失败视为中断）以「特有差异」块形式保留在自身正文中，MUST NOT 上移进共享 skill（共享 skill 只承载跨工作流稳定的核心规则）。

#### Scenario: jira 特有规则留在 jira-fix-workflow

- **WHEN** 用户在 jira-fix-workflow 中使用 `--retry` 重入分析阶段
- **THEN** 模式按 jira-fix-workflow 自身「特有差异」块重置为手动；该规则不出现在 `workflow-mode-lifecycle` 正文中

### Requirement: 模式生命周期 SHALL 作为引用方工作流的强依赖

引用方工作流 MUST 在 frontmatter `dependencies` 中声明 `workflow-mode-lifecycle`，启动前置检查缺失即中止并提示安装命令，MUST NOT 静默降级为内联旧规则。

#### Scenario: 缺失即中止

- **WHEN** 引用方工作流启动时前置检查发现 `workflow-mode-lifecycle` 不可用
- **THEN** 立即中止流程并输出缺失提示（含安装命令），不降级运行

### Requirement: 共享 skill SHALL 识别 ai-proxy overlay（非第三控制流态）

`workflow-mode-lifecycle` SHALL recognize an **ai-proxy overlay** in addition to manual/auto control-flow modes, without folding the `ai-proxy-discipline` charter into this skill. Recognition: a host that lists ai-proxy triggers in its `description` treats 「ai-proxy 模式」「AI 代理模式」 / "ai-proxy mode" as overlay request; 「切换 ai-proxy」 / "switch to ai-proxy" switches mid-run. Overlay maps to **auto carrier** plus `Stage-exit policy: ai-proxy`; occupancy and thin freeze remain in `ai-proxy-discipline`. On full-flow completion or any interruption, overlay MUST revert to manual and clear the policy (same revert table as auto). Re-entering overlay requires an explicit trigger; implicit continuation (「继续」「再改一下」「深入分析」) MUST NOT re-activate overlay. Batch orchestrators MUST pass `Stage-exit policy` explicitly per child (not ambient inheritance). This skill MUST NOT restate the proxy authority charter, reserved list, or adversarial protocol.

#### Scenario: 独立触发请求 overlay 而非裸 auto

- **WHEN** solve-workflow 的触发含「ai-proxy 模式」且不含仅表示裸 auto 的「自动分析/自动解决」路径
- **THEN** 生命周期将本次 run 标为 overlay 请求（auto 载体 + 待写入的 Stage-exit policy: ai-proxy），不把它当成普通自动模式（named escapes 直通）

#### Scenario: 完成回手动并清除 overlay

- **WHEN** 处于 overlay 的 PDCA 流程正常完成或被中断
- **THEN** 恢复手动模式，且本次 Stage-exit policy 不再视为 ai-proxy

#### Scenario: 隐式延续不重开 overlay

- **WHEN** overlay 已回手动后用户说「继续」「再改一下」
- **THEN** 保持手动，不重新进入 overlay，也不重新开始薄冻结

### Requirement: 未声明 ai-proxy 触发词的宿主 MUST 忽略 overlay

Hosts that declare `workflow-mode-lifecycle` but do **not** list ai-proxy triggers in `description` (including `write-workflow`) MUST keep two-state recognition only: 「自动」 selects auto mode; other phrases including 「ai-proxy 模式」 MUST NOT start overlay, freeze, or occupancy.

#### Scenario: write-workflow 不进入 overlay

- **WHEN** write-workflow 运行中用户说「ai-proxy 模式」或「切换 ai-proxy」
- **THEN** 不改变该宿主的手动/自动状态机（除非同时命中该宿主已有的「自动」触发），不加载代理占位

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

