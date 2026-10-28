# report-output-format Specification

## Purpose
TBD - created by archiving change report-output-format-contract. Update Purpose after archive.

## Requirements

### Requirement: 产物消费者类别 SHALL 按注册表登记项求值

每个落盘产物 MUST 在产物注册表中登记一个消费者类别。类别 MUST 取自 `machine`、`dual`、`human`，且 MUST 按下列顺序求值，第一条匹配即终止：

1. **`machine`** — 存在一个**非 agent** 的具名程序消费者，它按**字段或协议**读取本产物（解析其中的结构化数据以驱动后续逻辑），且注册表给出该读取点的 grep 模式与命中位置。仅把本产物当作渲染输入（读全文以生成展示）的读取点 MUST NOT 计入本条。
2. **`dual`** — 不存在上述非 agent 程序消费者，但存在一个**具名 agent 消费点**：下游工作流阶段读取本产物以继续流程，或宿主在会话启动时按约定加载本产物（如 `AGENTS.md` / `CLAUDE.md` / `CONTEXT.md`）。注册表给出该消费点的具名出处（skill 名 + 正文行号，或约定文件名 + 文档行）。
3. **`human`** — 以上均不匹配，此为本规则**唯一默认值**。

判定输入 MUST 是注册表条目中已登记的字面值，MUST NOT 依赖 AI 对「谁会读它」的临场判断。注册表条目缺失时 MUST 退回 `human`。

**既有 HTML 契约例外**：在进入上述求值之前，若某产物已有生效的 HTML 视图契约，其类别 MUST 登记为 `human` 并注明「既有契约」，本条对其 HTML 要求既不新增也不禁止。例外清单为：队列的卡片、`triage` 记录、`progress.md`、`verification.md`、验收包内每份引擎完成报告（`reports/<card-slug>.md`）、评审页与证据页；独立长跑运行的评审页与证据页；概念解释页。该清单以注册表为准，MUST NOT 依据推断扩展。

#### Scenario: 门禁脚本消费的产物判为 machine

- **WHEN** 某产物被一个门禁脚本按其路径读取，且注册表登记了该脚本中的 grep 模式与命中位置
- **THEN** 该产物类别为 `machine`

#### Scenario: 仅由下游阶段读取的产物判为 dual

- **WHEN** 某产物没有非 agent 程序消费者，但注册表登记了读取它的下游阶段 skill 名与正文行号
- **THEN** 该产物类别为 `dual`

#### Scenario: 无登记消费者的产物默认判为 human

- **WHEN** 某产物在注册表中未登记任何具名消费者
- **THEN** 该产物类别为 `human`
- **AND** 判定过程不需要证明「不存在消费者」

#### Scenario: 同一产物只登记一个类别

- **WHEN** 某产物同时存在非 agent 程序消费者与下游 agent 阶段消费者
- **THEN** 按规则顺序取 `machine`，`dual` 列留空，不双重登记

#### Scenario: 仅作渲染输入的读取点不计为程序消费者

- **WHEN** 某程序只把一份产物读全文以生成展示，不解析其中的字段驱动分支
- **THEN** 该读取点不计入 `machine` 判定
- **AND** 该产物按其余条件落到 `dual` 或 `human`

### Requirement: 报告类产物 SHALL 以 Markdown 真源派生 HTML

注册表中**类别为 `human`、接入状态为 `接入`、且未标注「既有契约」** 的产物 MUST 同时落盘 Markdown 真源与由其派生的 HTML。Markdown MUST 是唯一编辑入口；HTML MUST 由渲染器从真源生成。本条以注册表字段为唯一边界判据，不使用「交付级报告」等未定义措辞。

例外清单中的条目 MUST 登记为 `未接入`，本条对其不适用。

本轮接入项：技术评审文档、人工测试指南、发布报告。

#### Scenario: 技术评审文档同时落盘两种格式

- **WHEN** `tech-review-doc` 成功写入 `tech-review-{topic}-{YYYY-MM-DD}.md` 且共享渲染器可用
- **THEN** 同目录存在同名 `.html` 派生文件

#### Scenario: 人工测试指南生成派生页

- **WHEN** `test-guide-from-code` 写入 `<feature>_manual_test_guide_<YYYY-MM-DD>.md` 且共享渲染器可用
- **THEN** 同目录存在同名 `.html` 派生文件

