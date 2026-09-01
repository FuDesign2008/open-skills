# goal-queue Specification

## Purpose

Persistent goal-backlog queue lifecycle owned by the user-invocable `goal-driven-batch` skill: durable task-card backlog, intake-time high-impact pre-approval with 留痕, serial consumption delegating each task to the `goal-driven-workflow` engine (`goal-run` capability), per-task branch/worktree isolation, queue-level budget and stopping rules, a per-run progress document, and a batch acceptance package that hands merge decisions back to the human. Scheduling stays platform-native; this layer treats any trigger — manual or scheduled — as "consume the queue until it drains or caps hit".
## Requirements
### Requirement: 持久 backlog 载体

The system SHALL maintain the queue as a persistent project-local directory (default `.goal-driven/`) holding one markdown task card per goal, where each card records: measurable goal condition, mandatory turn/time budget clause, constraints, priority, a coarse advisory duration estimate, status, and acceptance summary fields. Priority SHALL use a three-level vocabulary — `P0` (urgent, highest), `P1` (normal, default when unstated), `P2` (background, lowest) — and same-priority cards SHALL be consumed FIFO by card `Created` timestamp. Cards MUST be git-trackable so backlog state survives sessions and reviewable in diffs. Each card SHALL also carry a **Decisions-I-made-for-you** section listing intake self-answered decisions with impact tiers (empty when none), and MAY carry an optional `Traceability: openspec/<change-name>` field when the user opted into OpenSpec sedimentation at enqueue.

#### Scenario: 需求入库

- **WHEN** 用户在空闲时段提交一个需求并要求入队（如「goal 队列加个任务：修复登录超时 bug」）
- **THEN** 系统将其加工为含可验证目标条件、预算子句与粗粒度耗时预估（仅供参考，偏差不作废预审批）的任务卡片写入 `.goal-driven/`，状态标记为待审批项，人确认条件与预算后入库完成

#### Scenario: 队列跨会话存续

- **WHEN** 一个会话结束而后新会话被拉起消费队列
- **THEN** 系统从 `.goal-driven/` 读取存量任务卡片继续按优先级消费，不依赖任何对话历史

#### Scenario: 优先级词表与同级先进先出

- **WHEN** 队列含 `P0`、`P1`、`P2` 卡片且两张 `P1` 卡片 `Created` 时间先后不同
- **THEN** 消费顺序为全部 `P0` 先于 `P1` 先于 `P2`，同级内按 `Created` 时间先进先出；入队时未声明优先级的卡片按 `P1` 处理

#### Scenario: 卡片呈报自答决策

- **WHEN** 入队深谈存在自答项（守卫定位、验证策略等）
- **THEN** 任务卡含 Decisions-I-made-for-you 段（决策 + 影响分级），批准事件必须连同该段一起展示；无自答项时段落为空

### Requirement: 入库即预审批（高危启动门禁的队列级化解）

The system SHALL run a **fog-bounded deep intake interview** at enqueue time while the human is present, per `intake-interview-discipline` §A (one question per turn until fog graduates; approach comparison with human pick; freeze into the task card), applying its **presence tiers**: human present (the default) → per-decision questioning with high-impact self-answers escalated to questions and an intake output that opens with the three-part base (goal restatement / key elements / open questions) before freezing into the card — the card is the product of that display, not its replacement; declared absence or structural absence → the once-confirm + full-ledger mode unchanged. The system SHALL capture human approval of each task's final goal condition and budget as **an approval event distinct from run-start**: approval MUST display the Decisions-I-made-for-you section, and starting consumption requires a separate explicit run instruction even when the two confirmations are consecutive; "once" = one approval event closing that interview, not one question total, and an explicit human skip records assumptions and proceeds. The approval record in the task card (the git commit serves as 留痕) satisfies the launch approval otherwise required per unattended run; the host MUST thin-reference `design-approval-gate` named-escape semantics for this pattern. Mid-run launches MUST NOT pause for absent humans unless a newly detected relationship issue or constraint violation changes an already-approved condition, in which case the task MUST be parked as `conflict pending confirmation`.

#### Scenario: 深谈入库一次审批

- **WHEN** 用户随口提交需求要求入队（如「把需求加入队列今晚自己跑」）
- **THEN** 系统以雾为界一次一问问清开放决策并给出方案对比供人选定，冻结进任务卡后以一次审批事件收口；无雾任务快速毕业，人显式跳过则记录假设放行

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
- **THEN** 按现行一次确认 + 全账本模式执行，行为与引入在场两档之前逐字一致

### Requirement: 显式触发边界（编排层不内置调度）

The skill SHALL activate only on an explicit queue request (trigger words such as 「跑队列」「goal 队列」「无人值守队列」 / "run queue", "goal queue") and SHALL describe scheduling as platform-native intent only (cron / systemd / scheduled CI / assistant-native routines / manual invocation). The skill MUST NOT embed scheduler commands as required paths and MUST NOT auto-start consumption merely by being loaded.

