# goal-queue Delta: engine-optional dispatch

## ADDED Requirements

### Requirement: 子任务引擎可选调度

Task cards SHALL support an optional `Engine` field with exact-skill-name vocabulary: `goal-driven-workflow` (default when absent) | `solve-workflow` | `opsx-solve-workflow`, fixed per card at freeze time. The Delegate step SHALL dispatch by this field: a `solve-workflow` child receives the card's problem statement + frozen-decisions block as its stage-1 input and runs with the propagated mode plus `counterpart: on`; an `opsx-solve-workflow` child additionally passes the openspec environment gate (`openspec/` directory + usable CLI detection) — a card whose engine requires a missing environment parks at the consumption-entry check as `conflict pending confirmation`, never degrading to another engine silently. Queue-level contracts (caps, branch isolation, per-status recording, relationship pass) apply to every engine unchanged. Cards without the field behave identically to today.

#### Scenario: 派发给 solve-workflow 子运行

- **WHEN** 卡片 Engine: solve-workflow 且通过消费入口检查
- **THEN** Delegate 以卡片问题+冻结决策作为其阶段 1 输入调用 solve-workflow，auto 模式与 counterpart: on 随批传播；其阶段出口按 ai-counterpart 章程由对手方坐席

#### Scenario: opsx 引擎环境门

- **WHEN** 卡片 Engine: opsx-solve-workflow 而目标工程无 openspec/ 或 CLI 不可用
- **THEN** 消费入口检查将该卡搁置为 conflict pending confirmation 并注记环境缺失，不静默降级为其它引擎

#### Scenario: 无字段零变化

- **WHEN** 卡片未写 Engine 字段
- **THEN** 子运行照常派发给 goal-driven-workflow，行为与无此能力时逐字一致
