# intake-deep-interview Delta: third answer source (AI counterpart)

## ADDED Requirements

### Requirement: 第三应答源（AI 对手方）

Beyond the two presence tiers (present human / declared or structural absence), the interview methodology SHALL admit a third answer source: an AI counterpart per `ai-counterpart-discipline`, active only when the host run opted in (`counterpart: on`). When active, present-mode methodology runs unchanged with the counterpart as the answer source at the enumerated checkpoints — per-decision questions are asked and answered, high-impact self-answers are escalated to the counterpart instead of being frozen, and every counterpart answer enters the ledger marked `counterpart-made`. The §B "next human touchpoint" for high-impact mid-run decisions MAY be a counterpart checkpoint; reserved-list items remain human-only at every touchpoint.

#### Scenario: 对手方坐 seats 时在场档方法论适用

- **WHEN** 宿主运行 opted-in counterpart 且 intake 在缺席场景执行
- **THEN** 逐决策提问照常进行，应答方为对手方（章程约束内），答案入账本并标记 counterpart-made

#### Scenario: 保留项不因对手方降格

- **WHEN** 升格到对手方检查点的事项属于保留清单（不可逆/超预算/outcome 等）
- **THEN** 对手方不行使裁决，出票搁置留待真人；两档既有语义（在场/缺席）不因第三源引入而改变