#### Scenario: 加载即观察

- **WHEN** 该 skill 被加载但用户没有明确的队列操作请求
- **THEN** 编排不自行启动；系统输出当前队列概览并等待指令

#### Scenario: 定时拉起即消费

- **WHEN** 平台定时器或用户手动命令拉起「跑队列」
- **THEN** 系统串行消费全部 pending 任务直至清空或触达队列级预算上限

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

### Requirement: 逐任务隔离

The system SHALL require each queued task to execute on its own branch (or linked worktree) based off the current main state, so concurrent history stays reviewable per-task and one task's working tree never carries another's uncommitted changes. Isolation directives follow `git-worktree-discipline`; the orchestrator does not restate its checklists.

#### Scenario: 独立分支落盘

- **WHEN** 任务进入执行阶段
- **THEN** 引擎在该任务专属分支上进行全部修改，完成后该分支承载本次交付物供人审查合并

### Requirement: 模式向子运行传播

The system SHALL propagate batch-level mode explicitly into every child long-run invocation: a card's `Stage-exit policy` field, when present, overrides trigger-word propagation (manual → child manual mode; proxy → child auto mode + proxy checkpoints; auto → child auto mode with named escapes); with no field, the legacy trigger rule applies (queue trigger containing 「自动」/"auto" runs children in auto mode; default trigger leaves children in their manual defaults). Child skills' auto-revert-to-manual behavior MUST NOT break queue continuity between tasks. The orchestrator states mode propagation once and does not rely on ambient inheritance.

#### Scenario: 自动批次持续自动

- **WHEN** 用户以「自动跑队列」触发且队列含三个任务
- **THEN** 三个任务的引擎调用均以自动模式发起，前一个任务的完结回退不影响后续任务的连续执行

### Requirement: 队列级预算与停止规则

The system SHALL enforce queue-level caps independent of per-task budgets: a maximum number of tasks per run and/or an overall time cap supplied at trigger time or from the queue config, stopping cleanly when reached with remaining tasks left pending. When a run starts, the system SHOULD report upfront how the summed card estimates compare to the resolved caps (advisory only — stopping remains cap-driven). The system treats stopping as a feature: hitting caps, emptying the queue, or repeated no-progress outcomes all end the run gracefully and hand back to the human.

#### Scenario: 总预算触顶优雅收尾

- **WHEN** 队列级时间上限在第三个任务执行完毕时到达
- **THEN** 系统停止派发第四个任务，保留其 pending 状态，转入验收包生成流程

### Requirement: 进度文档与验收包

The system SHALL maintain a persistent progress document updated on every status change (suggested path `.goal-driven/runs/<batch-id>/progress.md`, minimum fields: task, mode, status, result summary, branch name, notes), and SHALL end every run with an acceptance package: the batch progress document plus each executed task's engine completion report plus the branch list awaiting human review. Merge decisions remain exclusively human; the package labels claims per `completion-evidence-discipline` inherited from the engine reports.

#### Scenario: 人回归验收

- **WHEN** 用户在任何时段回来查看「昨晚跑了什么」
- **THEN** 系统呈现进度文档路径与最终摘要：每个任务的结果、证据来源、对应分支，以及待人工判定的 outcome 型事项清单

#### Scenario: 合并权保留在人

- **WHEN** 全部任务已完成且验收包已生成
- **THEN** 系统停在分支清单与建议处等待人工处置，不自行合并到主分支

### Requirement: 编排层薄引用引擎方法论

The skill body MUST thin-reference `goal-driven-workflow` for single-run methodology (acceptance layering, `/goal` condition design, sub-agent context management, launch companions, completion reporting) and MUST NOT restate that content. The frontmatter MUST declare the single-direction dependency and pass the prerequisite check at startup, aborting with install guidance when missing.

#### Scenario: 正文不复制引擎方法

- **WHEN** 阅读编排 skill 的消费循环说明中关于单个任务如何执行的部分
- **THEN** 正文只保留占位映射（号+名）与队列特有编排，方法论细节以名称引用引擎阶段而非复制段落

### Requirement: 正文语言与触发词

Instructional body text of `goal-driven-batch` MUST be written in English; Chinese MUST appear in the frontmatter description and trigger list (including queue-operation triggers like 「跑队列」「goal 队列」with English equivalents). The frontmatter `description` MUST stay within the repo's character limit and carry only routing information (what/when/triggers/do-not-use).

#### Scenario: 双语触发路由

- **WHEN** 中文用户说「跑一下我的任务队列」
- **THEN** 该说法命中中文触发词使 skill 被路由激活，正文按英文指令执行

### Requirement: 任务卡冻结决策区

