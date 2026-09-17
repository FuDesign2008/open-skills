## MODIFIED Requirements

### Requirement: derived 关系且禁止共用 change/分支

Relationship handling SHALL be split by pass. The **enqueue batch triage pass** (owned by `goal-queue-triage`) SHALL handle **duplicate/equivalent** and **root-cause clustering**, marking a card whose outcome is already covered by an **accepted** card (`Verification: verified`) `skipped (covered)` with a pointer to the covering report; a card that is only `done` (engine completed) but still `awaiting` or `returned` MUST NOT cover another card. The **dispatch-time relationship pass** SHALL recognize **derived** (fixing A reveals B as follow-on or deeper root cause) in addition to **dependency** and **overlap-conflict**. Derived SHALL be recorded in the progress document Notes. The system MUST NOT place two in-progress cards on one branch or one OpenSpec change. For `Engine: opsx-jira-fix-workflow` children, relationship-pass notes SHALL be included in the card supply so the child writes `## Related Issues` in that change's `design.md`.

#### Scenario: 入队与派发职责分离

- **WHEN** 一批新卡入队且其中两张等价
- **THEN** 等价由入队 triage 处置（折叠或标记 covered），派发时的关系 pass 不再重复承担等价判定，只负责 dependency、overlap-conflict 与 derived

#### Scenario: 衍生票不共用分支

- **WHEN** 关系检测认定 B 由已完成的 A 衍生且 B 仍需修复
- **THEN** B 保持独立卡片与独立分支，进度 Notes 记录 derived，不并入 A 的 change

#### Scenario: 覆盖证据须已验收

- **WHEN** 一张卡声称其产出已被另一张卡覆盖，而后者仅 `done`（`Verification: awaiting` 或 `returned`）
- **THEN** 系统不得据其标记 `skipped (covered)`；仅当覆盖卡 `Verification: verified` 时才可机械应用覆盖

#### Scenario: opsx 子运行写入 Related Issues

- **WHEN** `Engine: opsx-jira-fix-workflow` 的子运行收到队列关系判断
- **THEN** 该 change 的 `design.md` 含 `## Related Issues` 节记录判断

### Requirement: 并发消费与非阻塞失败

The system SHALL consume queued cards through the slot dispatch defined by 并发 slot 派发与非重叠准入, admitting cards in the order defined by 持久 backlog 载体 (priority level, then information leverage, then assessment band, then FIFO) — the order decides admission sequence, not the number of concurrent children. The relationship pass is re-anchored in two places: **at enqueue**, the batch triage pass owned by `goal-queue-triage` handles equivalence, root-cause clustering and suggested kills before any interview; **at dispatch**, a light pass over pending cards **in the bound queue only** re-checks dependency waiting, overlap-conflict and **derived** against the live code state, and re-evaluates remaining cards after each completion. At that same post-completion boundary the system SHALL also re-scan the bound queue directory for newly added pending cards: a discovered card that is well-formed and carries both a budget clause and an approval record SHALL be admitted into the admission sequence for the remainder of the run — subject to the resolved concurrency and the same module non-overlap criterion as any other card, never preempting the in-flight children — and SHALL count against the remaining queue-level task cap; a discovered card that is malformed or lacks an approval record SHALL stay `pending` with a note in the progress document, and MUST NOT be executed. Cards appearing only in sibling queues MUST NOT be admitted. One task's failure MUST NOT block later tasks; failed tasks are marked and recorded with reason and the freed slot is refilled at the next completion boundary.

#### Scenario: 失败不传染

- **WHEN** 任务 A 的长跑以预算耗尽终止且验收未达成
- **THEN** 系统将 A 标记为 failed 及原因，并在下一个完成边界把腾出的 slot 补给下一个可采纳卡

#### Scenario: 重复任务跳过

- **WHEN** 待执行任务 B 的症状与目标同一张**已人工验收（`Verification: verified`）**的卡 A 等价且 A 的产出已覆盖
- **THEN** 系统将 B 标记为 skipped (covered by duplicate)，注记指向 A 的报告；A 仅 `done` 但 `Verification: awaiting` 或 `returned` 时不构成覆盖，不得据此跳过 B

#### Scenario: 派发时重判依赖与重叠

- **WHEN** 某任务完成后代码状态发生变化
- **THEN** 系统在派发边界对剩余卡重判依赖等待、重叠冲突与 derived 关系，并按最新状态调整后续采纳顺序（含对在飞卡模块集的重叠检查）

#### Scenario: 并发采纳不超并发度

- **WHEN** 已满并发度且仍有可采纳卡
- **THEN** 系统不采纳新卡，在飞卡继续执行；任一完成后再补位

#### Scenario: 运行中追加完成后纳入

- **WHEN** 队列运行中（某子任务执行期间）一张新的合法卡片（含预算子句与审批留痕）被写入**已绑定** queue-id 的目录
- **THEN** 在飞子任务不被打断；其后一次完成边界重扫该目录时该卡片通过校验并按采纳顺序进入后续消费（受并发度与非重叠判据约束），发现事件记入进度文档 Notes；兄弟队列中的新卡不被纳入

#### Scenario: 无审批留痕的新卡不执行

- **WHEN** 重扫发现一张缺少审批留痕（Approved 记录缺失）的新卡片
- **THEN** 系统将其保持 pending 并在进度文档注记「awaiting approval (added mid-run)」，绝不无人审批执行

#### Scenario: 迟到卡片计入任务配额

- **WHEN** 队列级任务数上限为 3 且运行中第 2 个任务完成后重扫纳入 1 张新卡片
- **THEN** 该卡片占用剩余任务配额（第 3 个派发名额）；配额触顶时新卡片与其它 pending 一样保留至下次运行
