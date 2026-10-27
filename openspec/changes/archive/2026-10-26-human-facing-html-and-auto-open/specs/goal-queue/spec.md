# goal-queue Specification (DELTA)

## ADDED Requirements

### Requirement: Human-facing queue records SHALL have generated HTML views

The queue SHALL keep every human-facing record's Markdown file as the canonical source and SHALL generate a self-contained HTML view beside it. The covered set SHALL be the task cards, the triage record, `progress.md`, `verification.md`, and each engine completion report packaged into the acceptance package. `config` and `approaches/*.md` SHALL remain Markdown-only. The existing review HTML and evidence HTML pages SHALL keep their current contract.

The HTML views SHALL be generated at the Stage 1 approval handoff (task card and triage record) and at Stage 3 package assembly (all covered records), and SHALL be regenerated immediately before any open so a stale view is never opened. `verification.html` SHALL be the acceptance entry page and SHALL link to `progress.html`, the triage HTML view, each card's HTML view, each executed card's packaged engine report's HTML view, and, for each done card, that card's review page and evidence page. A target that does not exist SHALL be annotated as unavailable for any batch, including a current batch with failed, skipped, or zero done cards; the entry page SHALL NOT invent a file. Each executed card's packaged engine report SHALL use a deterministic filename (`reports/<card-slug>.md`) and its view `reports/<card-slug>.html`, with the original path named in the footer.

The renderer SHALL use Node built-ins only and SHALL NOT add a runtime dependency. It SHALL escape `&`, `<`, `>`, `"`, and `'`, and SHALL NOT pass raw HTML from card or report content. It SHALL use inline CSS with no external stylesheet, script, font, image, or `@import`; content anchors to `http`/`https` are allowed. It SHALL normalize each link target by trimming whitespace, removing control characters, and lowercasing the scheme, and SHALL allow only relative paths (not starting with `/` or `//`), fragments, `http`, `https`, and `mailto`; it SHALL reject `javascript:`, `data:`, `vbscript:`, `file:`, root-relative paths, protocol-relative URLs, and backslash-prefixed paths, and SHALL escape attribute values. It SHALL split table cells on unescaped `|`, honor `\|` inside a cell, and protect code spans from link rewriting. It SHALL rewrite a relative `.md` link to an existing `.html` view except inside code fences, SHALL record the source path and generation time in the page footer, SHALL be deterministic for the same source and generation time, and SHALL NOT modify the `.md` source.

When Node is unavailable, the dispatcher SHALL write the same HTML directly under the same escaping, self-containment, and footer rules. If the dispatcher cannot guarantee those rules, it SHALL print the `.md` paths instead of writing unsafe HTML. The contract is the rendered content, not the tool.

The first progress-document entry SHALL record `Trigger: interactive | scheduled` from the actual run trigger. The dispatcher SHALL auto-open `verification.html` at the Stage 3 handback only when that recorded value is `interactive`. An explicit view request SHALL open the requested page regardless of the recorded trigger; the request itself is the presence input. A scheduled or unattended run SHALL NOT auto-open; it SHALL print the paths and MAY open a page only on an explicit request. The open action SHALL resolve the file under the queue directory and SHALL use an argument vector rather than a shell; tests SHALL inject the opener and SHALL NOT launch a browser. Generated HTML SHALL NOT be committed: delivery SHALL stage only the card's allowed paths, and verification SHALL show the diff excludes `.goal-driven/`.

#### Scenario: Every covered record gets an HTML sibling

- **WHEN** the queue generates human-facing views for a batch
- **THEN** each task card, the triage record, `progress.md`, `verification.md`, and each packaged engine report has a sibling `.html` view

#### Scenario: Markdown remains canonical and byte-unchanged

- **WHEN** a view is rendered
- **THEN** the `.md` source is unchanged byte-for-byte and remains the record agents edit

#### Scenario: Agent-only records stay Markdown-only

- **WHEN** the queue generates HTML views
- **THEN** `config` and `approaches/*.md` get no HTML view

#### Scenario: Verification HTML is the entry page with resolving links

- **WHEN** the acceptance package is assembled
- **THEN** `verification.html` links to progress, triage, each card, each executed card's packaged report, and, for each done card, that card's review page and evidence page; every existing target resolves, and a missing target is annotated as unavailable

#### Scenario: A pre-change batch links only existing targets