Task cards SHALL carry a Frozen Decisions section (chosen approach, resolved tickets, deferred tickets with reason, initial assumptions, pre-launch self-review outcome) per `intake-interview-discipline`, which answers the child engine's stage-1 intake.

#### Scenario: 子运行不重问已冻结项

- **WHEN** 消费循环委派子引擎运行某任务
- **THEN** 卡片冻结决策区供应子运行的 intake，子运行为卡片已冻结的内容重新暂停发问视为违规；消费入口检查仍守卫冻结条件的持续有效性

### Requirement: 证伪冻结方向的任务级干净停止

When a child run's evidence falsifies the card's frozen approach, the orchestrator SHALL record a clean stop for that task (safe point, no half-edits, budget respected) with a ticket report in the child's completion report, park the card for human re-direction (`conflict pending confirmation` or equivalent host status), and continue consuming remaining valid tasks.

#### Scenario: 停止不传染

- **WHEN** 某任务的冻结方向被子运行证据证伪
- **THEN** 该任务干净停止并出票留待人重新定方向，队列其余合法任务继续串行消费

### Requirement: 验收包汇总决策与假设台账

The acceptance package SHALL aggregate each executed task's decision/assumption ledger per `intake-interview-discipline` §C into its needs-your-judgment section: outcome-type items plus unresolved tickets, low-confidence assumptions, high-impact-if-wrong entries, and clean-stop tickets with their options.

#### Scenario: 台账汇总呈报

- **WHEN** 批次结束组装验收包
- **THEN** Needs-your-judgment 含各任务台账汇总（未决票/低置信假设/高影响项）与干净停止票及选项，供人一次看完集中定夺

### Requirement: 队列级验收核对清单

The system SHALL assemble the acceptance package through a queue-level verification checklist: (1) caps accounting — tasks dispatched vs the resolved caps, stops recorded with which cap hit; (2) progress-document completeness — every status change has an entry, discovery notes present for mid-run additions; (3) per-task report-checklist status — each executed task's engine completion report carries its numbered verification checklist, and its overall status is recorded in the card's acceptance summary; (4) leftover pending inventory — what remains, at which priorities, for the next run; (5) archive status per task when OpenSpec sedimentation is on. The checklist rides the acceptance package as an itemized section; item failures are surfaced, not silently dropped.

#### Scenario: 验收包含队列级核对

- **WHEN** 批次结束组装验收包
- **THEN** 包含队列级核对清单（配额记账/进度文档完整性/各任务报告核对状态/遗留盘点/归档状态），核对不通过项显式呈报

### Requirement: 可选 OpenSpec 沉淀（goal-queue）

The queue SHALL offer OpenSpec sedimentation as an **opt-in enqueue-time decision** (`traceability: openspec | none` on the task card), presented only when the target project has an `openspec/` directory and a usable openspec CLI or equivalent; default off, project policy may mandate on, the user's explicit choice wins. When on for a card: the child run maintains the mapped openspec change artifacts during execution; the record step validates the change; the acceptance package lists per-task archive status (archived after that task's machine-verifiable evidence is complete). When off or unavailable: behavior identical to today.

#### Scenario: 入队选择沉淀

- **WHEN** 目标工程存在 openspec/ 且用户入队时选择 traceability: openspec
- **THEN** 卡片携带 Traceability 字段，子运行维护对应 change artifacts，记录步骤顺带 validate，验收包列出归档状态

#### Scenario: 未选择零变化

- **WHEN** 用户未选择 openspec 沉淀（或工程无 openspec/）
- **THEN** 选项不出现或不生效，队列全流程行为与无此能力时逐字一致

### Requirement: 子任务引擎可选调度

Task cards SHALL support an optional `Engine` field with exact-skill-name vocabulary: `goal-driven-workflow` (default when absent) | `solve-workflow` | `opsx-solve-workflow` | `jira-fix-workflow`, fixed per card at freeze time. The Delegate step SHALL dispatch by this field and pass the card's `Stage-exit policy` along: a `solve-workflow` child receives the card's problem statement + frozen-decisions block as its stage-1 input and runs per the policy (proxy → auto mode with proxy-occupied exits; manual → manual mode; auto → auto with named escapes); an `opsx-solve-workflow` child additionally passes the openspec environment gate (`openspec/` directory + usable CLI detection) — a card whose engine requires a missing environment parks at the consumption-entry check as `conflict pending confirmation`, never degrading to another engine silently. A `jira-fix-workflow` child receives the Jira issue link/key as the card's goal condition, the frozen-decisions block as its stage 0–1 supply, an explicit `queue-child` context flag, and a **PR-open terminal**: the child runs through stage 9 (PR open) and a record-only closeout — stage 10 (merge + Jira writeback) is deferred to the human, whose merge authority the queue never proxies; the acceptance package lists the awaiting PR and the pending merge + writeback as explicit follow-ups. Queue-level contracts (caps, branch isolation, per-status recording, relationship pass) apply to every engine unchanged. Cards without the fields behave identically to today.

