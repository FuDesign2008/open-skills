## MODIFIED Requirements

### Requirement: 持久 backlog 载体

The system SHALL maintain the queue as a persistent project-local tree under `.goal-driven/queues/<queue-id>/` holding one markdown task card per goal, where each card records: measurable goal condition, mandatory turn/time budget clause, constraints, priority, a coarse advisory duration estimate, status, acceptance summary fields, a **certainty/difficulty assessment** (coarse band + named signals, marked `factual`/`preference`, per `goal-queue-triage`), an optional machine-readable `Waits-on` dependency field, and an optional `Reusable: yes | no` mark (default `no`, per `goal-queue-reuse`). Priority SHALL use a three-level vocabulary — `P0` (urgent, highest), `P1` (normal, default when unstated), `P2` (background, lowest). Within one priority level the consumption order SHALL be: information leverage descending (the card whose resolution can retire the most other pending cards first), then the assessment band (high-certainty, low-cost first), and FIFO by card `Created` timestamp as the final tie-break. Cards MUST be git-trackable so backlog state survives **within the bound conversation** and reviewable in diffs. Each card SHALL also carry a **Decisions-I-made-for-you** section listing intake self-answered decisions with impact tiers (empty when none), and MAY carry an optional `Traceability: openspec/<change-name>` field when the user opted into OpenSpec sedimentation at enqueue. File SoT is the bound queue directory: the same conversation resumes from those files without depending on chat history for card content; a new conversation mints a fresh queue and does not auto-bind another conversation's directory. Legacy cards directly under `.goal-driven/` remain readable as queue-id `default` per 对话自动隔离, and a legacy card carrying none of the new fields is consumed exactly as before.

#### Scenario: 需求入库

- **WHEN** 用户在空闲时段提交一个需求并要求入队（如「goal 队列加个任务：修复登录超时 bug」）
- **THEN** 系统将其加工为含可验证目标条件、预算子句与粗粒度耗时预估（仅供参考，偏差不作废预审批）的任务卡片写入已绑定 queue-id 的 `.goal-driven/queues/<queue-id>/`，状态标记为待审批项，人确认条件与预算后入库完成

#### Scenario: 队列跨会话存续

- **WHEN** 同一对话中途中断后再次在该对话内消费
- **THEN** 系统从本对话已绑定 queue-id 的目录读取存量任务卡片继续按优先级消费，卡片内容不依赖聊天记录；新对话不自动绑定该目录

#### Scenario: 优先级词表与同级内排序

- **WHEN** 队列含 `P0`、`P1`、`P2` 卡片，且同级内存在杠杆或确定度档不同的卡片
- **THEN** 消费顺序为全部 `P0` 先于 `P1` 先于 `P2`；同级内先按信息杠杆降序，再按确定度档（高确定低成本优先），仍相同才按 `Created` 时间先进先出；入队时未声明优先级的卡片按 `P1` 处理

#### Scenario: 存量卡行为不变

- **WHEN** 队列中存在不含确定度评估、`Waits-on` 与 `Reusable` 字段的存量卡
- **THEN** 该卡按原有规则消费，行为与引入本能力前逐字一致

#### Scenario: 卡片呈报自答决策

- **WHEN** 入队深谈存在自答项（守卫定位、验证策略等）
- **THEN** 任务卡含 Decisions-I-made-for-you 段（决策 + 影响分级），批准事件必须连同该段一起展示；无自答项时段落为空

### Requirement: 入库即预审批（高危启动门禁的队列级化解）

The system SHALL run a **fog-bounded deep intake interview** at enqueue time while the human is present, per `intake-interview-discipline` §A (one question per turn until fog graduates; approach comparison with human pick; freeze into the task card), applying its **presence tiers**: human present (the default) → per-decision questioning with high-impact self-answers escalated to questions and an intake output that opens with the three-part base (goal restatement / key elements / open questions) before freezing into the card — the card is the product of that display, not its replacement; declared absence or structural absence → the once-confirm + full-ledger mode unchanged. The interview SHALL be preceded by the batch triage pass owned by `goal-queue-triage`, so cards eliminated or folded by triage never reach an interview. The system SHALL capture human approval of each task's final goal condition and budget as **an approval event distinct from run-start**: approval MUST display the Decisions-I-made-for-you section, and starting consumption requires a separate explicit run instruction even when the two confirmations are consecutive; "once" = one approval event closing that interview, not one question total, and an explicit human skip records assumptions and proceeds. **One approval event MAY cover a whole triage batch** — the batch path already used by the Jira list-enqueue shortcut extends to the general enqueue path, covering the batch's merges, clusters and suggested kills in a single confirmation. The approval record in the task card (the git commit serves as 留痕) satisfies the launch approval otherwise required per unattended run; the host MUST thin-reference `design-approval-gate` named-escape semantics for this pattern. Mid-run launches MUST NOT pause for absent humans unless a newly detected relationship issue or constraint violation changes an already-approved condition, in which case the task MUST be parked as `conflict pending confirmation`.

