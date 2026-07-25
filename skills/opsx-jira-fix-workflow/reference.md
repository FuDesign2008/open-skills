# OPSX Jira Fix Workflow — 输出格式参考

本文件为 `opsx-jira-fix-workflow` skill 的各阶段输出格式模板，供 AI 格式化输出时参考。

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

## 合并前检查清单（门控 + tip 钉死）

> 完整规范见强依赖 skill `merge-discipline`（Part A 覆盖率门控 + Part B tip 钉死）。本清单为合并前自检快查表。

**覆盖率门控（Part A）**：

- [ ] 合并意图已确认？（分支收尾决策选定合并 / 用户直接合并指令 / AI 即将调用合并命令）
- [ ] test-coverage-analyzer 是否可用？→ 不可用则环境缺漏留痕，等用户决策
- [ ] 门控是否已运行？→ 未运行则先跑（除非用户显式跳过并留痕）
- [ ] 门控结果如何？→ 达标继续 Part B；不达标/崩溃/无报告/无测试 → 暂停等用户；漏跑 → 按漏跑规则
- [ ] 留痕是否写入？（显式跳过 / 环境缺漏 / 隐式漏跑）

**合并 tip 钉死（Part B）**：

- [ ] merge 是否钉死合入 revision？（`--sha` 或等价；裸 merge 禁止）→ Part B step 1
- [ ] 刚 push 后的「Pipeline succeeded」是否核对过 sha？→ Part B step 2
- [ ] 合入后祖先校验是否 OK？（MISSING 则开补齐 MR，不得宣称收尾）→ Part B step 3
