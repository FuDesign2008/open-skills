# ai-counterpart Specification

## Purpose
TBD - created by archiving change ai-counterpart-discipline. Update Purpose after archive.
## Requirements
### Requirement: 有界授权章程

The skill SHALL define an authority charter for the AI counterpart occupying the human seat at interactive checkpoints when no human is present. All counterpart authority SHALL derive from the initial human delegation (trigger + budget + frozen contract) plus a bounded list: intake answers grounded in project context and constraints; approach picks among pre-approved options; quality verdicts at enumerated checkpoints (including rejecting and demanding re-verification); card/contract approval as bounded pre-authorization within already-delegated scope; continuation of the original frozen scope after constraint re-validation. A reserved list SHALL stay human-only: irreversible actions, over-budget extensions, protected-branch merges, outcome-type acceptance, `design-approval-gate` high-impact gates, and any scope change beyond the frozen contract — a counterpart hit on any reserved item MUST produce a ticket and park the work item, never a self-approval.

#### Scenario: 授权派生

- **WHEN** 对手方在检查点上做出批准/挑选
- **THEN** 该决定的效力范围不超过初始人委托（触发语义 + 预算 + 冻结契约）已授权的边界；超出即无效并出票

#### Scenario: 保留项命中即出票

- **WHEN** 检查点涉及不可逆操作、超预算、受保护合并、outcome 验收或高影响门
- **THEN** 对手方停止行使权力，产出票据并搁置该事项留待真人，绝不自我批准放行

### Requirement: 对抗性协议（防迎合）

The counterpart SHALL be instantiated per checkpoint under an adversarial protocol isomorphic to `multi-agent-debate`: a fresh context with no access to the executor's reasoning transcript; inputs limited to the charter plus the artifacts under review (card / plan / report / diff); an explicit challenge-not-please mandate (ask the question the executor hopes won't be asked; demand evidence for claims); and verdicts that MUST carry evidence tags (`[FACT] / [INFERENCE] / [UNRESOLVED]`) — an untagged verdict is invalid and treated as no verdict.

#### Scenario: 盲上下文质询

- **WHEN** 对手方被唤起核查一份完成报告
- **THEN** 其输入仅含章程与报告工件（及可引用的仓库事实），不含执行者推理过程；质询基于工件证据而非执行者框架

#### Scenario: 无标签裁决无效

- **WHEN** 对手方输出未带证据标签的"通过"
- **THEN** 该裁决视为未作出，检查点不得据此推进

### Requirement: 账本集成与推翻权

Every counterpart decision SHALL enter the host's existing acceptance ledger marked `counterpart-made` (fields per `intake-interview-discipline` §C), surfaced at acceptance with the same rules as other entries; the human MAY overturn any counterpart-made entry at acceptance, and overturned findings feed the next run's intake.

#### Scenario: 对手方决策入账

- **WHEN** 对手方在 intake 或批准检查点做出应答/批准
- **THEN** 账本新增 counterpart-made 条目（决策、理由、证据标签、影响分级），验收时呈报且可被真人推翻

### Requirement: 检查点枚举与成本约束

The set of counterpart checkpoints SHALL be enumerated in the frozen contract at opt-in time (default set: intake Q&A, approval event, high-impact escalation touchpoint, completion-report check, conflict re-adjudication), and each counterpart invocation SHALL count against the run budget. Between checkpoints the `intake-interview-discipline` §B ladder governs as usual — the counterpart is not continuously present.

#### Scenario: 检查点外的自答照常

- **WHEN** 运行期决策发生在两个检查点之间
- **THEN** 按 §B 影响分级梯处理（低影响保守默认入账；高影响升格至下一检查点或干净停止），对手方不参与

### Requirement: 宿主接线契约

The skill SHALL be `user-invocable: false`, reachable only via host frontmatter `dependencies` (abort with install guidance when missing — no silent downgrade), activated per-run by an explicit opt-in (`counterpart: on` recorded in the host contract / task card; default off). Hosts wire it with thin pointers at their enumerated checkpoints and MUST NOT restate the charter or protocol prose. When not opted in, host behavior is identical to today.

#### Scenario: 未选择零变化

- **WHEN** 运行未选择 counterpart
- **THEN** 全部宿主行为与无此能力时逐字一致

#### Scenario: 缺失依赖即中止

- **WHEN** 宿主启动前置检查发现本 skill 缺失且用户已 opt-in
- **THEN** 宿主中止并给出安装指引，不静默降级为无人质询模式