- **WHEN** a view is generated for a batch that predates this capability
- **THEN** the entry page links only to existing targets or annotates a missing target as unavailable, and does not invent a file

#### Scenario: A failed card has no review or evidence link

- **WHEN** a current batch contains a failed card that was executed and has a packaged report
- **THEN** the entry page links that card's HTML view and packaged report, and annotates the absent review/evidence target as unavailable

#### Scenario: A skipped card has no packaged report

- **WHEN** a card is `skipped (covered)` and was never executed
- **THEN** the entry page links that card's HTML view and annotates the missing report, review, and evidence targets as unavailable

#### Scenario: A zero-done batch still gets an entry page

- **WHEN** a batch finishes with zero done cards
- **THEN** `verification.html` still exists and links progress, triage, each card, each executed card's packaged report, and annotates every review/evidence target as unavailable

#### Scenario: The auto-open gate reads the recorded trigger

- **WHEN** the first progress entry records `Trigger: interactive`
- **THEN** the dispatcher may auto-open the Stage 3 entry page; when it records `Trigger: scheduled`, the dispatcher prints paths and does not auto-open, while an explicit view request may still open the requested page

#### Scenario: Protocol-relative and obfuscated schemes are rejected

- **WHEN** a link target is `//example.com/x`, `file:...`, `JaVaScRiPt:...`, `java\tscript:...`, or a backslash-prefixed path
- **THEN** normalization rejects the target and the renderer emits no active link for it

#### Scenario: Interactive handback opens the entry page

- **WHEN** the first progress entry records `Trigger: interactive` and the Stage 3 handback runs
- **THEN** the dispatcher auto-opens `verification.html` in the system default browser

#### Scenario: On-demand view opens the requested page

- **WHEN** the human explicitly asks to view a covered record, regardless of the recorded trigger
- **THEN** the dispatcher regenerates that view if stale and opens it in the system default browser; the request itself is the presence input

#### Scenario: Unattended runs do not auto-open a browser

- **WHEN** a scheduled or unattended run assembles the package
- **THEN** no browser auto-opens and the dispatcher prints the view paths; an explicit view request may still open a page

#### Scenario: A stale view is regenerated before opening

- **WHEN** the `.md` source is newer than its HTML view
- **THEN** the dispatcher re-renders the view before opening it

#### Scenario: The renderer escapes content and stays self-contained

- **WHEN** the source contains `<script>`, `&`, quotes, or heading placeholders such as `<batch-id>`
- **THEN** the output escapes them, contains inline CSS only, and contains no external stylesheet, script, font, image, or `@import`

#### Scenario: Unsafe link schemes and attributes are blocked

- **WHEN** the source contains a `javascript:`, `data:`, or `vbscript:` link, or a link with special characters in its target
- **THEN** the renderer blocks the scheme or escapes the attribute value

#### Scenario: Link rewriting skips code fences and missing targets

- **WHEN** the source links to another `.md` file
- **THEN** the renderer rewrites the link to its `.html` view only when that view exists and the link is not inside a code fence

#### Scenario: The no-Node fallback keeps the same contract

- **WHEN** Node is unavailable
- **THEN** the dispatcher writes the same escaped, self-contained HTML with the source and generation time in the footer, or prints the `.md` paths instead of writing unsafe HTML

#### Scenario: The open action is path-contained and shell-free

- **WHEN** the dispatcher opens a view
- **THEN** the path resolves under the queue directory and the opener receives an argument vector, not a shell command

### Requirement: Completed queue cards SHALL auto-submit an MR

Every executed card that reaches `done` with a reviewable diff SHALL automatically commit, push its feature branch, and open a PR/MR before its completion report is final. The child SHALL commit its work first, then establish a reviewable diff only when the scoped work tree is clean (`git status --porcelain -- . ':(exclude).goal-driven' ':(exclude).explain-clearly'` prints nothing) and `git diff --stat "$(git merge-base origin/main HEAD)" HEAD` prints at least one changed file; the completion report SHALL record both commands and a short output summary. A scoped status that still prints a change SHALL NOT be reported as no reviewable diff: the child SHALL commit the work or report a delivery failure. If `origin/main` or the merge base is unavailable, the child SHALL report `MR: failed — <reason>`. The report SHALL use exactly one of these states: `MR: opened <url>`, `MR: failed — <reason>`, or `MR: skipped — no reviewable diff (<status output>; <diff output>)`.

