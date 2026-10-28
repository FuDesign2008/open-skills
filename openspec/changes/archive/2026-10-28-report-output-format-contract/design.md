# Design: 报告产物格式契约

## Context

全库 67 个可分发 skill 中只有 3 个能产出 HTML。唯一通用渲染器 `render-html.mjs`（1297 行）住在 `goal-driven-queue` 内部，按仓库检出相对路径引用，全局安装与用户仓库场景下都无法解析。

两轴审查确认了三个前提：渲染器与队列的耦合面很窄（约 10 行）；既有人类页面（`explain-clearly`）与队列验收视图各有独立契约；`.html` 路径会触发 UI 验证义务。

## Goals / Non-Goals

**Goals**

- 按消费者类别决定落盘格式，规则单一持有、宿主薄引用
- 报告类 HTML 在任何安装形态下都能生成
- 全库产物有唯一登记处，接入状态可见

**Non-Goals**

- 不把所有 `human` 产物 HTML 化（对话级结论、阶段结论留在原处）
- 不为 `dual` 产物建立派生流水线
- 不改造队列专属视图逻辑
- 不为无 sink 的报告 skill 定义落盘路径

## Decisions

### D1：三分类按注册表字面值求值，默认为 human

`human` 原本写作「无程序消费者」，是负存在命题，无法用一条命令证实，违反门禁输入可核验原则。

第一轮修订曾把 `dual` 定义为「程序消费者 + 位于工作流阶段链」，但该定义自相矛盾：阶段是 agent 行为，不是程序消费者；且 `machine` 是它的严格超集并优先命中，使 `dual` 不可达。

最终口径改为**按消费者性质分层 + 注册表字面值求值**：

| 类别 | 登记证据 | 可核验方式 |
|---|---|---|
| `machine` | 非 agent 程序消费者（CLI / 脚本 / 门禁） | `grep -n '<pattern>' <file>` 命中 |
| `dual` | 具名下游 agent 阶段读取（skill 名 + 正文行号） | 打开该行确认读取动作 |
| `human` | 以上均未登记时的默认值 | 无需证明 |

按顺序求值，第一条命中即终止，故同一产物只登记一个类别。判定输入是注册表条目中已写下的字面值，不存在临场判断。

**被否决的替代**：让 AI 判断「这个产物给谁看」——无法核验，误判为 `machine` 会静默免除 HTML 义务，且下游无任何实证能覆盖。

### D2：渲染器拆分采取 core / adapter，本轮只抽 core

按职责实测：通用约 620 行（Markdown 解析、转义、链接归一化、`renderNav`、文档解析、外壳、`renderFile`、CSS），队列专属约 430 行（`kind`/KPI/`sectionClass` 模板、入口页、评审页、证据页、`readTrigger`、`maybeAutoOpen`）。

组合方式是**队列 adapter import core**，依赖方向为队列 → 纪律，通用侧零队列语义。

**本轮只做抽取与等价验证，不整理 adapter。** 队列专属函数留在原位，仅把通用函数改为从 core 引入。理由是缩小本轮风险面：队列有 2 份 spec、2 个 repo 级契约测试、42 个单元测试，一次动完的回归面过大。

**被否决的替代**：整文件搬迁——共享 skill 会携带约 430 行死代码与队列词汇（任务卡、triage、验收入口），读它的用户可能只想渲染一份技术评审；且下一轮维护者会再次提出分层问题。

### D3：拆分等价性用字节级 diff 证明

仓库内**没有现成夹具目录**（`skills/goal-driven-queue/evals/evals.json` 的 `files` 字段全为空）。等价性验证须先构造夹具：从现有 42 个测试中提取输入（卡片、triage、progress、verification、review、evidence 各一），落盘为固定 `.md` / `.json`。

流程：固定 `--at <iso>`（CLI 已支持，实测输出稳定可哈希）→ 旧渲染器生成基线 → 抽取后走新路径 → 逐字节比对，全部一致才切换引用。

这比审阅更可靠：转义、表格切分、链接重写都是易错区，人眼审 1297 行不可行。

### D4：渲染器按 skill 安装目录解析

旧引用写 `skills/goal-driven-queue/scripts/render-html.mjs`，只在仓库检出内成立。实测：`~/.agents/skills/goal-driven-queue/scripts/render-html.mjs` 存在，`~/.claude/skills/goal-driven-queue` 是指向它的符号链接；在 `/tmp` 下该相对路径解析失败。

新规则：宿主按**加载纪律 skill 的目录**解析 `<skill-dir>/scripts/render-core.mjs`。`<skill-dir>` 由宿主加载 skill 时的位置确定；无法确定时 MUST 询问用户已安装路径，不猜测。降级路径与仓内先例一致（`astrill-control` 的「ask the user for the installed skill path」）。

队列 adapter 跨 skill import core 的解析同此规则；单独安装队列而未安装纪律 skill 时，adapter MUST 降级打印 `.md` 路径，不以模块 import 抛错中断流程。

### D5：派生 HTML 一律不纳入版本控制，责任归宿主

