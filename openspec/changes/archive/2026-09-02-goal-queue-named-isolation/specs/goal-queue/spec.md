## ADDED Requirements

### Requirement: 对话自动隔离

The system SHALL isolate the backlog per conversation with a minted kebab-case **queue-id** (not a platform session UUID and not a name the human must pick). Card files and run progress documents for a bound queue-id SHALL live under `.goal-driven/queues/<queue-id>/`. Enqueue, consumption, the relationship pass, mid-run re-scan, and the acceptance package MUST operate only on this conversation's bound directory; sibling queues MUST remain invisible to those operations. The system MUST NOT write a project-level current-queue pointer file that another conversation could overwrite. The system MUST NOT ask the human to choose among queues.

Bind order, evaluated at every enqueue, Jira list-enqueue shortcut, and consume entry: (1) reuse the queue-id already bound in this conversation; (2) else mint `q-YYYYMMDD-HHMMSS` (append `-` plus four hex digits when that directory already exists), bind it for this conversation, and use it — first enqueue or 「跑队列」 mints, including an empty consume that then stops cleanly; (3) a mere load with no queue request MUST NOT mint and MUST NOT list sibling queues as a picker. A **new** conversation MUST mint a fresh queue and MUST NOT auto-bind `default` or any sibling `q-*` directory. A scheduled or unattended pull with no conversation bind SHALL consume `default` only; it MUST NOT mint and MUST NOT drain every queue in the folder. `jira-fix-batch` and `opsx-jira-fix-batch` inherit this bind through `goal-driven-batch`.

Markdown task cards placed directly under `.goal-driven/` (not under `queues/` or `runs/`) together with `.goal-driven/runs/` SHALL belong to queue-id `default`. Binding `default` SHALL read that legacy layout and `.goal-driven/queues/default/` when present. New card and progress-document writes SHALL go to `.goal-driven/queues/<queue-id>/`. The system MUST NOT auto-move legacy files.

#### Scenario: 两会话互不抢卡

- **WHEN** 同一工程目录下两个对话各自入队
- **THEN** 两套卡片落在不同 `.goal-driven/queues/<queue-id>/` 下；任一对话「跑队列」只消费本对话已绑定队列的 pending 卡，不读取另一队列；过程中不向人索要队列名

#### Scenario: 新对话自动新开

- **WHEN** 新对话在已有其它 `q-*` 抽屉残留 pending 的工程里说「跑队列」且本对话尚未绑定
- **THEN** 系统为本对话铸造新 queue-id 并只消费该目录（可为空后收尾），不抽干兄弟队列，不列出队列让人点名

#### Scenario: 同一对话自动续跑

- **WHEN** 同一对话先入队后来说「跑队列」
- **THEN** 系统复用本对话已绑定的 queue-id，从该目录读取存量卡片消费，不再铸造、不问队列名

#### Scenario: 入队自动铸造

- **WHEN** 对话未绑定且用户要求入队
- **THEN** 系统铸造新 queue-id、把卡片写入 `.goal-driven/queues/<queue-id>/`，不向人索要或确认队列名

#### Scenario: 遗留目录仅定时 default

- **WHEN** `.goal-driven/` 根下仍有任务卡（不在 `queues/` 或 `runs/` 内）且一次无人值守定时拉起「跑队列」且无对话绑定
- **THEN** 系统只消费 `default`（遗留卡与 `.goal-driven/queues/default/` 若存在）；交互会话不自动绑定 `default`

#### Scenario: 禁止共享指针文件

- **WHEN** 编排需要记住本对话绑定的 queue-id
- **THEN** 绑定留在本对话上下文，不写入可被另一对话覆盖的项目级当前队列文件

#### Scenario: 加载不铸造不点名

- **WHEN** 该 skill 被加载但用户没有明确的队列操作请求且本对话尚未绑定
- **THEN** 不铸造目录、不列出兄弟队列供点名、不启动消费；提示本对话尚无队列，等待入队或「跑队列」

## MODIFIED Requirements

### Requirement: 持久 backlog 载体

The system SHALL maintain the queue as a persistent project-local tree under `.goal-driven/queues/<queue-id>/` holding one markdown task card per goal, where each card records: measurable goal condition, mandatory turn/time budget clause, constraints, priority, a coarse advisory duration estimate, status, and acceptance summary fields. Priority SHALL use a three-level vocabulary — `P0` (urgent, highest), `P1` (normal, default when unstated), `P2` (background, lowest) — and same-priority cards SHALL be consumed FIFO by card `Created` timestamp. Cards MUST be git-trackable so backlog state survives **within the bound conversation** and reviewable in diffs. Each card SHALL also carry a **Decisions-I-made-for-you** section listing intake self-answered decisions with impact tiers (empty when none), and MAY carry an optional `Traceability: openspec/<change-name>` field when the user opted into OpenSpec sedimentation at enqueue. File SoT is the bound queue directory: the same conversation resumes from those files without depending on chat history for card content; a new conversation mints a fresh queue and does not auto-bind another conversation's directory. Legacy cards directly under `.goal-driven/` remain readable as queue-id `default` per 对话自动隔离.

#### Scenario: 需求入库

- **WHEN** 用户在空闲时段提交一个需求并要求入队（如「goal 队列加个任务：修复登录超时 bug」）
- **THEN** 系统将其加工为含可验证目标条件、预算子句与粗粒度耗时预估（仅供参考，偏差不作废预审批）的任务卡片写入已绑定 queue-id 的 `.goal-driven/queues/<queue-id>/`，状态标记为待审批项，人确认条件与预算后入库完成