#### Scenario: 发布报告生成派生页

- **WHEN** `git-release-finish` 写入 `release-<VERSION>-report.md` 且共享渲染器可用
- **THEN** 同目录存在同名 `.html` 派生文件

#### Scenario: 渲染器不可用时只落盘真源

- **WHEN** 上述任一宿主写入 Markdown 真源，但渲染器无法解析或运行环境缺少 Node
- **THEN** 只落盘 Markdown 真源
- **AND** 宿主打印真源路径并说明降级原因

### Requirement: 派生 HTML SHALL 可重新生成且真源优先

再次生成 MUST 由 Markdown 真源重新渲染并覆盖旧 HTML。手改 HTML MUST NOT 被视为有效变更。

#### Scenario: 真源更新后重新渲染覆盖

- **WHEN** Markdown 真源被修改并再次调用渲染
- **THEN** 派生 HTML 反映修改后的内容

### Requirement: machine 产物 MUST NOT 产出 HTML

类别为 `machine` 的产物 MUST 保持 Markdown 或 JSON，MUST NOT 生成同名 HTML 派生文件。

#### Scenario: 状态文件不生成 HTML

- **WHEN** 工作流写入被下一阶段解析的状态或 ledger 文件
- **THEN** 该文件只有 Markdown 或 JSON 形式

### Requirement: dual 产物 SHALL 保持 Markdown 真源

类别为 `dual` 的产物 MUST 维持 Markdown 为唯一真源。其格式契约 MUST NOT 要求 HTML 作为必需产物，MUST NOT 在工作流阶段中插入强制派生步骤。按需派生 MAY 手动执行，但不构成阶段义务。

#### Scenario: 仅由下游阶段读取的产物保持真源

- **WHEN** 某产物的唯一具名消费者是下游工作流阶段
- **THEN** 该产物保持 Markdown，不因本契约新增 HTML 义务

### Requirement: machine 契约产物 SHALL 保持 Markdown

以字段或协议被程序解析的契约产物（`openspec` 的 proposal / delta specs / design / tasks，以及以结构化字段驱动门禁判定的 living artifact）MUST 登记为 `machine` 并保持 Markdown。本契约对其 MUST NOT 新增 HTML 义务。

#### Scenario: OpenSpec 契约产物不被改写为 HTML

- **WHEN** `opsx-solve-workflow` 产出 proposal / specs / design / tasks
- **THEN** 这些产物保持 Markdown，`openspec validate` 与归档流程不受影响

#### Scenario: 门禁脚本解析的 living artifact 保持 Markdown

- **WHEN** 某 living artifact 的字段被门禁脚本读取并据其退出码判定
- **THEN** 该产物登记为 `machine` 并保持 Markdown

### Requirement: 既有 HTML 契约的记录 SHALL 维持原状

第「产物消费者类别」条列出的例外清单（含 `triage` 记录与验收包内引擎完成报告）MUST 登记为 `human` 并注明「既有契约」。本契约对其 HTML 义务既不新增也不禁止，也不强制其为 HTML 补建 Markdown 真源。

概念解释页（由自带 shell 直接写出、无 Markdown 真源）同属既有契约，MUST 一并登记。例外条目的消费证据列 MUST 写「既有契约（读取点见 `<路径:行号>`）」，不参与 `machine` 判定。

#### Scenario: 队列阶段记录保持原有 HTML 契约

- **WHEN** 队列为 `progress.md` 或 `verification.md` 生成 HTML 视图
- **THEN** 该行为按队列自身契约执行，不被本契约豁免或禁止
- **AND** 不要求为其补建 Markdown 真源

#### Scenario: 概念解释页不被要求补建真源

- **WHEN** `explain-clearly` 直接写出一个 HTML 页面
- **THEN** 该页面按自身契约存在，本契约不要求它为 HTML 另建 Markdown 真源

### Requirement: 终端与对话级结论 SHALL NOT 进入 HTML 契约

仅在对话中呈现的阶段结论、验证结论、审查结论 MUST NOT 被要求生成 HTML。本契约只管辖注册表中登记的落盘产物。

#### Scenario: 阶段结论留在对话

- **WHEN** 工作流在对话中输出某一阶段的结论
- **THEN** 不生成任何 HTML 文件
- **AND** 该结论不出现在注册表中

### Requirement: 报告类 HTML MUST 由共享渲染器生成

