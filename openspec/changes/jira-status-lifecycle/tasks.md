## 1. Decision matrix

- [x] 1.1 先写失败测试，再实现 `scripts/decide.mjs`
- [x] 1.2 `SKILL.md` 列出全部 outcome，且不依赖 `jira-status-writeback`

## 2. Hosts

- [x] 2.1 `jira-fix-workflow` 与 `opsx-jira-fix-workflow` 在分析前加载
- [x] 2.2 `jira-status-writeback` 按决定执行合并后流转和评论
- [x] 2.3 `ai-proxy` 保留合并与 QA 状态为人工，放行两次开发侧流转

## 3. Contract

- [x] 3.1 主 spec：`jira-status-lifecycle`、`jira-status-writeback`、`workflow-contract-sync`、`ai-proxy`
- [x] 3.2 依赖方向测试与决策测试通过
