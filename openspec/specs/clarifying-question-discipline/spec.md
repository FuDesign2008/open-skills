# clarifying-question-discipline Specification

## Purpose
定义本工程工作流 skill 向用户提问时的纪律：信息不足时每次只问一个最关键的问题（无条件硬纪律，不依赖外部 skill 是否存在），提问方式平台无关（描述意图，让 Agent 自选原生能力），且纪律多处高频强化。覆盖 opsx-solve-workflow、solve-workflow、jira-fix-workflow、opsx-jira-fix-workflow、think-big 等所有声明向用户提问的工作流 skill。
## Requirements
### Requirement: 信息不足时 SHALL 每次只问一个最关键的问题，且为无条件硬纪律

当阶段进行中信息不足以保证输出质量时，AI MUST 每次只向用户提出 **1 个最关键的问题**（优先级：目的 → 约束 → 成功标准），得到回答后再问下一个；MUST NOT 一次抛多个问题或一次列多个疑问点让用户逐个回答。

此约束规范的是**单轮交互**：一条消息只含 1 个问题（**一次一问**）。当存在多个未知时，AI MUST 通过**多轮追问**把问题问清（**多轮问清**），且每一轮的问题 MUST 基于上一轮回答来精化（渐进收敛）。MUST NOT 使用「一问一答」表述该纪律（该措辞易被误读为每轮提问后立即给出解答）。

该纪律为**无条件硬纪律**——MUST NOT 依赖「是否检测到某个可选增强 skill」作为触发前提；无论可选增强 skill 存在与否，都必须遵守。

#### Scenario: 无外部增强 skill 时仍一次一问

- **WHEN** 运行环境未安装/未检测到可选增强 skill，且阶段信息不足需向用户提问
- **THEN** AI 仍每次只问 1 个最关键的问题，不因「未检测到增强 skill」而退回一次列多个疑问点

#### Scenario: 存在多个未知时逐轮逐个收集，不省略后续追问

- **WHEN** AI 识别出多个待确认的未知项（如目的、规模、约束、成功标准同时缺失）
- **THEN** AI 每轮只提出优先级最高的 1 个（通常先问目的），并明确告知仍有后续未知、将逐个追问（「得到回答后再问下一个」），逐轮推进直到信息充分；MUST NOT 只问 1 个就停止而丢弃其余未知

#### Scenario: 纪律措辞不使用一问一答

- **WHEN** an agent reads `clarifying-question-discipline` spec or skill body / workflow one-line pointers that cite this discipline
- **THEN** the normative slogan is「一次一问、多轮问清」(or English equivalent one-per-turn + multi-round-until-clear), and MUST NOT instruct via「一问一答」

### Requirement: 「疑问点列出」步骤的措辞 SHALL 与一次一问硬纪律一致

阶段流程中「疑问点列出」类步骤 MUST 在措辞上显式约束「若向用户提问，一次只问 1 个最关键的，得到回答后再问下一个」，MUST NOT 仅写「列出需要进一步确认的地方」而无数量约束（否则与一次一问纪律冲突，诱使 AI 列多个）。

#### Scenario: 疑问点步骤附数量约束

- **WHEN** 流程定义「疑问点列出」步骤
- **THEN** 该步骤措辞包含「若向用户提问，一次只问 1 个最关键的」约束，指向一次一问硬纪律

### Requirement: 提问方式 SHALL 平台无关——描述意图，让 Agent 自选原生能力

skill 跨平台运行（Claude Code / Cursor / OpenCode 等），提问方式 MUST 平台无关：**描述「要达成什么」（意图，如「结构化单选：单问题 + 多选项」），由运行该 skill 的 Agent 用其原生能力实现**；无对应能力时退回通用格式（如 prose）。MUST NOT 把某一 Agent 专属工具（如 Claude Code 的 `AskUserQuestion`）作为必需或首选，MUST NOT 枚举「X 平台用 A 工具、Y 平台用 B」（枚举仍是硬编码，且武断假设其他平台能力）。

#### Scenario: 描述意图，Agent 自选工具

- **WHEN** skill 指导 AI 如何提问
- **THEN** 以意图描述（如「结构化单选：单问题 + 多选项」）为主，由 Agent 用其原生结构化提问能力实现，无则退回 prose

#### Scenario: 不枚举平台/工具

- **WHEN** skill 提及提问方式
- **THEN** 不写「Claude Code 用 AskUserQuestion，Cursor/OpenCode 用 prose」式枚举；让各 Agent 自选原生能力

### Requirement: 一次一问纪律 SHALL 多处高频强化，不靠单次声明

为避免被流程细节淹没（声明式失效），一次一问纪律 MUST 在多处高频强化：阶段提问入口的**醒目硬纪律**（如 ⚠️ 标签）+ 通用原则 + Red Flags 违规条。MUST NOT 仅在单一普通段落声明一次。

#### Scenario: 违反一次一问被 Red Flags 列为禁止

- **WHEN** 阶段流程定义 Red Flags / 禁止行为
- **THEN** 「一次抛出多个疑问点让用户回答」被列为禁止项，并给出「每次只问 1 个最关键的」修正

#### Scenario: 提问入口有醒目硬纪律

- **WHEN** 流程进入需向用户提问的关键节点（如阶段 1.1 明确问题）
- **THEN** 在该节点入口处以醒目方式（标签/加粗/独立小节）声明一次一问硬纪律，而非埋在普通段落

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

### Requirement: 一次一问纪律的完整形态 SHALL 沉淀为同名共享 skill

