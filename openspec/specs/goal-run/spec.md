# goal-run Specification

## Purpose

Goal-driven long-run execution capability owned by the user-invocable `goal-driven-workflow` skill: five-stage orchestration — ① requirement alignment & output contract → ② layered acceptance criteria + `/goal` condition design (official four parts, mandatory budget clause) → ③ sub-agent division & context management (context-rot mitigation) → ④ long-run launch (`/goal` / `claude -p` non-interactive / manual-loop fallback, with CLAUDE.md + hooks + auto-mode companion) → ⑤ completion report & human acceptance. Built on top of Claude Code's native `/goal` harness (v2.1.139+), with a generic fallback for environments without `/goal`.
## Requirements
### Requirement: 长跑前置需求对齐

The system SHALL perform a **deep intake interview** and output-contract alignment before starting a goal long-run, following `intake-interview-discipline` §A: fog-bounded depth (destination → decision tickets resolved one-per-turn per `clarifying-question-discipline` → approach comparison with human pick → freeze into the output contract → bounded pre-launch self-review). The host MUST NOT restate the composed disciplines' rules in the stage body; it MUST keep only thin touchpoints (pointer, per-turn quantity, Red Flags). When the queue-child predicate holds (this turn's dispatch message already supplied a frozen task card as stage 1 input), that artifact's frozen decisions answer this stage; if that card has no frozen decisions, the interview runs in self-answer mode with every answer flagged as an assumption. Standalone invocations MUST NOT complete Design-checked via self-answer: absent a human-seat confirmation of stages 1–3 and Stage 4 launch approval, Design-checked is incomplete and Launch MUST be refused.

#### Scenario: 产出需求对齐清单

- **WHEN** 用户触发 goal 长跑（如「goal 长跑 xxx」「一个 goal 下去跑 xxx」）
- **THEN** 系统通过一次一问问清目标与开放决策，给出 2–5 方案对比由人选定，产出含冻结决策块（选定方向/已决票/延后票/初始假设）的需求对齐清单（模板1），并完成发射前 checklist 级自审；遗留阻塞性疑点在发射前当面退回给人

#### Scenario: Host does not restate clarifying priority checklist

- **WHEN** an agent reads `goal-driven-workflow` stage 1 instructions for asking clarifying questions
- **THEN** the stage body points at `clarifying-question-discipline` / `intake-interview-discipline` for question selection and graduation rules and MUST NOT embed the purpose→constraints→success priority chain as host-local methodology

#### Scenario: 无人值守 intake 自答降级

- **WHEN** the queue-child predicate holds and the supplied card has no frozen decisions
- **THEN** 系统以自答模式跑访谈（调查 → 保守默认 → 全部标记为假设），访谈在人回归时经台账复核补足

#### Scenario: Standalone absence does not self-answer Design-checked

- **WHEN** a standalone invocation has no human present and Design-checked is incomplete
- **THEN** the system MUST NOT mark stages 1–4 complete via self-answer and MUST refuse Launch

### Requirement: Goal-run clarify stage SHALL use clarifying Prefer pointer

The `goal-driven-workflow` clarify stage MUST include a prominent one-line pointer to `clarifying-question-discipline` whose English Prefer form matches clarifying's Prefer slogan (one question per turn; multi-round until clear; clarify first, do not rush to answer). A locale-equivalent one-liner MAY appear alongside the English Prefer line.

#### Scenario: English Prefer pointer present

- **WHEN** an agent opens stage 1 of `goal-driven-workflow`
- **THEN** the stage includes a tagged pointer that names `clarifying-question-discipline` and the English Prefer clarifying slogan

### Requirement: Goal-run clarify stage SHALL flag multi-question dumps

The `goal-driven-workflow` clarify stage MUST list dumping multiple clarifying questions/open points in one message, and rushing to answer during clarification, as Red Flags (with the one-question-per-turn fix).

#### Scenario: Multi-question dump is a Red Flag

