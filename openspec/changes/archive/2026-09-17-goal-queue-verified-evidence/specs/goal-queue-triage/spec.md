## MODIFIED Requirements

### Requirement: 入队批量 triage

The system SHALL run one batch triage pass over the cards being enqueued, **before** any per-card deep intake interview, producing three outcome classes: equivalence groups, root-cause clusters, and suggested-kill cards. Ordering triage ahead of the interview is the point — work eliminated here is never interviewed. Mechanically provable outcomes — equivalence, and already-covered-by-a-**verified**-card — SHALL be applied automatically with a **reversible record**: the superseded card is archived (never deleted) inside the bound queue directory and points at the covering card or its report. A covering card that is only `done` (`Verification: awaiting` or `returned`) MUST NOT count as covered evidence. Value-judgment outcomes (a card judged not worth doing) MUST NOT be applied automatically: they SHALL be surfaced for human confirmation and the card MUST keep its current status until a human acts on it. Under declared absence or `Stage-exit policy: ai-proxy`, only the mechanically provable outcomes SHALL be applied; value-judgment items MUST stay untouched with a progress-document note. Cluster folding SHALL preserve every member card's goal text inside the folded card. The triage outcome SHALL be recorded in a triage record inside the bound queue directory (a pre-run enqueue has no batch directory yet) and SHALL ride the acceptance package.

#### Scenario: 等价卡自动合并且可逆

- **WHEN** 同批入队的两张卡目标与症状等价，且其中一张的证据已由另一张覆盖
- **THEN** 系统自动合并：被覆盖卡归档（不删除）并在原地指向覆盖卡及其报告，合并事件记入 triage 记录

#### Scenario: 同根因聚簇折叠保留成员目标

- **WHEN** 同批三张卡的症状指向同一根因
- **THEN** 系统折叠为一张卡，且折叠后的卡内含三张成员卡各自的目标文本，成员卡以归档方式保留可回溯

#### Scenario: 覆盖卡未获验收不得自动覆盖

- **WHEN** 一张卡声称已被另一张卡覆盖，而后者仅 `done`（`Verification: awaiting` 或 `returned`）
- **THEN** triage 不得自动标记 `skipped (covered)`；该项保持原状态并写入 triage 记录，待覆盖卡获 `verified` 后再判定或留人处置

#### Scenario: 价值类建议不做留人确认

- **WHEN** triage 判断某张卡不值得做（价值判断，非机械等价）
- **THEN** 系统只提出建议并保持该卡原状态，等待人在批准事件中处置，绝不自动淘汰

#### Scenario: 缺席时不静默淘汰

- **WHEN** 无人值守入队（声明缺席或 Stage-exit policy: ai-proxy）且 triage 产出价值类建议
- **THEN** 只有机械可证结论被自动应用；价值类项保持原状并写入进度文档注记，留待人回归

#### Scenario: triage 先于深谈

- **WHEN** 一批新卡入队
- **THEN** triage 先跑完并产出结论，逐卡深谈只对存活的卡进行；被淘汰或合并掉的卡不再消耗深谈

#### Scenario: triage 结果进验收包

- **WHEN** 批次结束组装验收包
- **THEN** triage 记录（合并/聚簇/建议淘汰/搁置计数与逐项依据）作为验收包的一部分呈报

### Requirement: 信息杠杆排序

Dependency edges between cards SHALL be expressible as a machine-readable card field (`Waits-on`), not only as prose in progress-document Notes. Within one priority level, **information leverage** SHALL rank first — the card whose resolution can retire the most other pending cards runs before its peers; the remainder of the order sequence is owned by `goal-queue`'s 持久 backlog 载体 and MUST NOT be restated here. The leverage count SHALL be recomputed at every completion boundary, because both the pending set and the code world move. A card whose `Waits-on` target is not yet **human-accepted** (`Verification: verified`) MUST NOT be dispatched; it SHALL hold the `waiting dependency` status until that target is `verified`. A target that is `done` but still `awaiting` verification holds the dependent in `waiting dependency`.

`Waits-on` edges SHALL be acyclic: when they form a cycle, every card in the cycle SHALL be parked as `conflict pending confirmation` with the cycle recorded, MUST NOT be dispatched, and MUST NOT block other cards. When a `Waits-on` target reaches any terminal state other than `verified` — `returned`, `skipped (covered)`, archived/killed, `failed`, or parked — the dependent card SHALL be parked as `conflict pending confirmation` for human decision rather than waiting indefinitely.

#### Scenario: 依赖边字段化

- **WHEN** 一张卡依赖另一张卡的产出
- **THEN** 该依赖以卡面 `Waits-on` 字段表达，而非仅写在进度文档 Notes 的自然语言里

#### Scenario: 杠杆高的卡先跑

- **WHEN** 同级内两张卡，A 的结论可决定其余三张待办卡是否还需要做，B 只影响自身
- **THEN** A 先于 B 被消费

#### Scenario: 同级内三层排序

- **WHEN** 同级内两张卡杠杆相同
- **THEN** 先比较确定度/成本档（高确定低成本优先）；仍相同则按 Created 时间先进先出

#### Scenario: 完成后重算杠杆

- **WHEN** 任一子任务完成，代码状态与待办集合发生变化
- **THEN** 系统在该完成边界重算所有待办卡的杠杆计数，并按新序消费

#### Scenario: 依赖未获验收不派发

- **WHEN** 一张卡的 Waits-on 目标尚未获得人工验收（`Verification: verified`）
- **THEN** 该卡保持 waiting dependency，不被派发，且不阻塞其它合法卡

#### Scenario: 依赖成环即搁置

- **WHEN** Waits-on 边构成环（A 等 B、B 等 A）
- **THEN** 环上每张卡均被搁置为 conflict pending confirmation 并记录该环，不派发任一环上卡，且不阻塞其它合法卡

#### Scenario: 目标未获验收终态即搁置

- **WHEN** 某卡的 Waits-on 目标以 `returned`、skipped (covered)、归档/淘汰、failed 或搁置等非 `verified` 终态结束
- **THEN** 依赖卡被搁置为 conflict pending confirmation 待人工决定，而非无限期等待
