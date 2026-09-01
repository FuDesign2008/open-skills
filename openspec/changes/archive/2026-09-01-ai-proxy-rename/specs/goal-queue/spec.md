# delta (generated)

## RENAMED Requirements

### Requirement: goal-queue 对手方检查点接线
- FROM: `### Requirement: goal-queue 对手方检查点接线`
- TO: `### Requirement: goal-queue 代理检查点接线`

## MODIFIED Requirements

### Requirement: 交互预算票与阶段出口策略

The enqueue interview SHALL open with a fixed first ticket — the **interaction budget** — before scope tickets: A. full-human (child manual mode, every stage exit asks the user) / B. AI-proxy proxy (`Stage-exit policy: ai-proxy`: child auto mode + proxy checkpoints per charter, ledger trail, human reviews only the final acceptance package) / C. auto (child auto mode, named escapes + self-answer). The chosen value lands on the card's `Stage-exit policy: manual | ai-proxy | auto` field (a legacy `Counterpart: on` line reads as `proxy`; the field replaces the former proxy decision item), is passed to the child along with `Engine`, and overrides trigger-word mode propagation for every engine. The enqueue output SHALL state the layer split explicitly: intake tickets freeze task-level WHAT; process-level forks that only emerge during analysis (approach picks, verdicts, plan confirmation) belong to the layer this ticket assigns.

#### Scenario: 第一票知情选择

- **WHEN** 用户入队一张卡（在场档）
- **THEN** 深谈第一票为交互预算三选一（含推荐与后果说明），选定值写入 Stage-exit policy 字段；输出明示「任务级方向已冻结，过程级分叉的归属由本票决定」

#### Scenario: policy 覆盖触发词

- **WHEN** 卡片 Stage-exit policy: ai-proxy 且触发语为「启动」（不含「自动」）
- **THEN** 子运行以 auto 模式 + 代理检查点执行，触发词规则被覆盖；无字段时保持现行触发词规则，行为与历史版本逐字一致


### Requirement: 模式向子运行传播

The system SHALL propagate batch-level mode explicitly into every child long-run invocation: a card's `Stage-exit policy` field, when present, overrides trigger-word propagation (manual → child manual mode; proxy → child auto mode + proxy checkpoints; auto → child auto mode with named escapes); with no field, the legacy trigger rule applies (queue trigger containing 「自动」/"auto" runs children in auto mode; default trigger leaves children in their manual defaults). Child skills' auto-revert-to-manual behavior MUST NOT break queue continuity between tasks. The orchestrator states mode propagation once and does not rely on ambient inheritance.

#### Scenario: 自动批次持续自动

- **WHEN** 用户以「自动跑队列」触发且队列含三个任务
- **THEN** 三个任务的引擎调用均以自动模式发起，前一个任务的完结回退不影响后续任务的连续执行


### Requirement: goal-queue 代理检查点接线

`goal-driven-batch` SHALL declare `ai-proxy-discipline` in frontmatter `dependencies` (prerequisite check with install guidance; abort on missing when the card's Stage-exit policy is `proxy`) and wire it, when the card records `Stage-exit policy: ai-proxy`, at these thin-pointer checkpoints: enqueue intake Q&A (absent human), the card approval event (proxy approval = bounded pre-authorization, Decisions-I-made section displayed to it), the record-step verification-checklist check on each child report, and conflict re-adjudication (whether a parked card's constraints re-validate within the original frozen scope). Checkpoint invocations count against the queue budget. With any other policy value or none, queue behavior is identical to today.

#### Scenario: 代理批准事件

- **WHEN** 卡片 Stage-exit policy: ai-proxy 且批准事件到达而真人缺席
- **THEN** 代理在展示 Decisions-I-made-for-you 段后给有界预授权批准，决策入账本标记 proxy-made


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

