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

## 阶段 8.2 Jira 评论

Jira 评论必须包含：

- 修复分支 / PR URL / Commit
- 根因摘要
- 修复方案
- OpenSpec change 路径
- 验证场景
- 风险或待 QA 关注点

---

## 合并前覆盖率门控（强制）规范

> 门控规范版本：v1
> 本规范在 `jira-fix-workflow` / `opsx-jira-fix-workflow` / `opsx-solve-workflow` 三个工作流的 reference.md 同步维护。test-coverage-analyzer 参数契约变更时，须同步更新三处。

> **触发条件**：用户在分支收尾/合并决策中已选定「合并」。本门控在合并执行前运行，是合并的强制前置。选择「保留分支」「继续开发」**不触发**门控。

**前置检测**：环境探索是否发现 `test-coverage-analyzer` skill？
- ❌ 未发现 → 静默跳过本门控，直接执行合并（不报错、不阻断、不留痕）
- ✅ 发现 → 执行下方门控步骤

**门控步骤**（本步骤拥有独立 Bash 权限，运行 test-coverage-analyzer 脚本，不计入各工作流合并阶段的 Bash 约束）：

1. 构造 `--base`（按序尝试，命中即停）：
   - MR/PR 场景：`gh pr view --json baseRefName -q .baseRefName` / `glab mr view <iid> -F json | jq .target_branch` → `--base <目标分支>`（裸分支名，脚本 `validate_ref` 自动加 `origin/`）
   - 获取失败 / detached HEAD / 无远端 → 不传 `--base`，依赖脚本 5 级回退链；**门控输出显式警告**「未显式指定 base，MR 场景可能误判为 0 变更」
   - 多仓库 MR → 逐仓库执行门控，各自获取 `--base`，任一仓库未通过则整体暂停
2. 调用脚本（先读 test-coverage-analyzer SKILL.md 确认调用方式与参数契约，不得凭记忆）：
   `python3 "<SKILL_DIR>/scripts/analyze_coverage.py" "<工程根>" [--base <目标分支>]`
3. 按判定矩阵处理：

   | 执行结果 | 🤖 自动模式 | 👤 手动模式 |
   |---|---|---|
   | ✅ 报告生成 + 覆盖率达标 | 继续执行合并 | 提示通过，等用户再次确认合并 |
   | ⚠️ 报告生成 + 覆盖率不达标 | **暂停**，输出报告，等用户决策（强制合并/补测试/放弃） | 同左 |
   | 💥 脚本崩溃 / 无报告 / 退出码 1（全上传失败） | **视为门控未通过**（不得误判为通过继续合并），暂停等用户 | 同左 |
   | 📭 项目无测试代码 / 0% 通过 | 如实呈现报告，**不自动放行**，暂停等用户判断 | 同左 |

4. 显式跳过（仅手动模式，用户主动选择跳过门控）：必须写入留痕（**留痕位置见各工作流 SKILL.md 本门控小节的「留痕位置」声明**）：
   `【覆盖率门控跳过】用户显式跳过，未运行 test-coverage-analyzer。时间：<ISO 时间戳>。决策人：用户。`

**模式生命周期**：门控自动运行 test-coverage-analyzer **不触发**「自动恢复手动」（它是合并流程的子步骤，非独立流程完成）；门控暂停（不达标/崩溃）= 合并流程中断，按既有规则恢复手动。
