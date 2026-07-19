# workflow-contract-sync Specification (Delta)

## Purpose

同步 `workflow-contract-sync` 中对 `opsx-solve-workflow` 阶段编号的引用，使其与 `opsx-solve-workflow` 八阶段拆分后的新编号保持一致。

## ADDED Requirements

无。

## MODIFIED Requirements

### Requirement: 工作流回顾阶段 SHALL 以「复盘改进」命名对齐 learn-and-improve

工作流中委托 `learn-and-improve` 的回顾阶段或小节 MUST 使用「复盘改进」命名（旧称「回顾总结」可保留为别名触发词），使阶段语义与承载 skill 对齐。

#### Scenario: opsx 阶段 8 小节更名

- **WHEN** `opsx-solve-workflow` 执行归档后的经验沉淀小节
- **THEN** 该小节以「复盘改进（委托 learn-and-improve）」命名，不再使用「回顾总结与经验沉淀」

#### Scenario: solve-workflow 阶段 8 小节更名

- **WHEN** `solve-workflow` 执行阶段 8 的复盘改进小节
- **THEN** 该小节以「复盘改进（委托 learn-and-improve）」命名，不再使用「回顾总结与经验沉淀」

## REMOVED Requirements

无。
