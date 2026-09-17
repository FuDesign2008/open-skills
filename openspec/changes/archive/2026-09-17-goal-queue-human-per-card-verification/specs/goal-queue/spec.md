## ADDED Requirements

### Requirement: 执行后人工逐卡核对与独立核对文档

After a batch run ends (caps hit or queue empty) and the acceptance package is assembled, `goal-driven-queue` SHALL run a **mandatory human per-card verification gate** before the batch may be treated as accepted.

- Every **executed** card SHALL enter the verification state `awaiting` at package-assembly time, recorded in the card's Acceptance Summary (`Verification: awaiting | verified | returned — <reason>`) and in a `Verification` column of the progress document; `done` keeps its existing meaning of "engine completed".
- The system SHALL produce a **dedicated, consolidated verification document** at `.goal-driven/queues/<queue-id>/runs/<batch-id>/verification.md`, written by the dispatcher (sole writer). One section per executed card SHALL gather, in one place: card slug, verbatim goal condition, engine, result tier, branch tip, report path, layered acceptance status (hard / soft / human), the engine report's numbered verification checklist, side effects (functional and non-functional), the card's decision/assumption ledger items awaiting judgment, and that branch's conflict pre-run result — followed by a verdict line (`verified` / `returned` + reason + who/when).
- The batch SHALL NOT be presented as **accepted** (and its batch summary SHALL show `Verified: N / Awaiting: M / Returned: K`) until every executed card carries a human verdict.
- The per-card verdict SHALL be **human-only**: with `Stage-exit policy: ai-proxy`, the proxy MAY still run the record-step report-checklist check, but MUST NOT fill, infer, or pre-fill a per-card acceptance verdict; a card whose verdict is absent stays `awaiting`.
- A `returned` verdict SHALL route its findings back as new or revised cards (the existing acceptance-findings loop); it MUST NOT merge, revert, or silently drop the branch.
- Non-executed outcomes (`failed` / `skipped (covered)` / `waiting dependency` / `conflict pending confirmation` / parked / leftover `pending`) SHALL be listed in a separate "items needing your decision" section of the verification document and MUST NOT occupy a per-card verdict slot.
- Batches and cards completed before this capability (no verification state recorded) SHALL behave exactly as before; no retro-active verdict is required.

#### Scenario: 批次收尾生成独立核对文档

- **WHEN** 一次队列运行收尾（触顶或清空）并组装验收包
- **THEN** 系统在 `runs/<batch-id>/` 生成独立的 `verification.md`，每张已执行卡一节、就地汇总其目标条件/引擎结果/分支报告/分层验收/引擎核对清单/副作用/台账项/冲突预演，并留裁决行；所有已执行卡标 `Verification: awaiting`

#### Scenario: 未逐卡裁决不得表述为已验收

- **WHEN** 部分已执行卡尚无人工裁决
- **THEN** 批次摘要显示 `Verified/Awaiting/Returned` 计数，且系统不得将该批次表述为已验收

#### Scenario: 代理不得代出逐卡裁决

- **WHEN** 卡片 `Stage-exit policy: ai-proxy` 且人未回归
- **THEN** 代理可执行报告质量核对，但不得填写或推断逐卡验收裁决；裁决缺失的卡保持 `awaiting`，留待真人

#### Scenario: 打回卡回流为新卡

- **WHEN** 人在核对文档中对某卡给出 `returned`
- **THEN** 该卡的发现按既有回路成为新/修订卡，卡片记录 `Verification: returned — <理由>`，不自行合并、回退或静默丢弃该分支

#### Scenario: 非执行结果并入待判定区

- **WHEN** 批次含 `failed` / `skipped (covered)` / 搁置 / 遗留 `pending` 等未执行结果
- **THEN** 这些项列入核对文档的「待判定」区，不占用逐卡裁决位

#### Scenario: 存量运行不受影响

- **WHEN** 查看引入本能力之前完成的批次
- **THEN** 不要求补做逐卡裁决，行为与引入前逐字一致

## MODIFIED Requirements

### Requirement: 进度文档与验收包

The system SHALL maintain a persistent progress document (path `.goal-driven/queues/<queue-id>/runs/<batch-id>/progress.md`, minimum fields: task, mode, status, result summary, branch name, notes) whose **sole writer is the dispatcher** — a child run reports back and MUST NOT write it, and completions arriving together are recorded sequentially so no entry is lost. Every run SHALL end with an acceptance package in that same `runs/<batch-id>/` directory: the batch progress document, the triage record by path, each executed task's engine completion report, the **dedicated verification document `verification.md`** carrying one section per executed card plus its verdict line, and the branch list awaiting human review — with each branch **auto-rebased onto the latest main and its conflicts pre-computed** so the human reviews real conflicts rather than performing N unassisted merge decisions. The package SHALL mark every executed card `Verification: awaiting` until a present human records a verdict, and the batch MUST NOT be presented as accepted while any executed card is still `awaiting`. Merge decisions remain exclusively human; the package labels claims per `completion-evidence-discipline` inherited from the engine reports.

