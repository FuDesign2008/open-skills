## Why

`clarifying-question-discipline` 纪律的标题/口号式表述「一次只问一个」被弱模型/快速浏览误解为"全程只能问一个问题"，导致 AI 在确需追问第 2、3 个未知时**自我设限、不敢提问**，信息采集不足、方案质量下降。这恰好是该纪律原本要防范的"多问题同抛"的**相反极端——过度收敛**。

虽然 spec 正文与多数 skill 已有「得到回答后再问下一个」的澄清，但标题/首句的歧义仍主导第一印象（`solve-workflow` 标题 `⚠️ 主动提问（硬纪律：一次只问一个）` 是纯歧义源）。需在 spec 语义层显式确立「允许多个未知、一次一问、多轮问清推进」，并在各 skill 标题/首句统一该措辞，堵死"全程只能问一个"的误读方向。

## What Changes

- 在 `clarifying-question-discipline` spec 的 requirement 中**显式加入正向语义**：「允许存在多个未知；多个未知通过多次一问一答、逐轮逐个推进来收集，而非在一条消息里堆叠」，并**点破反方向**：「不是'全程只能问一个问题'——需要几个就分几轮问」
- 各 skill 的标题/首句从「一次只问一个」统一为「**一次一问、多轮问清**」式表述：
  - `solve-workflow`：标题 127 + 正文首句 129
  - `opsx-solve-workflow`：标题式声明 256
  - `jira-fix-workflow`：标题 130
  - `opsx-jira-fix-workflow`、`think-big`：按当前措辞按需对齐
- **保留不变**：既有「禁止一次抛多个」「得到回答后再问下一个」「优先级 目的→约束→成功标准」「平台无关提问方式」
- **非破坏性语义澄清（non-breaking）**：纪律的可观测行为不变（每次仍只回 1 个问题），只是消除"全程只能问一个"的误读、补全"允许多轮"的正向语义

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `clarifying-question-discipline`：requirement 语义从「每次只问 1 个最关键的问题」澄清为「每次只问 1 个最关键的问题 **且允许多个未知、通过多轮问清收集**」；新增反向约束——MUST NOT 将该纪律误解为"全程只能问一个问题"而在需要时省略后续追问。

## Impact

- **spec**：`openspec/specs/clarifying-question-discipline/spec.md`
- **skills**（`skills/<name>/SKILL.md`）：`solve-workflow`、`opsx-solve-workflow`、`jira-fix-workflow`、`opsx-jira-fix-workflow`、`think-big`（think-big 当前措辞待 tasks 阶段核实）
- **snapshot 副本**（`skills/opsx-solve-workflow-workspace/skill-snapshot/`）：本次不动
- **代码/API/依赖**：无影响，纯文档语义澄清
