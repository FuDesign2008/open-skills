# delta (generated)

## MODIFIED Requirements

### Requirement: 子任务引擎可选调度

The enqueue interview SHALL include a **mandatory engine ticket** (second fixed ticket, after the interaction budget): the user must explicitly choose among `goal-driven-workflow | solve-workflow | opsx-solve-workflow | jira-fix-workflow | opsx-jira-fix-workflow` (exact skill names, with fit guidance and a recommended answer) — **no default value**; the chosen value is fixed per card at freeze time as the `Engine` field. The Delegate step SHALL dispatch by this field and pass the card's `Stage-exit policy` along: a `solve-workflow` child receives the card's problem statement + frozen-decisions block as its stage-1 input and runs per the policy (proxy → auto mode with proxy-occupied exits; manual → manual mode; auto → auto with named escapes); an `opsx-solve-workflow` child additionally passes the openspec environment gate (`openspec/` directory + usable CLI detection) — a card whose engine requires a missing environment parks at the consumption-entry check as `conflict pending confirmation`, never degrading to another engine silently. A `opsx-jira-fix-workflow` child receives the same supply as the jira-fix child (Jira-link goal condition, frozen decisions as its stage 0–1 supply, explicit `queue-child` flag) plus the openspec environment gate, with an **archive + PR-open terminal**: the child archives its OpenSpec change (archiving is native to its model and always happens), then stops at PR open — merge + Jira writeback defer to the human. A `jira-fix-workflow` child receives the Jira issue link/key as the card's goal condition, the frozen-decisions block as its stage 0–1 supply, an explicit `queue-child` context flag, and a **PR-open terminal**: the child runs through stage 9 (PR open) and a record-only closeout — stage 10 (merge + Jira writeback) is deferred to the human, whose merge authority the queue never proxies; the acceptance package lists the awaiting PR and the pending merge + writeback as explicit follow-ups. Queue-level contracts (caps, branch isolation, per-status recording, relationship pass) apply to every engine unchanged. A card without a `Stage-exit policy` keeps the legacy trigger rule; a card without an `Engine` field parks at the consumption-entry check as `conflict pending confirmation` (awaiting engine decision — one added line un-parks it); the queue never silently picks an engine.

#### Scenario: 派发给 solve-workflow 子运行

- **WHEN** 卡片 Engine: solve-workflow 且通过消费入口检查
- **THEN** Delegate 以卡片问题+冻结决策作为其阶段 1 输入调用 solve-workflow，Stage-exit policy 随卡传递并决定其出口行为；队列契约（隔离/记录/配额）不变

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

- **WHEN** 卡片未写 Engine 字段（必问票上线前的存量卡或手写卡）
- **THEN** 消费入口检查将其搁置为 conflict pending confirmation 并注记「awaiting engine decision」，不默认派发任何引擎；补一行 Engine 字段即可解除


### Requirement: 交互预算票与阶段出口策略

The enqueue interview SHALL open with two fixed tickets before scope tickets — first the **interaction budget**, then the **mandatory engine ticket** (per 子任务引擎可选调度): A. full-human (child manual mode, every stage exit asks the user) / B. AI-proxy proxy (`Stage-exit policy: ai-proxy`: child auto mode + proxy checkpoints per charter, ledger trail, human reviews only the final acceptance package) / C. auto (child auto mode, named escapes + self-answer). The chosen value lands on the card's `Stage-exit policy: manual | ai-proxy | auto` field (a legacy `Counterpart: on` line reads as `proxy`; the field replaces the former proxy decision item), is passed to the child along with `Engine`, and overrides trigger-word mode propagation for every engine. The enqueue output SHALL state the layer split explicitly: intake tickets freeze task-level WHAT; process-level forks that only emerge during analysis (approach picks, verdicts, plan confirmation) belong to the layer this ticket assigns.

#### Scenario: 第一票知情选择

- **WHEN** 用户入队一张卡（在场档）
- **THEN** 深谈第一票为交互预算三选一（含推荐与后果说明），选定值写入 Stage-exit policy 字段；输出明示「任务级方向已冻结，过程级分叉的归属由本票决定」

#### Scenario: policy 覆盖触发词

- **WHEN** 卡片 Stage-exit policy: ai-proxy 且触发语为「启动」（不含「自动」）
- **THEN** 子运行以 auto 模式 + 代理检查点执行，触发词规则被覆盖；无字段时保持现行触发词规则，行为与历史版本逐字一致

