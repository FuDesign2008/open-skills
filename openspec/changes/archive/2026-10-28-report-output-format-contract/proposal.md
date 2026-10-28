## Why

Skill 产出的落盘产物没有格式边界。全库 67 个可分发 skill 中，只有 3 个能生成 HTML（`goal-driven-queue`、`goal-driven-workflow`、`explain-clearly`），人类需要阅读和传阅的**落盘报告**全部停留在 Markdown。唯一可用的通用渲染器寄居在 `goal-driven-queue`（一个队列编排器）内部，任何非队列 skill 想产出 HTML 都必须依赖一个编排器——依赖方向倒置，因此无人引用。

同时，渲染器内的路径按仓库检出相对路径书写（`skills/goal-driven-queue/scripts/render-html.mjs`）。全局安装后实际位于 `~/.agents/skills/`，在用户自己的仓库中该路径一律解析失败——即使有人想引用也跑不起来。

需要一条按「消费者」而非「skill」决定格式的契约：给人看的落盘报告写 HTML，给机器看的写 Markdown/JSON，人机双读的保持 Markdown 真源。对话中的阶段结论不在此列。

## What Changes

- 新增共享纪律 skill `report-output-discipline`：定义 `human` / `machine` / `dual` 三类的**正证据**判定规则（默认 human，machine/dual 须登记可核验的具名消费者），规定报告类产物的格式契约，并维护覆盖全库的产物注册表。该 skill 是能力 `report-output-format` 的承载者——skill 名与 capability 名不同，本文后续引用恒定使用这两个名字。
- 从 `goal-driven-queue` 抽出渲染器的**通用部分**为 `render-core.mjs` 放入共享 skill；队列保留 adapter 并通过 import 复用。这是一次职责拆分（通用能力迁出 + 所有权转移），不是文件搬家。队列专属逻辑（progress 协议、`runs/` 扫描、验收视图、auto-open 策略）本轮留在原位不动。
- 共享渲染器新增 Mermaid `flowchart` 预渲染为内联 SVG。全库仅 `tech-review-doc` 使用 Mermaid（4 处，均为 `flowchart`），而现有渲染器对其零支持——不支持时图会退化为代码文本，与本变更目的相反。
- 渲染器定位改为相对**加载本 skill 的目录**解析，不再依赖仓库检出内相对路径。
- 建立**全库产物注册表**（`reference.md`）：逐条登记产物名、产生 skill、消费者类别、真源/派生格式、落盘路径、接入状态（`接入` / `sink 待定` / `未接入`）。覆盖范围为**所有有落盘产物的 skill**（全库 67 个可分发 skill 的子集）；无落盘产物的纯纪律 skill 不登记空行。
- 第一批迁移三个**已有固定落盘路径**的交付级报告生产者：`tech-review-doc`、`test-guide-from-code`、`git-release-finish`。宿主正文只声明注册表条目名并引用纪律 skill。
- 派生 HTML 一律纳入 gitignore，避免进入变更集合被误判为 UI 行为变更。
- 既有契约产物按可核验证据分类，均维持 Markdown 真源、不建立派生流水线：OpenSpec 四件套与 figma living artifact 被 CLI / 门禁脚本按字段解析，登记为 `machine`；`.jira-fix/*.md`、上下文 ledger 由下游工作流阶段读取，登记为 `dual`。

## Capabilities

### New Capabilities

- `report-output-format`: 按消费者类别决定落盘格式的契约——正证据判定规则、报告类产物的 Markdown 真源 + HTML 派生、派生可重生成、machine 禁止 HTML、dual 保持真源、对话级结论排除、共享渲染器与目录相对解析、自包含与可追溯、派生 HTML 不入版本控制、路径告知、全库注册表与接入状态、宿主强依赖声明。

### Modified Capabilities

- `tech-review-doc`: 输出路径要求原只定义唯一 `.md` 文件；新增同名派生的 `.html` 兄弟文件。
- `runtime-verification-discipline`: `.html` 路径后缀信号会命中变更集合；需明确被版本控制忽略的派生报告 HTML 不构成 UI 行为变更。
- `goal-queue`: 队列记录 HTML 视图需求中的通用渲染器条款（转义、链接归一化、自包含、footer、确定性）改为指向 `report-output-format` 的薄引用，避免同一行为由两处权威持有；队列特有的视图集合、路径、生成时机、auto-open 规则保留在本地。

## Impact

- **新增 skill**：`skills/report-output-discipline/`（`SKILL.md`、`reference.md` 注册表、`scripts/render-core.mjs` 及其测试）
- **渲染器拆分**：`skills/goal-driven-queue/scripts/render-html.mjs` 改为 import `render-core.mjs`，队列专属函数留原位；`render-html.test.mjs` 拆分，通用 24 项迁至 core 测试、队列 18 项保留（合计 42）
- **渲染器等价验证**：仓库内无现成夹具，须先从现有 37 个测试提取输入并落盘为夹具；拆分前后用该夹具做**字节级输出 diff**，一致方切换
- **宿主 skill**：`tech-review-doc`、`test-guide-from-code`、`git-release-finish` 增加注册表条目引用、`report-output-discipline` 强依赖声明与渲染调用
- **既有队列宿主**：`goal-driven-queue`（adapter import core）须声明依赖并在缺模块时降级打印路径；`goal-driven-workflow`（`SKILL.md:181`）依赖的是队列 adapter 的 `renderReviewPage` / `renderEvidencePage`（这两个函数留在队列侧），须改为按**加载 `goal-driven-queue` skill 的目录**解析，而非指向 core
- **测试**：新增 `scripts/report-output-format-contract.test.mjs`（注册表字段完整性 + 覆盖率 + Mermaid 渲染断言）；同步 `scripts/human-facing-html-contract.test.mjs:53,125`（锚定旧路径）、`scripts/review-html-flow-contract.test.mjs`
- **文档**：`AGENTS.md` 的 Skill 清单新增 `report-output-discipline` 行，并在「Skill 调用分层」表登记为共享纪律（`user-invocable: false`）。依赖声明以各 skill 的 frontmatter 为准，覆盖五个引用方（`tech-review-doc`、`test-guide-from-code`、`git-release-finish`、`goal-driven-queue`、`goal-driven-workflow`）；其中 `test-guide-from-code` 与 `git-release-finish` 在 Skill 清单表中无行次，依赖由 frontmatter + 生成的 `skills-index.md` 承载，需要时再补表行。`skills/goal-driven-queue/{SKILL.md:65,reference.md:110,reference.md:112}` 与 `skills/goal-driven-workflow/SKILL.md:181` 的路径引用与渲染器散文副本改为薄引用；`docs/generated/skills-index.md` 由 pre-commit 重新生成
- **渲染器行为契约归属**：转义、链接归一化、自包含、footer、确定性等通用条款以 `report-output-format` 为唯一权威；`openspec/specs/goal-queue/spec.md:657` 的对应段落降为指向该权威的薄引用，不保留第二份全文
- **版本控制**：宿主在产物所在仓库确保派生 HTML 被忽略（本仓 `.gitignore` 仅覆盖本仓；用户仓库需追加单行规则）
- **保持原样**：`explain-clearly` 的独立 HTML 页面契约（自带 shell、无 Markdown 真源）不受本契约约束，为本契约的显式例外
- **后续轮次**（本轮不做）：`essence-diagnosis`、`competitive-research`、`evolution-review`、`perf-optimize-workflow` 报告需先定义 sink（注册表标 `sink 待定`）；队列 adapter 的进一步整理；Mermaid 的 `sequenceDiagram` 等其余图类型
