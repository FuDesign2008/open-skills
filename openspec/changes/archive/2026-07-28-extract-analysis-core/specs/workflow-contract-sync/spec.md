## MODIFIED Requirements

### Requirement: 分析阶段核心方法论内容 SHALL 单源承载

工作流 skill 的分析阶段核心方法论内容——临时改动权限与回滚门控、打点调试触发条件与调试 skill 委托、调试-验证闭环规则、分析步骤骨架——MUST 由共享 skill `analysis-core` 单源承载，各工作流以引用方式集成并在引用行声明差异映射（如 `{next-stage}` 占位符，须「号+名」），MUST NOT 在各工作流正文中逐字复制该内容。编排性内容（阶段出口、手动/自动模式差异、OpenSpec/Jira 产物落点、形似神异清单上的有意分歧）MUST 留在各工作流。本 Requirement 在 `analysis-core` 已落地的仓库状态下生效。

#### Scenario: 新增工作流复用分析阶段核心

- **WHEN** 新增一个 PDCA 工作流需要分析阶段
- **THEN** 其正文以引用 `analysis-core` 的方式获得临时改动门控、打点调试与调试-验证闭环规则，仅保留自身编排（出口、模式、产物落点）与差异映射，不复制共享内容全文

#### Scenario: 既有四工作流完成迁移

- **WHEN** `solve-workflow` / `opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow` 的分析阶段被打开
- **THEN** 上述方法论块来自对 `analysis-core` 的加载/引用，工作流 frontmatter 将 `analysis-core` 列为强依赖（硬加载路径），且正文无该块的逐字副本
