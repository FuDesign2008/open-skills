# clarifying-question-discipline Delta Spec

## ADDED Requirements

### Requirement: 一次一问纪律的完整形态 SHALL 沉淀为同名共享 skill

`clarifying-question-discipline` skill MUST 单点承载一次一问硬纪律的完整形态：纪律声明与「为什么」、结构化提问格式（单问题 + 多选项）、简答约定（用户可回复选项字母）、平台无关提问方式（描述意图，Agent 自选原生能力）、调查优先原则（先调查再发言、证据说话）。引用方工作流 MUST 在 frontmatter `dependencies` 声明该 skill 并做前置检查，缺失即中止并提示安装命令，MUST NOT 静默降级。

#### Scenario: 引用方缺失即中止

- **WHEN** 声明依赖的工作流启动时前置检查发现 `clarifying-question-discipline` 不可用
- **THEN** 立即中止流程并输出缺失提示（含安装命令），不降级运行

## MODIFIED Requirements

### Requirement: 所有声明向用户提问的工作流 skill SHALL 落地一次一问硬纪律

本工程所有声明向用户提问的工作流 skill（含 `jira-fix-workflow`、`opsx-jira-fix-workflow`、`think-big`，以及未来的同类 skill）MUST 落地 `clarifying-question-discipline` 纪律，合规形态二选一：

- **引用形态（声明强依赖的工作流默认采用）**：通过 frontmatter `dependencies` 引用同名共享 skill 承载完整纪律形态，同时自身 MUST 保留三个触点——阶段提问入口的数量约束（提问处显式「一次只问 1 个最关键的」）+ Red Flags 违规条（「一次抛多个疑问点/歧义点」列为禁止）+ 醒目声明指针（标签/加粗的一行引用声明，不埋在普通段落）。
- **内联形态（不声明依赖的 skill，如英文独立 skill）**：保留完整内联形态——醒目硬纪律声明 + 阶段提问入口的数量约束 + Red Flags 违规条 + 平台无关提问方式。

两种形态均 MUST NOT 仅以单句普通段落声明了事；提问方式 MUST 平台无关（描述意图，让 Agent 自选原生能力）。

#### Scenario: jira-fix 类工作流 skill 采用引用形态

- **WHEN** `jira-fix-workflow` / `opsx-jira-fix-workflow` 的「主动提问」/「歧义与假设」环节指导向用户提问
- **THEN** 通过 `dependencies` 引用 `clarifying-question-discipline` 承载纪律全文，自身保留提问入口数量约束、Red Flags 违规条与醒目声明指针；提问方式平台无关

#### Scenario: think-big 英文 skill 保留内联形态

- **WHEN** `think-big`（英文 skill，未声明 dependencies）指导提问
- **THEN** 保留英文版内联硬纪律声明「Ask one question at a time, wait for the answer before following up」，提问方式平台无关

#### Scenario: 未来同类 skill 默认遵循

- **WHEN** 新增的工作流 skill 声明向用户提问
- **THEN** 该 skill 按上述两种形态之一落地一次一问硬纪律（声明依赖则用引用形态，否则用内联完整形态），而非仅单句声明
