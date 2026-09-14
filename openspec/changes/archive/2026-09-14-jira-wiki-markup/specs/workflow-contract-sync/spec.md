## ADDED Requirements

### Requirement: Jira comment bodies SHALL be Wiki markup via jira-wiki-markup

`solve` 家族 Jira 工作流（`jira-fix-workflow` / `opsx-jira-fix-workflow`）以及它们委托的 `jira-status-writeback`，在调用 `jira_add_comment` 时 MUST 将 `body` 写成 Jira Wiki markup，且 MUST 通过加载强依赖 skill `jira-wiki-markup` 获得语法，而不是使用 GitHub Markdown 模板。本要求不改变「合并完成后才回写」与两步 API / 仅「已修复」的既有契约。

#### Scenario: Writeback body is not Markdown

- **WHEN** post-merge writeback sends the repair comment
- **THEN** `body` uses Jira Wiki notation from `jira-wiki-markup` rather than Markdown `**` / `###` / fenced code

#### Scenario: Hosts do not copy the notation tables

- **WHEN** an agent opens the comment or writeback section of either Jira fix host
- **THEN** full Wiki notation tables are not pasted in the host; the host loads `jira-wiki-markup` (writeback loads it for the repair comment)
