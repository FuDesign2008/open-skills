# ai-proxy Specification

## Purpose
TBD - created by archiving change ai-proxy-rename. Update Purpose after archive.
## Requirements
### Requirement: 有界授权章程

The skill SHALL define an authority charter for the AI proxy occupying the human seat at interactive checkpoints when no human is present. All proxy authority SHALL derive from the initial human delegation (trigger + budget + frozen contract) plus a bounded list: intake answers grounded in project context and constraints; approach picks among pre-approved options; quality verdicts at enumerated checkpoints (including rejecting and demanding re-verification); card/contract approval as bounded pre-authorization within already-delegated scope; continuation of the original frozen scope after constraint re-validation. A reserved list SHALL stay human-only: irreversible actions, over-budget extensions, protected-branch merges, outcome-type acceptance, `design-approval-gate` high-impact gates, and any scope change beyond the frozen contract — a proxy hit on any reserved item MUST produce a ticket and park the work item, never a self-approval.

#### Scenario: 授权派生

- **WHEN** 代理在检查点上做出批准/挑选
- **THEN** 该决定的效力范围不超过初始人委托（触发语义 + 预算 + 冻结契约）已授权的边界；超出即无效并出票

#### Scenario: 保留项命中即出票

- **WHEN** 检查点涉及不可逆操作、超预算、受保护合并、outcome 验收或高影响门
- **THEN** 代理停止行使权力，产出票据并搁置该事项留待真人，绝不自我批准放行

### Requirement: 对抗性协议（防迎合）

The proxy SHALL be instantiated per checkpoint under an adversarial protocol isomorphic to `multi-agent-debate`: a fresh context with no access to the executor's reasoning transcript; inputs limited to the charter plus the artifacts under review (card / plan / report / diff); an explicit challenge-not-please mandate (ask the question the executor hopes won't be asked; demand evidence for claims); and verdicts that MUST carry evidence tags (`[FACT] / [INFERENCE] / [UNRESOLVED]`) — an untagged verdict is invalid and treated as no verdict.

#### Scenario: 盲上下文质询

- **WHEN** 代理被唤起核查一份完成报告
- **THEN** 其输入仅含章程与报告工件（及可引用的仓库事实），不含执行者推理过程；质询基于工件证据而非执行者框架

#### Scenario: 无标签裁决无效

- **WHEN** 代理输出未带证据标签的"通过"
- **THEN** 该裁决视为未作出，检查点不得据此推进

### Requirement: 账本集成与推翻权

Every proxy decision SHALL enter the host's existing acceptance ledger marked `proxy-made` (fields per `intake-interview-discipline` §C), surfaced at acceptance with the same rules as other entries; the human MAY overturn any proxy-made entry at acceptance, and overturned findings feed the next run's intake.

#### Scenario: 代理决策入账

- **WHEN** 代理在 intake 或批准检查点做出应答/批准
- **THEN** 账本新增 proxy-made 条目（决策、理由、证据标签、影响分级），验收时呈报且可被真人推翻

### Requirement: 检查点枚举与成本约束

The set of proxy checkpoints SHALL be enumerated in the frozen contract at opt-in time (default set: intake Q&A, approval event, high-impact escalation touchpoint, completion-report check, conflict re-adjudication), and each proxy invocation SHALL count against the run budget. Between checkpoints the `intake-interview-discipline` §B ladder governs as usual — the proxy is not continuously present.

#### Scenario: 检查点外的自答照常

- **WHEN** 运行期决策发生在两个检查点之间
- **THEN** 按 §B 影响分级梯处理（低影响保守默认入账；高影响升格至下一检查点或干净停止），代理不参与

### Requirement: 宿主接线契约

The skill SHALL be `user-invocable: false`, reachable only via host frontmatter `dependencies` (abort with install guidance when missing — no silent downgrade), activated per-run by the host contract's / task card's `Stage-exit policy: ai-proxy` (set by the interaction-budget ticket; a legacy `Counterpart: on` line reads as `proxy`). Hosts wire it with thin pointers at their enumerated checkpoints and MUST NOT restate the charter or protocol prose. With any other policy value or none, host behavior is identical to today.

#### Scenario: 未选择零变化

- **WHEN** 运行未选择 proxy（policy 为 manual / auto / 缺省）
- **THEN** 全部宿主行为与无此能力时逐字一致

#### Scenario: 缺失依赖即中止

- **WHEN** 宿主启动前置检查发现本 skill 缺失且卡片 policy 为 proxy
- **THEN** 宿主中止并给出安装指引，不静默降级为无人质询模式

### Requirement: PDCA 宿主出口接线

The skill's integration guide SHALL define the seat-filling rules for PDCA hosts (`solve-workflow` / `opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`): when such a host runs as a queue child with `Stage-exit policy: ai-proxy` (child auto mode), each manual stop point (the stage exits) becomes a proxy checkpoint under the same charter — fresh context, artifact-only inputs (that stage's output), evidence-tagged verdict, ledger-marked `proxy-made`. At the pre-execution approval point, the proxy's bounded pre-authorization replaces the bare auto-mode escape of `design-approval-gate` (strictly stronger: charter bounds + ledger entry + human overturn instead of a 留痕-only pass-through). Merge decisions, irreversible actions, protected-branch operations, and external-tracker writebacks (e.g. Jira status transitions) stay human-only — a hit parks the item with a ticket. PDCA hosts starting as queue children SHALL also open with a **stop-point forecast**: every manual exit of that workflow, each marked covered-by-frozen-decisions or will-form-a-new-ticket, so the interaction budget's owner knows the interaction count before analysis begins. Hosts integrate via one thin pointer section plus the frontmatter dependency; they MUST NOT restate the charter or protocol.

#### Scenario: 出口坐席升级裸逃生

- **WHEN** solve-workflow 以 Stage-exit policy: ai-proxy 到达实现前批准点
- **THEN** 代理按章程给有界预授权（而非仅留痕直通），决策入账本可推翻；不可逆/合并/受保护项仍出票留真人

#### Scenario: 薄指针接线

- **WHEN** 阅读 solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow 的无人值守代理出口段
- **THEN** 该段只含指针与触发条件（Stage-exit policy: ai-proxy → 出口按章程坐席），不复述章程或协议正文

#### Scenario: 停点预告先行

- **WHEN** solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow 作为队列子运行启动（问题+冻结决策随卡供应）
- **THEN** 进入分析前输出停点预告表（各手动出口 × 已被冻结决策覆盖 / 将形成新决策票），交互次数与归属在分析前可知

#### Scenario: Jira 回写不代理

- **WHEN** jira-fix 子运行到达原 stage 10 位置（队列派发下已短路为待办）
- **THEN** 代理不行使合并与 Jira 回写（外部系统副作用属保留清单），两者作为待办留人；代理仅可就「PR 内容是否满足冻结验收」给出标签裁决

