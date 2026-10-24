## MODIFIED Requirements

### Requirement: 进度文档与验收包

The system SHALL maintain a persistent progress document (path `.goal-driven/queues/<queue-id>/runs/<batch-id>/progress.md`, minimum fields: task, mode, status, result summary, branch name, notes) whose **sole writer is the dispatcher** — a child run reports back and MUST NOT write it, and completions arriving together are recorded sequentially so no entry is lost. Every run SHALL end with an acceptance package in that same `runs/<batch-id>/` directory: the batch progress document, the triage record by path, each executed task's engine completion report, the **dedicated verification document `verification.md`** carrying one section per executed card plus its verdict line, for each card that reached done that card's evidence HTML page and the image files that page displays, and the branch list awaiting human review — with each branch **auto-rebased onto the latest main and its conflicts pre-computed** so the human reviews real conflicts rather than performing N unassisted merge decisions. The package SHALL mark every executed card `Verification: awaiting` until a present human records a verdict, and the batch MUST NOT be presented as accepted while any executed card is still `awaiting`. Merge decisions remain exclusively human; the package labels claims per `completion-evidence-discipline` inherited from the engine reports.

#### Scenario: 人回归验收

- **WHEN** 用户在同一对话回来查看「昨晚跑了什么」
- **THEN** 系统呈现该队列进度文档路径、独立核对文档 `verification.md` 路径与最终摘要：每个任务的结果、证据来源、每张完成卡的证据页路径、对应分支，待人工逐卡裁决的核对节，以及待人工判定的 outcome 型事项清单

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

### Requirement: 执行后人工逐卡核对与独立核对文档

After a batch run ends (caps hit or queue empty) and the acceptance package is assembled, `goal-driven-queue` SHALL run a **mandatory human per-card verification gate** before the batch may be treated as accepted.

- Every **executed** card SHALL enter the verification state `awaiting` at package-assembly time, recorded in the card's Acceptance Summary (`Verification: awaiting | verified | returned — <reason>`) and in a `Verification` column of the progress document; `done` keeps its existing meaning of "engine completed".
- The system SHALL produce a **dedicated, consolidated verification document** at `.goal-driven/queues/<queue-id>/runs/<batch-id>/verification.md`, written by the dispatcher (sole writer). One section per executed card SHALL gather, in one place: card slug, verbatim goal condition, engine, result tier, branch tip, report path, layered acceptance status (hard / soft / human), the engine report's numbered verification checklist, side effects (functional and non-functional), the card's decision/assumption ledger items awaiting judgment, that branch's conflict pre-run result, and, when that card reached done, the path of its evidence HTML page — followed by a verdict line (`verified` / `returned` + reason + who/when).
- The batch SHALL NOT be presented as **accepted** (and its batch summary SHALL show `Verified: N / Awaiting: M / Returned: K`) until every executed card carries a human verdict.
- The per-card verdict SHALL be **human-only**: with `Stage-exit policy: ai-proxy`, the proxy MAY still run the record-step report-checklist check, but MUST NOT fill, infer, or pre-fill a per-card acceptance verdict; a card whose verdict is absent stays `awaiting`.
- A `returned` verdict SHALL route its findings back as new or revised cards (the existing acceptance-findings loop); it MUST NOT merge, revert, or silently drop the branch.
- Non-executed outcomes (`failed` / `skipped (covered)` / `waiting dependency` / `conflict pending confirmation` / parked / leftover `pending`) SHALL be listed in a separate "items needing your decision" section of the verification document and MUST NOT occupy a per-card verdict slot.
- Batches and cards completed before this capability (no verification state recorded) SHALL behave exactly as before; no retro-active verdict is required.

#### Scenario: 批次收尾生成独立核对文档

- **WHEN** 一次队列运行收尾（触顶或清空）并组装验收包
- **THEN** 系统在 `runs/<batch-id>/` 生成独立的 `verification.md`，每张已执行卡一节、就地汇总其目标条件/引擎结果/分支报告/分层验收/引擎核对清单/副作用/台账项/冲突预演与完成卡的证据页路径，并留裁决行；所有已执行卡标 `Verification: awaiting`

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

### Requirement: goal-queue SHALL write one review HTML per completed card

