## ADDED Requirements

### Requirement: 冻结解法可复用标记

A card's frozen approach MAY be marked reusable (`Reusable: yes | no`; default `no`), either at freeze time or at the record/acceptance step. A reusable record SHALL carry: the **problem signature** (the symptom class, not the one-off goal text), the chosen approach one-liner, the verification that proved it, and the **falsified directions** — recorded so a failed recipe is not repeated. Reusable records SHALL live inside the bound queue directory under `.goal-driven/`; they SHALL NOT be written to a shared carrier by the queue itself.

#### Scenario: 冻结解法可标记复用

- **WHEN** 某张卡按冻结方向完成且其解法可再次适用
- **THEN** 该卡可在冻结时或记录/验收步骤被标记 Reusable: yes，并生成复用记录

#### Scenario: 复用记录含问题签名与证伪方向

- **WHEN** 生成复用记录
- **THEN** 记录含问题签名（症状类别而非一次性目标文本）、选定解法一行、所依据的验证、以及被证伪的方向

#### Scenario: 默认不复用

- **WHEN** 卡片未显式标记
- **THEN** Reusable 取默认值 no，不产生复用记录

### Requirement: 等价卡 intake 种子复用

When a newly enqueued card's problem signature matches a reusable record, the deep intake SHALL present that record as the **seed**: the approach comparison starts from the recorded approach, and tickets the record already resolved SHALL be presented as decisions to confirm rather than questions to re-answer. Seeding SHALL shorten the interview and MUST NOT skip the approval event — approval remains a distinct event per `goal-queue`. A record whose `factual` entries fail verification against the current code world MUST NOT seed; that card falls back to a full deep intake. The card's frozen-decisions block SHALL name the record it was seeded from.

#### Scenario: 命中复用记录即种子化深谈

- **WHEN** 新卡的签名命中一条复用记录
- **THEN** 深谈以该记录为种子：方案对比从记录解法起步，记录已决的票以「待确认」而非「待回答」呈现

#### Scenario: 种子化不跳过批准

- **WHEN** 深谈以复用记录为种子完成
- **THEN** 批准事件仍独立发生并展示 Decisions-I-made-for-you 段；种子化只缩短访谈，不替代批准

#### Scenario: factual 证伪则不种子化

- **WHEN** 复用记录的 factual 项经实证与当前代码世界不符
- **THEN** 该记录不用于种子化，卡片退回完整深谈

#### Scenario: 复用来源留痕

- **WHEN** 卡片以某条记录种子化落盘
- **THEN** 卡片的冻结决策区标明所依据的复用记录

### Requirement: 复用载体归属

The queue's own reusable records SHALL stay inside `.goal-driven/`. Promoting a reusable approach into a shared carrier (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, a project-local skill) SHALL be governed by `learn-and-improve`'s carrier decision tree; the queue SHALL recommend such promotion and MUST NOT write a shared carrier without an explicit user request.

#### Scenario: 队列自有记录留在 .goal-driven

- **WHEN** 生成或读取复用记录
- **THEN** 读写均发生在绑定队列目录内，不改动工程共享规则文件

#### Scenario: 升格共享载体须人显式请求

- **WHEN** 某复用记录具备跨任务价值、值得升格为共享规则或项目级 skill
- **THEN** 系统只作推荐并说明理由，等待人显式请求后再写

#### Scenario: 走 learn-and-improve 载体树

- **WHEN** 需要为一条复用经验选择载体
- **THEN** 载体选择沿用 learn-and-improve 的载体决策树，不在本能力内另立一套载体规则
