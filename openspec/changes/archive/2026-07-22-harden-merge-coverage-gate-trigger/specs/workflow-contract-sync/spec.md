## ADDED Requirements

### Requirement: 工作流合并前覆盖率门控 SHALL 以「合并动作」本身为触发锚点

`solve` 家族工作流（`opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`）的合并前覆盖率门控 MUST 以「即将执行的合并动作」本身作为触发锚点，**不依赖**是否走过分支收尾决策。当 AI 即将执行任何合并动作（`glab mr merge` / `gh pr merge` / `git merge` 到保护分支等）时，MUST 先运行覆盖率门控。合并意图的判定信号（满足任一即触发）：

- 用户在分支收尾决策中选定「合并」
- 用户直接下达「merge MR / 合并 MR / 准备合并」等指令
- AI 准备调用 `glab mr merge` / `gh pr merge` / `git merge <protected-branch>`
- 用户消息含「merge」「合并」「准备合并」等词且上下文为合并意图

选择「保留分支」「继续开发」**不触发**门控。

#### Scenario: 用户跳过分支收尾决策直接说合并

- **WHEN** 用户在工作流归档后跳过分支收尾决策，直接说「准备 merge MR #450」
- **THEN** 工作流触发合并前覆盖率门控，运行 test-coverage-analyzer，达标后再执行 `glab mr merge`，不得直接合并

#### Scenario: 分支收尾决策为「保留分支」不触发门控

- **WHEN** 用户在分支收尾决策中选定「保留当前分支」或「继续开发」
- **THEN** 工作流不触发覆盖率门控，分支保留原状

### Requirement: 工作流 SHALL 在合并命令前置加显式提醒

工作流 SKILL.md 中所有合并相关章节 MUST 包含「合并命令前置检查」强制提醒：调用 `glab mr merge` / `gh pr merge` 前，AI MUST 自问「是否已运行合并前覆盖率门控？」；若未运行 MUST 先跑门控再合并，不得直接执行合并命令。

#### Scenario: AI 准备直接调用合并命令

- **WHEN** AI 准备调用 `glab mr merge 450 --yes` 而未运行覆盖率门控
- **THEN** 工作流前置检查规则触发，AI 暂停合并、补跑门控，达标后才执行合并

### Requirement: 工作流 SHALL 区分「显式跳过」与「隐式漏跑」

工作流门控判定矩阵 MUST 包含「隐式漏跑」一行：AI 即将合并但未运行门控（非用户主动跳过）MUST 视为门控未通过，暂停合并、补跑门控。若代码已合并（无法回退），工作流 MUST 如实报告漏跑并留痕：

- 留痕内容：`【覆盖率门控漏跑】AI 即将/已合并但未运行门控，属隐式漏跑。时间：<ISO 时间戳>。漏跑阶段：<合并前/合并后>。`
- 留痕位置：与显式跳过留痕位置一致（PR 描述 + 各工作流 SKILL.md 声明的留痕位置）

#### Scenario: AI 在合并前发现未跑门控

- **WHEN** AI 即将调用 `glab mr merge` 而意识到未运行覆盖率门控
- **THEN** 工作流判定为「隐式漏跑」，暂停合并、补跑门控；不得直接放行

#### Scenario: AI 已合并后发现未跑门控

- **WHEN** AI 已执行 `glab mr merge` 完成合并，事后发现未运行覆盖率门控
- **THEN** 工作流如实报告漏跑（无法回退），按上述格式留痕写入 PR 描述和 design.md Verification Notes

### Requirement: 工作流 SHALL 收紧「未发现 test-coverage-analyzer skill」的降级

工作流门控前置检测（环境探索是否发现 `test-coverage-analyzer` skill）MUST 区分两种情况，**不得静默跳过且不留痕**：

- ❌ 未发现 + 工作流上下文已声明门控强制（即用户已选定合并意图）：MUST 输出提示「门控不可用：未检测到 test-coverage-analyzer skill，覆盖率无法验证」，并写入留痕：

  `【覆盖率门控跳过】未检测到 test-coverage-analyzer skill，门控不可用。时间：<ISO 时间戳>。决策人：系统（环境缺漏）。`

  然后由用户决定是否继续合并（手动模式）或在自动模式下暂停等用户决策，**不得静默放行**。
- ✅ 发现 skill：执行既有门控步骤。

#### Scenario: 未装 test-coverage-analyzer 的项目合并时不再静默

- **WHEN** 用户在工作流中选定合并意图，环境探索未发现 `test-coverage-analyzer` skill
- **THEN** 工作流输出「门控不可用」提示并写入留痕，由用户决定是否继续合并，不静默跳过

### Requirement: 工作流 SHALL 提供合并前覆盖率门控检查清单

工作流 reference.md 的门控规范章节 MUST 提供显式的「合并前检查清单」，AI 执行合并前 MUST 逐项确认：

```
合并前检查清单（AI 执行合并前必须完成）：
- [ ] 当前是否在 opsx/jira-fix 工作流上下文？
  - 是 → 按各工作流分支收尾决策流程，决策为「合并」时触发门控
  - 否 → 进入「合并动作触发锚点」规则
- [ ] 是否已运行 test-coverage-analyzer 门控？
  - 否 → 先跑门控（除非用户显式跳过并留痕，或环境未发现 skill 且已按降级规则留痕）
- [ ] 门控结果是否达标？
  - 达标 → 继续合并
  - 不达标 / 崩溃 / 无报告 / 无测试代码 → 暂停，等用户决策
  - 隐式漏跑 → 按漏跑规则处理
- [ ] 若用户显式跳过 / 环境缺漏 → 是否已写入留痕？
```

#### Scenario: AI 执行合并前对照清单

- **WHEN** AI 准备执行 `glab mr merge` 或 `gh pr merge`
- **THEN** 工作流要求 AI 对照合并前检查清单逐项确认，任一项不满足则暂停合并