- **WHEN** stage 1 Red Flags are defined for `goal-driven-workflow`
- **THEN** they include dumping multiple questions/open points at once and rushing to answer during clarification

### Requirement: 验收标准分层

The system SHALL layer acceptance criteria into three tiers: machine-verifiable (hard), LLM-judge with deterministic-checker (soft), and human outcome-type (human).

#### Scenario: 三层验收标准

- **WHEN** 在启动长跑前设计验收标准
- **THEN** 系统将验收标准分为硬性（编译/测试/格式，agent 可自验）、软性（质检模型 + 确定性 checker）、人工（结果型，需人判断）三层，并将硬性标准作为 `/goal` 条件来源

### Requirement: /goal 条件遵循官方四部分

The system SHALL design the `/goal` condition using the official four parts: one measurable end state, a stated check, constraints that must not change, and a turn/time budget clause.

#### Scenario: 可验证条件

- **WHEN** 编写 `/goal` 条件
- **THEN** 条件包含可测量终态、声明的检查方式（如 `npm test exits 0`）、关键约束（如 `no other test file is modified`）、预算子句（如 `or stop after 20 turns`）

### Requirement: 强制预算子句

The system SHALL include a turn or time budget clause in every `/goal` condition, because `/goal` has no built-in token budget and the evaluator can only judge the transcript.

#### Scenario: 预算保护

- **WHEN** 编写 `/goal` 条件且条件未含预算子句
- **THEN** 系统必须补充 `or stop after N turns`（或时间子句），防止长跑无限消耗 token；系统不得在没有预算约束的情况下启动长跑

### Requirement: sub-agent 分工与上下文管理

The system SHALL plan sub-agent division and select a context-management technique (sub-agent architecture / compaction / structured note-taking) to mitigate context rot during long runs, keeping the main agent focused on plan and synthesis.

#### Scenario: 上下文技术选型

- **WHEN** 长跑任务预期上下文将超过单窗口承载
- **THEN** 系统选择 sub-agent 架构（子代理深工、主 agent 只收 1-2k 摘要）/ compaction / structured note-taking 之一，并为每个 sub-agent 定义任务、最小工具集、输出契约与完成条件

### Requirement: 长跑执行多模式支持

The system SHALL support launching the long run via: (1) an interactive goal harness when available, (2) a non-interactive agent CLI invocation of that harness when available, or (3) a manual bounded goal loop fallback. Instructional text MUST describe these as intents first; concrete `/goal` and `claude -p` forms MAY appear as primary-harness examples, not as the only supported platforms.

#### Scenario: Non-interactive execution

- **WHEN** the user needs an unattended run-to-completion invocation
- **THEN** the system launches via the environment's non-interactive agent CLI wrapping the goal harness when available (example: `claude -p "/goal <condition>" --output-format stream-json --verbose`), and can stream progress

#### Scenario: No goal-harness fallback

- **WHEN** the current environment has no `/goal`-equivalent harness
- **THEN** the system falls back to a manual goal loop: iterate do-work → verify against acceptance checklist → continue if unmet (budget-bounded) → stop when met, with an explicit stop clause

### Requirement: 无人值守配套设施

The system SHALL guide companion setup for unattended long runs using intent-first wording: a project convention/instructions file re-read each turn, post-edit automatic validation hooks, and an approval mode that does not stall on routine tool writes. Primary-harness examples (e.g. project-root `CLAUDE.md`, PostToolUse hooks, Claude Code auto mode) MAY be named; MUST NOT imply other agents cannot substitute equivalents.

#### Scenario: Unattended companions in place

- **WHEN** the long run must be unattended (auto/scheduled)
- **THEN** the system confirms a per-turn convention file and post-edit validation hooks are in place, and enables an auto-approval mode so routine writes do not stall the run

### Requirement: 复合目标拆分

The system SHALL split compound objectives into a chain of sequential goals, each with its own verifiable end state, instead of one oversized `/goal`.

#### Scenario: 顺序 goal 链

