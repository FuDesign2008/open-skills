## MODIFIED Requirements

### Requirement: Jira 状态回写 SHALL 在 PR/MR 合并完成后执行

`solve` 家族 Jira 工作流（`jira-fix-workflow` / `opsx-jira-fix-workflow`）的 Jira 状态回写 MUST 在 PR/MR 合并完成后执行，而非 PR/MR 创建时。PR 创建后可能被拒绝、需要修改或 Code Review 不通过；提前回写「已修复」会误导 QA。回写的操作内容与状态边界 MUST 委托强依赖 skill `jira-status-writeback`（两步独立 API、仅「已修复」、`jira_add_comment` 的 `body` 参数）；宿主 MUST NOT 在正文中保留完整两步 API 复述，仅保留加载指针与宿主字段映射。

#### Scenario: PR 创建时不同写 Jira

- **WHEN** 工作流执行到 PR/MR 创建步骤
- **THEN** 工作流只执行 commit + push + 创建 PR/MR，不执行 Jira 状态回写

#### Scenario: PR/MR 合并完成后回写 Jira

- **WHEN** PR/MR 已成功合并到目标分支
- **THEN** 工作流加载 `jira-status-writeback` 并按其 SOP 流转到「已修复」且独立调用 `jira_add_comment` 写修复评论

#### Scenario: Host does not restate the two-step API

- **WHEN** an agent opens the post-merge section of `jira-fix-workflow` or `opsx-jira-fix-workflow`
- **THEN** the section points at `jira-status-writeback` for API/status rules and does not paste the full two-step procedure

## ADDED Requirements

### Requirement: Jira fix hosts SHALL thin-reference merge and env discovery

`jira-fix-workflow` and `opsx-jira-fix-workflow` MUST NOT embed full `merge-discipline` Part C/D step lists or Red Flag catalogs that duplicate that skill; they MUST keep at most a one-line load pointer plus host order constraints (e.g. writeback after merge, archive-before-merge for opsx). They MUST NOT restate `env-capability-discovery` methodology beyond a one-line load note plus the host’s capability→stage mapping table (and jira-fix’s optional `state.json` storage note).

#### Scenario: merge Red Flags removed from host

- **WHEN** an agent reads Red Flags near merge in either Jira host after this change
- **THEN** coverage/tip/archive merge pitfalls are directed to `merge-discipline`, not duplicated as multi-bullet host catalogs

#### Scenario: env section is mapping-only

- **WHEN** an agent reads the env-capability section of either Jira host
- **THEN** discovery method prose is not copied; only the host mapping (and jira-fix storage tip if any) remains

### Requirement: Jira fix hosts SHALL relocate bulky templates to reference.md

Bulky output templates, OpenSpec artifact field checklists, and long exit-speech examples that exceed short inline needs MUST live in each host’s `reference.md` (or the shared writeback skill). The host `SKILL.md` MUST keep orchestration, gates, intentional divergences, and one-line pointers. Target after this change: `jira-fix-workflow/SKILL.md` roughly 420–520 lines and `opsx-jira-fix-workflow/SKILL.md` roughly 350–450 lines (approximate, not a hard CI gate).

#### Scenario: opsx stage-3 field list moves to reference

- **WHEN** `opsx-jira-fix-workflow` documents required design.md / proposal fields
- **THEN** the detailed field checklist is in `reference.md` and the SKILL keeps naming, creation order, and minimum completeness headings

#### Scenario: jira-fix analysis template not fully inlined

- **WHEN** `jira-fix-workflow` documents analysis-stage output shape
- **THEN** full templates are referenced from `reference.md` rather than pasted as long inline blocks in SKILL.md
