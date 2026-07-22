## Why

Jira 状态回写（流转到「已修复」+ 写修复评论）当前在 PR/MR 创建时执行（jira-fix-workflow 阶段 9 / opsx-jira-fix-workflow 阶段 8.2），但 PR 创建后可能被拒绝、需要修改、或 Code Review 不通过。提前回写「已修复」会误导 QA 以为问题已解决，而实际代码尚未进入主分支。Jira 回写应在 PR/MR 合并完成后执行，确保只有真正合入主分支的修复才流转到「已修复」。

## What Changes

- jira-fix-workflow 阶段 9：移除「Jira 状态自动回写」步骤；阶段 9 只负责 commit + push + 创建 PR/MR
- jira-fix-workflow 阶段 10：合并完成后新增 Jira 回写步骤（分支清理之后）
- opsx-jira-fix-workflow 阶段 8：子步骤重排为 8.1 提交 PR → 8.2 Archive → 8.3 分支收尾（含合并 + 门控）→ 8.4 Jira 回写（合并完成后）
- 两个工作流的 reference.md 输出模板、常见错误表、Red Flags 同步调整

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `workflow-contract-sync`: 新增 requirement——Jira 回写时机应在 PR/MR 合并完成后，而非创建时

## Impact

**涉及文件**：
- `skills/jira-fix-workflow/SKILL.md`（阶段 9 移除 Jira 回写 + 阶段 10 新增 Jira 回写 + 常见错误表 + 快速参考表 + 工具约束表）
- `skills/jira-fix-workflow/reference.md`（输出模板调整）
- `skills/opsx-jira-fix-workflow/SKILL.md`（阶段 8 子步骤重排 + 常见错误表 + Red Flags）
- `skills/opsx-jira-fix-workflow/reference.md`（输出模板调整）

**向后兼容性**：仅调整子步骤执行时机，Jira 回写的操作内容（两步独立调用 + 禁止流转到关闭/验证通过）不变。
