# goal-queue-concurrency Specification

## Purpose
Concurrent consumption layer for the goal-driven-queue backlog, owned by the user-invocable `goal-driven-queue` skill: slot-based dispatch in which a free slot is offered only to a card whose machine-readable module set does not overlap any in-flight card; a concurrency and isolation strength settled at the enqueue interview and reused by absent runs, with worktree-mandatory isolation above concurrency 1; three independent caps (`max-tasks` / `max-concurrent` / **wall-clock**) with wall-clock accounting and reference-only estimates; single-writer progress accounting that also records effective concurrency; same-module exploration amortization reusing the Approach Record shape; acceptance merge-decision compression by scratch-worktree conflict prediction that never rewrites a published branch; and an explicit platform-degradation path that states its fallback.
## Requirements
### Requirement: 并发 slot 派发与非重叠准入

The system SHALL consume queued cards through a **slot dispatch** model: while a slot is free and an admissible pending card exists, admit the next card in the consumption order and start its child run, refilling the slot at each completion boundary. A free slot SHALL be offered only to a card whose **module set** does not overlap any in-flight card — so same-module writes serialize automatically instead of colliding. The module set SHALL be a **machine-readable `Modules:` card field**, extracted at enqueue from the card's Constraints and normalized to a comparable path/module list; the admission criterion MUST NOT be evaluated against free-text Constraints. When no pending card is admissible (every candidate overlaps an in-flight card, or is dependency-blocked), the slot SHALL stay idle and the run SHALL continue as in-flight cards complete; an overlapping card MUST NOT be admitted to keep a slot busy. The consumption order (priority level → information leverage → certainty band → FIFO) SHALL decide admission **sequence**, not the number of concurrent children.

#### Scenario: 空闲 slot 采纳下一张不重叠卡

- **WHEN** 一个 slot 空闲，且消费序中的下一张卡 `Modules:` 字段与所有在飞卡不重叠
- **THEN** 系统采纳该卡并启动其子运行，slot 占用

#### Scenario: 模块集取自机器可读字段

- **WHEN** 入队写入一张卡
- **THEN** 该卡的模块集以 `Modules:` 字段规范化落盘（由 Constraints 抽取），派发判据读取该字段而非自由文本 Constraints

#### Scenario: 重叠卡等待而非强占

- **WHEN** 消费序中靠前的卡与某在飞卡模块集重叠，而其后有另一张不重叠的卡
- **THEN** 系统跳过重叠卡、采纳不重叠的那张；重叠卡保持 `pending` 直到在飞卡完成

#### Scenario: 无可采纳卡时 slot 空转

- **WHEN** 所有待办卡都与在飞卡重叠或都被依赖阻塞，而仍有 slot 空闲
- **THEN** 该 slot 保持空闲、不采纳任何卡、不报错也不死锁；运行随在飞卡完成继续推进

#### Scenario: 完成边界补位

- **WHEN** 任一在飞子运行结束（成功、失败或搁置）
- **THEN** 系统在该完成边界重新评估可采纳卡并补位，同时重算信息杠杆

### Requirement: 并发度与隔离强度的入队期决策

The enqueue interview SHALL settle **concurrency** together with **isolation strength** while the human is present. Concurrency SHALL be a choice with a recommended default of **3**; selecting concurrency ≥ 2 SHALL imply acceptance of **worktree-mandatory isolation** for that queue (one worktree per concurrent child), and refusing worktrees SHALL cap the queue's concurrency at 1. Because a mis-described consequence is worse than none, the ticket SHALL state the consequences **derived by walking this project's actual configuration** per `intake-interview-discipline` §A — at minimum: the sibling-path breakage risk for multi-repository projects (worktrees move relative paths, so a script reaching `../sibling-repo` may stop resolving), the disk cost of holding one worktree per concurrent child, and the fact that the human will review conflict pre-runs rather than N unassisted merges. Both chosen values SHALL be recorded in the queue config (`.goal-driven/queues/<queue-id>/config`). A run with the human present and no recorded concurrency SHALL ask; an absent, unattended or scheduled run SHALL reuse the recorded values, and SHALL fall back to concurrency 1 when none is recorded. The system MUST NOT silently assume a concurrency above 1. The skill SHALL declare `git-worktree-discipline` in frontmatter `dependencies` and run a **conditional prerequisite check**: missing aborts with install guidance when the resolved concurrency is ≥ 2, and does not block when concurrency is 1.

