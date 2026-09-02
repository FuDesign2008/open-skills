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

`jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At startup prerequisite check, a missing either skill MUST abort the workflow (no silent degrade). During execute/verify stages, the host MUST load implement when Figma URL/node or pixel-restore intent is in scope, and MUST load verify when this run implemented from Figma or alignment checking is required.

#### Scenario: Missing figma-pixel-verify aborts jira-fix startup

- **WHEN** `jira-fix-workflow` loads and `figma-pixel-verify` is not available
- **THEN** the workflow prints a missing-dependency notice and aborts before stage 0 continues

#### Scenario: Jira UI fix with Figma link uses implement

- **WHEN** stage execute is applying a UI fix and the issue or plan references a Figma node
- **THEN** the host loads `figma-pixel-implement` rather than inventing CSS without the fidelity workflow

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

