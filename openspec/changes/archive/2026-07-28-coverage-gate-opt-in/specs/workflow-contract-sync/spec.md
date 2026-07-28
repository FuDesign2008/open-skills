## MODIFIED Requirements

### Requirement: 工作流合并前覆盖率门控 SHALL 在合并动作发生时启动决策

`solve` 家族工作流（`opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`）的合并前覆盖率门控 MUST 在 AI 即将执行合并动作时启动 **Part C 决策**（委托 `merge-discipline`）。合并动作的判定信号（满足任一）：分支收尾决策中选定「合并」/ 用户直接下达合并指令（「merge MR」「合并 MR」「准备合并」等）/ AI 准备调用 `glab mr merge` / `gh pr merge` / `git merge` 到保护分支。启动决策后，AI MUST 按 `merge-discipline` 的工程偏好（`always` / `never` / `ask`）与每次询问规则决定是否运行 `test-coverage-analyzer`；不得在未完成该决策时默认开跑。「保留分支」「继续开发」属于非合并动作，门控不触发。

#### Scenario: 用户跳过分支收尾决策直接说合并

- **WHEN** 用户在工作流归档后跳过分支收尾决策，直接说「准备 merge MR #450」
- **THEN** 工作流启动覆盖率门控决策；仅当偏好为 `always` 或用户在 `ask` 下选择「跑」时才运行 test-coverage-analyzer，再执行合并

#### Scenario: 分支收尾决策为「保留分支」不触发门控

- **WHEN** 用户在分支收尾决策中选定「保留当前分支」或「继续开发」
- **THEN** 工作流不触发覆盖率门控，分支保留原状

#### Scenario: ask 偏好下用户选择跳过仍可合并

- **WHEN** 合并意图已确认、工程未声明 `coverage-gate:`（或声明为 `ask`），且用户选择本次跳过覆盖率
- **THEN** 工作流写入显式跳过留痕后继续合并流程，不得因未跑 analyzer 而视为隐式漏跑

### Requirement: 工作流 SHALL 处理门控隐式漏跑

工作流门控判定矩阵 MUST 包含「隐式漏跑」情况：在用户或工程偏好已决定 **应当运行** 覆盖率门控（`always`，或 `ask` 下用户已选「跑」）之后，门控脚本未运行而合并动作已发生时，MUST 暂停合并、补跑门控。若合并已完成（无法回退），工作流 MUST 写入漏跑留痕（`【覆盖率门控漏跑】合并已发生但门控未运行。时间：<ISO 时间戳>。漏跑阶段：<合并前/合并后>。`），留痕位置与显式跳过留痕位置一致。合法的 `never` 偏好跳过或 `ask` 下用户显式跳过 MUST NOT 记为隐式漏跑。

#### Scenario: AI 在合并前发现应跑却未跑门控

- **WHEN** 用户已选择「跑」或偏好为 `always`，且 AI 即将调用 `glab mr merge` 而尚未运行覆盖率脚本
- **THEN** 工作流判定为「隐式漏跑」，暂停合并、补跑门控

#### Scenario: AI 已合并后发现应跑却未跑门控

- **WHEN** AI 已执行 `glab mr merge` 完成合并，事后发现在应跑条件下未运行覆盖率门控
- **THEN** 工作流如实报告漏跑（无法回退），按上述格式留痕写入 PR 描述和 design.md Verification Notes

#### Scenario: 用户显式跳过不算漏跑

- **WHEN** 用户在 `ask` 决策中选择跳过并已写入跳过留痕后合并完成
- **THEN** 工作流不得将此次记为隐式漏跑

### Requirement: 工作流 SHALL 在未发现 test-coverage-analyzer 时留痕并交用户决策

当覆盖率决策结果为 **运行** 且门控前置检测未发现 `test-coverage-analyzer` skill 时，MUST 输出提示「门控不可用：未检测到 test-coverage-analyzer skill」，写入环境缺漏留痕（`【覆盖率门控跳过】未检测到 test-coverage-analyzer skill，门控不可用。时间：<ISO 时间戳>。决策人：系统（环境缺漏）。`），由用户决定是否继续合并。若决策结果为跳过（`never` 或用户显式跳过），MUST NOT 仅因未安装 analyzer 而阻断。

#### Scenario: 未装 test-coverage-analyzer 的项目在选择运行时留痕交用户决策

- **WHEN** 用户或偏好选择运行覆盖率，且环境探索未发现 `test-coverage-analyzer` skill
- **THEN** 工作流输出「门控不可用」提示并写入留痕，由用户决定是否继续合并

### Requirement: 工作流 SHALL 提供合并前覆盖率门控检查清单

工作流对合并前检查清单的权威来源 MUST 为 `merge-discipline/reference.md`（宿主仅保留一句指针）。清单 MUST 覆盖：合并意图是否已确认 / 工程 `coverage-gate` 偏好是否已解析 / `ask` 时是否已询问用户 / 若决定运行则 analyzer 是否可用且已执行 / 结果如何（达标继续；不达标/崩溃/无报告/无测试→暂停；应跑却漏跑→按漏跑规则）/ 跳过或环境缺漏留痕是否写入。

#### Scenario: AI 执行合并前对照清单

- **WHEN** AI 准备执行 `glab mr merge` 或 `gh pr merge`
- **THEN** 工作流要求 AI 对照 `merge-discipline` 合并前检查清单逐项确认，任一项未满足则暂停合并