#### Scenario: 人回归验收

- **WHEN** 用户在同一对话回来查看「昨晚跑了什么」
- **THEN** 系统呈现该队列进度文档路径、独立核对文档 `verification.md` 路径与最终摘要：每个任务的结果、证据来源、对应分支，待人工逐卡裁决的核对节，以及待人工判定的 outcome 型事项清单

#### Scenario: 单写者记账不丢条目

- **WHEN** 两个子运行在同一时间窗内完成
- **THEN** 派发器逐条记录两次状态变更，进度文档中两条都在

#### Scenario: 验收只呈报真冲突

- **WHEN** 组装验收包时多数分支可无冲突合入
- **THEN** 系统只呈报真冲突与建议合并序列，不要求人逐张做无冲突的合并决策

#### Scenario: 合并权保留在人

- **WHEN** 全部任务已完成且验收包已生成
- **THEN** 系统停在分支清单、冲突预演结果与逐卡核对文档处等待人工处置，不自行合并到主分支

#### Scenario: 逐卡裁决门入包

- **WHEN** 批次收尾组装验收包
- **THEN** 验收包含独立核对文档，且每张已执行卡在获得真人裁决前保持 `Verification: awaiting`，批次不得被表述为已验收

### Requirement: 队列级验收核对清单

The system SHALL assemble the acceptance package through a queue-level verification checklist: (1) caps accounting — tasks dispatched vs the resolved caps, stops recorded with which cap hit; (2) progress-document completeness — every status change has an entry, discovery notes present for mid-run additions; (3) per-task report-checklist status — each executed task's engine completion report carries its numbered verification checklist, and its overall status is recorded in the card's acceptance summary; (4) leftover pending inventory — what remains, at which priorities, for the next run; (5) archive status per task when OpenSpec sedimentation is on; (6) concurrency accounting — the resolved concurrency against the effective one achieved, with the reason for any gap (module-overlap idling or a platform fallback); (7) conflict picture — the conflict pre-run result per waiting branch, naming which branches carry genuine conflicts that need human resolution; (8) **verification coverage** — every executed card appears in `verification.md` with its verdict state and its per-card section populated from the engine report, and the count of `awaiting` cards is reported. The checklist rides the acceptance package as an itemized section; item failures are surfaced, not silently dropped.

#### Scenario: 验收包含队列级核对

- **WHEN** 批次结束组装验收包
- **THEN** 包含队列级核对清单（配额记账/进度文档完整性/各任务报告核对状态/遗留盘点/归档状态/并发记账/冲突图景/核对覆盖度），核对不通过项显式呈报

#### Scenario: 核对覆盖度记账

- **WHEN** 组装验收包且部分已执行卡尚无人工裁决
- **THEN** 核对清单呈报核对覆盖度：各卡在核对文档中的裁决态与 `awaiting` 计数，缺节的卡被显式指出而非静默略过

### Requirement: 验收包汇总决策与假设台账

The acceptance package SHALL aggregate each executed task's decision/assumption ledger per `intake-interview-discipline` §C into its needs-your-judgment section: outcome-type items plus unresolved tickets, low-confidence assumptions, high-impact-if-wrong entries, and clean-stop tickets with their options. Each executed task's ledger items SHALL also appear in that card's section of the dedicated verification document, so the human can judge them per card while verifying.

#### Scenario: 台账汇总呈报

- **WHEN** 批次结束组装验收包
- **THEN** Needs-your-judgment 含各任务台账汇总（未决票/低置信假设/高影响项）与干净停止票及选项，供人一次看完集中定夺

#### Scenario: 台账随卡入核对节

- **WHEN** 组装独立核对文档
- **THEN** 每张已执行卡的核对节含该卡台账项（未决票/低置信假设/高影响项），与本卡结果并列供逐卡判定

### Requirement: 交互预算票与阶段出口策略