#### Scenario: 深谈入库一次审批

- **WHEN** 用户随口提交需求要求入队（如「把需求加入队列今晚自己跑」）
- **THEN** 系统先跑批量 triage，再以雾为界一次一问问清开放决策并给出方案对比供人选定，冻结进任务卡后以一次审批事件收口；无雾任务快速毕业，人显式跳过则记录假设放行

#### Scenario: 批次批准覆盖 triage 结果

- **WHEN** 一批卡经 triage 产出合并、聚簇与建议不做项，人在场
- **THEN** 一次批准事件覆盖整批的 triage 处置（合并/折叠/建议不做）与各卡条件预算；未被人显式处置的建议不做项保持原状态

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
- **THEN** 按现行一次确认 + 全账本模式执行，行为与引入在场两档之前逐字一致；triage 仅自动应用机械可证结论

### Requirement: 串行消费与非阻塞失败

The system SHALL consume queued tasks strictly serially in the order defined by 持久 backlog 载体 (priority level, then information leverage, then assessment band, then FIFO). The relationship pass is re-anchored in two places: **at enqueue**, the batch triage pass owned by `goal-queue-triage` handles equivalence, root-cause clustering and suggested kills before any interview; **at dispatch**, a light pass over pending cards **in the bound queue only** re-checks dependency waiting, overlap-conflict and **derived** against the live code state, and re-evaluates remaining cards after each completion. At that same post-completion boundary the system SHALL also re-scan the bound queue directory for newly added pending cards: a discovered card that is well-formed and carries both a budget clause and an approval record SHALL be admitted into the consumption order for the remainder of the run (never preempting the in-flight child task) and SHALL count against the remaining queue-level task cap; a discovered card that is malformed or lacks an approval record SHALL stay `pending` with a note in the progress document, and MUST NOT be executed. Cards appearing only in sibling queues MUST NOT be admitted. One task's failure MUST NOT block later tasks; failed tasks are marked and recorded with reason, then the loop continues.

#### Scenario: 失败不传染

- **WHEN** 任务 A 的长跑以预算耗尽终止且验收未达成
- **THEN** 系统将 A 标记为 failed 及原因，继续执行下一个 pending 任务 B

#### Scenario: 重复任务跳过

- **WHEN** 待执行任务 B 的症状与目标同已完成的任务 A 等价且 A 的产出已覆盖
- **THEN** 系统将 B 标记为 skipped (covered by duplicate)，注记指向 A 的报告

#### Scenario: 派发时重判依赖与重叠

- **WHEN** 某任务完成后代码状态发生变化
- **THEN** 系统在派发边界对剩余卡重判依赖等待、重叠冲突与 derived 关系，并按最新状态调整后续消费顺序

#### Scenario: 运行中追加完成后纳入

- **WHEN** 队列运行中（某子任务执行期间）一张新的合法卡片（含预算子句与审批留痕）被写入**已绑定** queue-id 的目录
- **THEN** 当前子任务不被打断；其后一次完成边界重扫该目录时该卡片通过校验并按消费顺序插入后续消费，发现事件记入进度文档 Notes；兄弟队列中的新卡不被纳入

#### Scenario: 无审批留痕的新卡不执行

- **WHEN** 重扫发现一张缺少审批留痕（Approved 记录缺失）的新卡片
- **THEN** 系统将其保持 pending 并在进度文档注记「awaiting approval (added mid-run)」，绝不无人审批执行

#### Scenario: 迟到卡片计入任务配额

- **WHEN** 队列级任务数上限为 3 且运行中第 2 个任务完成后重扫纳入 1 张新卡片
- **THEN** 该卡片占用剩余任务配额（第 3 个派发名额），时间上限口径不变；配额触顶时新卡片与其它 pending 一样保留至下次运行

### Requirement: 子任务引擎可选调度

