# goal-queue Delta: priority vocabulary & mid-run enqueue

## MODIFIED Requirements

### Requirement: 持久 backlog 载体

The system SHALL maintain the queue as a persistent project-local directory (default `.goal-driven/`) holding one markdown task card per goal, where each card records: measurable goal condition, mandatory turn/time budget clause, constraints, priority, a coarse advisory duration estimate, status, and acceptance summary fields. Priority SHALL use a three-level vocabulary — `P0` (urgent, highest), `P1` (normal, default when unstated), `P2` (background, lowest) — and same-priority cards SHALL be consumed FIFO by card `Created` timestamp. Cards MUST be git-trackable so backlog state survives sessions and reviewable in diffs.

#### Scenario: 需求入库

- **WHEN** 用户在空闲时段提交一个需求并要求入队（如「goal 队列加个任务：修复登录超时 bug」）
- **THEN** 系统将其加工为含可验证目标条件、预算子句与粗粒度耗时预估（仅供参考，偏差不作废预审批）的任务卡片写入 `.goal-driven/`，状态标记为待审批项，人确认条件与预算后入库完成

#### Scenario: 队列跨会话存续

- **WHEN** 一个会话结束而后新会话被拉起消费队列
- **THEN** 系统从 `.goal-driven/` 读取存量任务卡片继续按优先级消费，不依赖任何对话历史

#### Scenario: 优先级词表与同级先进先出

- **WHEN** 队列含 `P0`、`P1`、`P2` 卡片且两张 `P1` 卡片 `Created` 时间先后不同
- **THEN** 消费顺序为全部 `P0` 先于 `P1` 先于 `P2`，同级内按 `Created` 时间先进先出；入队时未声明优先级的卡片按 `P1` 处理

### Requirement: 串行消费与非阻塞失败

The system SHALL consume queued tasks strictly serially in priority order per the defined P0/P1/P2 vocabulary (FIFO within a level). Before execution, the system SHALL run a light relationship pass over pending cards (duplicate/equivalent, dependency waiting, overlap-conflict) and re-evaluate remaining cards against the latest code state after each completion. At that same post-completion boundary the system SHALL also re-scan the backlog directory for newly added pending cards: a discovered card that is well-formed and carries both a budget clause and an approval record SHALL be admitted into priority order for the remainder of the run (never preempting the in-flight child task) and SHALL count against the remaining queue-level task cap; a discovered card that is malformed or lacks an approval record SHALL stay `pending` with a note in the progress document, and MUST NOT be executed. One task's failure MUST NOT block later tasks; failed tasks are marked and recorded with reason, then the loop continues.

#### Scenario: 失败不传染

- **WHEN** 任务 A 的长跑以预算耗尽终止且验收未达成
- **THEN** 系统将 A 标记为 failed 及原因，继续执行下一个 pending 任务 B

#### Scenario: 重复任务跳过

- **WHEN** 待执行任务 B 的症状与目标同已完成的任务 A 等价且 A 的产出已覆盖
- **THEN** 系统将 B 标记为 skipped (covered by duplicate)，注记指向 A 的报告

#### Scenario: 运行中追加完成后纳入

- **WHEN** 队列运行中（某子任务执行期间）一张新的合法卡片（含预算子句与审批留痕）被写入 `.goal-driven/`
- **THEN** 当前子任务不被打断；其后一次完成边界重扫目录时该卡片通过校验并按优先级插入后续消费顺序，发现事件记入进度文档 Notes

#### Scenario: 无审批留痕的新卡不执行

- **WHEN** 重扫发现一张缺少审批留痕（Approved 记录缺失）的新卡片
- **THEN** 系统将其保持 pending 并在进度文档注记「awaiting approval (added mid-run)」，绝不无人审批执行

#### Scenario: 迟到卡片计入任务配额

- **WHEN** 队列级任务数上限为 3 且运行中第 2 个任务完成后重扫纳入 1 张新卡片
- **THEN** 该卡片占用剩余任务配额（第 3 个派发名额），时间上限口径不变；配额触顶时新卡片与其它 pending 一样保留至下次运行