#### Scenario: 入队时间并发度

- **WHEN** 用户在入队深谈中被问到并发度
- **THEN** 系统给出并发度选择（推荐默认 3）并说明后果；选定值与隔离强度一并记入队列配置

#### Scenario: 后果按实际配置披露

- **WHEN** 入队票呈现并发 ≥2 的后果
- **THEN** 后果按本工程实际配置走查得出（至少含多仓 sibling 路径断裂风险、每并发 child 一 worktree 的磁盘成本、人将审冲突预演而非逐张合并），不得只写「接受 worktree」

#### Scenario: 并发 ≥2 蕴含接受 worktree

- **WHEN** 用户选择并发 ≥2
- **THEN** 该队列被视为已接受 worktree 强制隔离（每并发 child 一个 worktree），该接受随并发度一同记录

#### Scenario: 拒绝 worktree 则并发封顶 1

- **WHEN** 用户拒绝 worktree 隔离
- **THEN** 该队列的并发度被封顶为 1 并记录，行为退回串行消费；系统不强行要求 worktree

#### Scenario: 缺 worktree 依赖时条件中止

- **WHEN** 队列解析出的并发度 ≥ 2 而 `git-worktree-discipline` 不可用
- **THEN** 系统按前置检查中止并给出安装指引；并发度为 1 时该依赖缺失不阻断运行

#### Scenario: 缺席照用已记录值

- **WHEN** 无人值守或定时拉起消费一个已记录并发度与隔离强度的队列
- **THEN** 系统照用已记录值（含已接受的 worktree 强制），不发起新的询问

#### Scenario: 未记录且缺席则退 1

- **WHEN** 缺席消费而队列配置中没有任何并发度记录
- **THEN** 系统以并发度 1 运行，不静默假定并发

### Requirement: 三口径 caps 与墙钟记账

The system SHALL enforce three independent queue-level caps: a maximum number of tasks per run (`max-tasks`, retained), a maximum concurrency (`max-concurrent`), and an overall **wall-clock** time cap. The summed card estimates SHALL be reported as reference only and MUST NOT be presented as an upper bound on wall-clock duration. Stopping SHALL remain cap-driven: hitting any cap ends **dispatch** cleanly with remaining cards `pending`, while in-flight children are allowed to reach a safe point. Reaching `max-concurrent` SHALL NOT interrupt in-flight children.

#### Scenario: 三口径分别触顶

- **WHEN** 任一 cap（任务数 / 并发度 / 墙钟）达到上限
- **THEN** 系统停止继续派发、保留剩余卡为 `pending`、转入验收包生成；在飞子运行不被中断

#### Scenario: 并发触顶不中断在飞卡

- **WHEN** `max-concurrent` 已满而仍有空闲 slot 需求
- **THEN** 系统不派发新卡，但在飞卡继续执行至完成

#### Scenario: 预估总和降级为参考

- **WHEN** 运行开始时报告卡片预估总和
- **THEN** 该总和仅作参考，不被表述为墙钟时长的上界（并发下它已不成立）

### Requirement: 派发器单写者记账

The dispatcher SHALL be the **sole writer** of the progress document and the queue-level records; a child run MUST NOT write any shared queue file and SHALL report back instead. On each child completion the dispatcher SHALL record the status change, and a leverage recomputation that moves the queue head SHALL be logged as a `reordering` note. Completions arriving together SHALL be recorded sequentially by the dispatcher so that no entry is lost. The progress document SHALL also record the **effective concurrency** achieved alongside the resolved value — so a run whose slots idled on module overlap, or which fell back for platform reasons, is visibly under-utilized rather than silently slower.

