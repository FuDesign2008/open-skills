# delta (generated): followup of ai-proxy-rename

## RENAMED Requirements

### Requirement: 第三应答源（AI 代理）
- FROM: `### Requirement: 第三应答源（AI 对手方）`
- TO: `### Requirement: 第三应答源（AI 代理）`

## MODIFIED Requirements

### Requirement: 第三应答源（AI 代理）

Beyond the two presence tiers (present human / declared or structural absence), the interview methodology SHALL admit a third answer source: an AI proxy per `ai-proxy-discipline`, active only when the host run opted in (`proxy: on`). When active, present-mode methodology runs unchanged with the proxy as the answer source at the enumerated checkpoints — per-decision questions are asked and answered, high-impact self-answers are escalated to the proxy instead of being frozen, and every proxy answer enters the ledger marked `proxy-made`. The §B "next human touchpoint" for high-impact mid-run decisions MAY be a proxy checkpoint; reserved-list items remain human-only at every touchpoint.

#### Scenario: 代理坐 seats 时在场档方法论适用

- **WHEN** 宿主运行 opted-in proxy 且 intake 在缺席场景执行
- **THEN** 逐决策提问照常进行，应答方为代理（章程约束内），答案入账本并标记 proxy-made

#### Scenario: 保留项不因代理降格

- **WHEN** 升格到代理检查点的事项属于保留清单（不可逆/超预算/outcome 等）
- **THEN** 代理不行使裁决，出票搁置留待真人；两档既有语义（在场/缺席）不因第三源引入而改变