- **WHEN** 用户目标含多个相互独立的可验证终态（如「改架构 + 加 OAuth + 补测试」）
- **THEN** 系统拆分为顺序 `/goal` 链，每个 goal 单独设计条件与预算，逐一执行

### Requirement: 完成报告与人工验收

The system SHALL produce a structured completion report after the long run, separate machine-verifiable acceptance (spot-checked by human) from human outcome-level acceptance, and MUST follow `completion-evidence-discipline` for any pass/done claims (fresh current-turn evidence; Executed vs Pending labels). The host MUST thin-reference that skill rather than restating its full iron law. The completion report SHALL carry a numbered **verification checklist** with one line per item: (1) goal achievement vs the restated goal/output contract; (2) frozen-approach comparison — what was frozen, what actually happened, deviations with reasons; (3) tests and verification evidence per acceptance tier (Executed/Pending labels); (4) side effects — functional (unexpected behavior changes elsewhere) and non-functional (performance/security/maintainability impact), each split explicitly; (5) logic and end-to-end flow review for gaps. Checklist items are additive report structure — they do not replace the per-criterion acceptance status.

#### Scenario: Report and layered acceptance

- **WHEN** the long run ends
- **THEN** the main agent outputs the completion report (template 5: goal recap, per-criterion status, deliverables + evidence, leftovers, spend), the human judges outcome-type items and spot-checks machine items; findings feed the next run's requirements template

#### Scenario: Pass claims cite completion-evidence-discipline

- **WHEN** the agent marks hard acceptance items as passed
- **THEN** each pass claim is backed per `completion-evidence-discipline` with Executed evidence or labeled Pending

#### Scenario: 完成报告分项核对清单

- **WHEN** 长跑结束产出完成报告
- **THEN** 报告含编号核对清单（目标达成对照 / 冻结方案对照与偏差 / 分层测试证据 / 副作用功能与非功能分列 / 逻辑端到端复查），每项标注证据状态，无「整体看起来没问题」式的合并结论

### Requirement: Standalone pre-run Design-checked Armed Launch

For a **standalone** invocation, `goal-driven-workflow` SHALL use the state machine Design-checked → Armed → Launch.

**Queue-child predicate (executable):** this invocation is a queue child **only when this turn's user/orchestrator dispatch message already supplied a frozen task card as stage 1 input**. Conversation history and on-disk `.goal-driven/` cards do **not** count. The host MUST NOT scan `.goal-driven/queues/` to classify the invocation. The host MUST NOT require a `queue-child` flag that the caller did not send. All other invocations are standalone.

- **Design-checked** is complete only when stages 1, 2, and 3 are complete **and** Stage 4 launch approval (final goal condition + budget + companion checklist) has been confirmed at the human seat (present human, or `Stage-exit policy: ai-proxy` occupying the enumerated approval checkpoint). A skip-ahead into stage 2 (invocation already carries a concrete verifiable goal + acceptance criteria) still MUST produce Template 1 (frozen block or an explicit stage-1-N/A line) and obtain one confirmation of that Template 1; that confirmation counts as stage 1 complete.
- **Armed** follows Design-checked. While Armed, the system MUST announce that pre-run checks are complete and MUST NOT start the long run.
- **Launch** starts Stage 4 execute only on an explicit user launch instruction from the closed list 「开跑」 / "launch" / "start the run" / 「开始长跑」 (and obvious same-phrase translations). The following MUST NOT count as Launch: 「自动模式」 / 「自动跑」 / "auto mode"; bare 「好的」 / "ok" / 「继续」 / "confirm". After Launch, the system MUST NOT re-ask stages 1–4 pre-run Q&A.
- If Design-checked is incomplete, the system MUST refuse Launch and continue the remaining pre-run checks — including when the user issues a launch instruction early.
- Auto mode (「自动模式」 / 「自动跑」 / "auto mode") MUST NOT skip stages 1–3 confirmation on standalone invocations. On standalone, a Template 1 `Stage-exit policy: auto` decides who answers mid-run questions; it MUST NOT skip Design-checked or auto-fire Launch.
- Instructional body and frontmatter description MUST NOT add off-hours / leave-work trigger words (e.g. 「下班」 / 「准备下班」); the gate is resident, not a keyword mode.
- Queue-child invocations (predicate above) MUST keep the mapping in `goal-run 阶段出口策略映射`; this state machine does not apply to them.
- Stage 5 human acceptance is unchanged.
- Starting the long run (Launch) is human-only even when `Stage-exit policy: ai-proxy`: the proxy MAY complete Design-checked (intake + contract approval checkpoints); it MUST NOT issue Launch.