The enqueue interview SHALL include an **engine ticket** (second fixed ticket, after the interaction budget): the value is chosen from among `goal-driven-workflow | solve-workflow | opsx-solve-workflow | jira-fix-workflow | opsx-jira-fix-workflow` (exact skill names, with fit guidance and a recommended answer) and is fixed per card at freeze time as the `Engine` field. **The ticket carries no default value unless the card's certainty/difficulty assessment reaches the high-certainty, low-cost band**, in which case the assessment's recommended engine SHALL be pre-filled as the default and the human (or proxy) confirms or overrides it in the same interaction — this replaces the previous blanket "no default value" rule. The Delegate step SHALL dispatch by this field and pass the card's `Stage-exit policy` along: a `solve-workflow` child receives the card's problem statement + frozen-decisions block as its stage-1 input and runs per the policy (proxy → auto mode with proxy-occupied exits; manual → manual mode; auto → auto with named escapes); an `opsx-solve-workflow` child additionally passes the openspec environment gate (`openspec/` directory + usable CLI detection) — a card whose engine requires a missing environment parks at the consumption-entry check as `conflict pending confirmation`, never degrading to another engine silently. A `opsx-jira-fix-workflow` child receives the same supply as the jira-fix child (Jira-link goal condition, frozen decisions as its stage 0–1 supply, explicit `queue-child` flag) plus the openspec environment gate, with an **archive + PR-open terminal**: the child archives its OpenSpec change (archiving is native to its model and always happens), then stops at PR open — merge + Jira writeback defer to the human. A `jira-fix-workflow` child receives the Jira issue link/key as the card's goal condition, the frozen-decisions block as its stage 0–1 supply, an explicit `queue-child` context flag, and a **PR-open terminal**: the child runs through stage 9 (PR open) and a record-only closeout — stage 10 (merge + Jira writeback) is deferred to the human, whose merge authority the queue never proxies; the acceptance package lists the awaiting PR and the pending merge + writeback as explicit follow-ups. Queue-level contracts (caps, branch isolation, per-status recording, relationship pass) apply to every engine unchanged. A card without a `Stage-exit policy` keeps the legacy trigger rule; a card without an `Engine` field parks at the consumption-entry check as `conflict pending confirmation` (awaiting engine decision — one added line un-parks it); the queue never silently picks an engine that neither the human nor a high-confidence assessment supplied.

#### Scenario: 派发给 solve-workflow 子运行

- **WHEN** 卡片 Engine: solve-workflow 且通过消费入口检查
- **THEN** Delegate 以卡片问题+冻结决策作为其阶段 1 输入调用 solve-workflow，Stage-exit policy 随卡传递并决定其出口行为；队列契约（隔离/记录/配额）不变

#### Scenario: 高置信度档引擎默认

- **WHEN** 卡片评估落在高确定度、低成本档
- **THEN** 引擎票以评估推荐值预填为默认，人（或代理）在同一次交互中确认或覆盖；卡片记录该默认来源

#### Scenario: 低置信度档仍无默认

- **WHEN** 卡片评估低于高置信度档
- **THEN** 引擎票保持必问且无默认值，用户必须显式选定后写入 Engine 字段

#### Scenario: opsx 引擎环境门

- **WHEN** 卡片 Engine: opsx-solve-workflow 而目标工程无 openspec/ 或 CLI 不可用
- **THEN** 消费入口检查将该卡搁置为 conflict pending confirmation 并注记环境缺失，不静默降级为其它引擎

#### Scenario: jira-fix 子运行 PR-open 终态

- **WHEN** 卡片 Engine: jira-fix-workflow 且无人值守消费
- **THEN** 子运行以显式 queue-child 标志启动，止于 stage 9（PR 开好+记录性收尾）；合并与 Jira 回写作为待办进入验收包留人处置，绝不无人代理合并或回写；难度分级 🔴 终止按队列非阻塞失败语义记 failed 并继续后续任务

#### Scenario: opsx-jira 子运行 archive+PR-open 终态

- **WHEN** 卡片 Engine: opsx-jira-fix-workflow 且通过环境门与消费入口检查
- **THEN** 子运行归档其 OpenSpec change 后止于 PR 开好；合并与 Jira 回写作为待办进入验收包留人，归档永不延迟

#### Scenario: 无字段卡片搁置待定引擎

- **WHEN** 卡片未写 Engine 字段且其评估未达高置信度档（必问票上线前的存量卡或手写卡）
- **THEN** 消费入口检查将其搁置为 conflict pending confirmation 并注记「awaiting engine decision」，不默认派发任何引擎；补一行 Engine 字段即可解除

### Requirement: 交互预算票与阶段出口策略

The enqueue interview SHALL open with two fixed tickets before scope tickets — first the **interaction budget**, then the **engine ticket** (per 子任务引擎可选调度): A. full-human (child manual mode, every stage exit asks the user) / B. AI-proxy proxy (`Stage-exit policy: ai-proxy`: child auto mode + proxy checkpoints per charter, ledger trail, human reviews only the final acceptance package) / C. auto (child auto mode, named escapes + self-answer). The chosen value lands on the card's `Stage-exit policy: manual | ai-proxy | auto` field (a legacy `Counterpart: on` line reads as `proxy`; the field replaces the former proxy decision item), is passed to the child along with `Engine`, and overrides trigger-word mode propagation for every engine. **When the card's certainty/difficulty assessment reaches the high-certainty, low-cost band, the assessment's recommended policy SHALL be pre-filled as the ticket's default**, confirmed or overridden in the same interaction; below that band the ticket stays mandatory with no default. The enqueue output SHALL state the layer split explicitly: intake tickets freeze task-level WHAT; process-level forks that only emerge during analysis (approach picks, verdicts, plan confirmation) belong to the layer this ticket assigns.