两条理由叠加：

1. 派生文件随真源变动，提交会反复制造 diff 噪声
2. `runtime-verification-discipline` 把未被 ignore 的未跟踪 `.html` 判为 UI 行为，会为纯文档变更强制触发打开 UI + 截图

**本仓 `.gitignore` 不随分发**（实测 `~/.agents/skills/goal-driven-queue/` 只有 `evals/ reference.md scripts/ SKILL.md`），而三个宿主都写在用户仓库。因此忽略义务 MUST 由宿主在生成时落实：向产物所在仓库追加单行规则，或生成到已忽略目录；只追加相关行，不覆盖已有内容。规格层把它写成宿主义务，而不是依赖一个不存在部署机制的文件。

另外区分两类失败，避免格式问题卡死发版：**纪律 skill 缺失** → 中止并提示安装；**Node 或渲染器不可用** → 降级打印 Markdown 路径，流程继续。

### D6：既有 HTML 页面保持独立契约

`explain-clearly` 的 HTML 由自带 shell 直接写出（非 Markdown 派生，允许一个内联播放器脚本）；队列验收视图由队列 adapter 生成。二者各有已声明的页面契约，本契约不覆盖，也不要求它们改道。

新契约的管辖范围以注册表字段界定：**类别 `human` 且接入状态 `接入`** 的产物。不使用「交付级报告」这类未定义措辞作为边界。

### D7：Mermaid flowchart 预渲染为内联 SVG

实测：全库仅 `tech-review-doc` 使用 Mermaid（`template.md` 4 处），且**全部为 `flowchart`**；渲染器对 Mermaid 零支持，围栏只输出 `<pre><code class="language-mermaid">`。自包含要求又禁止运行时加载脚本，本机也无 `mmdc`。

若不处理，第一批迁移出的技术评审 HTML 会把图退化成代码文本——比 Markdown 更难读，与本变更目的相反。

因此渲染器内置 Mermaid `flowchart` → 内联 `<svg>` 转换，覆盖方向（TB/TD/LR/BT/RL）、节点形状（`[]` `()` `{}` `([ ])` `(( ))`）、带标签边、带引号标题的 `subgraph`。

实测 `skills/tech-review-doc/template.md` 四个图：方向 TB/LR/TD，节点含 `[]`、`([ ])`（第 94、98 行）、`{}`，边含 `-->` 与 `-->|label|`，`subgraph Client["客户端"]` 带引号标题——全部落在上述子集内。

超出子集的图（如 `sequenceDiagram`）输出**可见降级标记**并保留原码，不静默当普通代码块。其余图类型的支持列为后续轮次。

### D8：类别与格式规则只登记在注册表

类别、路径、消费证据、抑制方式、接入状态只在注册表判定与修改；宿主正文写注册表条目名 + 对纪律 skill 的引用，不复制判定表。

注册表 MUST 含「消费证据」列（机器类填 grep 模式与命中位置，双读类填下游阶段 skill 名与行号，human 留空），与判定规则一一对应。覆盖率由契约测试断言，不靠人工清点。

## Risks

| 风险 | 影响 | 缓解 |
|---|---|---|
| 抽取改变渲染输出 | 高 | D3 字节级 diff；不一致即回退 |
| Mermaid 子集覆盖不足，图仍退化 | 高 | D7 承诺 flowchart 及体育场/圆形节点；未支持构造整图降级；「模板四图全渲染」已写成 spec 场景 |
| 用户仓库缺 ignore 规则，报告 HTML 触发 UI 验证义务 | 高 | D5 把忽略写成宿主义务，生成时追加单行；契约测试校验宿主正文含该步骤 |
| 宿主新增强依赖，部分安装形态启动中止 | 中 | 区分 skill 缺失（中止）与 Node/渲染器缺失（降级）；`AGENTS.md` 与注册表注明先装纪律 skill |
| 注册表随 skill 演进漂移 | 中 | 接入状态为机械字段；覆盖率由契约测试断言 |
| 三个宿主新增派生步骤被漏做 | 中 | 每个宿主有对应 Scenario，契约测试断言正文含渲染调用与路径告知 |
| 后续轮次的 sink 定义反复 | 低 | 注册表用 `sink 待定` 显式占位，不隐式跳过 |

## Migration

分批，本轮为第一批：

| 批次 | 对象 | 前置 |
|---|---|---|
| 第一批（本轮） | `tech-review-doc`、`test-guide-from-code`、`git-release-finish` | 路径已固定 |
| 第二批 | `essence-diagnosis`、`competitive-research`、`evolution-review`、`perf-optimize-workflow` 报告 | 先定义 sink |
| 第三批 | 队列 adapter 整理；其余 `human` 产物 | 视前两批结果 |

## Open Questions

- 第二批四个 skill 的 sink 路径需逐个确定（是否集中到 `docs/` 下、是否按日期分子目录），本轮不预设。
- `perf-optimize-workflow` 的 `BENCHMARK.md` 具有机器消费特征（下一轮 campaign 读取），类别需按 D1 逐条核验后再定，不默认归 human。