#### Scenario: Incomplete check refuses launch

- **WHEN** a standalone run has not finished stages 1–3 (including skip-ahead Template 1 confirm) or Stage 4 launch approval, and the user issues a launch instruction
- **THEN** the system MUST NOT start the long run and MUST continue the remaining pre-run checks

#### Scenario: Armed waits for explicit launch

- **WHEN** a standalone run has completed Design-checked
- **THEN** the system enters Armed, announces that the run will not start until an explicit launch instruction, and MUST NOT start Stage 4 execute

#### Scenario: Explicit launch starts the run without re-asking

- **WHEN** the run is Armed and the user issues an explicit launch instruction
- **THEN** the system starts Stage 4 execute and MUST NOT re-open stages 1–4 pre-run Q&A; Stage 5 still ends at human acceptance

#### Scenario: Auto-mode words are not Launch

- **WHEN** a standalone run is Armed (or still in Design-checked) and the user says 「自动模式」 / 「自动跑」 / "auto mode"
- **THEN** those phrases MUST NOT start Stage 4 execute; Launch still requires a closed-list launch instruction

#### Scenario: Bare confirmation is not Launch

- **WHEN** a standalone run is Armed and the user says only 「好的」 / "ok" / 「继续」 / "confirm"
- **THEN** the system MUST NOT start Stage 4 execute

#### Scenario: Standalone auto does not skip stages 1–3

- **WHEN** a standalone invocation is in auto mode
- **THEN** stages 1, 2, and 3 still pause for confirmation at the human seat; auto MUST NOT advance those exits without confirmation

#### Scenario: Skip-ahead still completes stage 1

- **WHEN** a standalone invocation skips ahead to stage 2 because the input already has a concrete verifiable goal + acceptance criteria
- **THEN** the system still outputs Template 1 (freeze or stage-1-N/A) and requires one confirmation of it before stage 1 counts as complete for Design-checked

#### Scenario: Queue child is dispatch-supplied only

- **WHEN** this turn's dispatch text already supplied a frozen task card as stage 1 input
- **THEN** the invocation is a queue child: the card's frozen decisions supply stage 1, `Stage-exit policy` maps remaining exits as today, and this standalone state machine does not apply

#### Scenario: On-disk queue does not classify the invocation

- **WHEN** `.goal-driven/queues/` contains cards but this turn's dispatch did not supply a frozen task card as stage 1 input
- **THEN** the invocation is standalone; the host MUST NOT treat those on-disk cards as queue-child supply

#### Scenario: No leave-work trigger words

- **WHEN** an agent reads `goal-driven-workflow` frontmatter description and instructional body
- **THEN** those texts MUST NOT list 「下班」 / 「准备下班」 / equivalent off-hours phrases as trigger words

#### Scenario: Proxy may Arm, not Launch

- **WHEN** a standalone invocation records `Stage-exit policy: ai-proxy`
- **THEN** the proxy MAY occupy intake and contract-approval checkpoints to complete Design-checked; Launch remains a present-human instruction and the proxy MUST NOT fire it

### Requirement: 长跑启动批准门控

The system SHALL require confirmation of the final goal condition + budget + companion checklist before a **standalone** run may enter Armed. The host MUST thin-reference `design-approval-gate` for the approval-gate pattern. That approval MUST NOT start Stage 4 execute; Launch remains a separate explicit user instruction (see Standalone pre-run Design-checked Armed Launch). Auto mode does **not** bypass this standalone launch-approval pause (intentional host divergence from generic auto escape). High-impact conditions (unattended / large budget / irreversible) remain covered by this same pause — they do not create a second, bundled fire-on-approve step.