本契约管辖的报告类 HTML MUST 由共享渲染器从 Markdown 真源生成。宿主 MUST NOT 手写报告类 HTML。

渲染器 MUST 相对于**加载本纪律 skill 的目录**解析（`<skill-dir>/scripts/render-core.mjs`），调用形态为 `node <path> <source.md> [--root <dir>] [--at <iso>]`，与现有渲染器 CLI 一致。当宿主无法确定该目录时，MUST 向用户询问已安装 skill 的路径；MUST NOT 猜测。

需要 `renderReviewPage` / `renderEvidencePage` 的宿主（独立长跑运行）MUST 按**加载 `goal-driven-queue` skill 的目录**解析其 adapter（`<queue-skill-dir>/scripts/render-html.mjs`），而不是 core——这两个函数留在队列 adapter 内。该解析同样 MUST NOT 依赖仓库检出相对路径。

`<skill-dir>` 不可得且用户无法提供、或运行环境缺少 Node 时，宿主 MUST 打印 Markdown 真源路径并说明原因，MUST NOT 手写 HTML 兜底。

本要求不适用于既有独立 HTML 页面契约（概念解释页）与队列自身验收视图。

#### Scenario: 宿主在用户仓库中调用渲染器

- **WHEN** 一个全局安装的宿主在用户自己的仓库里渲染报告
- **THEN** 渲染器按 skill 安装目录解析成功，不依赖仓库检出内相对路径

#### Scenario: 渲染器不可用时降级

- **WHEN** 渲染器无法解析或运行环境缺少 Node
- **THEN** 宿主打印 Markdown 真源路径并说明降级原因，不手写 HTML

### Requirement: 渲染器 SHALL 将 Mermaid flowchart 预渲染为内联 SVG

渲染器 MUST 把 `mermaid` 围栏中的 `flowchart` / `graph` 图预渲染为内联 `<svg>`，MUST NOT 依赖运行时脚本或外部服务。支持的子集 MUST 至少覆盖：

- 方向：`TB` / `TD` / `LR` / `BT` / `RL`
- 节点形状：`[text]` 矩形、`(text)` 圆角、`{text}` 菱形、`([text])` 体育场、`((text))` 圆形
- 边：`-->`、`---`、`--x`、带 `|label|` 标签的边
- `subgraph` 分组，含带引号的组标题

降级粒度 MUST 为**整图**：受支持的图类型中若出现未支持的构造（`&` 链、`classDef` / `style` / `linkStyle`、节点文本内的 HTML 标签如 `<br/>`），渲染器 MUST 输出可见降级标记并保留该图原始代码，MUST NOT 丢弃该构造后继续渲染。

#### Scenario: flowchart 渲染为内联 SVG

- **WHEN** 渲染器遇到 `mermaid` 围栏且内容为 `flowchart TB` 图
- **THEN** 输出包含内联 `<svg>`，节点与边可见
- **AND** 输出不含 `<script>` 与外部资源引用

#### Scenario: 体育场与圆形节点被渲染

- **WHEN** 图中节点写作 `([开始])` 或 `((结束))`
- **THEN** 该节点渲染为对应形状，不触发降级

#### Scenario: 不支持的图类型显式降级

- **WHEN** 渲染器遇到 `sequenceDiagram` 或其他未支持的图类型
- **THEN** 输出可见的降级标记并保留原始代码文本
- **AND** 不把它当作普通代码块静默输出

#### Scenario: 受支持类型内的未支持构造整图降级

- **WHEN** `flowchart` 图含 `classDef` 声明或节点文本内的 `<br/>`
- **THEN** 整图输出可见降级标记并保留原始代码
- **AND** 不静默丢弃该构造后继续渲染

#### Scenario: 技术评审模板的全部图可渲染

- **WHEN** 渲染 `skills/tech-review-doc/template.md` 中的四个 `flowchart` 示例
- **THEN** 四者均产出内联 `<svg>`，无一个落入降级标记

### Requirement: 渲染器通用行为 SHALL 遵循本节

本条是渲染器通用行为的唯一权威，其他 capability 引用本节而不另持副本。

