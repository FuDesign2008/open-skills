# env-capability-discovery Specification (Delta)

## MODIFIED Requirements

### Requirement: 环境能力探索 SHALL 为弱引用并保持静默跳过语义

`env-capability-discovery` **默认**不进入工作流的 frontmatter `dependencies`；引用方未匹配到增强能力、或该 skill 不可用时，MUST 静默跳过并按原有流程执行，不报错、不阻断。**例外**：工作流可显式将其声明为强依赖（如 `solve-workflow`、`opsx-solve-workflow`、`jira-fix-workflow`、`opsx-jira-fix-workflow`），此时该工作流的前置 skill 检查 MUST 保证其可用，缺失时该工作流启动即中止，不做静默降级。

#### Scenario: skill 不可用时静默降级

- **WHEN** 运行环境未安装 `env-capability-discovery`，且引用方工作流**未**将其声明为强依赖
- **THEN** 引用方工作流跳过增强能力探索，按原有流程执行，不输出错误、不中止

#### Scenario: 声明强依赖的工作流缺失即中止

- **WHEN** 运行环境未安装 `env-capability-discovery`，而引用方工作流已将其声明为 frontmatter `dependencies` 强依赖
- **THEN** 该工作流前置检查不通过，启动即中止并提示安装
