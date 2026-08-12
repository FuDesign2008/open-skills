# Figma 像素保真调研：MCP 能力、官方/社区 Skill、双 Skill 架构

> **用途**：为一对即将新建的 open-skills（**像素级对齐实现** + **对齐检查**）提供一手调研沉淀。本文是**调研笔记 + 架构草案**，不是可安装 skill。  
> **核验日期**：2026-08-11（同日用 **ego-browser** 补读 Rate limits / Create skills / MCP vs Agent）  
> **关联**：[`figma-pixel-fidelity-mask-incident.md`](./figma-pixel-fidelity-mask-incident.md)（事件复盘与早期单 skill 草案；本文将目标修订为**两个** skill）  
> **文风**：证据 → 边界 → 对 open-skills 的启示（对齐 `merge-coverage-gate-bypass-incident.md`）

**能力断言口径（铁律 8）**：凡写「能/不能」均标注来源类型——`一手：本地 skill/MCP schema` / `一手：官方文档或官方仓库 raw` / `二手：社区 README/博客`。

---

## 0. 目标修订（相对 incident 草案）

| 原草案 | 现目标 |
|--------|--------|
| 单一 `figma-pixel-fidelity` | **两个**可独立触发的 skill |
| 实现与验收揉在一起 | **实现 skill** 管取稿→适配→资产直出；**检查 skill** 管运行态是否对齐 |

**候选命名**（落 skill 时再经 `skill-creator` 定稿；须 kebab-case，见 `openspec/specs/skill-naming`）：

| 角色 | 候选 id | 触发语义（须含中文） |
|------|---------|----------------------|
| 实现对齐 | `figma-pixel-implement` | 「像素级还原」「按稿实现」「Figma 对齐实现」 |
| 检查对齐 | `figma-pixel-verify` | 「检查像素对齐」「对照 Figma 验收」「设计保真检查」 |

**与各 Agent 自带 Figma→code 引导的关系**：部分产品（如 Cursor 插件）会带 `figma-design-to-code` 一类 skill，规定「Figma→代码」时先取 design context。本仓两 skill **不替代**这类引导，也**不把任一产品的 skill id 当成通用硬依赖**。实现 skill 的硬门禁是 **Figma design-context / MCP 可用**；若当前 Agent 有同角色引导则加载，没有则直接走 MCP + 本仓规格表/资产纪律；检查 skill **只做验收**，可被独立唤起。

---

## 1. 官方：MCP 做什么 / 不做什么

### 1.1 MCP vs Agent（一手：官方 Q&A）

