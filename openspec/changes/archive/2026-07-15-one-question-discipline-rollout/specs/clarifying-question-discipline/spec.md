## ADDED Requirements

### Requirement: 所有声明向用户提问的工作流 skill SHALL 落地一次一问硬纪律

本工程所有声明向用户提问的工作流 skill（含 `jira-fix-workflow`、`opsx-jira-fix-workflow`、`think-big`，以及未来的同类 skill）MUST 落地 `clarifying-question-discipline` 纪律的完整形态：**醒目硬纪律声明**（标签/加粗/独立小节，不埋在普通段落）+ **阶段提问入口的数量约束**（提问处显式「一次只问 1 个最关键的」）+ **Red Flags 违规条**（「一次抛多个疑问点/歧义点」列为禁止）+ **平台无关提问方式**（prose 为主，Agent 专属工具仅可选）。不得仅以单句声明了事。

#### Scenario: jira-fix 类工作流 skill 强化

- **WHEN** `jira-fix-workflow` / `opsx-jira-fix-workflow` 的「主动提问」/「歧义与假设」环节指导向用户提问
- **THEN** 以醒目硬纪律声明一次一问，Red Flags 将「一次列出多个歧义点」列为违规，提问方式平台无关（不硬依赖 AskUserQuestion 等 Agent 专属工具）

#### Scenario: think-big 英文 skill 强化

- **WHEN** `think-big`（英文 skill）指导提问
- **THEN** 以英文版硬纪律声明「Ask one question at a time, wait for the answer before following up」，且提问方式平台无关（英文表述不硬依赖某一 Agent 专属工具）

#### Scenario: 未来同类 skill 默认遵循

- **WHEN** 新增的工作流 skill 声明向用户提问
- **THEN** 该 skill 落地完整的一次一问硬纪律形态（醒目声明 + 入口约束 + Red Flags + 平台无关），而非仅单句声明
