## Why

Jira 修复技能在分析前不会把「待处理」改为「解决中」，合并后的「已修复」失败时只告警并继续把收尾当成完成，也不看指派人。工程内外的技能没有一份可依赖的开发侧状态契约。

## What Changes

- 新增 `jira-status-lifecycle`：分析前认领与合并后「已修复」的决定，可执行矩阵在 `scripts/decide.mjs`。
- `jira-fix-workflow` 与 `opsx-jira-fix-workflow` 在读完工单后、分析前加载该技能。
- `jira-status-writeback` 按该决定执行合并后流转；失败不撤销合并，生命周期不算完成；修复评论仍按决定书写。
- `ai-proxy` 仍执行这两次开发侧流转；「验证通过」「关闭」和合并仍留给人。

## Capabilities

### New Capabilities

- `jira-status-lifecycle`: 开发侧 Jira 状态决定与单向依赖。

### Modified Capabilities

- `jira-status-writeback`: 合并后执行改为服从生命周期决定；流转失败不再把生命周期当成完成。
- `workflow-contract-sync`: 分析前认领与合并后回写的委托关系。
- `ai-proxy`: 开发侧两次流转不再列入一律人工。

## Impact

- **Skill**：`skills/jira-status-lifecycle/`、`skills/jira-fix-workflow/SKILL.md`、`skills/opsx-jira-fix-workflow/SKILL.md`、`skills/jira-status-writeback/SKILL.md`、`skills/ai-proxy-discipline/SKILL.md`
- **契约**：`openspec/specs/jira-status-lifecycle/spec.md` 及上列 Modified 能力的主 spec
- **测试**：`skills/jira-status-lifecycle/scripts/decide.test.mjs`、`scripts/jira-status-lifecycle.test.mjs`
