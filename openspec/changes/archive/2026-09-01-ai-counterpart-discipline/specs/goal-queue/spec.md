# goal-queue Delta: counterpart checkpoints

## ADDED Requirements

### Requirement: goal-queue 对手方检查点接线

`goal-driven-batch` SHALL declare `ai-counterpart-discipline` in frontmatter `dependencies` (prerequisite check with install guidance; abort on missing when opted in) and wire it, when the task card records `counterpart: on`, at these thin-pointer checkpoints: enqueue intake Q&A (absent human), the card approval event (counterpart approval = bounded pre-authorization, Decisions-I-made section displayed to it), the record-step verification-checklist check on each child report, and conflict re-adjudication (whether a parked card's constraints re-validate within the original frozen scope). Checkpoint invocations count against the queue budget. When not opted in, queue behavior is identical to today.

#### Scenario: 对手方批准事件

- **WHEN** 卡片记录 counterpart: on 且批准事件到达而真人缺席
- **THEN** 对手方在展示 Decisions-I-made-for-you 段后给有界预授权批准，决策入账本标记 counterpart-made

#### Scenario: 子报告受质询

- **WHEN** record 步骤收到子运行完成报告且 counterpart 开启
- **THEN** 报告核对清单交对手方盲上下文质询；未通过项打回重验或出票，不静默记 done

#### Scenario: 冲突复裁限于原冻结范围

- **WHEN** conflict pending confirmation 的卡片被复裁
- **THEN** 对手方仅可裁决「原冻结范围内继续/终止」；需要改冻结范围（新方向/新预算）即出票留真人
