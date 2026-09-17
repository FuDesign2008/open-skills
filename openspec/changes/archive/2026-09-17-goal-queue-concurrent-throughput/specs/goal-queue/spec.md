## RENAMED Requirements

- FROM: `### Requirement: 串行消费与非阻塞失败`
- TO: `### Requirement: 并发消费与非阻塞失败`

## MODIFIED Requirements

### Requirement: 并发消费与非阻塞失败

The system SHALL consume queued cards through the slot dispatch defined by 并发 slot 派发与非重叠准入, admitting cards in the order defined by 持久 backlog 载体 (priority level, then information leverage, then assessment band, then FIFO) — the order decides admission sequence, not the number of concurrent children. The relationship pass is re-anchored in two places: **at enqueue**, the batch triage pass owned by `goal-queue-triage` handles equivalence, root-cause clustering and suggested kills before any interview; **at dispatch**, a light pass over pending cards **in the bound queue only** re-checks dependency waiting, overlap-conflict and **derived** against the live code state, and re-evaluates remaining cards after each completion. At that same post-completion boundary the system SHALL also re-scan the bound queue directory for newly added pending cards: a discovered card that is well-formed and carries both a budget clause and an approval record SHALL be admitted into the consumption order for the remainder of the run (it MUST NOT preempt an in-flight child) and SHALL count against the remaining queue-level task cap; a discovered card that is malformed or lacks an approval record SHALL stay `pending` with a note in the progress document, and MUST NOT be executed. Cards appearing only in sibling queues MUST NOT be admitted. One task's failure MUST NOT block later tasks; failed tasks are marked and recorded with reason and the freed slot is refilled at the next completion boundary.

#### Scenario: 失败不传染

- **WHEN** 任务 A 的长跑以预算耗尽终止且验收未达成
- **THEN** 系统将 A 标记为 failed 及原因，并在下一个完成边界把腾出的 slot 补给下一个可采纳卡

#### Scenario: 重复任务跳过

- **WHEN** 待执行任务 B 的症状与目标同已完成的任务 A 等价且 A 的产出已覆盖
- **THEN** 系统将 B 标记为 skipped (covered by duplicate)，注记指向 A 的报告

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

### Requirement: 逐任务隔离

The system SHALL grade isolation strength by the resolved concurrency. At concurrency 1 each queued card SHALL execute on its own branch **or** a linked worktree based off the current main state, as today. At concurrency ≥ 2 each concurrent child SHALL execute in its **own worktree** — a single working tree cannot serve two children on two branches — so one task's working tree never carries another's uncommitted changes. Isolation directives follow `git-worktree-discipline`; the orchestrator does not restate its checklists. A queue whose concurrency is capped at 1 (because worktrees were declined) keeps the branch-or-worktree behavior.

#### Scenario: 独立分支落盘

- **WHEN** 任务进入执行阶段
- **THEN** 引擎在该任务专属分支上进行全部修改，完成后该分支承载本次交付物供人审查合并

#### Scenario: 并发 ≥2 强制 worktree

- **WHEN** 队列并发度为 2 或以上且某任务被准入
- **THEN** 该任务的子运行在自己的 worktree 中执行，不与任何在飞任务共享工作树

#### Scenario: 并发 1 保持现状

- **WHEN** 队列并发度为 1
- **THEN** 隔离保持 branch-or-worktree 的现状，行为与引入并发之前逐字一致

### Requirement: 队列级预算与停止规则

The system SHALL enforce three independent queue-level caps: a maximum number of tasks per run (`max-tasks`), a maximum concurrency (`max-concurrent`, resolved per 并发度与隔离强度的入队期决策), and an overall **wall-clock** time cap — each supplied at trigger time or from the queue config. Hitting any cap SHALL stop **dispatch** cleanly with remaining tasks left `pending` while in-flight children reach a safe point. The summed card estimates SHALL be reported as reference only and MUST NOT be presented as an upper bound on wall-clock duration. The system treats stopping as a feature: hitting caps, emptying the queue, or repeated no-progress outcomes all end the run gracefully and hand back to the human.

