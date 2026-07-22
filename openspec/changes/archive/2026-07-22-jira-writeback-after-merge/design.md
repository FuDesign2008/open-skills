## Context

Jira 状态回写当前在 PR 创建时执行，但 PR 可能被拒绝或需要修改。提前回写「已修复」误导 QA。

## Goals / Non-Goals

**Goals**: Jira 回写移到 PR/MR 合并完成后，两个 Jira 工作流同步调整。

**Non-Goals**: 不改变 Jira 回写的操作内容（两步独立调用），不改变其他非 Jira 工作流。

## Decisions

### D1：capability 放在 `workflow-contract-sync`

两个 Jira 工作流共享同一变更，`workflow-contract-sync` 本就是跨工作流共享契约的载体。

### D2：opsx-jira-fix-workflow 阶段 8 子步骤重排

当前：8.1 PR → 8.2 Jira → 8.3 archive → 8.4 分支收尾
新序：8.1 PR → 8.2 archive → 8.3 分支收尾（含合并+门控）→ 8.4 Jira 回写

archive 前移到 8.2 是因为 archive 产生的 specs 更新需要进入 PR diff，必须在合并前完成。

## Risks / Trade-offs

- [风险] PR 合并后 Jira 回写失败（如 Jira API 不可用）→ 缓解：回写失败不阻断流程，输出警告并记录到报告（既有错误处理策略保留）