The completion report SHALL record the MR URL. The progress document, the verification document, and the acceptance package SHALL record the same URL. A done card with a reviewable diff and neither an opened URL nor a failure reason SHALL bounce; the queue SHALL NOT fake a URL.

The queue SHALL carry the auto-MR rule in the card supply. It SHALL NOT edit a child engine's completion-report template. Merge, release, protected-branch operations, and any auto-merge SHALL remain human-only. An MR failure SHALL be reported as a delivery failure; the card SHALL NOT be presented as done-with-MR until the MR is open. The dispatcher SHALL record the failure reason and set the card status to `failed`. A done card with a reviewable diff and neither an opened URL nor a failure reason SHALL also be set to `failed` (a bounce). Only a scope or constraint change beyond the frozen card uses `conflict pending confirmation`.

Conflict prediction SHALL stay local: the pre-run rebase SHALL happen in a temporary scratch worktree, SHALL NOT push, force-push, or rewrite a branch that already carries an open MR, and only genuine conflicts plus the MR URL SHALL reach the human.

#### Scenario: A done card with a reviewable diff opens an MR

- **WHEN** an executed card reaches done and the diff command prints at least one changed file
- **THEN** the child commits, pushes its feature branch, opens a PR/MR, and records `MR: opened <url>` before the completion report is final

#### Scenario: The MR URL reaches every human-facing record

- **WHEN** a card opens an MR
- **THEN** the URL appears in the completion report, the progress document, the verification document, and the acceptance package

#### Scenario: A done card with no diff records the reason

- **WHEN** the diff command prints no changed file
- **THEN** the report records `MR: skipped — no reviewable diff (<status output>; <diff output>)` and no MR is opened

#### Scenario: A done card with a diff and no MR state bounces

- **WHEN** a done card has a reviewable diff but neither an MR URL nor a failure reason
- **THEN** the dispatcher bounces the card and does not present it as done-with-MR

#### Scenario: MR failure is reported and not faked

- **WHEN** the child cannot open an MR (no remote, auth, or network)
- **THEN** the report records `MR: failed — <reason>`, the dispatcher records the delivery failure, and no URL is invented

#### Scenario: Merge remains human

- **WHEN** an MR is open
- **THEN** the queue does not merge, release, push a protected branch, or enable auto-merge

#### Scenario: The queue does not edit engine templates

- **WHEN** the auto-MR rule is applied
- **THEN** the queue carries it in the card supply and does not change any child engine's completion-report template

#### Scenario: Conflict prediction does not rewrite an open-MR branch

- **WHEN** a waiting branch already carries an open MR
- **THEN** the prediction rebase runs only in a scratch worktree and never pushes, force-pushes, or rewrites that branch; only genuine conflicts and the MR URL reach the human

#### Scenario: Uncommitted work is not skipped

- **WHEN** the scoped status command prints a change and the commit has not been made
- **THEN** the child commits the work or reports `MR: failed — <reason>`; it SHALL NOT report `MR: skipped — no reviewable diff`

#### Scenario: Merge-base failure is a delivery failure

- **WHEN** `origin/main` or the merge base is unavailable
- **THEN** the report records `MR: failed — <reason>` and the card is not presented as done-with-MR

## MODIFIED Requirements

### Requirement: 进度文档与验收包

The system SHALL maintain a persistent progress document (path `.goal-driven/queues/<queue-id>/runs/<batch-id>/progress.md`, minimum fields: task, mode, status, result summary, branch name, **MR URL**, notes) whose **sole writer is the dispatcher** — a child run reports back and MUST NOT write it, and completions arriving together are recorded sequentially so no entry is lost. The first progress-document entry SHALL record `Trigger: interactive | scheduled` from the actual run trigger. Every run SHALL end with an acceptance package in that same `runs/<batch-id>/` directory: the batch progress document and its generated `progress.html` view, the triage record and its generated HTML view, each executed task's engine completion report copied into the package together with its generated HTML view, the **dedicated verification document `verification.md` and its generated `verification.html` entry page** carrying one section per executed card plus its verdict line and that card's HTML view path, for each card that reached done that card's evidence HTML page and the image files that page displays, and the branch list awaiting human review — with each branch's **conflicts pre-computed in a temporary scratch worktree** so the human reviews real conflicts rather than performing N unassisted merge decisions; the prediction MUST NOT push, force-push, or rewrite a branch that already carries an open MR, and only genuine conflicts plus each card's MR URL reach the human. The branch list SHALL record each card's MR URL or its recorded no-diff/failure reason. The package SHALL mark every executed card `Verification: awaiting` until a present human records a verdict, and the batch MUST NOT be presented as accepted while any executed card is still `awaiting`. Merge decisions remain exclusively human; the package labels claims per `completion-evidence-discipline` inherited from the engine reports.

