# OPSX Solve Workflow — 输出格式参考

本文件为 `opsx-solve-workflow` skill 的各阶段输出格式模板，供 AI 格式化输出时参考。

---

## 阶段 1 明确问题

```text
【问题复述】...
（只描述用户的意图与现象，不得出现根因判断或修复建议——技术结论留给阶段 2）
【关键要素】目标：... / 约束：... / 背景：... / 期望结果：...
【OpenSpec 变更】建议 change 名称：...
【需要确认】是否按该 change 继续？
```

---

## 阶段 7 检查验证

```text
【验证结果】
- OpenSpec 校验：已执行（openspec validate <name>，输出：...）/ 失败（原因：...）
- 工程验证：已执行（命令：...，结果：...）/ 待执行（需用户手动操作：...）
- 行为对照：已执行（逐条对比结果：...）/ 待执行（人工验证项：...）
- 与 tasks.md 对比：...
- 副作用检查（功能副作用：在其他模块引发新问题；非功能副作用：性能/安全/可维护性预期外影响）：...
- 是否可归档：是 / 否
```

---

## 阶段 8 回顾归档

```text
【复盘改进】
- 已完成变更：...
- 更新的 specs：...
- 归档位置：...
- 可复用经验：...
- 不建议固化的内容：...（一次性经验、未验证判断等，不写入长期规则）
- 推荐沉淀载体：AGENTS.md / CLAUDE.md / .cursor/rules/ / 项目内 skill / 总结文档 / 暂不沉淀，理由：...
- 是否需要用户确认写入：需要 / 不需要；若需要，等待用户明确要求后再落盘
- 后续建议：...
- [模式状态] 自动模式已完成本轮，已恢复为手动模式。如需下一轮继续自动，请显式说「opsx 自动解决 xxx」。
```

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

**合并 tip 钉死（archive/docs push 后，见 SKILL.md 阶段 8）**：

- [ ] merge 命令是否钉死了合入 revision？（`--sha <刚 push 的 tip>` 或等价校验；无 `--sha` 的裸 merge 禁止）
- [ ] 合并输出的「Pipeline succeeded」是否对应刚 push 的 tip？（刚 push 后立即 merge 时必须核对 sha，旧 tip 的绿结果不可采信）
- [ ] 合入后 `git merge-base --is-ancestor <expected_sha> origin/<target>` 是否通过？（含 archive / specs sync 的 SHA 必须是 target 祖先；MISSING 则开补齐 MR，不得宣称收尾完成）

### 模式生命周期

门控自动运行 test-coverage-analyzer 不触发「自动恢复手动」（合并流程的子步骤）；门控暂停（不达标/崩溃/隐式漏跑）即合并流程中断，按既有规则恢复手动。
