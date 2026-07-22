## ADDED Requirements

### Requirement: Jira 状态回写 SHALL 在 PR/MR 合并完成后执行

`solve` 家族 Jira 工作流（`jira-fix-workflow` / `opsx-jira-fix-workflow`）的 Jira 状态回写（流转到「已修复」+ 写修复评论）MUST 在 PR/MR 合并完成后执行，而非 PR/MR 创建时。PR 创建后可能被拒绝、需要修改或 Code Review 不通过；提前回写「已修复」会误导 QA。Jira 回写的操作内容（两步独立调用：① `jira_transition_issue` 流转状态，② `jira_add_comment` 写评论）保持不变。

#### Scenario: PR 创建时不同写 Jira

- **WHEN** 工作流执行到 PR/MR 创建步骤
- **THEN** 工作流只执行 commit + push + 创建 PR/MR，不执行 Jira 状态回写

#### Scenario: PR/MR 合并完成后回写 Jira

- **WHEN** PR/MR 已成功合并到目标分支
- **THEN** 工作流执行 Jira 状态回写：流转到「已修复」+ 独立调用 `jira_add_comment` 写修复评论
