## Why

`clarifying-question-discipline` 纪律的标题/口号式表述「一次只问一个」被弱模型/快速浏览误解为"全程只能问一个问题"，导致 AI 在确需追问第 2、3 个未知时**自我设限、不敢提问**，信息采集不足、方案质量下降——这恰好是该纪律原本要防范的"多问题同抛"的**相反极端（过度收敛）**。

根因：口号「一次只问一个」只表达"每轮 1 个"，缺少"允许多个、多轮问清"的正向语义；spec 正文与多数 skill 虽有「得到回答后再问下一个」的零散澄清，但被标题的第一印象压过。

## What Changes

- **确立核心口号「一次一问、多轮问清」**（think-big 英文：Ask ONE question at a time, then follow up across rounds until clear）——对仗承载两个约束，本身即排除"全程只能问一个"的误读
- spec Requirement 1 用清晰 MUST 表述三件事：①一条消息只 1 个问题（一次一问）②多个未知分多轮问清（多轮问清）③每轮基于上一轮回答精化
- 各 skill 的「主动提问」段落**整体重写**（非标题换词），让两个约束在正文展开
- **精简**：删掉为旧歧义打的元注释补丁（如「对称的两面」「过度收敛」等解释性文字）——MUST 表述清楚后无需再防误读；并删一个冗余的防误读 Scenario（被另一 scenario 覆盖）
- **保留不变**：「禁止一次抛多个」「优先级 目的→约束→成功标准」「平台无关提问方式」
- **非破坏性（non-breaking）**：可观测行为不变（仍每轮 1 个）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `clarifying-question-discipline`：Requirement 1 从"每次只问 1 个"澄清为"一次一问、多轮问清（多轮收集多个未知，每轮基于上一轮回答精化）"，并精简旧歧义的元注释补丁。

## Impact

- **spec**：`openspec/specs/clarifying-question-discipline/spec.md`
- **skills**：`solve-workflow`、`opsx-solve-workflow`、`jira-fix-workflow`、`think-big`（整体重写「主动提问」段落）；`opsx-jira-fix-workflow` 核对未改
- **snapshot 副本**：不动
- **代码/API/依赖**：无影响，纯文档语义澄清
