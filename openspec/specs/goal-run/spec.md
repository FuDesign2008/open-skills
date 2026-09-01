# goal-run Specification

## Purpose

Goal-driven long-run execution capability owned by the user-invocable `goal-driven-workflow` skill: five-stage orchestration — ① requirement alignment & output contract → ② layered acceptance criteria + `/goal` condition design (official four parts, mandatory budget clause) → ③ sub-agent division & context management (context-rot mitigation) → ④ long-run launch (`/goal` / `claude -p` non-interactive / manual-loop fallback, with CLAUDE.md + hooks + auto-mode companion) → ⑤ completion report & human acceptance. Built on top of Claude Code's native `/goal` harness (v2.1.139+), with a generic fallback for environments without `/goal`.
## Requirements
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

### Requirement: 长跑启动批准门控

The system SHALL require explicit user approval before launching a long run when it involves unattended operation, a budget above threshold, or irreversible actions. The host MUST thin-reference `design-approval-gate` for the approval gate pattern. Auto mode does **not** bypass this long-run high-impact gate (intentional host divergence from generic auto escape).

#### Scenario: High-impact long run approved

- **WHEN** the long run meets any high-impact condition (unattended / large budget / irreversible)
- **THEN** the system pauses before launch and requests explicit user approval of the final goal condition + budget + companion checklist, and MUST NOT skip even in auto mode

#### Scenario: Ordinary long run needs no gate

- **WHEN** the long run is low-impact (small budget / reversible / single-file high-certainty)
- **THEN** the system does not require the high-impact approval gate and may start stage 4 normally after prior stage confirms

### Requirement: Goal-run instructional body SHALL be English

Instructional body text in `goal-driven-workflow` (`SKILL.md` and `reference.md` templates/cheatsheets) MUST be written in English. Chinese trigger phrases MUST remain in frontmatter `description` (and may appear in the invocation trigger list that mirrors description). MUST NOT leave Chinese instructional prose in stage bodies, gate blocks, or output templates.

#### Scenario: Stage body has no Chinese instructional prose

- **WHEN** an agent reads `goal-driven-workflow` stage sections and `reference.md` templates
- **THEN** instructional sentences and template labels are English; Chinese appears only as description/invocation triggers where required

### Requirement: Goal-run command entry SHALL follow command-file conventions when present

When `commands/goal-run.md` is added, it MUST set `disable-model-invocation: true` and MUST instruct the agent to invoke `goal-driven-workflow` and follow it exactly. The repository SHOULD add this command as part of this change.

#### Scenario: Command file invokes the skill

- **WHEN** `commands/goal-run.md` exists
- **THEN** it sets `disable-model-invocation: true` and instructs the agent to invoke `goal-driven-workflow` and follow it exactly

### Requirement: Goal-run SHALL strong-depend on design-approval-gate for launch approval

`goal-driven-workflow` MUST declare `design-approval-gate` in frontmatter `dependencies`, verify it at startup, and thin-reference it at the long-run launch gate. Long-run-specific rule: high-impact launches (unattended / over-budget / irreversible) MUST still pause for explicit user approval even when the host is in auto mode — this is an intentional divergence from `design-approval-gate`'s generic auto-mode escape and MUST be stated at the host launch gate.

#### Scenario: Launch gate thin-refs design-approval-gate

- **WHEN** stage 4 is about to start a high-impact long run
- **THEN** the host loads `design-approval-gate` and still requires explicit user approval for unattended / over-budget / irreversible launches even under auto mode

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

### Requirement: goal-run 对手方检查点接线

`goal-driven-workflow` SHALL declare `ai-counterpart-discipline` in frontmatter `dependencies` (prerequisite check with install guidance; abort on missing when the run contract's Stage-exit policy is `counterpart`) and wire it, when the launch contract records `Stage-exit policy: counterpart`, at these thin-pointer checkpoints: intake Q&A (stage 1, absent human), contract approval as bounded pre-authorization, and the completion-report verification checklist check (stage 5). Checkpoint invocations count against the run budget; between checkpoints the §B ladder governs. With any other policy value or none, stage behavior is identical to today.

#### Scenario: 缺席深谈由对手方应答

- **WHEN** 无人值守 goal 长跑 Stage-exit policy: counterpart 且 stage 1 无真人在场
- **THEN** intake 逐决策提问由对手方按章程应答，决策入账本标记 counterpart-made，冻结契约照常产出

#### Scenario: 完成报告受质询

- **WHEN** stage 5 完成报告产出且 policy 为 counterpart
- **THEN** 报告的分项核对清单交对手方以盲上下文质询（证据标签裁决），未通过项打回重验或出票

### Requirement: goal-run 阶段出口策略映射

When dispatched as a queue child (or launched with the field in its contract), `goal-driven-workflow` SHALL honor the card's `Stage-exit policy` uniformly with the PDCA engines: `manual-pause` → manual mode, stage exits pause for the present user; `counterpart` → auto mode with the enumerated counterpart checkpoints occupied per charter; `auto-escape` → auto mode with named escapes + §B ladder (today's default child behavior). No field → legacy trigger-word propagation, identical to pre-policy versions.

#### Scenario: 三引擎同语义

- **WHEN** 队列以同一 Stage-exit policy 值派发 goal-driven-workflow / solve-workflow / opsx-solve-workflow 三种子运行
- **THEN** 三者对「运行期间谁回答问题」的处理语义一致（manual-pause 停等真人 / counterpart 对手方坐席 / auto-escape 具名逃逸），差异仅在各自的检查点/出口形状

