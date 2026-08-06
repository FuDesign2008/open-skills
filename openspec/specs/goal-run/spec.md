# goal-run Specification

## Purpose

Goal-driven long-run execution capability owned by the user-invocable `goal-driven-workflow` skill: five-stage orchestration — ① requirement alignment & output contract → ② layered acceptance criteria + `/goal` condition design (official four parts, mandatory budget clause) → ③ sub-agent division & context management (context-rot mitigation) → ④ long-run launch (`/goal` / `claude -p` non-interactive / manual-loop fallback, with CLAUDE.md + hooks + auto-mode companion) → ⑤ completion report & human acceptance. Built on top of Claude Code's native `/goal` harness (v2.1.139+), with a generic fallback for environments without `/goal`.

## Requirements

### Requirement: 长跑前置需求对齐

The system SHALL perform requirement clarification and output-contract alignment before starting a goal long-run, following one-question-per-turn clarification discipline.

#### Scenario: 产出需求对齐清单

- **WHEN** 用户触发 goal 长跑（如「goal 长跑 xxx」「一个 goal 下去跑 xxx」）
- **THEN** 系统通过一次一问澄清目标、产出物、范围、非目标、约束、预算，并产出需求对齐清单（模板1）

### Requirement: 验收标准分层

The system SHALL layer acceptance criteria into three tiers: machine-verifiable (hard), LLM-judge with deterministic-checker (soft), and human outcome-type (human).

#### Scenario: 三层验收标准

- **WHEN** 在启动长跑前设计验收标准
- **THEN** 系统将验收标准分为硬性（编译/测试/格式，agent 可自验）、软性（质检模型 + 确定性 checker）、人工（结果型，需人判断）三层，并将硬性标准作为 `/goal` 条件来源

### Requirement: /goal 条件遵循官方四部分

The system SHALL design the `/goal` condition using the official four parts: one measurable end state, a stated check, constraints that must not change, and a turn/time budget clause.

#### Scenario: 可验证条件

- **WHEN** 编写 `/goal` 条件
- **THEN** 条件包含可测量终态、声明的检查方式（如 `npm test exits 0`）、关键约束（如 `no other test file is modified`）、预算子句（如 `or stop after 20 turns`）

### Requirement: 强制预算子句

The system SHALL include a turn or time budget clause in every `/goal` condition, because `/goal` has no built-in token budget and the evaluator can only judge the transcript.

#### Scenario: 预算保护

- **WHEN** 编写 `/goal` 条件且条件未含预算子句
- **THEN** 系统必须补充 `or stop after N turns`（或时间子句），防止长跑无限消耗 token；系统不得在没有预算约束的情况下启动长跑

### Requirement: sub-agent 分工与上下文管理

The system SHALL plan sub-agent division and select a context-management technique (sub-agent architecture / compaction / structured note-taking) to mitigate context rot during long runs, keeping the main agent focused on plan and synthesis.

#### Scenario: 上下文技术选型

- **WHEN** 长跑任务预期上下文将超过单窗口承载
- **THEN** 系统选择 sub-agent 架构（子代理深工、主 agent 只收 1-2k 摘要）/ compaction / structured note-taking 之一，并为每个 sub-agent 定义任务、最小工具集、输出契约与完成条件

### Requirement: 长跑执行多模式支持

The system SHALL support launching the long run in interactive `/goal`, non-interactive `claude -p`, or manual-loop fallback mode depending on the environment.

#### Scenario: 非交互执行

- **WHEN** 用户需要无人值守跑完即退出
- **THEN** 系统使用 `claude -p "/goal <condition>" --output-format stream-json --verbose` 启动，并可实时查看进度

#### Scenario: 无 /goal 环境退化

- **WHEN** 当前环境不支持 `/goal`（旧版本或其他 agent）
- **THEN** 系统退化为手工 goal 循环：迭代「执行 → 对照验收清单验证 → 未达则继续（受预算约束）→ 达成则停止」，且必须显式设置停止子句

### Requirement: 无人值守配套设施

The system SHALL guide the required companion setup for unattended long runs: project-root CLAUDE.md, PostToolUse auto-validation hooks, and auto mode.

#### Scenario: 无人值守配套就位

- **WHEN** 长跑需要无人值守（auto 模式或调度执行）
- **THEN** 系统确认 CLAUDE.md（每轮一致上下文）与 PostToolUse hook（每步自动校验）就位，并启用 auto mode 避免文件写入审批卡顿

### Requirement: 复合目标拆分

The system SHALL split compound objectives into a chain of sequential goals, each with its own verifiable end state, instead of one oversized `/goal`.

#### Scenario: 顺序 goal 链

- **WHEN** 用户目标含多个相互独立的可验证终态（如「改架构 + 加 OAuth + 补测试」）
- **THEN** 系统拆分为顺序 `/goal` 链，每个 goal 单独设计条件与预算，逐一执行

### Requirement: 完成报告与人工验收

The system SHALL produce a structured completion report after the long run and separate machine-verifiable acceptance (spot-checked by human) from human outcome-level acceptance.

#### Scenario: 报告与分层验收

- **WHEN** 长跑结束
- **THEN** 主 agent 输出完成报告（模板5：目标回顾、验收标准逐项状态、实际产出与证据、遗留问题、耗时/token），人工判断结果型标准并抽查机器项；验收发现的问题回填至下一轮需求对齐清单

### Requirement: 长跑启动批准门控

The system SHALL require explicit user approval before launching a long run when it involves unattended operation, a budget above threshold, or irreversible actions; auto mode does not bypass this gate.

#### Scenario: 高影响长跑获批

- **WHEN** 长跑满足任一高影响条件（无人值守 / 大预算 / 不可逆操作）
- **THEN** 系统在启动前暂停并请求用户显式批准「最终 goal 条件 + 预算 + 配套清单」，即使处于 auto 模式也不得跳过

#### Scenario: 普通长跑无需门控

- **WHEN** 长跑为低影响（小预算 / 可逆 / 单文件高确定性）
- **THEN** 系统无需批准门控，按阶段 4 正常启动