#### Scenario: 总预算触顶优雅收尾

- **WHEN** 队列级时间上限到达
- **THEN** 系统停止派发新卡，保留未派发卡的 pending 状态，在飞卡到达安全点后转入验收包生成流程

#### Scenario: 三口径分别记账

- **WHEN** 运行过程中任一 cap 触顶（任务数 / 并发度 / 墙钟）
- **THEN** 进度文档记录是哪一个口径触顶，并据此收尾

#### Scenario: 并发度触顶不中断在飞卡

- **WHEN** 并发度已达上限而仍有待派发卡
- **THEN** 系统不派发新卡，但已在飞的子运行继续执行至完成

### Requirement: 进度文档与验收包

The system SHALL maintain a persistent progress document (path `.goal-driven/queues/<queue-id>/runs/<batch-id>/progress.md`, minimum fields: task, mode, status, result summary, branch name, notes) whose **sole writer is the dispatcher** — a child run reports back and MUST NOT write it, and completions arriving together are recorded sequentially so no entry is lost. Every run SHALL end with an acceptance package in that same `runs/<batch-id>/` directory: the batch progress document, the triage record by path, each executed task's engine completion report, and the branch list awaiting human review — with each branch **auto-rebased onto the latest main and its conflicts pre-computed** so the human reviews real conflicts rather than performing N unassisted merge decisions. Merge decisions remain exclusively human; the package labels claims per `completion-evidence-discipline` inherited from the engine reports.

#### Scenario: 人回归验收

- **WHEN** 用户在同一对话回来查看「昨晚跑了什么」
- **THEN** 系统呈现该队列进度文档路径与最终摘要：每个任务的结果、证据来源、对应分支，以及待人工判定的 outcome 型事项清单

#### Scenario: 单写者记账不丢条目

- **WHEN** 两个子运行在同一时间窗内完成
- **THEN** 派发器逐条记录两次状态变更，进度文档中两条都在

#### Scenario: 验收只呈报真冲突

- **WHEN** 组装验收包时多数分支可无冲突合入
- **THEN** 系统只呈报真冲突与建议合并序列，不要求人逐张做无冲突的合并决策

#### Scenario: 合并权保留在人

- **WHEN** 全部任务已完成且验收包已生成
- **THEN** 系统停在分支清单与冲突预演结果处等待人工处置，不自行合并到主分支

### Requirement: 入库即预审批（高危启动门禁的队列级化解）

The system SHALL run a **fog-bounded deep intake interview** at enqueue time while the human is present, per `intake-interview-discipline` §A (one question per turn until fog graduates; approach comparison with human pick; freeze into the task card), applying its **presence tiers**: human present (the default) → per-decision questioning with high-impact self-answers escalated to questions and an intake output that opens with the three-part base (goal restatement / key elements / open questions) before freezing into the card — the card is the product of that display, not its replacement; declared absence or structural absence → the once-confirm + full-ledger mode unchanged. The interview SHALL be preceded by the batch triage pass owned by `goal-queue-triage`, so cards eliminated or folded by triage never reach an interview. The interview SHALL also settle **concurrency and isolation strength** for the queue per 并发度与隔离强度的入队期决策 — the last cheap moment to ask, since absent runs reuse the recorded values. The system SHALL capture human approval of each task's final goal condition and budget as **an approval event distinct from run-start**: approval MUST display the Decisions-I-made-for-you section, and starting consumption requires a separate explicit run instruction even when the two confirmations are consecutive; "once" = one approval event closing that interview, not one question total, and an explicit human skip records assumptions and proceeds. **One approval event MAY cover a whole triage batch** — the batch path already used by the Jira list-enqueue shortcut extends to the general enqueue path, covering the batch's merges, clusters and suggested kills in a single confirmation. The approval record in the task card (the git commit serves as 留痕) satisfies the launch approval otherwise required per unattended run; the host MUST thin-reference `design-approval-gate` named-escape semantics for this pattern. Mid-run launches MUST NOT pause for absent humans unless a newly detected relationship issue or constraint violation changes an already-approved condition, in which case the task MUST be parked as `conflict pending confirmation`.

