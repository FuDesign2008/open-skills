## 1. 修改 opsx-solve-workflow 阶段结构

- [x] 1.1 将 `skills/opsx-solve-workflow/SKILL.md` 标题由「七阶段」改为「八阶段」
- [x] 1.2 将阶段 1 拆分为「阶段 1：明确问题」和「阶段 2：分析问题」
- [x] 1.3 将原阶段 2→7 依次递延为阶段 3→8，并同步更新所有阶段标题
- [x] 1.4 将 `1.5 调研路由与外部调研` 调整为阶段 2 下的步骤，并更新所有引用
- [x] 1.5 将 `3.6 上游依赖修复评估` 调整为阶段 2 下的步骤（步骤 5），并更新所有引用

## 2. 同步更新 opsx-solve-workflow 内部表格与交叉引用

- [x] 2.1 更新「阶段与 Artifact 映射表」中的阶段编号
- [x] 2.2 更新「阶段 1 工具限制」等描述中的阶段编号
- [x] 2.3 更新「常见错误」表中涉及阶段编号的示例
- [x] 2.4 使用 `grep` 扫描 `skills/opsx-solve-workflow/SKILL.md`，确认无遗留旧阶段编号

## 3. 同步更新 workflow-contract-sync

- [x] 3.1 修改 `openspec/specs/workflow-contract-sync/spec.md`，将其中 `opsx-solve-workflow` 的阶段 7 引用改为阶段 8
- [x] 3.2 检查 `workflow-contract-sync` 中是否还有其他 `opsx-solve-workflow` 阶段编号引用

## 4. 验证与归档

- [x] 4.1 运行 `openspec validate --changes` ✅（1 passed, 0 failed）
- [x] 4.2 运行项目 lint / 类型检查（无可运行命令；package.json 无 lint/test/tsc 脚本）
- [x] 4.3 确认 `tasks.md` 所有 checkbox 已勾选
- [x] 4.4 调用 `openspec archive --yes opsx-solve-workflow-eight-phase-split` 归档 change ✅
