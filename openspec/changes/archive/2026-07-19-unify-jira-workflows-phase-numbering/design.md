# Design: unify-jira-workflows-phase-numbering

## Context

solve-workflow（8 阶段）与 opsx-solve-workflow（8 阶段 + 阶段 0 门禁）已确立编号范式。两个 Jira 工作流仍为小数/混合编号；jira-fix-workflow 的 reference.md 与 SKILL.md 存在「阶段1=Git 分支创建 vs 读取 Jira」的存量语义错位（reference 流程整体早一位且缺理解对齐模板）。

## Goals / Non-Goals

**Goals:**
- jira-fix-workflow：0 保留；1.5→2、2→3、2.5→4、3→5、4→6、5→7、6→8、7→9、8→10；全部交叉引用同步；state 文件名约定改 `02-alignment.md`/`04-grade.md`（仅文档）
- opsx-jira-fix-workflow：0 保留；6.4→7、7→8、7.1/7.2→8.1/8.2；reference.md 标题同步
- `workflow-contract-sync` spec 新增编号统一 Requirement（已 ADDED 并通过 validate）

**Non-Goals:**
- `6.2.5/6.3`（阶段 6 内部小节号）保持不动
- 编排层（batch 系）与 AGENTS.md（扫描零命中）
- jira 存量会话的 state.json 迁移（运行时产物，文档约定只改文本）
- 子步骤/小节整数化（方案 2，已否决：破坏小节语义、阶段膨胀）

## Decisions

1. **阶段 0 保留**（用户确认）：与 opsx-solve-workflow 门禁先例一致，业务阶段 1-based。
2. **reference.md 以 SKILL.md 为语义基准重排**：其「阶段1=Git 分支创建、阶段2=读 Jira」为存量错位（SKILL.md 为「阶段1 读 Jira、阶段 5 执行前置创建分支」）；重排后该模板挂到新「阶段 7 执行计划」的前置分支描述处，早一位的后续模板（方案评估 4→5、制定计划 5→6、提交 7→9）随之归位。
3. **opsx-jira 阶段 7 语义保留**：原标题「提交 PR、Jira 回写、Archive 与收尾」改为「阶段 8：提交 PR、Jira 回写、Archive 与收尾」，7.1/7.2 子步骤改 8.1/8.2，不拆独立阶段。
4. **文件名约定仅改文档**：`02-alignment.md`/`04-grade.md` 只对齐文档约定；`.jira-fix/` 存量运行时目录不迁移。

## Risks / Trade-offs

- reference.md 语义修正挂错阶段 → 执行时对照 SKILL.md 执行计划前置分支原文核实，review 阶段再核
- 重排漏改 → 收尾双语残留 grep（`1.5|2.5|6.4|7.1|7.2` 阶段语境）+ 阶段标题顺序核对（同 PR #220 修复后的检查法）
- 用户旧会话引用「阶段 2.5 难度分级」的习惯 → 阶段名保留（难度分级/理解对齐），仅编号变化

## Migration Plan

无需迁移。纯文档契约同步；`.jira-fix/` 运行时目录按新约定自然滚动。