#### Scenario: 队列跨会话存续

- **WHEN** 同一对话中途中断后再次在该对话内消费
- **THEN** 系统从本对话已绑定 queue-id 的目录读取存量任务卡片继续按优先级消费，卡片内容不依赖聊天记录；新对话不自动绑定该目录

#### Scenario: 优先级词表与同级先进先出

- **WHEN** 队列含 `P0`、`P1`、`P2` 卡片且两张 `P1` 卡片 `Created` 时间先后不同
- **THEN** 消费顺序为全部 `P0` 先于 `P1` 先于 `P2`，同级内按 `Created` 时间先进先出；入队时未声明优先级的卡片按 `P1` 处理

#### Scenario: 卡片呈报自答决策

- **WHEN** 入队深谈存在自答项（守卫定位、验证策略等）
- **THEN** 任务卡含 Decisions-I-made-for-you 段（决策 + 影响分级），批准事件必须连同该段一起展示；无自答项时段落为空

### Requirement: 显式触发边界（编排层不内置调度）

The skill SHALL activate only on an explicit queue request (trigger words such as 「跑队列」「goal 队列」「无人值守队列」 / "run queue", "goal queue") and SHALL describe scheduling as platform-native intent only (cron / systemd / scheduled CI / assistant-native routines / manual invocation). The skill MUST NOT embed scheduler commands as required paths and MUST NOT auto-start consumption merely by being loaded. When loaded without a queue request and without a bound queue-id, the idle overview SHALL state that this conversation has no queue yet and MUST NOT list sibling queues as a picker.

#### Scenario: 加载即观察

- **WHEN** 该 skill 被加载但用户没有明确的队列操作请求且本对话尚未绑定 queue-id
- **THEN** 编排不自行启动、不铸造、不把兄弟队列列成选项；等待入队或「跑队列」

#### Scenario: 定时拉起即消费

- **WHEN** 平台定时器拉起「跑队列」且无对话绑定
- **THEN** 系统串行消费 `default` 的 pending 任务直至清空或触达队列级预算上限，不抽干其它 `q-*` 抽屉

### Requirement: 串行消费与非阻塞失败

The system SHALL consume queued tasks strictly serially in priority order per the defined P0/P1/P2 vocabulary (FIFO within a level). Before execution, the system SHALL run a light relationship pass over pending cards **in the bound queue only** (duplicate/equivalent, dependency waiting, overlap-conflict, **derived**) and re-evaluate remaining cards against the latest code state after each completion. At that same post-completion boundary the system SHALL also re-scan the bound queue directory for newly added pending cards: a discovered card that is well-formed and carries both a budget clause and an approval record SHALL be admitted into priority order for the remainder of the run (never preempting the in-flight child task) and SHALL count against the remaining queue-level task cap; a discovered card that is malformed or lacks an approval record SHALL stay `pending` with a note in the progress document, and MUST NOT be executed. Cards appearing only in sibling queues MUST NOT be admitted. One task's failure MUST NOT block later tasks; failed tasks are marked and recorded with reason, then the loop continues.

#### Scenario: 失败不传染

- **WHEN** 任务 A 的长跑以预算耗尽终止且验收未达成
- **THEN** 系统将 A 标记为 failed 及原因，继续执行下一个 pending 任务 B

#### Scenario: 重复任务跳过

- **WHEN** 待执行任务 B 的症状与目标同已完成的任务 A 等价且 A 的产出已覆盖
- **THEN** 系统将 B 标记为 skipped (covered by duplicate)，注记指向 A 的报告

#### Scenario: 运行中追加完成后纳入

- **WHEN** 队列运行中（某子任务执行期间）一张新的合法卡片（含预算子句与审批留痕）被写入**已绑定** queue-id 的目录
- **THEN** 当前子任务不被打断；其后一次完成边界重扫该目录时该卡片通过校验并按优先级插入后续消费顺序，发现事件记入进度文档 Notes；兄弟队列中的新卡不被纳入

#### Scenario: 无审批留痕的新卡不执行

- **WHEN** 重扫发现一张缺少审批留痕（Approved 记录缺失）的新卡片
- **THEN** 系统将其保持 pending 并在进度文档注记「awaiting approval (added mid-run)」，绝不无人审批执行

#### Scenario: 迟到卡片计入任务配额

- **WHEN** 队列级任务数上限为 3 且运行中第 2 个任务完成后重扫纳入 1 张新卡片
- **THEN** 该卡片占用剩余任务配额（第 3 个派发名额），时间上限口径不变；配额触顶时新卡片与其它 pending 一样保留至下次运行

### Requirement: 进度文档与验收包

The system SHALL maintain a persistent progress document updated on every status change (path `.goal-driven/queues/<queue-id>/runs/<batch-id>/progress.md`, minimum fields: task, mode, status, result summary, branch name, notes), and SHALL end every run with an acceptance package in that same `runs/<batch-id>/` directory: the batch progress document plus each executed task's engine completion report plus the branch list awaiting human review. Merge decisions remain exclusively human; the package labels claims per `completion-evidence-discipline` inherited from the engine reports.

#### Scenario: 人回归验收

- **WHEN** 用户在同一对话回来查看「昨晚跑了什么」
- **THEN** 系统呈现该队列进度文档路径与最终摘要：每个任务的结果、证据来源、对应分支，以及待人工判定的 outcome 型事项清单

#### Scenario: 合并权保留在人

- **WHEN** 全部任务已完成且验收包已生成
- **THEN** 系统停在分支清单与建议处等待人工处置，不自行合并到主分支
