# jira-fix-workflow Specification

## Purpose
TBD - created by archiving change integrate-learn-and-improve-jira-hosts. Update Purpose after archive.
## Requirements
### Requirement: Jira fix workflow SHALL strong-depend on learn-and-improve

`jira-fix-workflow` MUST list `learn-and-improve` in frontmatter `dependencies`. At startup prerequisite check, a missing `learn-and-improve` MUST abort the workflow (no silent degrade).

#### Scenario: Missing learn-and-improve aborts startup

- **WHEN** `jira-fix-workflow` loads and `learn-and-improve` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before stage 0 continues

### Requirement: Jira fix workflow SHALL thin-delegate retrospective after closeout

After stage 10 merge path completes (merge + `jira-status-writeback`, or keep/continue when no merge), `jira-fix-workflow` MUST load `learn-and-improve` and follow that skill's framework. The host MUST NOT restate the full retrospective methodology inline.

#### Scenario: Post-merge closeout loads learn-and-improve

- **WHEN** stage 10 merge and Jira writeback have finished (or the user chose keep/continue after presenting the closeout menu)
- **THEN** the host loads `learn-and-improve` for structured retrospective and sediment judgment

### Requirement: Jira fix workflow SHALL strong-depend on figma-pixel implement and verify

`jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At startup prerequisite check, a missing either skill MUST abort the workflow (no silent degrade). During execute/verify stages, the host MUST load implement when the goal, card, issue, or plan contains `figma.com` or `node-id=`, or the user asks for pixel restore (implement incomplete without a durable inventory+spec path). Those rows stay hard. A probe of visible text, a visibility flag, or a list length does not pass them. When that same text also contains `参考`, `match the existing`, or `same as`, verify adds the named control's interaction states. That skill MUST continue into `figma-pixel-verify` in the same run until overall PASS or the measurement command cannot run. The host MUST load verify when the goal, card, issue, or plan contains `figma.com` or `node-id=`, when this run implemented from Figma, or alignment checking is required. When that substring is present or this run implemented from Figma, the verification stage MUST treat a missing Verify section (or Spec source sibling) as a failed verification stage. The verification stage MUST pass only when that report’s overall status is PASS (accepted residuals included), its channel is `storybook`, `isolated-harness`, `preview`, `full-app`, or `layout-probe`, and `scripts/check-figma-verify-report.mjs` from `figma-pixel-verify` exits 0 on that file. A source-literal compare, or a report that leaves pixel rows for a person, MUST NOT pass. Any other result MUST fail the stage and return to the implement stage for another fix/re-measure loop. A spec-gap FAIL MUST NOT pass verification—re-enter implement to complete the table. Host prose MUST stay thin and MUST NOT duplicate Figma skill methodology.

#### Scenario: Missing figma-pixel-verify aborts jira-fix startup

- **WHEN** `jira-fix-workflow` loads and `figma-pixel-verify` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before stage 0 continues

#### Scenario: Jira UI fix with Figma link uses implement

- **WHEN** stage execute is applying a UI fix and the issue or plan references a Figma node
- **THEN** the host loads `figma-pixel-implement` and that skill continues into `figma-pixel-verify` in the same run until overall PASS or the measurement command cannot run

#### Scenario: Missing Figma verify report fails Jira verification

- **WHEN** this run implemented UI from Figma and verification has no Verify section (or Spec source sibling)
- **THEN** the host MUST NOT mark verification as passed

#### Scenario: Spec-gap FAIL re-enters implement

- **WHEN** verify FAILs because Spec is missing critical rows after this-run implement
- **THEN** the host MUST NOT pass verification and MUST re-enter `figma-pixel-implement`

#### Scenario: Source compare does not pass Jira verification

- **WHEN** the Verify channel is a source-literal compare, or the report leaves pixel rows for a person
- **THEN** the host MUST NOT pass verification and MUST return to the implement stage for another fix/re-measure loop

### Requirement: Stage 8 SHALL delegate verification execution to runtime-verification-discipline

`jira-fix-workflow` MUST list `runtime-verification-discipline` in frontmatter `dependencies`（缺失即在启动前置检查中止，不静默降级）。Stage 8 检查验证 SHALL 遵循 `runtime-verification-discipline`：由 AI 在环境中按其选层规则与提供者解析亲自执行验证，仅在分类后的真硬边界才交还用户。Host 正文保持薄引用（加载 + 适用条件），不复述该纪律的方法论。

#### Scenario: 可达环境中的修复验证

- **WHEN** Stage 8 验证一个其行为可在 AI 能驱动的环境中检验的修复
- **THEN** Stage 8 由 AI 在该环境中按 `runtime-verification-discipline` 执行验证
- **AND** 不把验证步骤列为「请用户自行运行」

#### Scenario: 缺失 runtime-verification-discipline 时启动中止

- **WHEN** `jira-fix-workflow` 启动前置检查发现 `runtime-verification-discipline` 不可用
- **THEN** 工作流中止并提示安装

### Requirement: Jira fix workflow SHALL delegate PAT readiness to the jira-read credential contract

`jira-fix-workflow` MUST NOT treat mcp-atlassian as the only valid PAT injector. Before any live Jira call, the host MUST run the `jira-read` credential resolution chain (env `JIRA_PERSONAL_TOKEN`, alias `JIRA_PAT`, then the agreed credential file, then ask-and-persist). mcp-atlassian remains a valid way to populate `JIRA_PERSONAL_TOKEN`. The host MUST point at `jira-read` rather than copy the full chain. Stage 0 MUST NOT abort solely because mcp-atlassian is missing. Connectivity MAY use MCP `jira_get_issue` when that tool is available; if it is not, the host MUST degrade to `jira-read` cache or another `jira-read` live path that uses the resolved credentials, and abort only when issue data cannot be obtained at all. This change does not require a new full Jira REST issue client inside `jira-fix-workflow`.

#### Scenario: Machine without mcp-atlassian

- **WHEN** mcp-atlassian is not configured and the `jira-read` chain resolves a PAT from env or the credential file
- **THEN** `jira-fix-workflow` does not abort at Stage 0 solely because mcp-atlassian is missing

#### Scenario: Stage 0 MCP tool missing but cache exists

- **WHEN** MCP `jira_get_issue` is unavailable and a local `jira-read` cache for the issue exists
- **THEN** Stage 0 / Stage 1 continues from cache instead of aborting on the MCP connectivity check

#### Scenario: Host does not duplicate the chain

- **WHEN** a reader compares `jira-fix-workflow` Prerequisites or Stage 0 with `jira-read`
- **THEN** the host has a pointer to `jira-read` and does not restate the three-level fallback table

### Requirement: Jira fix workflow SHALL strong-depend on jira-wiki-markup for comments

`jira-fix-workflow` MUST list `jira-wiki-markup` in frontmatter `dependencies`. At startup prerequisite check, a missing `jira-wiki-markup` MUST abort the workflow (no silent degrade). Every Jira comment this host writes — including the post-merge writeback template rendered through `jira-status-writeback`, and direct comments (existence-check mismatch, industry-wide hard-problem gate, analysis handoff) — MUST be composed after loading `jira-wiki-markup`. Host `reference.md` MUST NOT keep a full copy of the repair-comment field-map skeleton; it MUST point at `jira-wiki-markup` and MAY keep a short shape reminder (`h3.` / `h4.` / `# *{scenario name}*`) that states Wiki `#` is a numbered list. Chat and local-artifact templates MAY remain GitHub Markdown.

