# goal-queue Delta: presence intake + approval split + queue-level checklist + optional OpenSpec

## MODIFIED Requirements

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

## ADDED Requirements

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