#### Scenario: 深谈入库一次审批

- **WHEN** 用户随口提交需求要求入队（如「把需求加入队列今晚自己跑」）
- **THEN** 系统先跑批量 triage，再以雾为界一次一问问清开放决策并给出方案对比供人选定，冻结进任务卡后以一次审批事件收口；无雾任务快速毕业，人显式跳过则记录假设放行

#### Scenario: 批次批准覆盖 triage 结果

- **WHEN** 一批卡经 triage 产出合并、聚簇与建议不做项，人在场
- **THEN** 一次批准事件覆盖整批的 triage 处置（合并/折叠/建议不做）与各卡条件预算；未被人显式处置的建议不做项保持原状态

#### Scenario: 入队一并定并发与隔离

- **WHEN** 人在场入队一个队列
- **THEN** 深谈在冻结前问清并发度（推荐 3）与隔离强度，并把两者记入队列配置；选并发 ≥2 即接受 worktree 强制，拒绝 worktree 则并发封顶 1

#### Scenario: 夜间启动不再阻塞

- **WHEN** 消费循环到达一个已预审批且条件未变的任务
- **THEN** 系统直接委托引擎启动长跑，不因无人值守再次暂停等待审批，也不为卡片已冻结的内容重新发问

#### Scenario: 条件失效则搁置

- **WHEN** 执行前检查发现既有约束已不成立（如依赖分支已被合并、目标文件不存在）
- **THEN** 系统将该任务标记为 conflict pending confirmation 并跳过执行，留待人来重新确认

#### Scenario: 在场档三段式打底

- **WHEN** 人在场入队（默认档）
- **THEN** 冻结前先输出三段式（重述 / 关键要素 / 待确认问题），用户核对的是摊开的理解而非仅答案清单；卡片为三段式的浓缩产物

#### Scenario: 批准与开跑拆分

- **WHEN** 用户说「批准，开跑」
- **THEN** 系统先以独立批准事件收口（展示 Decisions-I-made-for-you 段），再以独立开跑指令进入消费；两个事件可连续发生但不得合并跳过展示

#### Scenario: 缺席档保持不变

- **WHEN** 用户声明无人值守或卡片由结构性缺席通道入队
- **THEN** 按现行一次确认 + 全账本模式执行；triage 仅自动应用机械可证结论；并发度与隔离强度照用入队时已记录的值

### Requirement: 显式触发边界（编排层不内置调度）

The skill SHALL activate only on an explicit queue request (trigger words such as 「跑队列」「goal 队列」「无人值守队列」 / "run queue", "goal queue") and SHALL describe scheduling as platform-native intent only (cron / systemd / scheduled CI / assistant-native routines / manual invocation). The skill MUST NOT embed scheduler commands as required paths and MUST NOT auto-start consumption merely by being loaded. When loaded without a queue request and without a bound queue-id, the idle overview SHALL state that this conversation has no queue yet and MUST NOT list sibling queues as a picker. A trigger MAY state a concurrency for this run; when it does not, the recorded queue value applies and an unrecorded value on an attended run is asked rather than assumed.

#### Scenario: 加载即观察

- **WHEN** 该 skill 被加载但用户没有明确的队列操作请求且本对话尚未绑定 queue-id
- **THEN** 编排不自行启动、不铸造、不把兄弟队列列成选项；等待入队或「跑队列」

#### Scenario: 定时拉起即消费

- **WHEN** 平台定时器拉起「跑队列」且无对话绑定
- **THEN** 系统按该队列已记录的并发度与隔离强度消费 `default` 的 pending 任务直至清空或触达队列级预算上限，不抽干其它 `q-*` 抽屉

#### Scenario: 触发语指定并发度

- **WHEN** 触发语中显式给出并发度（如「跑队列 2 并发」）
- **THEN** 该次运行采用触发语给出的并发度；未给出时采用队列已记录值，未记录且在场时则询问

### Requirement: 模式向子运行传播

