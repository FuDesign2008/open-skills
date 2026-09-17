## ADDED Requirements

### Requirement: 入队批量 triage

The system SHALL run one batch triage pass over the cards being enqueued, **before** any per-card deep intake interview, producing three outcome classes: equivalence groups, root-cause clusters, and suggested-kill cards. Ordering triage ahead of the interview is the point — work eliminated here is never interviewed. Mechanically provable outcomes — equivalence, and already-covered-by-a-done-card — SHALL be applied automatically with a **reversible record**: the superseded card is archived (never deleted) inside the bound queue directory and points at the covering card or its report. Value-judgment outcomes (a card judged not worth doing) MUST NOT be applied automatically: they SHALL be surfaced for human confirmation and the card MUST keep its current status until a human acts on it. Under declared absence or `Stage-exit policy: ai-proxy`, only the mechanically provable outcomes SHALL be applied; value-judgment items MUST stay untouched with a progress-document note. Cluster folding SHALL preserve every member card's goal text inside the folded card. The triage outcome SHALL be recorded in a triage record inside the bound queue directory (a pre-run enqueue has no batch directory yet) and SHALL ride the acceptance package.

#### Scenario: 等价卡自动合并且可逆

- **WHEN** 同批入队的两张卡目标与症状等价，且其中一张的证据已由另一张覆盖
- **THEN** 系统自动合并：被覆盖卡归档（不删除）并在原地指向覆盖卡及其报告，合并事件记入 triage 记录

#### Scenario: 同根因聚簇折叠保留成员目标

- **WHEN** 同批三张卡的症状指向同一根因
- **THEN** 系统折叠为一张卡，且折叠后的卡内含三张成员卡各自的目标文本，成员卡以归档方式保留可回溯

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

### Requirement: 卡片确定度与难度评估

Each task card SHALL carry a coarse **certainty/difficulty band** that is **derived from** four named signals — reversibility, evidence already available, blast radius, and dependency shape — and MUST NOT carry a numeric score and MUST NOT assert the band independently of those signals. Each signal SHALL be marked `factual` or `preference` per `intake-interview-discipline` (unmarked defaults to `factual`); the derivation rule from signals to band SHALL be recorded once in the change's design and applied uniformly. `factual` signals SHALL be verified at the consumption-entry check against the current code world (symbol existence / branch topology / target-path existence / `Waits-on` edges), and a falsified signal SHALL park the card as `conflict pending confirmation` at the gate rather than surfacing as a mid-run clean stop. A band derived from any `preference` signal SHALL NOT be treated as verified — only its `factual` inputs are. The derived band SHALL feed both the routing gate (per 评估驱动路由的置信度门控) and the ordering rule owned by `goal-queue`.

#### Scenario: 档位由信号派生而非独立断言

- **WHEN** 一张卡进入入队深谈并形成确定度/难度档位
- **THEN** 档位由可逆性、既有证据、影响半径、依赖形态四项信号按既定推导规则得出；卡片不含数值评分，也不存在脱离信号的档位断言

#### Scenario: 每项信号标记 factual 或 preference

- **WHEN** 四项信号写入卡片
- **THEN** 每项标记 factual 或 preference；未标记的按 factual 处理

#### Scenario: factual 信号在消费入口实证

- **WHEN** 消费入口检查遇到 factual 信号
- **THEN** 系统以廉价实证核对其与当前代码世界是否一致（符号存在性/分支包含关系/目标路径/Waits-on 边）

#### Scenario: 证伪即门口搁置

- **WHEN** 某 factual 信号被实证证伪
- **THEN** 该卡在消费入口即被搁置为 conflict pending confirmation 并注记证伪证据，不派发、不留到运行中 clean stop

#### Scenario: 含 preference 的档位不视为已核验

- **WHEN** 档位的任一派生信号标记为 preference
- **THEN** 该档位不被视为已核验（只有 factual 输入会被实证核查），且不得用于解锁路由默认

### Requirement: 评估驱动路由的置信度门控

When — and only when — **every signal input to the band is `factual` and verified, and the derived band is high-certainty/low-cost**, the enqueue path SHALL pre-fill the engine ticket and the stage-exit policy ticket from the assessment as their **defaults**, and the human (or the proxy under `Stage-exit policy: ai-proxy`) SHALL confirm or override them in the same interaction. If any input signal is a `preference`, or any `factual` signal failed verification, both tickets SHALL remain mandatory with no default, per `goal-queue`'s engine-ticket rule. A card carrying an assessment-driven default SHALL record which signals produced the band, the fact that all of them were `factual` and verified, and that an override is available.

#### Scenario: 全 factual 且高置信档才预填默认

- **WHEN** 档位的四项输入信号全部为 factual 且经实证通过，档位落在高确定度、低成本档
- **THEN** 引擎票与阶段出口策略票被预填为该评估推荐的值，人在同一次交互中确认或覆盖

#### Scenario: 信号含 preference 则不解锁默认

- **WHEN** 档位的任一输入信号为 preference（如影响半径依赖主观判断）
- **THEN** 即使档位计算结果落在高确定度档，引擎票与策略票仍保持必问且无默认值

#### Scenario: factual 信号证伪后门票回归必问

- **WHEN** 某项 factual 信号在消费入口被证伪
- **THEN** 该卡的评估默认不再生效，卡片在门口搁置待人工重新确认

#### Scenario: 默认来源留痕

- **WHEN** 卡片以评估默认值落盘
- **THEN** 卡片记录产生该默认的四项信号、其全部 factual 已核验的事实，并明示可覆盖

### Requirement: 信息杠杆排序

Dependency edges between cards SHALL be expressible as a machine-readable card field (`Waits-on`), not only as prose in progress-document Notes. Within one priority level, **information leverage** SHALL rank first — the card whose resolution can retire the most other pending cards runs before its peers; the remainder of the order sequence is owned by `goal-queue`'s 持久 backlog 载体 and MUST NOT be restated here. The leverage count SHALL be recomputed at every completion boundary, because both the pending set and the code world move. A card whose `Waits-on` target is not yet `done` MUST NOT be dispatched; it SHALL hold the `waiting dependency` status until that target completes.

`Waits-on` edges SHALL be acyclic: when they form a cycle, every card in the cycle SHALL be parked as `conflict pending confirmation` with the cycle recorded, MUST NOT be dispatched, and MUST NOT block other cards. When a `Waits-on` target reaches any terminal state other than `done` — `skipped (covered)`, archived/killed, `failed`, or parked — the dependent card SHALL be parked as `conflict pending confirmation` for human decision rather than waiting indefinitely.

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

#### Scenario: 依赖未完成不派发

- **WHEN** 一张卡的 Waits-on 目标尚未 done
- **THEN** 该卡保持 waiting dependency，不被派发，且不阻塞其它合法卡

#### Scenario: 依赖成环即搁置

- **WHEN** Waits-on 边构成环（A 等 B、B 等 A）
- **THEN** 环上每张卡均被搁置为 conflict pending confirmation 并记录该环，不派发任一环上卡，且不阻塞其它合法卡

#### Scenario: 目标以非 done 终态结束即搁置

- **WHEN** 某卡的 Waits-on 目标以 skipped (covered)、归档/淘汰、failed 或搁置等非 done 终态结束
- **THEN** 依赖卡被搁置为 conflict pending confirmation 待人工决定，而非无限期等待