#### Scenario: 派发给 solve-workflow 子运行

- **WHEN** 卡片 Engine: solve-workflow 且通过消费入口检查
- **THEN** Delegate 以卡片问题+冻结决策作为其阶段 1 输入调用 solve-workflow，Stage-exit policy 随卡传递并决定其出口行为；队列契约（隔离/记录/配额）不变

#### Scenario: opsx 引擎环境门

- **WHEN** 卡片 Engine: opsx-solve-workflow 而目标工程无 openspec/ 或 CLI 不可用
- **THEN** 消费入口检查将该卡搁置为 conflict pending confirmation 并注记环境缺失，不静默降级为其它引擎

#### Scenario: jira-fix 子运行 PR-open 终态

- **WHEN** 卡片 Engine: jira-fix-workflow 且无人值守消费
- **THEN** 子运行以显式 queue-child 标志启动，止于 stage 9（PR 开好+记录性收尾）；合并与 Jira 回写作为待办进入验收包留人处置，绝不无人代理合并或回写；难度分级 🔴 终止按队列非阻塞失败语义记 failed 并继续后续任务

#### Scenario: 无字段零变化

- **WHEN** 卡片未写 Engine 字段
- **THEN** 子运行照常派发给 goal-driven-workflow，行为与无此能力时逐字一致

### Requirement: 交互预算票与阶段出口策略

The enqueue interview SHALL open with a fixed first ticket — the **interaction budget** — before scope tickets: A. full-human (child manual mode, every stage exit asks the user) / B. AI-proxy proxy (`Stage-exit policy: ai-proxy`: child auto mode + proxy checkpoints per charter, ledger trail, human reviews only the final acceptance package) / C. auto (child auto mode, named escapes + self-answer). The chosen value lands on the card's `Stage-exit policy: manual | ai-proxy | auto` field (a legacy `Counterpart: on` line reads as `proxy`; the field replaces the former proxy decision item), is passed to the child along with `Engine`, and overrides trigger-word mode propagation for every engine. The enqueue output SHALL state the layer split explicitly: intake tickets freeze task-level WHAT; process-level forks that only emerge during analysis (approach picks, verdicts, plan confirmation) belong to the layer this ticket assigns.

#### Scenario: 第一票知情选择

- **WHEN** 用户入队一张卡（在场档）
- **THEN** 深谈第一票为交互预算三选一（含推荐与后果说明），选定值写入 Stage-exit policy 字段；输出明示「任务级方向已冻结，过程级分叉的归属由本票决定」

#### Scenario: policy 覆盖触发词

- **WHEN** 卡片 Stage-exit policy: ai-proxy 且触发语为「启动」（不含「自动」）
- **THEN** 子运行以 auto 模式 + 代理检查点执行，触发词规则被覆盖；无字段时保持现行触发词规则，行为与历史版本逐字一致

### Requirement: 消费入口事实性代答实证

Decisions-I-made entries SHALL be marked `factual` (branch baselines, dependency existence, target paths) or `preference` at freeze time (riding the existing impact re-review; unmarked defaults to factual). At the consumption-entry check, factual entries SHALL be cheaply verified against the current code world (symbol-existence grep / `git branch --contains` / merge-base topology); a falsified factual entry parks the card as `conflict pending confirmation` at the gate instead of surfacing as a mid-run clean stop.

#### Scenario: 基线证伪拦截在门口

- **WHEN** 冻结的分支基线代答经实证与当前代码世界不符（如基线为现工作区的陈旧祖先、所依赖的 MR 基座不存在其上）
- **THEN** 消费入口检查即将该卡搁置为 conflict pending confirmation 并注记证伪证据，不派发、不留到运行中 clean stop

### Requirement: goal-queue 代理检查点接线

`goal-driven-batch` SHALL declare `ai-proxy-discipline` in frontmatter `dependencies` (prerequisite check with install guidance; abort on missing when the card's Stage-exit policy is `proxy`) and wire it, when the card records `Stage-exit policy: ai-proxy`, at these thin-pointer checkpoints: enqueue intake Q&A (absent human), the card approval event (proxy approval = bounded pre-authorization, Decisions-I-made section displayed to it), the record-step verification-checklist check on each child report, and conflict re-adjudication (whether a parked card's constraints re-validate within the original frozen scope). Checkpoint invocations count against the queue budget. With any other policy value or none, queue behavior is identical to today.

#### Scenario: 代理批准事件

- **WHEN** 卡片 Stage-exit policy: ai-proxy 且批准事件到达而真人缺席
- **THEN** 代理在展示 Decisions-I-made-for-you 段后给有界预授权批准，决策入账本标记 proxy-made

