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

> 本规范在 `jira-fix-workflow` / `opsx-jira-fix-workflow` / `opsx-solve-workflow` 三个工作流的 reference.md 同步维护。test-coverage-analyzer 参数契约变更时，同步更新三处。

### 触发时机

门控在 AI 即将执行合并动作时启动，覆盖所有合并场景：

- 分支收尾决策中选定「合并」
- 用户直接下达合并指令（「merge MR」「合并 MR」「准备合并」等）
- AI 准备调用 `glab mr merge` / `gh pr merge` / `git merge <保护分支>`

「保留分支」「继续开发」不涉及合并动作，门控不触发。

### 前置检测

环境探索发现 `test-coverage-analyzer` skill 时，执行下方门控步骤。未发现时，输出提示「门控不可用：未检测到 test-coverage-analyzer skill」，写入环境缺漏留痕（见「留痕模板」），由用户决定是否继续合并。

### 门控步骤

本步骤拥有独立 Bash 权限，运行 test-coverage-analyzer 脚本。

1. 构造 `--base`（按序尝试，命中即停）：
   - MR/PR 场景：`gh pr view --json baseRefName -q .baseRefName` / `glab mr view <iid> -F json | jq .target_branch` → `--base <目标分支>`（裸分支名，脚本 `validate_ref` 自动加 `origin/`）
   - 获取失败 / detached HEAD / 无远端 → 不传 `--base`，依赖脚本 5 级回退链；输出警告「未显式指定 base，MR 场景可能误判为 0 变更」
   - 多仓库 MR → 逐仓库执行门控，各自获取 `--base`，任一仓库未通过则整体暂停
2. 调用脚本（先读 test-coverage-analyzer SKILL.md 确认参数契约）：
   `python3 "<SKILL_DIR>/scripts/analyze_coverage.py" "<工程根>" [--base <目标分支>]`
3. 按判定矩阵处理：

   | 执行结果 | 🤖 自动模式 | 👤 手动模式 |
   |---|---|---|
   | ✅ 报告生成 + 覆盖率达标 | 继续执行合并 | 提示通过，等用户再次确认合并 |
   | ⚠️ 覆盖率不达标 | 暂停，输出报告，等用户决策（强制合并/补测试/放弃） | 同左 |
   | 💥 脚本崩溃 / 无报告 / 退出码 1 | 视为门控未通过，暂停等用户 | 同左 |
   | 📭 无测试代码 / 0% 通过 | 如实呈现报告，暂停等用户判断 | 同左 |
   | 🕳️ 门控未运行而合并动作已发生（隐式漏跑） | 暂停合并、补跑门控；合并已完成则写入漏跑留痕 | 同左 |

### 留痕模板

留痕位置：PR 描述和 `design.md` 的 Verification Notes。三种情况各自模板：

| 情况 | 模板 |
|------|------|
| 用户显式跳过 | `【覆盖率门控跳过】用户显式跳过，未运行 test-coverage-analyzer。时间：<ISO>。决策人：用户。` |
| 环境缺漏（未发现 skill） | `【覆盖率门控跳过】未检测到 test-coverage-analyzer skill，门控不可用。时间：<ISO>。决策人：系统（环境缺漏）。` |
| 隐式漏跑 | `【覆盖率门控漏跑】合并已发生但门控未运行。时间：<ISO>。漏跑阶段：<合并前/合并后>。` |

### 合并前检查清单

AI 执行合并前逐项确认：

- [ ] 合并意图已确认？→ 触发门控（分支收尾决策选定合并 / 用户直接下达合并指令 / AI 即将调用合并命令）
- [ ] test-coverage-analyzer 是否可用？→ 不可用则按环境缺漏留痕，等用户决策
- [ ] 门控是否已运行？→ 未运行则先跑（除非用户显式跳过并留痕）
- [ ] 门控结果如何？→ 达标继续；不达标/崩溃/无报告/无测试 → 暂停等用户；漏跑 → 按漏跑规则处理
- [ ] 留痕是否写入？（显式跳过 / 环境缺漏 / 隐式漏跑）

### 模式生命周期

门控自动运行 test-coverage-analyzer 不触发「自动恢复手动」（合并流程的子步骤）；门控暂停（不达标/崩溃/隐式漏跑）即合并流程中断，按既有规则恢复手动。
