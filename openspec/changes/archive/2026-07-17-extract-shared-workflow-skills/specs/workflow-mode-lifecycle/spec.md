# workflow-mode-lifecycle Delta Spec

## ADDED Requirements

### Requirement: 共享 skill SHALL 单点定义自动/手动模式核心生命周期

`workflow-mode-lifecycle` skill MUST 单点承载模式核心生命周期规则：① 核心规则「自动恢复手动」（正常完成全流程、流程被任意中断时自动恢复为手动模式）；② 重新进入自动模式必须显式触发（如「自动 xxx」「切换自动模式」），隐式延续（「继续」「再改一下」）MUST NOT 重新激活自动模式；③ 批量场景由编排工具为每个子调用显式传递模式参数，不受单次恢复规则影响。引用方工作流 MUST NOT 复制上述核心规则全文。

#### Scenario: 工作流引用而非复制核心规则

- **WHEN** 含自动/手动模式概念的工作流 skill（solve-workflow、opsx-solve-workflow、jira-fix-workflow、opsx-jira-fix-workflow）描述模式生命周期
- **THEN** 其正文以引用 `workflow-mode-lifecycle` 的方式生效核心规则，仅保留自身触发词识别与「特有差异」块

#### Scenario: 隐式延续不重新激活自动模式

- **WHEN** 自动模式已恢复手动，用户说「继续」「再改一下」等隐式延续
- **THEN** 保持手动模式，不重新进入自动模式

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
