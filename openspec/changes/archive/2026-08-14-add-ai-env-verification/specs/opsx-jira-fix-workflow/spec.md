# opsx-jira-fix-workflow Delta Specification

## ADDED Requirements

### Requirement: 验证环节 SHALL delegate verification execution to runtime-verification-discipline

`opsx-jira-fix-workflow` MUST list `runtime-verification-discipline` in frontmatter `dependencies`（缺失即在启动前置检查中止，不静默降级）。验证环节 SHALL 遵循 `runtime-verification-discipline`：由 AI 在环境中按其选层规则与提供者解析亲自执行验证。「manual-verification items」的默认姿态随之改变——验证默认由 AI 在环境执行，仅当属于分类后的真硬边界时才列为人工验证项并给出理由。Host 正文保持薄引用（加载 + 适用条件），不复述该纪律的方法论。

#### Scenario: 默认由 AI 在环境验证

- **WHEN** 验证环节面对一个其行为可在 AI 能驱动的环境中检验的改动
- **THEN** 由 AI 在该环境中按 `runtime-verification-discipline` 执行验证
- **AND** 不把它列为 manual-verification item

#### Scenario: 仅真硬边界才列为人工验证项

- **WHEN** 一项验证属于分类后的真硬边界（如无法行动 / 无法判定结果 / 有真实世界副作用）
- **THEN** 它被列为 manual-verification item 并注明硬边界理由
