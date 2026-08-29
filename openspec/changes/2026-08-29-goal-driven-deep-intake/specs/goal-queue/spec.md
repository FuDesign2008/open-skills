## MODIFIED Requirements

### Requirement: 入库即预审批（高危启动门禁的队列级化解）

The system SHALL run a **fog-bounded deep intake interview** at enqueue time while the human is present, per `intake-interview-discipline` §A (one question per turn until fog graduates; approach comparison with human pick; freeze into the task card), and SHALL capture explicit human approval of each task's final goal condition and budget as **one approval event closing that interview** ("once" = one approval event, not one question total; an explicit human skip records assumptions and proceeds). The approval record in the task card (the git commit serves as 留痕) satisfies the launch approval otherwise required per unattended run; the host MUST thin-reference `design-approval-gate` named-escape semantics for this pattern. Mid-run launches MUST NOT pause for absent humans unless a newly detected relationship issue or constraint violation changes an already-approved condition, in which case the task MUST be parked as `conflict pending confirmation`.

#### Scenario: 深谈入库一次审批

- **WHEN** 用户随口提交需求要求入队（如「把需求加入队列今晚自己跑」）
- **THEN** 系统以雾为界一次一问问清开放决策并给出方案对比供人选定，冻结进任务卡后以一次审批事件收口；无雾任务快速毕业，人显式跳过则记录假设放行

#### Scenario: 夜间启动不再阻塞

- **WHEN** 消费循环到达一个已预审批且条件未变的任务
- **THEN** 系统直接委托引擎启动长跑，不因无人值守再次暂停等待审批，也不为卡片已冻结的内容重新发问

#### Scenario: 条件失效则搁置

- **WHEN** 执行前检查发现既有约束已不成立（如依赖分支已被合并、目标文件不存在）
- **THEN** 系统将该任务标记为 conflict pending confirmation 并跳过执行，留待人来重新确认

## ADDED Requirements

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
