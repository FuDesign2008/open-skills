## Context

`opsx-solve-workflow` 当前是「七阶段」结构，阶段 1 实际内含 `1.1 明确问题` 与 `1.2 分析问题` 两个小节。`solve-workflow` 已在 v1.75.0 完成 7→8 拆分，将这两个小节提升为独立阶段。为了保持两者一致并降低维护成本，需要将 `opsx-solve-workflow` 也拆分为八阶段，并同步调整内部小节编号（`1.5`、`3.6` 等）。本次变更范围限定在 `opsx-solve-workflow` 本身及 `workflow-contract-sync` 中的阶段引用，不处理 `jira-fix-workflow` / `opsx-jira-fix-workflow` 的小数序号（将作为后续独立 change）。

## Goals / Non-Goals

**Goals:**
- 将 `opsx-solve-workflow` 从七阶段拆分为八阶段，阶段名称与顺序与 `solve-workflow` 对齐。
- 调整内部小节编号：`1.5 调研路由与外部调研` 归入阶段 2，`3.6 上游依赖修复评估` 归入新编号体系。
- 同步更新 `opsx-solve-workflow` 内的所有阶段引用表（artifact 映射、工具约束、快速参考、常见错误等）。
- 同步更新 `workflow-contract-sync` 中对 `opsx-solve-workflow` 阶段编号的引用。
- 通过 OpenSpec 校验和项目验证。

**Non-Goals:**
- 不修改 `opsx-solve-workflow` 的触发词、frontmatter 依赖、核心定位或行为契约。
- 不修改 `solve-workflow`、`jira-fix-workflow`、`opsx-jira-fix-workflow` 的阶段结构（后续 change 处理）。
- 不引入新功能或新 skill。

## Decisions

1. **阶段拆分方式：照搬 solve-workflow 的 7→8 拆分**
   - 将原 `1.1 明确问题` 提升为阶段 1「明确问题」。
   - 将原 `1.2 分析问题` 提升为阶段 2「分析问题」。
   - 原阶段 2→7 依次递延为阶段 3→8。
   - 理由：与 `solve-workflow` 保持一致，减少用户和开发者的认知负担。

2. **小数序号重排**
   - 原 `1.5 调研路由与外部调研` 改为阶段 2 下的步骤（例如 `2.x`），因为调研路由属于技术分析阶段。
   - 原 `3.6 上游依赖修复评估` 改为新阶段编号下的步骤。由于上游依赖评估属于根因分析后的判断，归入阶段 2 或阶段 3 均可；本次设计将其归入阶段 2 的后续步骤，与分析阶段的 `known-issue-research` 和 `upstream-dependency-debug` 保持一致。
   - 理由：小数序号应反映其所属阶段，避免跨阶段引用。

3. **新增 `opsx-solve-workflow` capability**
   - 将八阶段结构、阶段工具权限、artifact 映射写入新的 capability spec，作为长期事实源。
   - 理由：`opsx-solve-workflow` 是核心工作流，值得拥有独立的 spec 文件记录其行为契约。

4. **只修改 `workflow-contract-sync` 的阶段引用**
   - `workflow-contract-sync` 中仅有一处涉及 `opsx-solve-workflow` 阶段编号（阶段 7 更名「复盘改进」的 scenario），将其改为阶段 8。
   - 理由：最小化 delta，不产生新的行为变更。

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 重编号后文档内部交叉引用遗漏 | 编辑后使用 `grep` 检查所有阶段编号引用，确保一致 |
| `workflow-contract-sync` 中阶段引用改错 | 只改明确引用 `opsx-solve-workflow` 阶段 7 的位置，其他通用描述不动 |
| 用户已习惯旧的七阶段输出 | 触发词和行为不变，仅阶段编号变化；在 release note 中说明 |
| 与 `solve-workflow` 阶段表仍不完全一致 | 编辑后逐条对照 `solve-workflow` 的八阶段表 |

## Migration Plan

1. 在分支上修改 `skills/opsx-solve-workflow/SKILL.md`：重命名阶段标题、调整阶段编号、更新内部小节编号、更新所有表格和常见错误示例。
2. 在分支上修改 `openspec/specs/workflow-contract-sync/spec.md`：更新阶段 7→阶段 8 的引用。
3. 运行 `openspec validate --change opsx-solve-workflow-eight-phase-split`。
4. 运行项目级 lint / 类型检查（如有）。
5. 归档 change，创建 PR，合并。

## Open Questions

无。
