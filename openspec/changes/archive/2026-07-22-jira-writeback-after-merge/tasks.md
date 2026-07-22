## 1. jira-fix-workflow 阶段调整

- [x] 1.1 阶段 9：移除第 4 步「Jira 状态自动回写」；修改阶段 9 出口提示（移除 Jira 回写）；修改完成输出字段（移除 Jira 回写状态）；修改 Red Flags（移除 Jira 回写相关条目）
- [x] 1.2 阶段 10：合并 + 分支清理 + 主分支同步之后，新增 Jira 回写步骤（操作内容不变：两步独立调用）
- [x] 1.3 修改快速参考表（阶段 9 和 10 的「必须输出」列）
- [x] 1.4 修改 reference.md 输出模板（阶段 9 输出移除 Jira 回写，阶段 10 输出新增）

## 2. opsx-jira-fix-workflow 阶段 8 重排

- [x] 2.1 阶段 8 标题调整 + 子步骤重排：8.1 提交 PR → 8.2 Archive → 8.3 分支收尾（含合并+门控）→ 8.4 Jira 回写
- [x] 2.2 调整阶段工具约束表、快速参考表
- [x] 2.3 修改 reference.md 输出模板
- [x] 2.4 修改常见错误表和 Red Flags

## 3. 验证

- [x] 3.1 `openspec validate` 通过
- [x] 3.2 grep 校验两个工作流不再有「PR 创建时回写 Jira」的残留表述
- [x] 3.3 `node scripts/gen-skill-docs.mjs` + skills 索引一致