#### Scenario: 第一票知情选择

- **WHEN** 用户入队一张卡（在场档）
- **THEN** 深谈第一票为交互预算三选一（含推荐与后果说明），选定值写入 Stage-exit policy 字段；输出明示「任务级方向已冻结，过程级分叉的归属由本票决定」

#### Scenario: 高置信度档策略默认

- **WHEN** 卡片评估落在高确定度、低成本档
- **THEN** 策略票以评估推荐值预填为默认，人在同一次交互中确认或覆盖

#### Scenario: policy 覆盖触发词

- **WHEN** 卡片 Stage-exit policy: ai-proxy 且触发语为「启动」（不含「自动」）
- **THEN** 子运行以 auto 模式 + 代理检查点执行，触发词规则被覆盖；无字段时保持现行触发词规则，行为与历史版本逐字一致

### Requirement: derived 关系且禁止共用 change/分支

Relationship handling SHALL be split by pass. The **enqueue batch triage pass** (owned by `goal-queue-triage`) SHALL handle **duplicate/equivalent** and **root-cause clustering**, marking a card whose outcome is already covered by a done card `skipped (covered)` with a pointer to the covering report. The **dispatch-time relationship pass** SHALL recognize **derived** (fixing A reveals B as follow-on or deeper root cause) in addition to **dependency** and **overlap-conflict**. Derived SHALL be recorded in the progress document Notes. The system MUST NOT place two in-progress cards on one branch or one OpenSpec change. For `Engine: opsx-jira-fix-workflow` children, relationship-pass notes SHALL be included in the card supply so the child writes `## Related Issues` in that change's `design.md`.

#### Scenario: 入队与派发职责分离

- **WHEN** 一批新卡入队且其中两张等价
- **THEN** 等价由入队 triage 处置（折叠或标记 covered），派发时的关系 pass 不再重复承担等价判定，只负责 dependency、overlap-conflict 与 derived

#### Scenario: 衍生票不共用分支

- **WHEN** 关系检测认定 B 由已完成的 A 衍生且 B 仍需修复
- **THEN** B 保持独立卡片与独立分支，进度 Notes 记录 derived，不并入 A 的 change

#### Scenario: opsx 子运行写入 Related Issues

- **WHEN** `Engine: opsx-jira-fix-workflow` 的子运行收到队列关系判断
- **THEN** 该 change 的 `design.md` 含 `## Related Issues` 节记录判断

### Requirement: goal-queue 代理检查点接线

`goal-driven-queue` SHALL declare `ai-proxy-discipline` in frontmatter `dependencies` (prerequisite check with install guidance; abort on missing when the card's Stage-exit policy is `proxy`) and wire it, when the card records `Stage-exit policy: ai-proxy`, at these thin-pointer checkpoints: enqueue intake Q&A (absent human); the **batch triage / batch approval event** (mechanically provable outcomes apply without confirmation; the proxy MAY grant the batch approval as bounded pre-authorization with the Decisions-I-made section displayed to it); the card approval event (proxy approval = bounded pre-authorization, Decisions-I-made section displayed to it); the record-step verification-checklist check on each child report; and conflict re-adjudication (whether a parked card's constraints re-validate within the original frozen scope). At the batch triage checkpoint the proxy MUST NOT confirm a **value-judgment kill** — discarding a card a human submitted is outcome acceptance and stays human-only; on hit the item SHALL be ticketed and parked as `conflict pending confirmation`, never applied. Proxy-made triage decisions SHALL be recorded in the triage record and surfaced in the acceptance package's needs-your-judgment section. Checkpoint invocations count against the queue budget. With any other policy value or none, queue behavior is identical to today.

#### Scenario: 代理批准事件

- **WHEN** 卡片 Stage-exit policy: ai-proxy 且批准事件到达而真人缺席
- **THEN** 代理在展示 Decisions-I-made-for-you 段后给有界预授权批准，决策入账本标记 proxy-made

#### Scenario: 代理不得确认价值类淘汰

- **WHEN** ai-proxy 卡片缺席运行中 triage 产出「建议不做」的价值类结论
- **THEN** 代理不出票批准该淘汰：该项被出票并搁置为 conflict pending confirmation 留人判定，机械可证的等价/被覆盖结论仍照常自动应用

#### Scenario: 代理的 triage 决策进台账

- **WHEN** 代理在 triage 检查点作出任何决策
- **THEN** 该决策记入 triage 记录并出现在验收包的 needs-your-judgment 段，可被人推翻