Queue-child runs (dispatch text already supplied a frozen task card as stage 1 input) use that card's recorded approval as the 留痕 for this gate; they do not wait for a second standalone Armed pause.

#### Scenario: High-impact long run approved

- **WHEN** a standalone long run meets any high-impact condition (unattended / large budget / irreversible)
- **THEN** the system pauses for confirmation of the final goal condition + budget + companion checklist even in auto mode, records Armed on approval, and MUST NOT start the long run until an explicit launch instruction

#### Scenario: Ordinary standalone still needs launch approval

- **WHEN** a standalone long run is low-impact (small budget / reversible / single-file high-certainty)
- **THEN** the system still requires Stage 4 launch approval to enter Armed and MUST NOT start after prior stage confirms alone

#### Scenario: Queue-child card approval stands in

- **WHEN** this turn's dispatch text already supplied a frozen task card that records approval of condition + budget
- **THEN** that recorded approval is the 留痕 for this gate; the child follows `Stage-exit policy` and MUST NOT insert an extra standalone Armed wait

### Requirement: Goal-run instructional body SHALL be English

Instructional body text in `goal-driven-workflow` (`SKILL.md` and `reference.md` templates/cheatsheets) MUST be written in English. Chinese trigger phrases MUST remain in frontmatter `description` (and may appear in the invocation trigger list that mirrors description). MUST NOT leave Chinese instructional prose in stage bodies, gate blocks, or output templates.

#### Scenario: Stage body has no Chinese instructional prose

- **WHEN** an agent reads `goal-driven-workflow` stage sections and `reference.md` templates
- **THEN** instructional sentences and template labels are English; Chinese appears only as description/invocation triggers where required

### Requirement: Goal-run SHALL strong-depend on design-approval-gate for launch approval

`goal-driven-workflow` MUST declare `design-approval-gate` in frontmatter `dependencies`, verify it at startup, and thin-reference it at the standalone Stage 4 launch-approval pause (the pause that enters Armed). On standalone invocations, `design-approval-gate`'s generic auto-mode escape MUST NOT skip that pause. High-impact launches (unattended / over-budget / irreversible) remain covered by the same pause. Queue-child runs use the supplying card's recorded approval as 留痕 and do not take this standalone pause.

#### Scenario: Launch gate thin-refs design-approval-gate

- **WHEN** a standalone run reaches Stage 4 launch approval (high-impact or ordinary)
- **THEN** the host loads `design-approval-gate` and still requires confirmation of condition + budget + companion even under auto mode; approval enters Armed and MUST NOT start the harness

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

### Requirement: 长跑运行中自检节奏

The system SHALL define a mid-run self-check cadence for the monitor step: at each budget milestone (e.g. every half or third of the turn/time budget), the orchestrating agent re-checks the evaluator's latest reason, remaining budget, and anomalies (repeated failures, no-progress loops), and records one run-log line per milestone. A milestone check that reveals sustained no-progress or budget exhaustion trend triggers the early-interrupt control instead of waiting for the full budget to burn.

#### Scenario: 预算里程碑自检

- **WHEN** 长跑消耗到达一个预算里程碑
- **THEN** 监控步骤记录一行运行日志（评估器最新理由、剩余预算、异常），发现持续无进展趋势时提前走中断控制而非等预算烧完

### Requirement: 可选 OpenSpec 沉淀（goal-run）

The system SHALL offer OpenSpec sedimentation as an **opt-in intake decision** (`traceability: openspec | none`), presented only when the target project has an `openspec/` directory and a usable openspec CLI or equivalent; default is off, project policy (AGENTS.md/CLAUDE.md) may mandate on, and the user's explicit choice wins. When on: stage 2/3 artifacts map to an openspec change under `openspec/changes/<name>/` (proposal = frozen approach + why, design = acceptance layering + sub-agent division, tasks = checkbox checklist maintained during the run); stage 4 carries the change path in the launch contract; stage 5 runs `openspec validate` and archives the change (syncing main specs) once machine-verifiable evidence is complete, recording both as report evidence items. When off or unavailable: behavior is identical to a run without this capability.

