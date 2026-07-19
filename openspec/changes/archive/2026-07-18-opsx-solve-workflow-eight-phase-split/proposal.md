## Why

`opsx-solve-workflow` 是 `solve-workflow` 的 OpenSpec 规范化版本，但当前仍使用“七阶段”结构：阶段 1 实际包含 `1.1 明确问题` 与 `1.2 分析问题` 两个小节。`solve-workflow` 已在 v1.75.0 完成 7→8 阶段拆分，将二者提升为独立阶段。两者阶段编号不一致会增加维护和理解成本，并导致小数序号（如 `1.5`、`3.6`）与新的阶段体系错位。本次变更是 `HANDOFF.md` 中“批 2”的第一项，先完成 `opsx-solve-workflow` 自身的八阶段拆分与内部小数序号对齐，再为后续统一 `jira-fix-workflow` / `opsx-jira-fix-workflow` 的小数序号打下基础。

## What Changes

- **BREAKING**: 将 `opsx-solve-workflow` 由“七阶段”拆分为“八阶段”：
  - 阶段 1 仅保留 `1.1 明确问题` 提升后的“明确问题”阶段；
  - 将原 `1.2 分析问题` 提升为独立的阶段 2“分析问题”；
  - 原阶段 2“探索方案”递延为阶段 3，阶段 3“审查方案”递延为阶段 4，阶段 4“制定计划”递延为阶段 5，阶段 5“执行计划”递延为阶段 6，阶段 6“检查验证”递延为阶段 7，阶段 7“回顾归档”递延为阶段 8。
- 调整 `opsx-solve-workflow` 内部小节编号：
  - 原 `1.5 调研路由与外部调研` 改为阶段 2 下的步骤；
  - 原 `3.6 上游依赖修复评估` 改为新阶段编号下的步骤；
  - 同步更新“阶段与 Artifact 映射表”、“阶段工具约束表”、“快速参考表”等所有引用阶段编号的位置。
- 更新 `openspec/specs/workflow-contract-sync/spec.md` 中对 `opsx-solve-workflow` 阶段编号的引用，确保契约同步。

## Capabilities

### New Capabilities
- `opsx-solve-workflow`: 定义 `opsx-solve-workflow` 的八阶段结构、各阶段工具权限、artifact 映射以及阶段编号约定，作为长期行为契约事实源。

### Modified Capabilities
- `workflow-contract-sync`: 同步更新其中引用 `opsx-solve-workflow` 的阶段编号（如阶段 7 更名「复盘改进」、阶段 2 临时改动门控等描述中的阶段序号），使其与八阶段结构保持一致。

## Impact

- `skills/opsx-solve-workflow/SKILL.md`：主文件重写阶段编号与结构（触发词、依赖、核心规则不变）。
- `openspec/specs/workflow-contract-sync/spec.md`：更新阶段引用，不产生行为变更。
- 新增 `openspec/changes/opsx-solve-workflow-eight-phase-split/specs/opsx-solve-workflow/spec.md`：写入八阶段行为契约。
- 用户可见变化：`opsx-solve-workflow` 的阶段输出与 `solve-workflow` 对齐，阶段编号从 7 变为 8；触发词与行为契约不变。
