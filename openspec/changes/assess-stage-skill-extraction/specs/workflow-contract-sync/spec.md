# workflow-contract-sync Specification (Delta)

## ADDED Requirements

### Requirement: 分析阶段核心方法论内容 SHALL 单源承载

工作流 skill 的分析阶段核心方法论内容——临时改动权限与回滚门控、打点调试触发条件与调试 skill 委托、调试-验证闭环规则、分析步骤骨架——MUST 由单一共享 skill 承载，各工作流以引用方式集成并声明差异映射（如 `{next-stage}` 占位符），MUST NOT 在各工作流正文中逐字复制该内容。本 Requirement 于 `analysis-core` 共享 skill 落地后生效；落地前各工作流维持现状并视为待迁移状态。

#### Scenario: 新增工作流复用分析阶段核心

- **WHEN** 新增一个 PDCA 工作流需要分析阶段
- **THEN** 其正文以引用共享 skill 的方式获得临时改动门控、打点调试与调试-验证闭环规则，仅保留自身编排（出口、模式、产物落点）与差异映射，不复制共享内容全文
