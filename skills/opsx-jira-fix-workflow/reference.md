# OPSX Jira Fix Workflow — 输出格式参考

本文件为 `opsx-jira-fix-workflow` skill 的各阶段输出格式模板，供 AI 格式化输出时参考。

阶段 2 分析方法论见 `analysis-core`；难度/路径/design 落点仍以 SKILL.md 编排为准。

---

## 阶段 3 Artifacts 字段清单

`proposal.md` 必须包含：

- Why：Jira 链接、问题摘要、用户影响、为什么现在修
- What Changes：行为变化，而不是实现细节
- Capabilities：新增或修改的 capability
- Impact：代码、API、平台、风险

`design.md` 完整字段（SKILL.md 最低完整度只要求其中 5 块，见正文）：

- Jira Context：Jira 标题、关键描述、复现路径、期望和实际结果
- Problem Analysis：存在性验证、根因、影响范围、难度分级
- Goals / Non-Goals：修复目标和明确排除的范围
- Options：候选方案、取舍、推荐方案
- Risk：副作用、回滚策略、QA 关注点
- Migration Plan：（涉及数据库/API/配置变更时必填）迁移步骤和回滚方案
- Verification Notes：验证场景、测试命令、人工验证项

Delta spec 常见格式错误（会导致 `openspec validate` 失败）：

- `### REQ-001:` → 格式错，标题必须是 `### Requirement: <描述>`
- `### Requirement: 初始化` → 缺 SHALL/MUST，描述必须包含 SHALL 或 MUST
- 无 `#### Scenario:` 块 → 每个 requirement 至少需要一个场景

---

## 阶段 7 验证结果

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

## 阶段 8.1 Commit Message

```text
fix(<scope>): <JIRA-ID> <subject>
```

示例：`fix(ai-summary): YNOTR-12167 修复分享链接中AI摘要按钮显示问题`

---

## 阶段 8.1 PR/MR 描述

PR/MR 描述必须包含：

- Jira 链接
- 根因
- 修复方案
- OpenSpec change 路径
- 修改文件清单
- 验证证据
- 风险与回滚

---

## 阶段 8.4 Jira 评论（合并完成后）

Jira 评论必须包含：

- 修复分支 / PR URL / Commit
- 根因摘要
- 修复方案
- OpenSpec change 路径
- 验证场景
- 风险或待 QA 关注点

---

## 合并前检查清单

见强依赖 `merge-discipline` 的 [reference.md](../merge-discipline/reference.md)「合并前检查清单」（Part A–D 单源；勿在本文件复制正文）。
