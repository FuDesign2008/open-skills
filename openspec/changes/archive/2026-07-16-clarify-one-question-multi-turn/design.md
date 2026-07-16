## Context

`clarifying-question-discipline` 纪律防的是「多问题同抛」，但其标题/口号「一次只问一个」被误解为「全程只能问一个问题」，诱发相反极端——过度收敛（该追问不追问）。根因不是"缺少防误解补丁"，而是**口号只表达"每轮 1 个"、缺"允许多个、多轮"的正向语义**。本 design 用一句对仗口号 + 清晰 MUST 表述从根上消除歧义，并精简掉为旧歧义打的元注释补丁。

## Goals

- 确立核心口号「一次一问、多轮问清」，本身即排除"全程只能问一个"误读
- spec Requirement 1 用清晰 MUST 表述（一次一问 / 多轮问清 / 每轮基于上轮精化）
- 各 skill「主动提问」段落整体重写，两个约束在正文展开
- 保留既有正确表述（禁止一次抛多个 / 优先级 / 平台无关）

## Non-Goals

- 不改变可观测行为（仍每轮 1 个）—— 非破坏性
- 不改 snapshot 副本
- 不改已正确的 opsx-jira-fix-workflow 行 193

## Design Decisions

### D1：核心口号「一次一问、多轮问清」

「一次一问」=一条消息只 1 个问题；「多轮问清」=多个未知分多轮问到清楚。对仗、口语、零抽象词，第一眼即懂；后半句直接排除"全程只能问一个"的误读。英文（think-big）：Ask ONE question at a time, then follow up across rounds until clear。

> 早期曾用一个对仗但生造的口号（"单轮/逐个"等词不直白、看不懂），评审后废弃，改用本口号。

### D2：MUST 表述清楚后，精简旧歧义的元注释补丁

旧文案为防"全程只能问一个"误读，堆了「不得把 X 误解为 Y」「对称的两面」「过度收敛」等元注释。新口号 + MUST 表述已从根上排除误读，这些补丁成冗余，全部删除——含一个冗余的防误读 Scenario（被「逐轮逐个收集，不省略后续追问」scenario 覆盖）。spec Requirement 1 精简为清晰的三句 MUST。

### D3：各 skill「主动提问」段落整体重写（非局部换词）

只换标题短句会导致"标题新概念、正文旧表述"割裂。故按 skill 结构整体重写，让两个约束在正文展开，并落地「每轮基于上一轮回答精化」。

| skill | 动作 |
|-------|------|
| solve-workflow | 整个小节重写（标题 + 正文 + 两个约束 + 为什么） |
| opsx-solve-workflow | 紧凑段落重写 + Red Flags 引用名同步 |
| jira-fix-workflow | 紧凑 bullet 重写 |
| think-big | 英文段落重写（one question at a time → follow up across rounds until clear） |
| opsx-jira-fix-workflow | 已正确，仅核对，不改 |

### D4：snapshot 不动

`skills/opsx-solve-workflow-workspace/skill-snapshot/SKILL.md` 是快照副本，应从源同步而非手改。

## Risks & Mitigations

- **精简过头、误读复现** → 口号「多轮问清」本身排除"全程只能问一个"；且保留「逐轮逐个收集，不省略后续追问」scenario 作测试锚
- **破坏既有强化结构** → 不动 ⚠️ 标签 / Red Flags / 平台无关结构（仍满足 Requirement 4/5）

## Alternatives Considered

- **只换标题短句（不动正文）**：被否——标题与正文割裂，正文旧表述仍单向
- **保留"防误读"元注释作保险**：被否——MUST 表述已清楚，元注释冗余；遵循"表述清楚就不需要补丁"