渲染器 MUST 只用 Node 内建模块，MUST NOT 引入运行时依赖。它 MUST 转义 `&`、`<`、`>`、`"`、`'`，MUST NOT 透传源内容中的原始 HTML。它 MUST 只用内联 CSS，并 MAY 输出恰好一个由渲染器自有的内联 `<script>` 专用于单图灯箱；MUST NOT 引用外部样式表、脚本、字体、图片或 `@import`；正文中的 `http`/`https` 内容锚点允许保留。源内容中的 HTML（含 `<script>`）MUST 保持转义文本，MUST NOT 执行。

它 MUST 归一化每个链接目标（去首尾空白、去控制字符、小写 scheme），MUST 只允许相对路径（不以 `/` 或 `//` 开头）、片段、`http`、`https`、`mailto`；MUST 拒绝 `javascript:`、`data:`、`vbscript:`、`file:`、根相对路径、协议相对 URL 与反斜杠前缀路径，MUST 转义属性值。

它 MUST 按未转义的 `|` 切分表格单元格，识别单元格内的 `\|`，并保护代码片段不被链接重写。它 MUST 只在目标视图已存在且不在代码围栏内时，把相对 `.md` 链接重写为对应 `.html`。它 MUST 在页面 footer 记录源路径与生成时间，对相同源与相同生成时间 MUST 产出确定性结果，MUST NOT 修改 `.md` 源文件。

#### Scenario: 内容被转义且页面自包含

- **WHEN** 源内容含 `<script>`、`&`、引号或 `<batch-id>` 这类占位符
- **THEN** 输出对其转义，只含内联 CSS 与至多一个渲染器自有的内联灯箱脚本，且不含外部样式表、脚本、字体、图片或 `@import`

#### Scenario: 危险 scheme 与属性被拦截

- **WHEN** 源内容含 `javascript:`、`data:`、`vbscript:` 链接，或目标含特殊字符的链接
- **THEN** 渲染器拦截该 scheme 或转义属性值

#### Scenario: 链接重写跳过代码围栏与缺失目标

- **WHEN** 源内容链接到另一个 `.md` 文件
- **THEN** 仅当对应 `.html` 视图存在且该链接不在代码围栏内时才重写

### Requirement: 派生 HTML SHALL 内联全部图形

生成的 HTML MUST 把图形内联进页面（SVG 或等效），MUST NOT 以外部图片引用呈现图形。样式的内联与 footer 的追溯要求由上一条「渲染器通用行为」持有，本条不重述。

#### Scenario: 页面无外部图片引用

- **WHEN** 检查任一派生 HTML 的源码
- **THEN** 不存在指向外部图片的 `src=` 引用
- **AND** 图形以内联 SVG 或等效形式存在

### Requirement: 宿主 SHALL 抑制派生 HTML 进入变更集合

宿主生成派生 HTML 时 MUST 确保其不进入版本控制变更集合，使纯文档变更不被判定为 UI 行为变更。实现方式 MUST 为以下之一，并在注册表登记：

- 在产物所在仓库写入 ignore 规则；或
- 生成到已被忽略的目录。

ignore 规则写入用户仓库时，MUST 只追加与该产物相关的行，MUST NOT 覆盖已有内容。

ignore 规则无法写入时（只读仓库、权限不足、用户拒绝修改），宿主 MUST 在对话中说明该情况并给出建议追加的规则行，MUST 继续生成 HTML，MUST NOT 静默跳过这一步。该分支下派生 HTML 仍是未跟踪且未被忽略的文件，按 `runtime-verification-discipline` 的口径它属变更集合，UI 验证义务仍然生效；宿主 MUST 在说明中一并指出这一点。

队列的 `.goal-driven/**/*.html` 视图 MUST 由队列宿主在目标仓库追加 ignore 规则；仅靠交付阶段不暂存这些路径，不满足本条。

#### Scenario: 纯文档变更不触发 UI 验证义务

- **WHEN** 一次变更只修改报告 Markdown 真源并重新生成派生 HTML
- **THEN** 变更集合只含 Markdown，派生 HTML 不出现
- **AND** 不因派生 HTML 触发打开 UI 的检查

#### Scenario: ignore 规则写不进时明确告知

- **WHEN** 宿主无法向产物所在仓库写入 ignore 规则
- **THEN** 对话中说明该情况并给出建议追加的规则行
- **AND** 仍生成 HTML，不静默跳过

### Requirement: 宿主 SHALL 把 HTML 路径告知读者

