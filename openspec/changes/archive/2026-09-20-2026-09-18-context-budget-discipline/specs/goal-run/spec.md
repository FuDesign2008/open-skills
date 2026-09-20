# goal-run Specification (DELTA)

## MODIFIED Requirements

### Requirement: sub-agent 分工与上下文管理

The system SHALL plan sub-agent division and select a context-management technique (sub-agent architecture / compaction / structured note-taking) to mitigate context rot during long runs, keeping the main agent focused on plan and synthesis. The context plan produced at this stage MUST be threshold-quantified and thin-reference `context-budget-discipline`: it SHALL name (a) the compaction threshold as a fraction of the context window, (b) a phase→reset-boundary map for the planned lifecycle, and (c) the disk-ledger path used for session handoffs; methodology detail (threshold table, ledger format, recovery rules) comes from the discipline via one-line thin-refs, never an inline copy. Compaction threshold checks ride the stage-4 budget-milestone cadence (长跑运行中自检节奏). A stage-3 context plan missing any of the three elements MUST block Stage-4 launch approval. The host declares `context-budget-discipline` in frontmatter `dependencies` with the stage-0 prerequisite check (missing → abort with install guidance).

#### Scenario: 上下文技术选型

- **WHEN** 长跑任务预期上下文将超过单窗口承载
- **THEN** 系统选择 sub-agent 架构（子代理深工、主 agent 只收 1-2k 摘要）/ compaction / structured note-taking 之一，并为每个 sub-agent 定义任务、最小工具集、输出契约与完成条件

#### Scenario: 阈值化上下文计划

- **WHEN** stage 3 为一次长跑产出上下文计划
- **THEN** 计划写明 compaction 阈值（窗口比例）、阶段→重置边界映射、台账路径；任一元素缺失即阻断 Stage-4 启动批准

#### Scenario: 共享纪律薄引用

- **WHEN** 阅读 goal-driven-workflow 正文或其 stage-3 输出中的上下文管理方法论细节
- **THEN** 细节为对 `context-budget-discipline` 的一行薄引用（阈值表 / 台账格式在该 skill 内），不存在内联复制