#### Scenario: 人回归验收

- **WHEN** 用户在同一对话回来查看「昨晚跑了什么」
- **THEN** 系统呈现该队列进度文档路径及其 `progress.html` 视图、triage 记录的 HTML 视图、独立核对文档 `verification.md` 路径及其 `verification.html` 入口页与最终摘要：每个任务的结果、证据来源、每张完成卡的证据页路径、对应分支与 MR URL（或无 diff/失败原因）、待人工逐卡裁决的核对节，以及待人工判定的 outcome 型事项清单

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

#### Scenario: 验收包记录 MR 与 HTML 入口

- **WHEN** 批次收尾组装验收包
- **THEN** 验收包含 `progress.html`、triage HTML 视图、`verification.html`、每份引擎报告的副本及其 HTML 视图，以及每张卡的 MR URL 或无 diff/失败原因

#### Scenario: 核对节记录卡片 HTML 视图路径

- **WHEN** 组装独立核对文档
- **THEN** 每张已执行卡的核对节记录该卡 HTML 视图的路径

#### Scenario: 冲突预演不重写已开 MR 分支

- **WHEN** 待审查分支已携带打开的 MR
- **THEN** 冲突预演只在临时 scratch worktree 中进行，不推送、不强推、不重写该分支；只有真冲突与 MR URL 呈报给人

### Requirement: 执行后人工逐卡核对与独立核对文档

After a batch run ends (caps hit or queue empty) and the acceptance package is assembled, `goal-driven-queue` SHALL run a **mandatory human per-card verification gate** before the batch may be treated as accepted.

- Every **executed** card SHALL enter the verification state `awaiting` at package-assembly time, recorded in the card's Acceptance Summary (`Verification: awaiting | verified | returned — <reason>`) and in a `Verification` column of the progress document; `done` keeps its existing meaning of "engine completed".
- The system SHALL produce a **dedicated, consolidated verification document** at `.goal-driven/queues/<queue-id>/runs/<batch-id>/verification.md`, written by the dispatcher (sole writer). One section per executed card SHALL gather, in one place: card slug, verbatim goal condition, engine, result tier, branch tip, report path, **that card's HTML view path**, **the card's MR URL or its no-diff/failure reason**, layered acceptance status (hard / soft / human), the engine report's numbered verification checklist, side effects (functional and non-functional), the card's decision/assumption ledger items awaiting judgment, that branch's conflict pre-run result, and, when that card reached done, the path of its evidence HTML page — followed by a verdict line (`verified` / `returned` + reason + who/when).
- The batch SHALL NOT be presented as **accepted** (and its batch summary SHALL show `Verified: N / Awaiting: M / Returned: K`) until every executed card carries a human verdict.
- The per-card verdict SHALL be **human-only**: with `Stage-exit policy: ai-proxy`, the proxy MAY still run the record-step report-checklist check, but MUST NOT fill, infer, or pre-fill a per-card acceptance verdict; a card whose verdict is absent stays `awaiting`.
- A `returned` verdict SHALL route its findings back as new or revised cards (the existing acceptance-findings loop); it MUST NOT merge, revert, or silently drop the branch.
- Non-executed outcomes (`failed` / `skipped (covered)` / `waiting dependency` / `conflict pending confirmation` / parked / leftover `pending`) SHALL be listed in a separate "items needing your decision" section of the verification document and MUST NOT occupy a per-card verdict slot.
- Batches and cards completed before this capability (no verification state recorded) SHALL behave exactly as before; no retro-active verdict is required.

#### Scenario: 批次收尾生成独立核对文档

- **WHEN** 一次队列运行收尾（触顶或清空）并组装验收包
- **THEN** 系统在 `runs/<batch-id>/` 生成独立的 `verification.md`，每张已执行卡一节、就地汇总其目标条件/引擎结果/分支报告/该卡 HTML 视图路径/该卡 MR URL 或无 diff/失败原因/分层验收/引擎核对清单/副作用/台账项/冲突预演与完成卡的证据页路径，并留裁决行；所有已执行卡标 `Verification: awaiting`

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