The system SHALL propagate batch-level mode explicitly into **every** child long-run invocation — with concurrency, each admitted slot receives its own explicit propagation rather than relying on a single batch-level statement: a card's `Stage-exit policy` field, when present, overrides trigger-word propagation (manual → child manual mode; proxy → child auto mode + proxy checkpoints; auto → child auto mode with named escapes); with no field, the legacy trigger rule applies (queue trigger containing 「自动」/"auto" runs children in auto mode; default trigger leaves children in their manual defaults). Child skills' auto-revert-to-manual behavior MUST NOT break queue continuity between tasks. The orchestrator states mode propagation per admitted child and does not rely on ambient inheritance.

#### Scenario: 自动批次持续自动

- **WHEN** 用户以「自动跑队列」触发且队列含三个任务
- **THEN** 三个任务的引擎调用均以自动模式发起，任一任务的完结回退不影响后续任务的连续执行

#### Scenario: 并发下逐 slot 传播

- **WHEN** 多个子运行同时被准入
- **THEN** 每个 child 各自收到显式的模式传播，不依赖批次级的隐式继承

### Requirement: 证伪冻结方向的任务级干净停止

When a child run's evidence falsifies the card's frozen approach, the orchestrator SHALL record a clean stop for that task (safe point, no half-edits, budget respected) with a ticket report in the child's completion report, park the card for human re-direction (`conflict pending confirmation` or equivalent host status), and continue consuming remaining valid tasks.

#### Scenario: 停止不传染

- **WHEN** 某任务的冻结方向被子运行证据证伪
- **THEN** 该任务干净停止并出票留待人重新定方向；队列其余合法任务继续消费，在飞子运行不因此中断

### Requirement: goal-queue 代理检查点接线

`goal-driven-queue` SHALL declare `ai-proxy-discipline` in frontmatter `dependencies` (prerequisite check with install guidance; abort on missing when the card's Stage-exit policy is `proxy`) and wire it, when the card records `Stage-exit policy: ai-proxy`, at these thin-pointer checkpoints: enqueue intake Q&A (absent human); the **batch triage / batch approval event** (mechanically provable outcomes apply without confirmation; the proxy MAY grant the batch approval as bounded pre-authorization with the Decisions-I-made section displayed to it); the **concurrency and isolation decision** (recorded at enqueue, reused by absent runs); the card approval event (proxy approval = bounded pre-authorization, Decisions-I-made section displayed to it); the record-step verification-checklist check on each child report; and conflict re-adjudication (whether a parked card's constraints re-validate within the original frozen scope). When several children are in flight, checkpoint events SHALL be adjudicated **serially by the dispatcher** so that no two adjudications interleave. At the batch triage checkpoint the proxy MUST NOT confirm a **value-judgment kill** — discarding a card a human submitted is outcome acceptance and stays human-only; on hit the item SHALL be ticketed and parked as `conflict pending confirmation`, never applied. Proxy-made triage decisions SHALL be recorded in the triage record and surfaced in the acceptance package's needs-your-judgment section. Checkpoint invocations count against the queue budget. With any other policy value or none, queue behavior is identical to today.

#### Scenario: 代理批准事件

- **WHEN** 卡片 Stage-exit policy: ai-proxy 且批准事件到达而真人缺席
- **THEN** 代理在展示 Decisions-I-made-for-you 段后给有界预授权批准，决策入账本标记 proxy-made

#### Scenario: 代理不得确认价值类淘汰

- **WHEN** ai-proxy 卡片缺席运行中 triage 产出「建议不做」的价值类结论
- **THEN** 代理不出票批准该淘汰：该项被出票并搁置为 conflict pending confirmation 留人判定，机械可证的等价/被覆盖结论仍照常自动应用

#### Scenario: 代理的 triage 决策进台账

- **WHEN** 代理在 triage 检查点作出任何决策
- **THEN** 该决策记入 triage 记录并出现在验收包的 needs-your-judgment 段，可被人推翻

#### Scenario: 并发检查点串行裁决

- **WHEN** 多个 ai-proxy 子运行同时抵达检查点
- **THEN** 派发器串行地逐个裁决，不出现两个裁决交错