#### Scenario: 选择采用 openspec 沉淀

- **WHEN** 目标工程存在 openspec/ 且 CLI 可用，用户在 intake 选择 traceability: openspec
- **THEN** 阶段 2/3 产物映射为 openspec change artifacts，运行中维护 tasks 勾选，完成报告含 validate 结果与归档动作（机器可验证证据齐全后执行）作为证据项

#### Scenario: 未选择则零变化

- **WHEN** 用户未选择 openspec 沉淀（或工程无 openspec/）
- **THEN** 该选项不出现或不生效，全部阶段行为与无此能力时逐字一致

#### Scenario: 归档门控于机器可验证证据

- **WHEN** openspec 沉淀开启且长跑结束
- **THEN** 归档（sync 主 specs）在机器可验证证据齐全后执行；outcome 型判断仍留给人，其发现回流为新/修订的 change 而非阻塞归档

### Requirement: goal-run 阶段出口策略映射

When dispatched as a queue child (dispatch text already supplied a frozen task card as stage 1 input) or launched with the field in its contract, `goal-driven-workflow` SHALL honor `Stage-exit policy` uniformly with the PDCA engines for **who answers mid-run questions**: `manual` → pause for the present user; `proxy` → auto mode with enumerated proxy checkpoints; `auto` → auto mode with named escapes + §B ladder. No field → legacy trigger-word propagation.

On **standalone** invocations, that field MUST NOT skip stages 1–3 confirmation, MUST NOT skip the Stage 4 launch-approval pause, and MUST NOT count as a Launch instruction.

#### Scenario: 三引擎同语义

- **WHEN** 队列以同一 Stage-exit policy 值派发 goal-driven-workflow / solve-workflow / opsx-solve-workflow 三种子运行
- **THEN** 三者对「运行期间谁回答问题」的处理语义一致（manual 停等真人 / proxy 代理坐席 / auto 具名逃逸），差异仅在各自的检查点/出口形状

#### Scenario: Standalone auto policy does not skip the pre-run gate

- **WHEN** a standalone invocation records `Stage-exit policy: auto` (or the user said 「自动跑」)
- **THEN** the policy selects auto-mode mid-run answering only; Design-checked and explicit Launch still apply

### Requirement: goal-run 代理检查点接线

`goal-driven-workflow` SHALL declare `ai-proxy-discipline` in frontmatter `dependencies` (prerequisite check with install guidance; abort on missing when the run contract's Stage-exit policy is `proxy`) and wire it, when the launch contract records `Stage-exit policy: ai-proxy`, at these thin-pointer checkpoints: intake Q&A (stage 1, absent human), contract approval as bounded pre-authorization (**Arm, not Launch**), and the completion-report verification checklist check (stage 5). Checkpoint invocations count against the run budget; between checkpoints the §B ladder governs. With any other policy value or none, stage behavior is identical to today except where Standalone pre-run Design-checked Armed Launch applies. The proxy MUST NOT issue Launch.

#### Scenario: 缺席深谈由代理应答

- **WHEN** 无人值守 goal 长跑 Stage-exit policy: ai-proxy 且 stage 1 无真人在场
- **THEN** intake 逐决策提问由代理按章程应答，决策入账本标记 proxy-made，冻结契约照常产出

#### Scenario: 完成报告受质询

- **WHEN** stage 5 完成报告产出且 policy 为 proxy
- **THEN** 报告的分项核对清单交代理以盲上下文质询（证据标签裁决），未通过项打回重验或出票

#### Scenario: Contract approval Arms only

- **WHEN** the proxy grants contract approval on a standalone invocation
- **THEN** the run enters Armed and MUST NOT start Stage 4 execute until a present-human launch instruction


