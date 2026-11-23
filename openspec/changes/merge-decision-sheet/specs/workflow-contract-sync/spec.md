## MODIFIED Requirements

### Requirement: 工作流 SHALL 提供合并前覆盖率门控检查清单

工作流对合并前检查清单的权威来源 MUST 为 `merge-discipline/reference.md`（宿主仅保留一句指针）。清单 MUST 覆盖：合并意图是否已确认 / 工程 `coverage-gate` 偏好是否已解析 / `ask` 时是否已询问用户（可经 merge decision sheet 一次性询问，不必逐 Part 单独询问）/ 若决定运行则 analyzer 是否可用且已执行 / 结果如何（达标继续；不达标/崩溃/无报告/无测试→暂停；应跑却漏跑→按漏跑规则）/ 跳过或环境缺漏留痕是否写入。

#### Scenario: AI 执行合并前对照清单

- **WHEN** AI 准备执行 `glab mr merge` 或 `gh pr merge`
- **THEN** 工作流要求 AI 对照 `merge-discipline` 合并前检查清单逐项确认，任一项未满足则暂停合并