#### Scenario: Missing jira-wiki-markup aborts jira-fix startup

- **WHEN** `jira-fix-workflow` loads and `jira-wiki-markup` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before stage 0 continues

#### Scenario: Writeback section is a thin pointer

- **WHEN** an agent reads the Jira writeback section in `jira-fix-workflow/reference.md`
- **THEN** the section points at `jira-wiki-markup`'s canonical skeleton (optional short shape reminder with the Wiki `#` list note) and does not paste a full `*Fix Branch*` field-map copy

#### Scenario: Direct gate comments use Wiki markup

- **WHEN** the host writes a Jira comment for an existence-check mismatch or an industry-wide hard-problem stop
- **THEN** the comment body is composed per `jira-wiki-markup`

### Requirement: jira-fix-workflow SHALL strong-depend on competitive-research

`jira-fix-workflow` MUST list `competitive-research` in frontmatter `dependencies`. At startup prerequisite check, a missing `competitive-research` MUST abort with an install hint. The analysis stage MUST delegate user-visible competitive research to `analysis-core`'s load of `competitive-research` with one line, and MUST NOT restate that skill's method.

#### Scenario: Missing competitive-research aborts startup

- **WHEN** `jira-fix-workflow` loads and `competitive-research` is not installed
- **THEN** the workflow aborts and names the missing skill and an install command

### Requirement: jira-fix-workflow queue child SHALL report explanation facts and an evidence list and not write HTML

When jira-fix-workflow runs as a queue child, the completion report MUST include the problem, the cause, the completed fix, and an evidence list. Each evidence item MUST be either an opened-UI check citing a png, jpg, jpeg, or webp path, or a non-UI check citing the command and a short output summary. A missing or empty image MUST be listed as pending with the capture still required, and the report MUST NOT invent an image. The workflow MUST NOT write the review HTML and MUST NOT write the evidence HTML.

#### Scenario: Queue child report carries the three facts

- **WHEN** jira-fix-workflow finishes as a queue child
- **THEN** the completion report includes the problem, the cause, the completed fix, and the evidence list, and this run does not write the review HTML or the evidence HTML