For every card that reaches done, under stage-exit policy manual, auto, or ai-proxy, the dispatcher MUST write one HTML page by following explain-clearly with the form fixed to HTML. The page MUST state the problem, the cause, and the completed fix. The page MUST include one link to that card's evidence HTML page after the explanation visual. The link MUST NOT replace the problem, the cause, or the completed fix. The acceptance package MUST record that file's path. A card that is not done MUST NOT get this page. An enqueue shell MUST NOT write it.

#### Scenario: Five completed cards produce five files

- **WHEN** five cards reach done in one batch
- **THEN** the acceptance package records five review HTML paths, one per card

#### Scenario: A card that did not finish has no file

- **WHEN** a card ends failed, skipped, or parked
- **THEN** the dispatcher does not write a review HTML for that card

#### Scenario: Manual policy still writes the file

- **WHEN** a card reaches done and its stage-exit policy is manual
- **THEN** the dispatcher still writes that card's review HTML page, the page links to that card's evidence page, and the acceptance package records the review path

#### Scenario: Review page links to the evidence page

- **WHEN** a card reaches done and its evidence page has been written
- **THEN** the review HTML contains one link to that evidence page after the explanation visual, and the visual still states the problem, the cause, and the completed fix

## ADDED Requirements

### Requirement: goal-queue SHALL write one evidence HTML per completed card

For every card that reaches done, under stage-exit policy manual, auto, or ai-proxy, the dispatcher MUST write one HTML page at `.goal-driven/queues/<queue-id>/runs/<batch-id>/evidence/<card>.html` during the same sole-writer record step that records that completion. The `<card>` segment MUST be that card's slug and MUST contain no path separator. The page title MUST be 证据留痕.

The child completion report MUST include an evidence list. Each item MUST be either an opened-UI check citing a png, jpg, jpeg, or webp path, or a non-UI check citing the command and a short output summary. The dispatcher MUST copy each cited image that exists and is non-empty into `evidence/<card>/` under that same batch directory. The page MUST reference those copies by a relative path. The page MUST NOT depend on the child worktree remaining.

An opened-UI item whose file is missing or empty MUST appear as pending and MUST state the capture still required. The page MUST NOT invent an image for it. A non-UI item MUST show the command and the output summary and MUST NOT include an image. A done card whose evidence list is empty MUST still get the page, and that page MUST state that no checks were recorded and MUST NOT include an image.

The card's `verification.md` section MUST record this page's path. A card that is not done MUST NOT get this page. An enqueue shell MUST NOT write it. A queue child MUST NOT write it.

#### Scenario: Five completed cards produce five evidence pages

- **WHEN** five cards reach done in one batch
- **THEN** the acceptance package records five evidence HTML paths, one per card, and each page's images are copies under that batch's `evidence/` directory

#### Scenario: A card that did not finish has no evidence page

- **WHEN** a card ends failed, skipped, or parked
- **THEN** the dispatcher does not write an evidence HTML page for that card

#### Scenario: Manual policy still writes the evidence page

- **WHEN** a card reaches done and its stage-exit policy is manual
- **THEN** the dispatcher still writes that card's evidence HTML page and records its path

#### Scenario: An opened UI shows the copied image

- **WHEN** a done card's evidence list cites a non-empty png, jpg, jpeg, or webp
- **THEN** the evidence page shows that image through a relative path to the copy in the acceptance package

#### Scenario: A missing image stays pending

- **WHEN** a done card's evidence list cites an opened UI and the file is missing or empty
- **THEN** the evidence page marks that item pending, states the capture still required, and does not contain an invented image

#### Scenario: A non-UI check has no image

- **WHEN** a done card's check did not open a UI
- **THEN** the evidence page shows that check's command and output summary and does not include an image for it

#### Scenario: A done card with no checks still has a page

- **WHEN** a card reaches done and its evidence list is empty
- **THEN** the dispatcher still writes the evidence page, the page states that no checks were recorded, and the page contains no image

#### Scenario: The page path uses the card slug

- **WHEN** the done card's slug is `sync-dns`
- **THEN** the evidence page path ends with `evidence/sync-dns.html` and its copied images sit under `evidence/sync-dns/`
