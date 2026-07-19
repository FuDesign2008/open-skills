# Proposal: unify-jira-workflows-phase-numbering

## Why

solve 家族编号统一批 2 收尾：`jira-fix-workflow`（阶段 0/1/1.5/2/2.5/3…8）与 `opsx-jira-fix-workflow`（阶段 0…6/6.4/7）仍是小数/混合编号，与 solve-workflow、opsx-solve-workflow 已确立的「阶段 0 门禁 + 业务阶段 1-based 顺序整数」范式不一致；且 `jira-fix-workflow/reference.md` 存在「阶段1=Git 分支创建」与 SKILL.md「阶段1=读取 Jira」的存量语义错位。

## What Changes

- **jira-fix-workflow**：阶段 0 保留；`1.5→2 理解对齐、2→3 分析问题、2.5→4 难度分级、3→5 探索与审查、4→6 制定计划、5→7 执行计划、6→8 检查验证、7→9 提交 PR/MR、8→10 Review 与合并`；模式表/工具表/出口/常见错误/路径声明全量同步；state 文件名约定 `01.5-alignment.md`→`02-alignment.md`、`02-grade.md`→`04-grade.md`（仅改文档约定，运行时产物不受影响）；reference.md 模板按 SKILL.md 语义重排，顺带修正「阶段1=Git 分支创建」存量错位
- **opsx-jira-fix-workflow**：阶段 0 保留；`6.4→7 检查验证、7→8 提交与归档`；`7.1/7.2 → 8.1/8.2`（保持阶段 8 子步骤语义）；`6.2.5/6.3` 为阶段 6 内部小节号，保留不动；reference.md 模板标题同步
- **spec**：`workflow-contract-sync` 新增「阶段编号统一」Requirement（ADDED）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `workflow-contract-sync`: 新增 Requirement——工作流阶段编号 SHALL 为「阶段 0 门禁（若有）+ 业务阶段 1-based 顺序整数」，小数插号仅允许作为阶段内部小节/子步骤编号

## Impact

- 文件：`skills/jira-fix-workflow/SKILL.md` + `reference.md`、`skills/opsx-jira-fix-workflow/SKILL.md` + `reference.md`、`openspec/specs/workflow-contract-sync/spec.md`（归档时同步）
- 不触碰：编排层（jira-fix-batch / opsx-jira-fix-batch，扫描零命中）、AGENTS.md（无阶段引用）、`6.2.5/6.3` 小节号、frontmatter description（触发词均不含阶段号）
- 风险：reference.md 的存量错位修正属语义变更（「Git 分支创建」从阶段 1 改挂正确位置），已在 design.md 记录决策
