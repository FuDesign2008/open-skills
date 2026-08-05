## Context

Claude Code 原生 `/goal`（v2.1.139+）提供了「完成条件 + 独立评估器 + 自动跨轮循环」harness，但缺少前置需求对齐、验收分层、sub-agent 上下文管理、报告验收的方法论封装。社区长跑实践（DeepSeek v4 flash 场景）验证了「需求聊透 → 验收自评 → sub-agent 分工 → 一个 goal 跑几小时 → 报告人工验收」五环节流程的价值。本工程（open-skills）已沉淀 `docs/7x24-agent-reliability-handbook.md` §8 方法论，现将其工程化为可调用 Skill。

约束：遵循 open-skills Skill 规范（frontmatter + 触发词 + 依赖声明 + skills-index 自动生成 + description ≤1024 校验）；不重复实现 `/goal` 已有的循环机制。

## Goals / Non-Goals

**Goals**：
- 新增 `goal-driven-run` Skill（host workflow，`user-invocable: true`），封装五环节编排
- 站在 `/goal` 之上做「引导 + 补缺」：引导条件 4 部分写法，补齐前置对齐 / 验收分层 / 上下文管理 / 报告验收
- 提供无 `/goal` 环境的通用退化路径
- 纳入工程规范（skills-index、AGENTS.md 清单、description lint）

**Non-Goals**：
- 不实现新的 goal 循环引擎（`/goal` 已覆盖）
- 不做 merge/发布流程（归 delivery-discipline / merge-discipline）
- 不改造现有 `solve-workflow`（保持其独立性，通过路径指引引用即可）

## Decisions

**D1：站在 `/goal` harness 之上做方法论封装，而非自研循环**
- 理由：`/goal` 的「完成条件 + 独立评估器 + 自动跨轮」已是官方 harness；自研循环重复造轮子、无法受益于官方评估器与状态展示。
- 备选：自研 goal 循环（维护成本高、评估器弱）→ 否决。

**D2：形态选 host workflow（user-invocable）而非纪律型**
- 理由：用户需要独立调用（触发词触发五环节），而非被其他 workflow 引用。
- 备选：纪律型 skill（`user-invocable: false`，仅被依赖）→ 无法独立启动长跑，否决。

**D3：SKILL.md + reference.md 双文件**
- 理由：五环节模板 + `/goal` 官方速查内容多，按工程惯例放入 reference.md，SKILL.md 保持编排主体。
- 备选：单文件（过长、难维护）→ 否决。

**D4：依赖最小化（2 个强依赖）**
- `clarifying-question-discipline`（阶段①一次一问）、`completion-evidence-discipline`（阶段②⑤验收证据）。
- 理由：goal-driven-run 是轻量 workflow，仅需这两个纪律；不过度依赖 solve-workflow 全套依赖。
- 备选：复用 solve-workflow 全套依赖 → 过重、耦合，否决。

**D5：内置通用退化路径**
- 无 `/goal` 环境（旧版本/其他 agent）→ 手工 goal 循环（迭代执行→对照清单验证→受预算约束→停止）。
- 理由：skill 跨环境可用；`/goal` 依赖 v2.1.139+。

**D6：spec 强制「预算子句」与「条件可证明」**
- 因 `/goal` 无内置 token 预算、评估器只读 transcript，把「每个条件必须含预算子句」和「条件须可由输出证明」固化为 REQUIREMENTS，从流程上防止烧 token 与评估器幻觉成功。

## Risks / Trade-offs

- **`/goal` 版本依赖（v2.1.139+）** → 提供手工 goal 循环退化路径；reference.md 标注版本要求与 trust dialog 前提。
- **评估器只读 transcript → 模糊条件致循环或幻觉成功** → spec 强制「条件 4 部分」与「可证明的检查方式」；skill Red Flags 警示。
- **无内置预算 → 长跑烧 token** → spec 强制预算子句；reference.md 附预算写法。
- **长跑上下文膨胀（context rot）→ 正确性下降** → 阶段③ sub-agent/compaction/note-taking 三选一 + 主 agent 只收摘要。
- **依赖 2 个纪律 skill 缺失 → 流程降级** → prerequisite skill check 启动即 abort（no-degradation）。

## Migration Plan

- 已实现（本次变更即落地）：`skills/goal-driven-run/{SKILL.md, reference.md}`、`docs/7x24-agent-reliability-handbook.md`。
- 工程注册已就绪：`skills-index.md`（52→53）、`AGENTS.md` 清单、description lint（0 error）。
- 回滚：删除 `skills/goal-driven-run/` 与手册文件即可；无数据迁移。

## Open Questions

- 无重大遗留。可选后续增强（不在本 change 范围）：`commands/goal-run.md` 快捷命令、README 提及新 skill、与 `solve-workflow` 的路径指引互链。