来源：[What the MCP sends vs. what the agent does](https://developers.figma.com/docs/figma-mcp-server/mcp-vs-agent/)

| MCP 做 | MCP 不做 |
|--------|----------|
| 抽取结构化设计上下文（frame、组件、布局、token、变量等） | 生成最终可提交代码 |
| 把上下文交给 Agent 作起点 | 默认理解你们的设计系统约定 |
| 通过 Code Connect / 变量语法提升复用 | 自动修复适配问题 |

> 官方原意：**不是** one-click「design to perfect code」。

来源：[The server keeps returning web/react code](https://developers.figma.com/docs/figma-mcp-server/server-returning-web-code/)：`get_design_context` 用类 React 结构是为了让 LLM 好翻译；**生产栈映射是 Agent 的事**。

**启示**：像素级还原的契约必须落在 **Skill / Agent 流程**，不能假设 MCP 工具内置保证。

### 1.2 Tools and prompts 全景（一手：官方 Tools 页）

来源：[Tools and prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)（2026-08-11 抓取）

#### A. 对「Figma→代码保真」高相关

| 工具 | 官方用途 | 保真角色 |
|------|----------|----------|
| `get_design_context` | 层/选区设计上下文；默认 React+Tailwind 形态 | **主取稿**；参考不是成品 |
| `get_screenshot` | 选区截图，帮助布局保真 | **看见稿**；建议默认开 |
| `get_metadata` | 稀疏 XML：id/名/类型/位置/尺寸 | 大稿拆分 / 几何大纲 |
| `get_variable_defs` | 选区 variables/styles | **数值规格源**（测量应对齐这里） |
| `get_motion_context` | 动效关键帧 / easing / 片段 | 动效保真（静态上下文之后） |
| `download_assets` | 导出渲染 + 原始 fills（remote） | **进仓交付**；与 screenshot 职责分离 |

#### B. 官方对 `get_screenshot` vs `download_assets` 的拆分

| | `get_screenshot` | `download_assets` |
|--|------------------|-------------------|
| 何时 | Agent 要**看**设计 | 要**保存/交付/跨文件传**资产 |
| 输出 | PNG | URL（多格式 / 原图） |
| 节点 | 单节点 | 最多 20 |
| 原图 | 否（重渲染） | 是（raw） |

#### C. 设计系统复用（间接抬保真，不替代验收）

`get_code_connect_map` / `get_code_connect_suggestions` / `get_context_for_code_connect` / `send_code_connect_mappings` / `add_code_connect_map` / `search_design_system` / `get_libraries`

#### D. 反向 / 画布写（本仓双 skill 默认不主路径）

`use_figma`、`generate_figma_design`、`upload_assets`、`create_new_file`、diagram / shader 等。

#### E. MCP Prompt

`create_design_system_rules`：生成规则文件帮翻译——**不是**运行时像素门禁。

### 1.3 Code Connect（一手：官方 Code Connect integration）

来源：[Code Connect integration](https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/)

- 有映射时，`get_design_context` 会插入 `<CodeConnectSnippet>`（设计属性、import、snippet、自定义 MCP instructions）。
- CLI 映射通常带更丰富实现细节；UI 映射可「Add instructions for MCP」。
- **提升复用与一致性**；**不证明**运行态像素对齐。

**启示**：实现 skill 应写「有 Code Connect 则优先复用映射组件」；检查 skill 仍须测**渲染结果**，不能用「映射存在」当作 PASS。

### 1.4 Rate limits & access（一手：官方 docs，ego-browser 实读）

**正确 URL**（侧栏 Q&A → Rate limits & access；注意 slug 是 `rate-limits-access`，不是 `rate-limits-and-access`）：

https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/

> 2026-08-11：静态 `WebFetch`/`curl` 曾打到错误 slug 或 404；用 **ego-browser** 打开侧栏链接触达正文。以下表格摘自该页 `article` 文本。

| Seat \\ Plan | Starter | Professional | Organization | Enterprise |
|--------------|---------|--------------|--------------|------------|
| **View, Collab** | Up to **6/month** | Up to **6/month** | Up to **6/month** | Up to **6/month** |
| **Dev, Full** | —（页表未给 Starter 下 Dev 行；见下） | Up to **200/day** + **10/min** | Up to **200/day** + **15/min** | Up to **600/day** + **20/min** |

页内说明补充：

- Per-minute 限额与 **daily/monthly tool call** 限额叠加适用。
- **读 Figma 数据的 MCP 工具**计入限额；部分工具**豁免**，页上点名：`add_code_connect_map`、`generate_figma_design`、`whoami`。
- 升档建议：Starter（6/月）→ Pro/Org/Enterprise 且拿 Full/Dev；View/Collab → Full/Dev；Org Full/Dev（200/日）→ Enterprise（600/日）。
- Figma 保留变更权利。

交叉核对：[figma/mcp-server-guide README](https://github.com/figma/mcp-server-guide) 仍写 Starter/View·Collab「up to 6 tool calls per month」、Dev/Full「per minute … same as Tier 1 REST」——与上表 **分钟档**一致；**日限额（200/600）以 `rate-limits-access` 页为准**（README 未展开日限额）。

**启示（写进两 skill）**：

- 大帧先 `get_metadata` 再按子节点取上下文；避免整屏反复 `get_design_context`。
- 检查闭环优先 **本地测量**（`getComputedStyle`），少烧 Figma **读配额**；规格表在实现阶段一次抽齐。
- Starter / View·Collab：**6 次/月**几乎无法支撑「多轮取稿 + 纠偏」——文档中应写明降级（仅本地测量 / 人工对照）。
- `whoami` / `generate_figma_design` 豁免 ≠ `get_design_context` / `get_screenshot` / `get_variable_defs` 豁免。

### 1.5 「Skill: Implement Design」官方页状态

| URL | 2026-08-11 状态（含 ego-browser 复核） |
|-----|----------------------------------------|
| `…/skill-figma-implement-design/` | **Page Not Found**（浏览器实读确认） |
| `…/figma-design-to-code/` | **Page Not Found** |
| 站内搜索「implement design skill」 | 无独立文档命中；相关为 **Create skills** Q&A |
| 可替代一手：[`openai/skills` · `figma-implement-design`](https://github.com/openai/skills/blob/main/skills/.curated/figma-implement-design/SKILL.md)（Help Center 亦链到 Codex Skills） | **一手：官方 curated skill 正文** |
| Cursor / `figma/mcp-server-guide` 的 `figma-design-to-code` | **一手：现行 Cursor 插件路径**（更短，偏取稿约定） |
| [Create skills for the Figma MCP server](https://developers.figma.com/docs/figma-mcp-server/create-skills/) | **一手**：如何写自定义 Figma MCP skill（与本仓双 skill 直接相关） |

**对比摘要**：

| | `figma-design-to-code`（Cursor / mcp-server-guide） | `figma-implement-design`（openai curated） |
|--|------------------------------------------------------|---------------------------------------------|
| 强制先 `get_design_context` | ✅ | ✅ |
| 额外 `get_screenshot` 步骤 | 可选 validate；禁止用其替代主工具 | **独立 Step 3**，作视觉真源 |
| 资产 | 导出 `<img>`、禁手绘 SVG、URL ~7 天过期须进仓 | 禁占位/禁新图标包；跟 MCP 资产端点 |
| CSS `mask` / `currentColor` 改管线 | **未禁止** | **未禁止** |
| 完成后验收 | **无硬门禁清单** | Step 7 **checklist**（布局/字体/色/状态/响应式/资产）——仍偏**目视对照截图**，无强制 `getComputedStyle` |
| 大稿策略 | skill 短；依赖 Agent | metadata → 子节点分治有写明 |

**缺口（两端共同）**：无「运行态数值测量闭环」；无 mask 黑名单——与 incident 完全吻合。

### 1.5.1 Create skills（一手：官方 Q&A，ego-browser）

来源：https://developers.figma.com/docs/figma-mcp-server/create-skills/

官方鼓励用 **自定义 skill** 把可重复 Figma 工作流固化（含「用现有库组件生成屏幕 + **validation steps**」）。写法要点：

- description 当路由规则（含 when NOT to use）
- 正文：When to use / 有序 Instructions / Examples / Common edge cases
- 细节进 `references/`、`scripts/`、`assets/`；主 `SKILL.md` 保持薄
- 高风险动作用 manual-only（`disable-model-invocation`）
- 在**副本文件**上测，勿用关键工作文件

**启示**：本仓双 skill 符合官方「自定义 skill 扩展设计系统工作流」方向；检查 skill 即其所述 validation steps 的独立产品化。

### 1.6 本机 MCP 对照（一手：`plugin-figma-figma`）

与官方 Tools 列表大体一致；本机另见例如 `export_video`、`list_file_components_for_code_connect`、`weave_*`，且 `download_assets` 描述含 **`svgAssets`**（矢量层 SVG）。

写 skill 时：**描述意图**（导出图标、取规格、截图对照），由 Agent 选具体工具名（铁律 6），勿枚举「仅某平台某工具」。

---

## 2. 社区 Skill / 工具深潜

### 2.1 jeltehomminga/figma-design-skills（一手：README + 两份 SKILL.md raw）

仓库：https://github.com/jeltehomminga/figma-design-skills（MIT；可 `npx skills add`）

| Skill | 职责 |
|-------|------|
| `figma-design-extract` | Figma → **design-spec 表**（element×property×Figma 值×repo token×组件）；截图仅视觉参考、**禁止从截图测像素** |
| `design-fidelity-verify` | 消费规格表；运行态 **vision + numeric** 有界循环（~3 轮）；web=`getComputedStyle`；mobile=fiber/CDP |

**可借鉴铁律**：

1. 规格表是实现与验收的**契约**；无表则验收退回目视。
2. `get_variable_defs` 是样式真源；`letterSpacing` 在 Figma 常为 **百分比**（易静默假 PASS）。
3. 无绑定变量的值 = 设计异味；记录 drift，勿为「对齐」硬编码 Figma 绝对值去改 token 包语义。
4. 验收 verdict：`PASS` / `DRIFT` / `HARDCODED` / `VARIANT` / `MISSING`；先辨 **VARIANT（状态不一致）** 再谈数值。
5. 几何容差：盒模型/间距约 **±1px**；色/字重/圆角精确比。
6. **工具无关**：要求「能在运行页 eval JS」的通道，不绑定单一 MCP 名。
7. Org 编排模式：薄宿主 skill + 上游 extract/verify + 本栈 reference——与 open-skills「薄引用」一致。

**与本仓差异**：社区 extract **偏规格抽取**；本仓「实现 skill」还需 **写码纪律**（mask 黑名单、主题优先级、与 `figma-design-to-code` 串联）。检查 skill 可高度对齐 verify 的循环与 verdict。

### 2.2 openai curated `figma-implement-design`（一手：SKILL.md）

见 §1.5。定位：**单 skill 覆盖实现+目视 checklist**；验收弱于 jelte 的测量闭环。适合作为「实现步骤骨架」参考，**不要**当作检查 skill 的完成定义。

### 2.3 Jumposc/verity（一手：README）

https://github.com/Jumposc/verity — **结构化样式树 diff**（Figma REST + DOM `getComputedStyle`），固定代码测、AI 只做消歧/严重度；弱覆盖区（渐变/图/canvas）退回局部截图。

**启示**：检查 skill 的「理想形态」是结构化 diff；open-skills 第一版可用 **Agent + 浏览器 eval 意图** 达到 80% 价值，无需立刻引入完整 verity 依赖。可选在 reference 中「进阶：可用 verity CLI」。

### 2.4 yepengfan/agent-registry · design-verify（一手：README；仓已 archive）

Playwright 抽 computed style ↔ Figma inventory；容差示例：尺寸 ±4px、间距 ±2px、色/字体精确。证明「独立 verify 命令」产品形态可行；archive 状态 → **勿当运行时强依赖**，只作设计参考。

### 2.5 npm `figma-to-code-skill@1.0.5`（一手：registry 元数据；README 空）

描述：1:1 实现 + 自纠正校验环（Claude/Codex）。registry 指向 `pawanpaudel93/figma-to-code`，该 GitHub 仓 2026-08-11 **404**。  
**结论**：营销页/registry 存在，**源码不可复核** → 能力细节标 **不可实证**，不写入本仓契约。

### 2.6 irinabandura/claude-skill-figma-implement

早期搜索有 `/figma-validate`（截图+token+autofix）描述；GitHub 仓 2026-08-11 **404**。  
**结论**：二手摘要可记「业界常见三分：setup / implement / validate」；**不可引用为可安装依赖**。

### 2.7 实践博客（二手，交叉用）

[Vadim · Pixel-Perfect Playwright + Figma MCP (2026)](https://vadim.blog/pixel-perfect-playwright-figma-mcp)：核心主张——**测量层**才是门禁；`toHaveScreenshot` 管回归不管对稿；纯 AI 约 65–80% fidelity。与 jelte/verity **交叉验证**成立。

### 2.8 私有 Skills Hub 上的两份「实现稿」skill（一手：登录后浏览器实读，2026-08-11）

> **脱敏说明（铁律 2）**：来源为需登录的企业内 Skills 目录页；本文**不收录**内网 URL、团队名、合集名。内容按 skill 语义对照公开 openai curated 文本归纳。

两份均为 **「Figma→代码实现」单 skill**（非独立「检查」skill），与 openai `figma-implement-design` 同源谱系：

| 维度 | Hub-A `implement-design` ~v1.0.1 | Hub-B `figma-implement-design` ~v1.0.7 |
|------|----------------------------------|----------------------------------------|
| 语言 | 英文 | 中文为主 |
| 与 openai curated | **几乎逐段同构**（Steps 1–7 + checklist） | 声明 SOURCE 指向 `skills.sh/openai/skills/figma-implement-design`，在其上**加厚** |
| MCP 未就绪 | 提示检查工具 / 启插件 | **第 0 步**：写入 stdio MCP 配置模板（`figma-developer-mcp` + PAT），要求用户重启后再从第 1 步续 |
| Desktop 选区 | 无（或弱） | 有：`figma-desktop` 可用当前选中节点 |
| 截图步骤 | Step 3 作视觉真源 | 同；并强调实现全程保留对照 |
| 资产 | localhost 直用、禁新图标包/占位 | 另要求用导出 PNG 的配套能力；提到 `dirForAssetWrites` 临时 hash 文件 |
| 1:1 表述 | Strive for pixel-perfect | **不允许「大约/差不多」估算** |
| 校验 | Step 7 目视 checklist | **更严**：先 `get_metadata`；对主要子节点分别 `get_design_context` + `get_screenshot`；不匹配**立即改代码再校**；清单含阴影/渐变/精确色 |
| 收尾 | 校验完可结束 | **第 8 步强制**：清理未被引用的 hash 临时资源；**校验通过 ≠ 流程结束** |
| CSS mask / 数值测量 | **无** | **无** |
| 独立 verify skill | **无** | **无** |

**可借鉴（写入本仓双 skill）**：

1. **实现 skill**：沿用 openai/Hub 的「强制有序步骤 + 截图对照清单」骨架；吸收 Hub-B 的「分段取上下文/截图」「不允许差不多」「校验后清理临时资产」。  
2. **检查 skill**：Hub 两份都**没有**把验收拆出去，也没有 `getComputedStyle`——这正是本仓相对价值（对齐 jelte verify）。  
3. **勿照搬**：stdio `FIGMA_API_KEY` 配置块绑定特定 MCP 发行方式；本仓应写「确认 Figma MCP 可用」意图，由宿主环境选用 Cursor 插件 / remote / desktop（铁律 6）。  
4. **勿照搬**：团队/合集元数据、内网安装命令。

**相对本仓目标的缺口（两份共同）**：无规格表契约；无运行态数值门禁；无 mask/`currentColor` 渲染管线黑名单；实现与验收未分离 → 易「调过 MCP + 目视勾清单」假阳性（incident 同构）。

---

## 3. 行业共识（≥2 独立来源）

1. **取稿 ≠ 完成** — MCP/官方 design-to-code 解决上下文；验收必须另有一层。  
2. **优先数值测量，截图辅证** — 截图估像素不可靠；规格来自 variables/metadata。  
3. **有界自纠（约 3 轮）** — 防上下文腐烂。  
4. **pass 单位宜为 token/设计决策**，字面「逐物理像素」在跨 DPR 下易噪声。  
5. **资产直出** — 官方与 Cursor skill 已要求导出 `<img>`；须再堵 **mask / currentColor 改管线**（incident）。

---

## 4. 双 Skill 架构草案（供 skill-creator / 审查用）

```
用户：「按稿实现」
        │
        ▼
┌───────────────────────────┐
│  figma-pixel-implement    │  ← 本仓 skill A
│  硬门禁：Figma design-context/MCP │
│  可选：Agent 自带 Figma→code 引导 │
│  + 规格表 + 资产纪律              │
│  + 写出可测实现                   │
└─────────────┬─────────────┘
              │ 产出：代码 + 规格表（工作笔记/artifact）
              ▼
┌───────────────────────────┐
│  figma-pixel-verify       │  ← 本仓 skill B（可单独唤起）
│  消费规格表；运行态测量   │
│  + 截图并排；有界纠偏报告 │
└───────────────────────────┘
```

### 4.1 Skill A — 像素级对齐**实现**（`figma-pixel-implement`）

**职责**：在有 Figma node 时，把稿落到目标工程，并留下可验收的规格契约。

**建议强制流程**：

1. 确认 Figma design-context / MCP 可用（工具可见）；不可用则停并指导启用（**不**硬编码某一 stdio 安装块、**不**要求 Cursor 专属 skill 名）。若 Agent 自带 Figma→code 引导（名称因平台而异），有则加载；无则继续。  
2. 调用 design-context；大稿：`get_metadata` → 子节点分治。  
3. `get_variable_defs` → 填 **规格表**（映射项目 token，禁止无脑硬编码）。  
4. `get_screenshot` 作视觉参考（细部可提高分辨率意图）；主要区块宜分段截图（借鉴 Hub-B）。  
5. 资产：下载进仓；**白名单** `<img>`/导出 SVG path 保色；**黑名单** CSS mask、色块冒充、手改 `currentColor` 再 mask（来自 incident）。  
6. 主题：默认帧保真优先；暗黑另备导出，禁止 mask 偷主题。  
7. 适配项目组件/token（Emotion 等）；有 Code Connect 则优先；**不允许「大约/差不多」**凑合。  
8. 清理未被引用的 MCP 临时资产（若环境产生 hash 临时文件）。  
9. **退出前**：规格表齐全；**不得**宣称已像素对齐——提示跑 Skill B（或同会话自动进入）。

**不做**：声称「已像素对齐」——该断言只属于 Skill B。

### 4.2 Skill B — **检查**是否对齐（`figma-pixel-verify`）

**职责**：证明运行态匹配规格表 / Figma；输出结构化报告。

**建议强制流程**：

1. 若无规格表 → 先抽（可调用 A 的抽取段或要求用户提供 node）。  
2. Preflight：环境 / 数据形状 / 可 eval JS 的通道 / 构建新鲜 / 鉴权（借鉴 jelte B0）。  
3. 导航到目标 UI；全分辨率捕获。  
4. Vision：稿截图 ↔ 实现截图并排，按类别枚举差异。  
5. Numeric：对规格表逐行测量；容差与 verdict 分类。  
6. 报告 + 可选有界修复建议（**默认不改代码**，除非用户要求「修到对齐」）。  
7. Hard cap ~3 轮后诚实列出 residual。

**平台无关**：正文写「在运行页读取 computed style / 盒模型」意图；Agent 自选 Playwright / Chrome DevTools / 其他。

### 4.3 与本仓已有 skill 的边界

| 已有 | 边界 |
|------|------|
| Cursor `figma-design-to-code` | 仅 Cursor 侧示例；A **可选**加载，非跨平台硬依赖 |
| `design-approval-gate` | **写码前**方案批准；A/B 是 **有稿 UI 的实现/验收** |
| `frontend-design`（外置） | 无稿探索；**有稿时 A/B 优先** |
| `completion-evidence-discipline` | B 的 PASS 声称须附当轮测量证据 |
| `browser-debug-toolkit` | B 可委托浏览器观测，但保真契约写在 B |

### 4.4 依赖与分层建议

| Skill | `user-invocable` | 建议 dependencies |
|-------|------------------|-------------------|
| A implement | `true` | 无强制本仓依赖；硬门禁为 Figma design-context/MCP；Agent 自带 Figma→code 引导可选 |
| B verify | `true` | 可选声明与 A 的「规格表契约」；无则 B 内含轻量抽取 |

宿主工作流（如 solve）**不要**默认强依赖二者（非人人做 UI）；由触发词 / 有 Figma URL 的 UI 任务唤起。

---

## 5. 对 incident 草案的修正清单

| incident §6 原建议 | 本文修正 |
|--------------------|----------|
| 单 skill `figma-pixel-fidelity` | 拆成 **implement + verify** |
| 截图对照硬门禁 | 保留，但升格为 **B 的 numeric+vision**；A 只准备规格与资产 |
| 与 design-to-code 划界 | 写清：A 硬依赖 **design-context 通道**；产品专名 skill 仅可选 |
| 验收用例回归 mask | 归 **B**：mask 实现应 FAIL；`<img>` 正例 PASS |

---

## 6. 证据索引（便于刷新）

| 主题 | URL / 路径 | 抓取日 | 方式 |
|------|------------|--------|------|
| Tools and prompts | https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/ | 2026-08-11 | WebFetch / 上传全文 |
| MCP vs Agent | https://developers.figma.com/docs/figma-mcp-server/mcp-vs-agent/ | 2026-08-11 | **ego-browser** 实读 |
| Create skills | https://developers.figma.com/docs/figma-mcp-server/create-skills/ | 2026-08-11 | **ego-browser** 实读 |
| **Rate limits & access** | https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/ | 2026-08-11 | **ego-browser** 实读（正确 slug） |
| React 中间态说明 | https://developers.figma.com/docs/figma-mcp-server/server-returning-web-code/ | 2026-08-11 | 搜索摘要 + 交叉 |
| Code Connect + MCP | https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/ | 2026-08-11 | WebFetch |
| MCP rate（仓库摘要） | https://github.com/figma/mcp-server-guide/blob/main/README.md | 2026-08-11 | raw |
| REST rate 表 | https://developers.figma.com/docs/rest-api/rate-limits/ | 2026-08-11 | curl（分钟档交叉） |
| openai implement skill | https://github.com/openai/skills/blob/main/skills/.curated/figma-implement-design/SKILL.md | 2026-08-11 | raw |
| Cursor design-to-code | 本机 / figma/mcp-server-guide | 2026-08-11 | 本地 + raw |
| jelte extract/verify | https://github.com/jeltehomminga/figma-design-skills | 2026-08-11 | raw |
| verity | https://github.com/Jumposc/verity | 2026-08-11 | README |
| design-verify (archived) | https://github.com/yepengfan/agent-registry/tree/main/skills/design-verify | 2026-08-11 | README |
| 本仓 incident | `docs/figma-pixel-fidelity-mask-incident.md` | — | — |
| 私有 Hub 两份实现 skill | （内网目录，正文不收录 URL） | 2026-08-11 | **ego-browser** 登录后实读 → §2.8 |

**未实证 / 404（浏览器已确认）**：`…/skill-figma-implement-design/`、`…/figma-design-to-code/` 文档页；`irinabandura/claude-skill-figma-implement`；`pawanpaudel93/figma-to-code` 源码仓。

**刷新方法**：官方 docs 若静态抓取失败，优先用 ego-browser 打开侧栏真实链接，再更新本节。私有 Hub 对照仅记**语义差异**，禁止把内网 URL/团队标识写入仓库。

---

## 7. 下一步（流程）

1. ~~solve-workflow / opsx 审查与双 skill 起草~~ — 已落地可安装 skill：
   - [`skills/figma-pixel-implement/`](../skills/figma-pixel-implement/SKILL.md)
   - [`skills/figma-pixel-verify/`](../skills/figma-pixel-verify/SKILL.md)
2. 可选：真机对一枚可访问 Figma node 跑通 implement → verify 作为验收用例。
3. 官方 Tools / rate / curated skill 变更时刷新 §1 与 §6。

---

## 8. 文档维护

- **状态**：调研已落库；双 skill **已**创建（见 §7）。  
- **刷新**：官方 Tools / rate / curated skill 变更时更新 §1 与 §6 索引日期。  
- **勿**把本文当成可 install 的 skill；安装物是 `skills/figma-pixel-implement` 与 `skills/figma-pixel-verify`。
