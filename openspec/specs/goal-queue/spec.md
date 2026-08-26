# goal-queue Specification

## Purpose

Persistent goal-backlog queue lifecycle owned by the user-invocable `goal-queue-workflow` skill: durable task-card backlog, intake-time high-impact pre-approval with 留痕, serial consumption delegating each task to the `goal-driven-workflow` engine (`goal-run` capability), per-task branch/worktree isolation, queue-level budget and stopping rules, a per-run progress document, and a batch acceptance package that hands merge decisions back to the human. Scheduling stays platform-native; this layer treats any trigger — manual or scheduled — as "consume the queue until it drains or caps hit".

## Requirements

### Requirement: 持久 backlog 载体

The system SHALL maintain the queue as a persistent project-local directory (default `.goal-queue/`) holding one markdown task card per goal, where each card records: measurable goal condition, mandatory turn/time budget clause, constraints, priority, status, and acceptance summary fields. Cards MUST be git-trackable so backlog state survives sessions and reviewable in diffs.

#### Scenario: 需求入库

- **WHEN** 用户在空闲时段提交一个需求并要求入队（如「goal 队列加个任务：修复登录超时 bug」）
- **THEN** 系统将其加工为含可验证目标条件与预算子句的任务卡片写入 `.goal-queue/`，状态标记为待审批项，人确认条件与预算后入库完成

#### Scenario: 队列跨会话存续

- **WHEN** 一个会话结束而后新会话被拉起消费队列
- **THEN** 系统从 `.goal-queue/` 读取存量任务卡片继续按优先级消费，不依赖任何对话历史

### Requirement: 入库即预审批（高危启动门禁的队列级化解）

The system SHALL capture explicit human approval of each task's final goal condition and budget **at enqueue time**, recording it in the task card (the git commit serves as 留痕), and treat that record as satisfying the launch approval otherwise required per unattended run. The host MUST thin-reference `design-approval-gate` named-escape semantics for this pattern. Mid-run launches MUST NOT pause for absent humans unless a newly detected relationship issue or constraint violation changes an already-approved condition, in which case the task MUST be parked as `conflict pending confirmation`.

#### Scenario: 夜间启动不再阻塞

- **WHEN** 消费循环到达一个已预审批且条件未变的任务
- **THEN** 系统直接委托引擎启动长跑，不因无人值守再次暂停等待审批

#### Scenario: 条件失效则搁置

- **WHEN** 执行前检查发现既有约束已不成立（如依赖分支已被合并、目标文件不存在）
- **THEN** 系统将该任务标记为 conflict pending confirmation 并跳过执行，留待人来重新确认

### Requirement: 显式触发边界（编排层不内置调度）

The skill SHALL activate only on an explicit queue request (trigger words such as 「跑队列」「goal 队列」「无人值守队列」 / "run queue", "goal queue") and SHALL describe scheduling as platform-native intent only (cron / systemd / scheduled CI / assistant-native routines / manual invocation). The skill MUST NOT embed scheduler commands as required paths and MUST NOT auto-start consumption merely by being loaded.

#### Scenario: 加载即观察

- **WHEN** 该 skill 被加载但用户没有明确的队列操作请求
- **THEN** 编排不自行启动；系统输出当前队列概览并等待指令

#### Scenario: 定时拉起即消费

- **WHEN** 平台定时器或用户手动命令拉起「跑队列」
- **THEN** 系统串行消费全部 pending 任务直至清空或触达队列级预算上限

### Requirement: 串行消费与非阻塞失败

The system SHALL consume queued tasks strictly serially in priority order. Before execution, the system SHALL run a light relationship pass over pending cards (duplicate/equivalent, dependency waiting, overlap-conflict) and re-evaluate remaining cards against the latest code state after each completion. One task's failure MUST NOT block later tasks; failed tasks are marked and recorded with reason, then the loop continues.

#### Scenario: 失败不传染

- **WHEN** 任务 A 的长跑以预算耗尽终止且验收未达成
- **THEN** 系统将 A 标记为 failed 及原因，继续执行下一个 pending 任务 B

#### Scenario: 重复任务跳过

- **WHEN** 待执行任务 B 的症状与目标同已完成的任务 A 等价且 A 的产出已覆盖
- **THEN** 系统将 B 标记为 skipped (covered by duplicate)，注记指向 A 的报告

### Requirement: 逐任务隔离

The system SHALL require each queued task to execute on its own branch (or linked worktree) based off the current main state, so concurrent history stays reviewable per-task and one task's working tree never carries another's uncommitted changes. Isolation directives follow `git-worktree-discipline`; the orchestrator does not restate its checklists.

#### Scenario: 独立分支落盘

- **WHEN** 任务进入执行阶段
- **THEN** 引擎在该任务专属分支上进行全部修改，完成后该分支承载本次交付物供人审查合并

### Requirement: 模式向子运行传播

The system SHALL propagate batch-level mode explicitly into every child long-run invocation (queue trigger containing 「自动」/"auto" runs children in auto mode; default trigger leaves children in their manual defaults). Child skills' auto-revert-to-manual behavior MUST NOT break queue continuity between tasks. The orchestrator states mode propagation once and does not rely on ambient inheritance.

#### Scenario: 自动批次持续自动

- **WHEN** 用户以「自动跑队列」触发且队列含三个任务
- **THEN** 三个任务的引擎调用均以自动模式发起，前一个任务的完结回退不影响后续任务的连续执行

### Requirement: 队列级预算与停止规则

The system SHALL enforce queue-level caps independent of per-task budgets: a maximum number of tasks per run and/or an overall time cap supplied at trigger time or from the queue config, stopping cleanly when reached with remaining tasks left pending. The system treats stopping as a feature: hitting caps, emptying the queue, or repeated no-progress outcomes all end the run gracefully and hand back to the human.

#### Scenario: 总预算触顶优雅收尾

- **WHEN** 队列级时间上限在第三个任务执行完毕时到达
- **THEN** 系统停止派发第四个任务，保留其 pending 状态，转入验收包生成流程

### Requirement: 进度文档与验收包

The system SHALL maintain a persistent progress document updated on every status change (suggested path `.goal-queue/runs/<batch-id>/progress.md`, minimum fields: task, mode, status, result summary, branch name, notes), and SHALL end every run with an acceptance package: the batch progress document plus each executed task's engine completion report plus the branch list awaiting human review. Merge decisions remain exclusively human; the package labels claims per `completion-evidence-discipline` inherited from the engine reports.

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

Instructional body text of `goal-queue-workflow` MUST be written in English; Chinese MUST appear in the frontmatter description and trigger list (including queue-operation triggers like 「跑队列」「goal 队列」with English equivalents). The frontmatter `description` MUST stay within the repo's character limit and carry only routing information (what/when/triggers/do-not-use).

#### Scenario: 双语触发路由

- **WHEN** 中文用户说「跑一下我的任务队列」
- **THEN** 该说法命中中文触发词使 skill 被路由激活，正文按英文指令执行