`clarifying-question-discipline` skill MUST 单点承载一次一问硬纪律的完整形态：纪律声明与「为什么」、结构化提问格式（单问题 + 多选项）、简答约定（用户可回复选项字母）、平台无关提问方式（描述意图，Agent 自选原生能力）、调查优先原则（先调查再发言、证据说话）。引用方工作流 MUST 在 frontmatter `dependencies` 声明该 skill 并做前置检查，缺失即中止并提示安装命令，MUST NOT 静默降级。

#### Scenario: 引用方缺失即中止

- **WHEN** 声明依赖的工作流启动时前置检查发现 `clarifying-question-discipline` 不可用
- **THEN** 立即中止流程并输出缺失提示（含安装命令），不降级运行

### Requirement: Clarification rounds SHALL prioritize asking until clear over answering

During clarification (information-gathering) rounds, the AI MUST focus on making the problem clear through one-question-per-turn multi-round asking. It MUST NOT rush to provide solutions, conclusions, or full answers while critical unknowns remain. Analysis and answering MAY proceed only after the problem is sufficiently clear (or the user explicitly asks to proceed / answer now).

#### Scenario: Hold answer while clarifying

- **WHEN** the user is still answering clarifying questions and purpose/constraints/success criteria are not yet sufficient
- **THEN** the AI asks the next single clarifying question (or confirms clarity) and MUST NOT deliver the solution or a premature full answer in that same clarification turn

#### Scenario: User asks to proceed early

- **WHEN** the user explicitly asks to skip further clarification and proceed to analysis or an answer
- **THEN** the AI MAY leave clarification and proceed, recording assumed defaults for remaining unknowns

### Requirement: Each clarifying question SHALL include a recommended answer

When `clarifying-question-discipline` requires asking the user one question, the agent MUST include a **recommended answer** or preferred option (with brief rationale) alongside the question when a reasonable default exists, so the user can accept quickly or override. MUST NOT ask a bare open question with no suggested resolution when a reasonable default exists. When the question is legitimately open-ended and no default is knowable, the agent MUST state that no recommendation is offered and why.

#### Scenario: Single-choice question carries a recommendation

- **WHEN** the agent asks a structured single-choice clarifying question
- **THEN** the message includes a recommended option (or stated default) plus the full option list

#### Scenario: No default for open-ended

- **WHEN** the agent asks an open-ended clarifying question and no reasonable default exists
- **THEN** the message states that no recommendation is offered and gives a brief reason

### Requirement: Fact self-check versus decision ask-human SHALL be distinguished

Before asking the user, the agent MUST self-check facts that can be verified from the repo or conversation without user input, and MUST reserve user questions for decisions, preferences, or unavailable context. MUST NOT ask the user for facts the agent can read from files already in scope.

#### Scenario: Readable fact is not asked

- **WHEN** the needed fact is available in an already-referenced file or prior user message
- **THEN** the agent verifies it itself and does not consume the one-question slot asking the user to restate it

### Requirement: Clarifying questions SHALL walk a decision tree by dependencies

When gathering clarification, the agent MUST treat open issues as a **decision tree**: ask about one decision at a time in dependency order so earlier answers reshape later questions. MUST NOT treat purpose → constraints → success criteria as a rigid flat checklist that ignores dependencies. When several independent roots are open, the agent MAY use purpose → constraints → success criteria as the tie-break order among roots.

#### Scenario: Dependent decision waits on prior answer

- **WHEN** decision B depends on the outcome of decision A and both are unresolved
- **THEN** the agent asks about A first (one question), waits for the answer, then asks about B using that answer

#### Scenario: Tie-break among independent roots

- **WHEN** multiple independent decision roots are open with no dependency between them
- **THEN** the agent picks the next question preferring purpose, then constraints, then success criteria

### Requirement: Agent SHALL explore context before burning clarifying-question slots

Before the first clarifying question of a clarification stretch (and when stuck), the agent MUST skim relevant project context (files, docs, recent commits as applicable) and MUST flag multi-subsystem scope for decomposition before refining details of a project that needs to be split. MUST NOT spend early question slots on facts or structure discoverable from the environment.

#### Scenario: Readable context checked first

- **WHEN** clarification is needed and relevant repo context has not been inspected
- **THEN** the agent explores that context before asking the user a clarifying question about facts or structure present there

#### Scenario: Multi-subsystem scope is decomposed early

- **WHEN** the user request clearly spans multiple independent subsystems
- **THEN** the agent helps decompose scope (pieces, relations, order) before deep clarifying rounds on a single overloaded project

### Requirement: Shared-understanding gate before acting on clarified work

After clarification, the agent MUST NOT act on the clarified plan, design, or implementation path until the user confirms shared understanding, or explicitly skips further clarification (in which case assumed defaults for remaining unknowns MUST be recorded). This gate complements — and does not replace — host-level design-approval or execution gates.

#### Scenario: Hold action until confirm

- **WHEN** clarifying questions have resolved the critical unknowns but the user has not confirmed shared understanding and has not asked to proceed
- **THEN** the agent asks for confirmation (or the next single clarifying question) and MUST NOT start implementing the clarified work in that turn

#### Scenario: User skips further clarification

- **WHEN** the user explicitly asks to skip further clarification and proceed
- **THEN** the agent MAY leave clarification, records assumed defaults for remaining unknowns, and proceeds per the host workflow

### Requirement: Open-ended clarifying questions SHALL be allowed when options fake certainty

Structured single-select with a recommended answer remains the preferred shape, but the agent MUST use an open-ended question when forcing fixed options would fake certainty or omit a real decision branch. Platform-agnostic rules still apply (intent description; no hardcoded platform tool).

#### Scenario: Open-ended when options are inadequate

- **WHEN** the critical unknown cannot be honestly reduced to a small option set without hiding a real alternative
- **THEN** the agent asks one open-ended clarifying question (still one per message; include a recommended direction when a default is knowable)
