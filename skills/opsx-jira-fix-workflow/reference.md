# OPSX Jira Fix Workflow — 输出格式参考

本文件为 `opsx-jira-fix-workflow` skill 的各阶段输出格式模板，供 AI 格式化输出时参考。

---

## 阶段 6.4 验证结果

```text
【验证结果】
- OpenSpec 校验：已执行（openspec validate <name>，输出：...）/ 失败（原因：...）
- 工程验证：已执行（命令：...，结果：...）/ 待执行（需用户手动操作：...）
- 行为对照：已执行（逐条对比结果：...）/ 待执行（人工验证项：...）
- Jira 对照：已执行（...）/ 待执行（...）
- 副作用检查：...
- 是否可提交 PR：是 / 否
```

---

## 阶段 7.1 Commit Message

```text
fix(<scope>): <JIRA-ID> <subject>
```

示例：`fix(ai-summary): YNOTR-12167 修复分享链接中AI摘要按钮显示问题`

---

## 阶段 7.1 PR/MR 描述

PR/MR 描述必须包含：

- Jira 链接
- 根因
- 修复方案
- OpenSpec change 路径
- 修改文件清单
- 验证证据
- 风险与回滚

---

## 阶段 7.2 Jira 评论

Jira 评论必须包含：

- 修复分支 / PR URL / Commit
- 根因摘要
- 修复方案
- OpenSpec change 路径
- 验证场景
- 风险或待 QA 关注点
