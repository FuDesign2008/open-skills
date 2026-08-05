# Goal-Driven Run — Output Format Reference

This file holds the per-stage output templates for the `goal-driven-run` skill, plus a quick reference to Claude Code's official `/goal` command. Templates are adapted from the 7×24-agent-reliability-handbook §8 (Goal-Driven 长跑模式).

---

## Stage 1 — Requirements & Output Contract (模板1)

```
【Goal restatement】I understand the goal as: ...
【Key elements】Deliverables: ... / Constraints: ... / Background: ... / Expected outcome: ...
【Output vs Outcome 预判】
- 输出型（agent 可自验）：<如：构建通过、测试全绿、无 TODO>
- 结果型（需人验收）：<如：方案符合团队架构约定>
【Points to confirm】(ask ONE question per turn, per clarifying-question-discipline)
```

**需求对齐清单**（逐项填写）：

| 项 | 填写内容 |
|----|---------|
| 目标（一段话） | ... |
| 产出物 | ... |
| 成功标准（机器可验） | ... |
| 成功标准（人工判断） | ... |
| 范围（做什么） | ... |
| 非目标（不做什么） | ... |
| 约束 | ... |
| 预算（turn/时间/token 上限） | ... |
| 边界情况处理 | ... |

---

## Stage 2 — Acceptance Criteria + Goal Condition (模板2)

```
## 验收标准
### 硬性（机器可验 → 成为 /goal 条件）
- [ ] 构建命令通过：<命令>
- [ ] 测试通过：<命令>（覆盖 >= <阈值>）
- [ ] 无 TODO/FIXME 残留
- [ ] <其他机器可验项>

### 软性（质检模型 + 确定性 checker）
- [ ] <质量要求>
- [ ] <一致性要求>

### 人工（结果型 → 阶段 5 人工验收）
- [ ] <业务/架构判断项>
- [ ] <体验判断项>

## /goal 条件（官方 4 部分）
<可测量终态> + <声明的检查方式> + <关键约束> + <预算子句：or stop after N turns>
示例：all tests in test/auth pass and the lint step is clean, stop after 20 turns
```

---

## Stage 3 — Sub-agent Division & Context Management (模板3)

```
## 协作设计
### 上下文技术选型
- [ ] Sub-agent 架构（并行探索/多模块）—— 子代理深工，主 agent 只收 1-2k 摘要
- [ ] Compaction（压缩）—— 长对话流，接近窗口上限总结重开
- [ ] Structured note-taking（结构化笔记）—— 多里程碑迭代，NOTES.md/memory

### sub-agent 划分
- [ ] 按模块：<A> / <B> ...
- [ ] 按领域：<研究> / <实现> / <验证>
- [ ] 独立 harness：实现 agent 与审查 agent 分离

### 每个 sub-agent 定义
- 任务描述 + 输出物
- 允许的工具（最小集 + 白名单）
- 输出契约（摘要 + 证据 + 遗留问题）
- 完成条件（机器可验）
- 失败处理（无法完成如何上报）

### 主 agent 职责
- [ ] 保持高层面计划 + 进度跟踪
- [ ] 只接收摘要，不接收细节
- [ ] 合成结果 + 汇总到完成报告
```

---

## Stage 4 — Launch the Long Run (模板4)

```
## 长跑启动单
- 环境：交互 / 非交互(claude -p) / 手工退化
- /goal 条件：<4 部分条件，含预算子句>
- 配套：
  - [ ] CLAUDE.md 在项目根（架构/约定/验收规则）
  - [ ] PostToolUse hook 自动校验（lint/typecheck）
  - [ ] auto mode 已启用（无人值守）
- 预算：<N turns / N 分钟 / token 上限>
- 命令：
  - 交互：/goal <condition>
  - 非交互：claude -p "/goal <condition>" --output-format stream-json --verbose
```

**Run log**（执行中记录）：turn 数 / 已耗 token / 评估器最近 reason / 异常。

---

## Stage 5 — Completion Report & Human Acceptance (模板5)