生成 HTML 后，宿主 MUST 在对话中给出派生文件路径。是否打开浏览器由宿主能力决定。

#### Scenario: 生成后报告路径

- **WHEN** 宿主完成报告与 HTML 派生
- **THEN** 对话中同时给出 Markdown 路径与 HTML 路径

### Requirement: 产物注册表 SHALL 覆盖全库且字段可核验

共享纪律 skill MUST 维护一份产物注册表。每条 MUST 包含：产物名称、产生 skill、类别、真源格式、派生格式、落盘路径、抑制方式、接入状态。

「消费证据」列按类别取值：`machine` MUST 填非 agent 读取点的 grep 模式与命中位置；`dual` MUST 填下游阶段 skill 名与正文行号；`human` MUST 留空，例外条目除外（按上条写「既有契约（读取点见 `<路径:行号>`）」）。

接入状态 MUST 取下列之一：

- `接入` — 本契约管辖，已落盘 Markdown 真源与派生 HTML。
- `sink 待定` — 有人读需求但尚无落盘路径，本轮不生成 HTML。
- `未接入` — 不受本契约派生义务管辖：既有 HTML 契约条目，或本轮不纳入的产物。

注册表 MUST 覆盖所有 skill 产出的**登记类产物**：报告、记录、契约、状态文件。

以下不计入登记范围，产物所属 skill 也不因此被要求登记：源代码与测试文件、版本声明配置（如 `.nvmrc`）、写入外部系统的内容（Jira 评论、PR/MR 描述）、证据截图、解包载荷、会话内临时脚本。

无登记类产物的 skill MUST NOT 为凑数登记空行。

覆盖率 MUST 由契约测试断言，oracle 为**双锚点**：

- 正向：注册表中每个条目声明的产生 skill MUST 存在于 `skills/*/SKILL.md`。
- 反向：测试 MUST 持有一份「无落盘产物」的 skill 白名单常量，其维护位置与增删理由 MUST 写在注册表首部；`skills/*/SKILL.md` 全集减去该白名单后，每个 skill MUST 至少有一条注册表条目。同时每个 `sink 待定` / `未接入` 条目 MUST 能在该差集中找到对应的 skill（双向对应）。

白名单是唯一的必然漏项来源，其增删 MUST 在注册表中留下理由。正向锚点防止登记不存在的 skill，反向锚点防止漏登有产物的 skill。

#### Scenario: 新增产物先登记再接入

- **WHEN** 某 skill 新增一个落盘产物
- **THEN** 该产物先在注册表登记类别、路径与接入状态，再在宿主正文中引用

#### Scenario: 无落盘路径的产物标为 sink 待定

- **WHEN** 某报告 skill 只有输出模板而没有落盘路径
- **THEN** 注册表将其接入状态标为 `sink 待定`，该轮不生成 HTML

#### Scenario: 注册表覆盖率由测试断言

- **WHEN** 契约测试运行
- **THEN** `skills/*/SKILL.md` 全集减去白名单后的每个 skill 至少有一条注册表条目
- **AND** 每个 `machine` / `dual` 条目的消费证据非空
- **AND** 每个非例外的 `human` 条目消费证据为空，每个例外条目消费证据以「既有契约」开头

#### Scenario: 纯纪律 skill 不登记空行

- **WHEN** 某 skill 不产生任何落盘产物
- **THEN** 它不出现在注册表中，契约测试不为它报缺失

### Requirement: 宿主 SHALL 声明对纪律 skill 的强依赖

加载共享纪律 skill 的宿主 MUST 在其 frontmatter `dependencies` 中声明该依赖并做前置检查；缺失时 MUST 中止并给出安装命令。

仅 import 渲染器而不加载纪律正文的宿主（队列 adapter）MUST 声明依赖，且渲染器缺失时 MUST 降级为打印 Markdown 路径，MUST NOT 因模块 import 失败而崩溃。纪律 skill 自身缺失时应报错中止。

#### Scenario: 缺失依赖时中止

- **WHEN** 宿主启动时共享纪律 skill 未安装
- **THEN** 前置检查失败，宿主中止并打印安装命令

#### Scenario: 队列 adapter 渲染器缺失时降级

- **WHEN** 队列 adapter 所在环境缺少共享渲染器模块
- **THEN** 队列打印已生成的 Markdown 路径并说明原因
- **AND** 不以模块 import 抛错的方式中断整个流程
