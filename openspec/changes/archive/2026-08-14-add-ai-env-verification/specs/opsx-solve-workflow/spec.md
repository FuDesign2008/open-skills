# opsx-solve-workflow Delta Specification

## ADDED Requirements

### Requirement: Phase 7 SHALL delegate verification execution to runtime-verification-discipline

`opsx-solve-workflow` MUST list `runtime-verification-discipline` in frontmatter `dependencies`（缺失即在启动前置检查中止，不静默降级）。Phase 7 检查验证 SHALL 遵循 `runtime-verification-discipline`：由 AI 在环境中按其选层规则与提供者解析亲自执行验证，仅在分类后的真硬边界才交还用户。原「AI cannot execute → tell the user to run it yourself」的默认二分被本纪律取代。Host 正文保持薄引用（加载 + 适用条件），不复述该纪律的方法论。

#### Scenario: 可达环境中的行为改动验证

- **WHEN** Phase 7 验证一个其行为可在 AI 能驱动的环境中检验的改动
- **THEN** Phase 7 由 AI 在该环境中按 `runtime-verification-discipline` 执行验证
- **AND** 不把验证步骤列为「请用户自行运行」

#### Scenario: 缺失 runtime-verification-discipline 时启动中止

- **WHEN** `opsx-solve-workflow` 启动前置检查发现 `runtime-verification-discipline` 不可用
- **THEN** 工作流在阶段 0 之后中止并提示安装