#### Scenario: child 不写共享文件

- **WHEN** 任一子运行在其生命周期内需要记录状态
- **THEN** 它只向派发器回报，不写进度文档、triage 记录或任何共享队列文件

#### Scenario: 并发完成不丢条目

- **WHEN** 两个子运行在同一时间窗内完成
- **THEN** 派发器逐条记录两次状态变更，两条都出现在进度文档中

#### Scenario: 有效并发度可见

- **WHEN** 运行期间 slot 因模块重叠长时间空闲，或平台降级
- **THEN** 进度文档记录有效并发度与声明并发度的差距，使人看出吞吐欠达的原因

### Requirement: 同模块探查摊销

When admitted cards touch the same module, the first SHALL produce an **exploration record** and later cards on that module SHALL seed from it rather than re-exploring; writes to that module are serialized by 并发 slot 派发与非重叠准入's admission criterion. The record follows `goal-queue-reuse`'s Approach Record shape and lives inside the bound queue directory. A record whose `factual` entries fail verification against the current code world MUST NOT seed.

#### Scenario: 首卡产出探查记录

- **WHEN** 某模块的首张卡执行完毕并形成了可复用的探查结论
- **THEN** 该结论以 Approach Record 形状写入绑定队列目录

#### Scenario: 后续同模块卡种子化复用

- **WHEN** 后续卡触及同一模块且探查记录的 factual 项仍成立
- **THEN** 该卡的深谈/执行以该记录为种子，不再从零探查

#### Scenario: 写串行由非重叠判据保证

- **WHEN** 两张卡触及同一模块
- **THEN** 它们不会被同时准入；后者的写发生在后者完成之后

#### Scenario: 记录证伪则不种子化

- **WHEN** 探查记录的 factual 项经核实已不成立
- **THEN** 该记录不用于种子化，触及该模块的卡按完整流程处理

### Requirement: 验收合并决策压缩

During acceptance-package assembly each executed task's branch SHALL be rebased **inside a temporary scratch worktree for conflict prediction only**, so the human reviews **real conflicts** instead of performing N unassisted merge decisions. The prediction MUST NOT push, force-push, or otherwise rewrite any published branch — a branch already carrying an open PR/MR is never rewritten; the actual rebase and merge are performed by the human. Merge authority remains exclusively human; the package SHALL surface only genuine conflicts together with the suggested merge order, and MUST NOT merge anything itself.

#### Scenario: 自动 rebase 与冲突预演

- **WHEN** 组装验收包时若干任务分支待审
- **THEN** 各分支在临时 worktree 内被 rebase 到最新 main 并预演合并冲突，预演结果落入验收包

#### Scenario: 预演不推送不改写已发布分支

- **WHEN** 某任务分支已开出 PR/MR
- **THEN** 冲突预演不推送、不 force-push、不改写该分支的已发布内容；实际 rebase 与合并留给人工执行

#### Scenario: 只呈报真冲突

- **WHEN** 多数分支可无冲突合入
- **THEN** 系统只把真冲突与建议合并序列呈报给人，不要求人逐张做无冲突的合并决策

#### Scenario: 合并权保留在人

- **WHEN** 冲突预演完成
- **THEN** 系统停在冲突与建议处等待人工处置，绝不自行合并

### Requirement: 平台降级路径

Concurrency SHALL be expressed as **intent**; the platform's native capability realizes it. When the platform cannot run N children concurrently, the system SHALL fall back to the highest supported concurrency, state the fallback in the progress document, and MUST NOT silently pretend to have run concurrently. The system MUST NOT embed a platform-specific concurrency tool as a required path.

#### Scenario: 平台不支持则降级并明示

- **WHEN** 平台无法并发运行 N 个子运行
- **THEN** 系统退到平台支持的最高并发度运行，并在进度文档中明示该降级

#### Scenario: 不硬编码平台并发工具

- **WHEN** 该 skill 描述并发能力
- **THEN** 正文只表达「N 路并发」的意图，不把任何平台专属并发工具写成必需路径

