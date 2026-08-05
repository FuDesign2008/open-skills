## Why

Agent 长时间无人值守运行是当前生产化的趋势，但「运行 ≠ 正确」——让 Agent 7×24 不间断运行相对容易，让它持续**正确达到用户预期**才是难点。Claude Code 原生 `/goal`（v2.1.139+）已把「完成条件 + 独立评估器 + 自动跨轮循环」做进了 harness，但业界实践（Google SRE / Anthropic context engineering）与社区长跑经验（DeepSeek v4 flash 场景）表明：长跑真正成功依赖**前置需求对齐、验收标准分层（output/outcome）、sub-agent 上下文管理（防 context rot）、完成报告与人工验收**——这些恰是 `/goal` 未覆盖的部分，且缺少可复用的方法论封装。需要一个可调用的 Skill 把 Goal-Driven 长跑模式工程化。

## What Changes

- 新增 `goal-driven-run` Skill（host workflow，`user-invocable: true`，触发词：「goal 长跑」「goal run」「goal-driven」「目标驱动长跑」「一个 goal 下去跑」等）。
- 五环节编排：① 需求对齐与 output contract → ② 验收标准分层 + `/goal` 条件 4 部分设计 → ③ sub-agent 分工与上下文管理 → ④ 长跑执行（`/goal` / `claude -p` 非交互 / 通用退化路径）→ ⑤ 完成报告 + 人工验收。
- 站在 Claude Code `/goal` harness 之上做「引导 + 补缺」，不重复实现 goal 循环；无 `/goal` 环境提供手工 goal 循环退化。
- 配套新增 `docs/7x24-agent-reliability-handbook.md`（分层可靠性方法论 L1-L4 + §8 Goal-Driven 长跑模式 + 5 个即用模板）。
- 工程注册：`skills-index.md`（52→53 skills）、`AGENTS.md` Skill 清单表补一行。

## Capabilities

### New Capabilities

- `goal-run`: Goal-Driven 长跑执行能力——定义 `goal-driven-run` Skill 五环节的行为契约：需求对齐与 output contract、验收标准分层与 `/goal` 条件设计（官方 4 部分）、sub-agent 分工与上下文管理、长跑执行（含预算与配套）、完成报告与人工验收。

### Modified Capabilities

<!-- 无：现有 specs 不涉及行为契约变更 -->

## Impact

- 新增文件：`skills/goal-driven-run/SKILL.md`、`skills/goal-driven-run/reference.md`、`docs/7x24-agent-reliability-handbook.md`
- 更新文件：`docs/generated/skills-index.md`（自动生成）、`AGENTS.md`（清单表一行）
- 依赖 Skill：`clarifying-question-discipline`（阶段①需求澄清）、`completion-evidence-discipline`（阶段②⑤验收证据）
- 交付载体：分支 `feat/goal-driven-run`，PR #265
