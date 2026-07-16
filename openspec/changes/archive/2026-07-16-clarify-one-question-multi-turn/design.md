## Context

`clarifying-question-discipline` 纪律防的是「多问题同抛」，但其标题/口号「一次只问一个」被误解为「全程只能问一个问题」，诱发相反极端——**过度收敛（该追问不追问）**。spec Requirement 1 同样只设了「防多问」一面，缺「防少问」的对称约束。本 design 在 spec 语义层补全对称约束，并在各 skill 标题/首句统一措辞，堵死误读。

## Goals

- 在 spec Requirement 1 显式确立「一次一问、多轮问清（允许多个未知）」+「不得误解为全程只能问一个」反向约束
- 各 skill 的纯歧义标题/首句统一为「一次一问、多轮问清」式表述
- 保留既有正确表述（禁止一次抛多个 / 得到回答后再问下一个 / 优先级 / 平台无关）

## Non-Goals

- 不改变纪律的可观测行为（仍每轮 1 个）—— 非破坏性
- 不重写各 skill 的整个「主动提问」小节，只改歧义源
- 不改 snapshot 副本（`skills/opsx-solve-workflow-workspace/skill-snapshot/`）
- 不改已正确的段落（如 opsx-jira-fix-workflow 行 193 已有「得到回答后再问下一个」）

## Design Decisions

### D1：统一用语「一次一问、多轮问清」/ "one question at a time, then follow up across rounds until clear"

对仗承载两个约束：**单轮只 1 个 + 多轮允许多个**。一句话同时防「多问」与「少问」。「不是全程只能问一个——需要几个分几轮问」作为点破反方向的关键句，写入 spec Requirement 1。

### D2：spec 层只 MODIFIED Requirement 1

Requirement 1 是单轮-vs-全程语义的核心。Requirement 4（高频强化）、5（skill 落地）规定的是「强化方式」「落地形态」，不规定具体字眼；skill 用「一次一问、多轮问清」仍满足 4/5。故 delta 最小化，只改 Requirement 1，并新增 1 个 Scenario「不得误解为全程只能问一个问题」。

### D3：各 skill 改动分级（按当前歧义程度）

| skill | 位置 | 当前 | 动作 |
|-------|------|------|------|
| solve-workflow | 127 标题 + 129 首句 | 「一次只问一个」（纯歧义源） | **必改**：标题→「一次一问、多轮问清」；首句联动 |
| opsx-solve-workflow | 256 标题式声明 | 「一次只问一个关键问题」 | **必改**：标题短语统一 |
| jira-fix-workflow | 130 标题 | 「一次只问一个」 | **必改**：标题统一 |
| opsx-jira-fix-workflow | 193 | 已有「得到回答后再问下一个」，无纯歧义标题 | **不改**（已正确，仅核对） |
| think-big | 111（英文） | "Ask ONE question at a time" + 已有 5 轮结构 | **边际澄清**（风险低，补 "one per turn, not one total"） |

### D4：snapshot 不动

`skills/opsx-solve-workflow-workspace/skill-snapshot/SKILL.md` 是 43KB 单文件快照副本，应从源 skill 同步而非手改。本次不纳入。

## Risks & Mitigations

- **遗漏某处歧义标题** → 实现后用 `grep -rn "一次只问一个"` 全量复查，确认无纯歧义残留
- **措辞改动破坏既有强化结构** → 只改标题/首句字眼，不动 ⚠️ 标签 / Red Flags / 平台无关等结构（仍满足 Requirement 4/5）
- **think-big 英文与中文不统一** → 英文用对仗表述 "one question at a time, then follow up across rounds until clear"，语义等价

## Alternatives Considered

- **方案 1（只改标题，不动首句）**：被否——标题与正文首句「一次只问一个最关键的问题」措辞不一致，残留歧义
- **方案 3（加独立显式澄清句）**：用户在 solve-workflow 阶段 2 选定方案 2；但方案 3 的核心价值「点破反方向」已融入 spec Requirement 1（新增 Scenario），skill 层用方案 2 的标题+首句联动即可
