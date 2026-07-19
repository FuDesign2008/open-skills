# Proposal: assess-stage-skill-extraction

## Why

用户提议将 4 个工作流（solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow）的相似阶段抽取为独立共享 skill 以减行并更专业。三路全文测绘证实真重复存在但高度集中（solve↔opsx ~150-160 行、jira 系 ~75-80 行逐字 + 三副本门控规范），而阶段正文的 80% 为工作流特有编排不可抽。需要一份基于数据的结论，避免按直觉做全量错误抽象。

## What Changes

- 产出 `analysis-report.md`：重复度矩阵、既有共享 skill 边界判定（方法论/编排范式）、方案 A「定向双抽取」设计（分析阶段核心共享 skill `{next-stage}` 占位符 + 覆盖率门控规范单源化）、成本收益、实施路线、形似神异禁并清单、意外发现登记
- delta spec：`workflow-contract-sync` 新增 Requirement——分析阶段核心方法论内容 SHALL 单源承载（analysis-core 落地后生效）
- **仅分析不实施**：不修改任何工作流 skill、不新建 skill（用户明确）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `workflow-contract-sync`: 新增「分析阶段核心方法论内容 SHALL 单源承载」Requirement（ADDED）

## Impact

- 文件：`openspec/changes/assess-stage-skill-extraction/`（proposal/analysis-report/design/specs/tasks）；归档时同步 `openspec/specs/workflow-contract-sync/spec.md`
- 行为：零变更（纯文档）
- 后续：实施属未来独立 opsx change + `/skill-creator`（新 skill）