```
## 完成报告
### 目标回顾
- 原始目标：<一段话>

### 完成情况（对照验收标准逐项）
- 硬性标准：全部通过 ✅ / 未通过项：<列出>
- 软性标准：<自查结论>
- 人工标准：<留给人工判断的问题/说明>

### 实际完成内容
- 改动/产出的清单（文件/artifact + 一句话说明）
- 验证证据（构建/测试输出摘要、覆盖率等）

### 遗留问题与风险
- 未完成项 / 已知风险 / 需要人决策的点
- 下一步建议

### 备注
- 实际耗时 / turn 数 / token 消耗 / 偏离计划之处
```

---

## /goal 官方命令速查（code.claude.com/docs/en/goal）

| 命令 | 作用 |
|------|------|
| `/goal <条件>` | 设置完成条件并立即开始一轮（条件即指令）；已有 goal 则被替换 |
| `/goal`（无参） | 查看当前状态：条件 / 运行时长 / 已评估 turn 数 / token 花费 / 评估器最近 reason |
| `/goal clear` | 清除未完成的 goal（别名：stop / off / reset / none / cancel） |
| `claude -p "/goal <条件>"` | 非交互模式，单次调用跑完即退出 |
| `claude -p "/goal ..." --output-format stream-json --verbose` | 非交互 + 实时查看每轮输出（默认 text 模式中途无输出，像卡住） |
| `Ctrl+C` | 非交互下提前中断 |
| `--resume` / `--continue` | 恢复会话时保留未完成 goal（turn/token 基线重置） |

**机制要点**：
- 每轮后小快评估模型（默认 Haiku，可 `ANTHROPIC_DEFAULT_HAIKU_MODEL` 换）读取 transcript 判断条件；不调用工具、不读文件 → 条件必须可由 Claude 输出证明。
- **无内置 token 预算** → 条件中必须写 `or stop after N turns` 或时间子句。
- 条件最长 4000 字符。
- 一个 session 一个 active goal；goal 达成后自动清除。
- 要求 Claude Code **v2.1.139+**；需接受 trust dialog；`disableAllHooks` 或 `allowManagedHooksOnly`(managed) 时不可用。

**条件 4 部分**（官方推荐）：
1. 一个可测量终态（测试结果 / 构建退出码 / 文件数 / 空队列）
2. 声明的检查方式（Claude 如何证明，如 `npm test exits 0`）
3. 关键约束（路上不能改变的，如 `no other test file is modified`）
4. 预算子句（`or stop after N turns`）

**与相邻机制对比**：
- `/goal` + **auto mode** = 无人值守长跑（auto 批准单 turn 内工具调用，/goal 决定是否开下一 turn）。二者互补。
- `/goal` vs **Stop hook**：/goal 是 session 内快捷方式；Stop hook 在 settings 全局生效、可跑确定性脚本（比 /goal 更灵活，但要配置）。
- `/goal` vs **`/loop`**：loop 按时间间隔重跑（轮询），goal 直到完成——不是一回事。

**可靠性三件套**（长跑更稳）：
1. 项目根 **CLAUDE.md**——每轮自动读取，提供一致上下文。
2. **PostToolUse hooks** 自动校验（每步自动 lint/type-check）。
3. **auto mode** 开启——否则长跑每写一个文件就卡在审批。

---

## Prerequisite Skill Check — Missing Notice

When a skill declared in frontmatter `dependencies` is missing, print the following and abort immediately:

```
⚠️ goal-driven-run is missing a strong dependency and cannot run in full

【Missing skill(s)】
- [skill-name]: [what it is for]

【Why it's needed】
goal-driven-run strongly depends on the following skills via frontmatter dependencies (missing = abort):
- `clarifying-question-discipline`: stage 1 requirement clarification (one question per turn; clarify-first)
- `completion-evidence-discipline`: stage 2/5 acceptance evidence (no pass claims without fresh evidence)
```

---

## Sources

- Claude Code 官方文档 `/goal` — code.claude.com/docs/en/goal
- Anthropic《Effective Context Engineering for AI Agents》— anthropic.com/engineering（context rot / sub-agent / compaction / note-taking）
- Yuval Yeret《AI Agents Can Now Run Toward Goals》— yuvalyeret.com（output vs outcome 目标）
- 7×24-agent-reliability-handbook §8（本 skill 的方法论来源）
