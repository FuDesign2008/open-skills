## MODIFIED Requirements

### Requirement: 长跑前置需求对齐

The system SHALL perform a **deep intake interview** and output-contract alignment before starting a goal long-run, following `intake-interview-discipline` §A: fog-bounded depth (destination → decision tickets resolved one-per-turn per `clarifying-question-discipline` → approach comparison with human pick → freeze into the output contract → bounded pre-launch self-review). The host MUST NOT restate the composed disciplines' rules in the stage body; it MUST keep only thin touchpoints (pointer, per-turn quantity, Red Flags). When no human is present at intake (e.g. a batch child run), the supplying artifact's frozen decisions answer this stage; absent that, the interview runs in self-answer mode with every answer flagged as an assumption.

#### Scenario: 产出需求对齐清单

- **WHEN** 用户触发 goal 长跑（如「goal 长跑 xxx」「一个 goal 下去跑 xxx」）
- **THEN** 系统通过一次一问问清目标与开放决策，给出 2–5 方案对比由人选定，产出含冻结决策块（选定方向/已决票/延后票/初始假设）的需求对齐清单（模板1），并完成发射前 checklist 级自审；遗留阻塞性疑点在发射前当面退回给人

#### Scenario: Host does not restate clarifying priority checklist

- **WHEN** an agent reads `goal-driven-workflow` stage 1 instructions for asking clarifying questions
- **THEN** the stage body points at `clarifying-question-discipline` / `intake-interview-discipline` for question selection and graduation rules and MUST NOT embed the purpose→constraints→success priority chain as host-local methodology

#### Scenario: 无人值守 intake 自答降级

- **WHEN** intake 时无人在场（如队列子运行未携带冻结决策）
- **THEN** 系统以自答模式跑访谈（调查 → 保守默认 → 全部标记为假设），访谈在人回归时经台账复核补足

## ADDED Requirements

### Requirement: 冻结方向与运行期自答纪律

The system SHALL freeze the chosen approach in the run contract before launch and, during the run, resolve mid-run decisions by the priority order of `intake-interview-discipline` §B (frozen contract → investigated fact → conservative default → clean stop + ticket report). The frozen approach MUST NOT be silently replaced mid-run; evidence falsifying it MUST produce a clean stop with a ticket report rather than an improvised new direction.

#### Scenario: 冻结契约优先

- **WHEN** 运行中出现决策且冻结契约已给出答案
- **THEN** 系统直接遵循契约执行，不重新决策、不入台账

#### Scenario: 方向证伪即干净停止

- **WHEN** 运行证据证伪了冻结方向且无法按优先级 1–3 自答
- **THEN** 系统在安全点干净停止（无半成品改动、预算内），产出票报告（证伪内容、证据、带权衡的选项）供人定夺，不静默换向

### Requirement: 发射契约携带冻结决策

The system SHALL include the frozen decisions (chosen approach, resolved/deferred tickets, initial assumptions) and the ledger path in the launched run contract, so the run can answer "what was frozen" without the human.

#### Scenario: 冻结决策随行

- **WHEN** stage 4 发射长跑
- **THEN** 运行提示词/契约携带冻结决策块与台账路径

### Requirement: 完成报告呈报决策与假设台账

The system SHALL carry a decision/assumption ledger through the run and surface it in the completion report per `intake-interview-discipline` §C: unresolved tickets, low-confidence assumptions, and high-impact-if-wrong entries are presented for human judgment; remaining entries are listed for spot-check and MAY be overturned by the human at acceptance.

#### Scenario: 台账随报告呈报

- **WHEN** 长跑结束产出完成报告
- **THEN** 报告含决策/假设台账节，标注待人工判断项（未决票/低置信/高影响）供 stage 5 人工验收