The enqueue interview SHALL open with two fixed tickets before scope tickets — first the **interaction budget**, then the **engine ticket** (per 子任务引擎可选调度): A. full-human (child manual mode, every stage exit asks the user) / B. AI-proxy proxy (`Stage-exit policy: ai-proxy`: child auto mode + proxy checkpoints per charter, ledger trail, the human's review at acceptance is the per-card verification document, and the per-card verdict seat stays human-only) / C. auto (child auto mode, named escapes + self-answer). The chosen value lands on the card's `Stage-exit policy: manual | ai-proxy | auto` field (a legacy `Counterpart: on` line reads as `proxy`; the field replaces the former proxy decision item), is passed to the child along with `Engine`, and overrides trigger-word mode propagation for every engine. **When the card's certainty/difficulty assessment reaches the high-certainty, low-cost band, the assessment's recommended policy SHALL be pre-filled as the ticket's default**, confirmed or overridden in the same interaction; below that band the ticket stays mandatory with no default. The enqueue output SHALL state the layer split explicitly: intake tickets freeze task-level WHAT; process-level forks that only emerge during analysis (approach picks, verdicts, plan confirmation) belong to the layer this ticket assigns.

#### Scenario: 第一票知情选择

- **WHEN** 用户入队一张卡（在场档）
- **THEN** 深谈第一票为交互预算三选一（含推荐与后果说明），选定值写入 Stage-exit policy 字段；输出明示「任务级方向已冻结，过程级分叉的归属由本票决定」

#### Scenario: 高置信度档策略默认

- **WHEN** 卡片评估落在高确定度、低成本档
- **THEN** 策略票以评估推荐值预填为默认，人在同一次交互中确认或覆盖

#### Scenario: policy 覆盖触发词

- **WHEN** 卡片 Stage-exit policy: ai-proxy 且触发语为「启动」（不含「自动」）
- **THEN** 子运行以 auto 模式 + 代理检查点执行，触发词规则被覆盖；无字段时保持现行触发词规则，行为与历史版本逐字一致

#### Scenario: proxy 语义含逐卡核对人席位

- **WHEN** 用户选择 B（AI 代理）交互预算
- **THEN** 输出说明该选择的语义包含「验收时人逐卡核对核对文档」，且逐卡裁决席位为真人专属、代理不得代出

### Requirement: goal-queue 代理检查点接线

`goal-driven-queue` SHALL declare `ai-proxy-discipline` in frontmatter `dependencies` (prerequisite check with install guidance; abort on missing when the card's Stage-exit policy is `proxy`) and wire it, when the card records `Stage-exit policy: ai-proxy`, at these thin-pointer checkpoints: enqueue intake Q&A (absent human); the **batch triage / batch approval event** (mechanically provable outcomes apply without confirmation; the proxy MAY grant the batch approval as bounded pre-authorization with the Decisions-I-made section displayed to it); the **concurrency and isolation decision** (recorded at enqueue, reused by absent runs); the card approval event (proxy approval = bounded pre-authorization, Decisions-I-made section displayed to it); the record-step verification-checklist check on each child report; and conflict re-adjudication (whether a parked card's constraints re-validate within the original frozen scope). When several children are in flight, checkpoint events SHALL be adjudicated **serially by the dispatcher** so that no two adjudications interleave. At the batch triage checkpoint the proxy MUST NOT confirm a **value-judgment kill** — discarding a card a human submitted is outcome acceptance and stays human-only; on hit the item SHALL be ticketed and parked as `conflict pending confirmation`, never applied. The **per-card verification verdict** in `verification.md` is likewise human-only: the record-step check is a quality verdict on the report, but the proxy MUST NOT fill, infer, or pre-fill a card's `verification` verdict — a card whose human verdict is absent stays `awaiting`. Proxy-made triage decisions SHALL be recorded in the triage record and surfaced in the acceptance package's needs-your-judgment section. Checkpoint invocations count against the queue budget. With any other policy value or none, queue behavior is identical to today.

#### Scenario: 代理批准事件

- **WHEN** 卡片 Stage-exit policy: ai-proxy 且批准事件到达而真人缺席
- **THEN** 代理在展示 Decisions-I-made-for-you 段后给有界预授权批准，决策入账本标记 proxy-made

#### Scenario: 代理不得确认价值类淘汰

- **WHEN** ai-proxy 卡片缺席运行中 triage 产出「建议不做」的价值类结论
- **THEN** 代理不出票批准该淘汰：该项被出票并搁置为 conflict pending confirmation 留人判定，机械可证的等价/被覆盖结论仍照常自动应用

#### Scenario: 代理的 triage 决策进台账

- **WHEN** 代理在 triage 检查点作出任何决策
- **THEN** 该决策记入 triage 记录并出现在验收包的 needs-your-judgment 段，可被人推翻

#### Scenario: 并发检查点串行裁决

- **WHEN** 多个 ai-proxy 子运行同时抵达检查点
- **THEN** 派发器串行地逐个裁决，不出现两个裁决交错

#### Scenario: 代理不代出逐卡验收裁决

- **WHEN** ai-proxy 卡片已完成且人未回归，核对文档中该卡裁决缺失
- **THEN** 代理仅可对该卡报告给出带证据标签的质量裁决（通过/打回重验），不得填写或推断 `verified`/`returned`；该卡保持 `awaiting` 直至真人裁决
