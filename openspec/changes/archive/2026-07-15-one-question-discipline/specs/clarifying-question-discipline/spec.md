## ADDED Requirements

### Requirement: 信息不足时 SHALL 每次只问一个最关键的问题，且为无条件硬纪律

当阶段进行中信息不足以保证输出质量时，AI MUST 每次只向用户提出 **1 个最关键的问题**（优先级：目的 → 约束 → 成功标准），得到回答后再问下一个；MUST NOT 一次抛多个问题或一次列多个疑问点让用户逐个回答。该纪律为**无条件硬纪律**——MUST NOT 依赖「是否检测到某个外部 skill（如 brainstorming）」作为触发前提；无论外部 skill 存在与否，都必须遵守。

#### Scenario: 无外部增强 skill 时仍一次一问

- **WHEN** 运行环境未安装/未检测到 brainstorming 等增强 skill，且阶段信息不足需向用户提问
- **THEN** AI 仍每次只问 1 个最关键的问题，不因「未检测到增强 skill」而退回一次列多个疑问点

#### Scenario: 存在多个未知时只挑最关键的一个

- **WHEN** AI 识别出多个待确认的未知项（如目的、规模、约束、成功标准同时缺失）
- **THEN** AI 仅向用户提出优先级最高的 1 个（通常先问目的），其余登记为后续追问项，明确告知「得到回答后再问下一个」

### Requirement: 「疑问点列出」步骤的措辞 SHALL 与一次一问硬纪律一致

阶段流程中「疑问点列出」类步骤 MUST 在措辞上显式约束「若向用户提问，一次只问 1 个最关键的，得到回答后再问下一个」，MUST NOT 仅写「列出需要进一步确认的地方」而无数量约束（否则与一次一问纪律冲突，诱使 AI 列多个）。

#### Scenario: 疑问点步骤附数量约束

- **WHEN** 流程定义「疑问点列出」步骤
- **THEN** 该步骤措辞包含「若向用户提问，一次只问 1 个最关键的」约束，指向一次一问硬纪律

### Requirement: 提问方式 SHALL 平台无关，MUST NOT 硬依赖某一 Agent 专属工具

skill 跨平台运行（Claude Code / Cursor / OpenCode 等），提问方式 MUST 以平台无关的 prose「单问题 + 多选项」格式为主；某平台专属工具（如 Claude Code 的 `AskUserQuestion`）MUST 仅作该平台上的**可选工具化**，且 MUST 显式标注「无此工具的平台用 prose 兜底」。MUST NOT 把专属工具作为必需或首选。

#### Scenario: 平台无关格式为主

- **WHEN** skill 指导 AI 如何提问
- **THEN** 以「单问题 + 多选项」prose 格式为默认推荐，平台专属工具仅作可选增强

#### Scenario: 显式标注兜底

- **WHEN** skill 提及某 Agent 专属提问工具（如 AskUserQuestion）
- **THEN** 同时说明「Cursor/OpenCode 等无此工具时直接用 prose 格式」，不造成对其他平台的硬依赖

### Requirement: 一次一问纪律 SHALL 多处高频强化，不靠单次声明

为避免被流程细节淹没（声明式失效），一次一问纪律 MUST 在多处高频强化：阶段提问入口的**醒目硬纪律**（如 ⚠️ 标签）+ 通用原则 + Red Flags 违规条。MUST NOT 仅在单一普通段落声明一次。

#### Scenario: 违反一次一问被 Red Flags 列为禁止

- **WHEN** 阶段流程定义 Red Flags / 禁止行为
- **THEN** 「一次抛出多个疑问点让用户回答」被列为禁止项，并给出「每次只问 1 个最关键的」修正

#### Scenario: 提问入口有醒目硬纪律

- **WHEN** 流程进入需向用户提问的关键节点（如阶段 1.1 明确问题）
- **THEN** 在该节点入口处以醒目方式（标签/加粗/独立小节）声明一次一问硬纪律，而非埋在普通段落
