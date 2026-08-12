# Figma 像素保真被 CSS mask 破坏 —— 事件复盘与 Skill 设计草案

> **用途**：记录一次 Agent SPA 顶栏「有 Figma 稿却未准确还原」的真实事件，提炼根因与反模式，供后续抽象为 **Figma / UI 像素保真纪律** Skill 时参考。本文是**案例 + Skill 提纲**，不是已发布的 skill 本体。
>
> **事件日期**：2026-08-11  
> **涉及工程**：agent-spa（`/Users/user/workspace/app/special-dev/agent-spa`）、web-host（panel_hide 配套）  
> **涉及 MR**：
> - [agent-spa !14](https://git.example.com/cowork/web/app/agent-spa/-/merge_requests/14) Phase 2 顶栏  
> - 前置失败实现：同分支初版 `ChatHeader`（CSS `mask` + `currentColor`）  
> - 正例对照：同仓 Phase 1 `WelcomeSuggest`（Figma 导出 SVG + `<img>`）  
> **项目侧沉淀**：`agent-spa/AGENTS.md`「Desktop UI / Figma」铁律已补强（同日）

**文风对齐**：`docs/merge-coverage-gate-bypass-incident.md`（经过 → 根因 → 给 Skill 作者的建议）

---

## 一、事件经过

### 1.1 背景

OpenSpec change `agent-init-ui` Phase 2：实现桌面 Agent 顶栏（标题「AI 助手」、限时体验副文案、参考资料 / 新建会话 / 历史 / 关闭四枚功能 icon）。设计入口见 `figma-design-init.md`，Figma file `1aKaPJann6uM44Ua2cpCsZ`，操作区 node 约 `895:45209`，标题区约 `895:45203`。

项目 `AGENTS.md` **当时已写明**：

- 有稿须 `figma-design-to-code` + `get_design_context`，**像素优先**；
- 图标须下载导出资产进仓，外框与内容尺寸写死；
- **禁止 CSS 色块 / 手绘占位冒充稿面图标**。

Phase 1 `WelcomeSuggest` 已按正确路径落地（sparkle 导出 SVG + `<img width/height>`）。

### 1.2 经过

1. AI 实现 Phase 2：调用了 Figma MCP `get_design_context`，并用 `download_figma_images` 导出四枚 18×18 SVG。
2. 为「暗黑主题跟色」，将 SVG 的 `#37435C`（Fill-8）改成 `currentColor`，再用 Emotion **`MaskIcon`**（`mask: url(svg)` + `background-color`）渲染。
3. VIP 钻标（`895:45206`）未导出，仅文字「限时体验」。
4. 提交/开 MR 前用户目视：**一眼看出 icon 不对**，质疑未走 `AGENTS.md` 约定。
5. `/solve-workflow` 对照 Figma 截图与本地栅格：导出**几何路径大体正确**，偏差主因是 **mask 渲染路径**，不是「下错图」。
6. 选定方案 3（整栏像素对齐）：去掉 mask，恢复 Fill-8 导出色，`<img>` 18×18；补 VIP 10×10；分隔用 CSS 设计 token 描边色。
7. 合入 `release/8.2.90`；复盘后将「准确还原 + 禁止 mask」写入 `agent-spa/AGENTS.md`。

### 1.3 后果

- **验收失败**：功能可用，但视觉不合格；用户信任受损（「写了 AGENTS 却没执行」）。
- **返工成本**：二次 Figma 对照 + 资产重导 + Header 重写 + 再开 MR。
- **流程信号**：调用 MCP ≠ 已还原；缺截图对照门禁时，「看起来做了设计还原」的假阳性很高。

---

## 二、根因分析（5Why）

| 层 | 问题 | 答案 |
|----|------|------|
| 1 | 为什么一眼不对？ | 屏上不是 Figma 线框直出，而是 mask 剪影/色块感。 |
| 2 | 为什么不是直出？ | 用了 CSS `mask` + 背景色，而不是 `<img src={导出.svg}>`。 |
| 3 | 为什么用 mask？ | 想为暗黑模式跟色，把「主题便利」压过「稿面保真」。 |
| 4 | 为什么没被拦住？ | 以为走过 `get_design_context` / 下过 SVG 即合规；**无强制截图对照验收**。 |
| 5 | **根因** | **默认优先级错误**：工程便利（跟主题、少资产）> 像素保真；AGENTS 规则存在但未当作硬门禁执行。 |

### 2.1 双环学习

- **单环**：改成 `<img>` + 原始导出（修症状）。
- **双环**：否定假设「为跟主题可以改渲染管线」；确立「有稿保真优先于主题变色；暗黑不够再备 dark 导出」。

### 2.2 与「没读设计」的区分

| 误判 | 实际 |
|------|------|
| 没调 Figma | 调了 MCP，也导出了 SVG |
| 导出几何全错 | 路径与 node 一致；**交付渲染**错了 |
| AGENTS 没写 | 写了「禁止色块冒充」；执行时用 mask **等价违规** |

---

## 三、正例 / 反例（可复用对照）

### 3.1 正例 — `WelcomeSuggest`（Phase 1）

- Figma 导出 `suggest-sparkle.svg` 进仓；
- `<img src={…} width={15.297} height={14.842} />`（叶尺寸写死，外框 16 容器）；
- 颜色保留稿面渐变，不经 mask。

### 3.2 反例 — 初版 `ChatHeader`（Phase 2）

- 导出后改 `currentColor`；
- `MaskIcon`：`background-color` + `mask: url(svg)`；
- 缺 VIP；无截图对照门禁。

### 3.3 修复后 — `ChatHeader`（合入 tip）

- Fill-8 `#37435C` 保留在 SVG；
- 功能 icon `<img width={18} height={18}>`；VIP `<img width={10} height={10}>`；
- 行为（`panel_hide` / `switchToNewThread`）与视觉解耦，视觉按 AGENTS。

---

## 四、项目侧已落地规则（摘录）

`agent-spa/AGENTS.md`「Desktop UI / Figma」补强要点：

1. **铁律**：有 Figma 稿 MUST 准确还原（像素优先）。
2. MCP 调用 ≠ 已还原；改完必须对照截图验收。
3. 图标：导出 + `<img>` + 写死尺寸；**禁止 CSS mask / 色块 / 手绘冒充**；禁止为跟主题改 `currentColor` 再 mask。
4. 「能跟主题 / 少文件」不得优先于稿面保真。

---

## 五、给 Skill 作者的优化建议

### 建议 1：把「截图对照」定为硬门禁，而非可选 polish

**问题**：只要求「先 get_design_context」会被理解成「调过就行」。

**优化**：Skill 应规定：有稿 UI 合并/宣称完成前，MUST 完成「Figma 截图（或导出栅格）↔ 实现」对照；未对照不得声称像素对齐。

### 建议 2：图标交付白名单 / 黑名单

**白名单**：Figma 导出文件进仓 + `<img>`（或 SVG 组件但 path 来自导出、色值保持稿面）。  
**黑名单**：CSS `mask` 填色、纯 CSS 几何冒充、手改 `currentColor` 再 mask、emoji/占位符图标。

### 建议 3：主题与保真的优先级写死

暗黑/多主题：**先保真简白（或设计指定默认帧）**；不够再 **第二套导出资产**，禁止用 mask 偷主题。

### 建议 4：与现有 Figma / frontend skill 划界

| 已有能力 | 本案例缺口 |
|----------|------------|
| Figma MCP / design-to-code（取上下文、导出） | **保真纪律与验收门禁** |
| frontend-design（视觉品味） | **有稿时禁止「创意替代稿面」** |
| design-approval-gate（实现前批准） | **实现后像素验收** 未覆盖 |

→ 适合新建独立 skill（或扩展现有 design-to-code 的「完成定义」），而非只写进某一业务仓 AGENTS。

### 建议 5：检索触发

Skill 触发词应覆盖：「还原 Figma」「像素对齐」「顶栏 icon」「导出 SVG」「mask 图标」以及改 `src/**` 下 UI 且存在 Figma URL/node 时。

---

## 六、Skill 设计草案（供抽象，非最终 SKILL.md）

> 以下为草案提纲，抽象时可拆成 `SKILL.md` + `reference.md`。

### 6.1 提议名称（候选）

- `figma-pixel-fidelity`（推荐）
- `design-to-code-fidelity-gate`
- `ui-figma-restore-discipline`

### 6.2 一句话职责

在有 Figma node 的 UI 实现中，强制「导出资产直出 + 像素对照验收」，禁止用主题/工程便利改写渲染路径导致稿面失真。

### 6.3 触发（Triggers）

中文：`还原 Figma` / `像素对齐` / `按稿实现` / `顶栏图标` / `设计还原` / `figma 保真`  
英文：`pixel fidelity` / `restore from Figma` / `design fidelity gate`  
情境：用户消息或任务含 figma.com URL / `node-id` / `get_design_context`，且将改 UI 代码。

### 6.4 铁律（Iron Law）

**有 Figma 稿的 UI MUST 准确还原；调用设计工具 ≠ 已还原；截图对照通过前不得宣称完成。**

### 6.5 强制流程（建议 4 步）

1. **Load**：`figma-design-to-code`（或等价）→ `get_design_context`（含截图）。  
2. **Export**：图标/插图下载进仓；保留稿面色值（简白帧权威色）。  
3. **Implement**：Emotion/项目栈适配；图标 `<img>` + 写死外框/叶尺寸；布局对照 token。  
4. **Verify（硬门禁）**：对照 Figma 截图；列出差异；无差异或已修复才进入「完成/开 MR」。

### 6.6 完成定义（DoD）

- [ ] 使用的 node id / fileKey 已记录  
- [ ] 导出资产在仓库内（非仅临时 URL）  
- [ ] 图标未使用 CSS mask / 色块冒充  
- [ ] 外框与内容尺寸已写死  
- [ ] 已对照截图（或用户书面确认像素 OK）  
- [ ] 主题跟色未压过保真（若需 dark，有独立资产或明确 Pending）

### 6.7 反模式目录（写入 reference）

| 反模式 | 为何失败 | 正确做法 |
|--------|----------|----------|
| MCP 走过即合规 | 假阳性 | 截图对照门禁 |
| CSS mask 跟主题 | 线框变剪影 | `<img>` + 双套导出 |
| 导出后改 currentColor 再 mask | 同上 | 保留 Fill token 色 |
| 只对齐结构/间距 | 用户一眼否决 icon | 像素优先含字形 |
| 手绘 SVG「近似」 | 漂移不可追溯 | 必须导出源文件 |

### 6.8 与强依赖关系（草案）

- **前置**：Figma MCP / `figma-design-to-code`  
- **互补**：`design-approval-gate`（写码前）；本 skill（写码后保真）  
- **可选**：`frontend-design` 仅在无稿探索时；有稿时本 skill 优先  

### 6.9 验收用例（抽象 skill 时应用）

1. **回归本事件**：给定 ChatHeader mask 实现，skill 应判定 FAIL 并要求改为导出 `<img>`。  
2. **正例**：WelcomeSuggest 路径应判定 PASS。  
3. **仅调 MCP 无对照**：应判定未完成。

---

## 七、相关路径速查

| 项 | 路径 |
|----|------|
| 项目 AGENTS | `agent-spa/AGENTS.md` → Desktop UI / Figma |
| 正例组件 | `agent-spa/src/desktop/chat/WelcomeSuggest.tsx` |
| 修复后顶栏 | `agent-spa/src/desktop/chat/ChatHeader.tsx` |
| 设计索引 | `agent-spa/figma-design-init.md` |
| 颜色规范 | `agent-spa/docs/ui-design-system.md` |
| OpenSpec | `agent-spa/openspec/changes/agent-init-ui/`（Phase 2 已勾；3–5 仍进行） |

---

## 八、文档维护

- **状态**：案例已合入产品仓；open-skills 已提供双 skill（不再落单一 `figma-pixel-fidelity`）。  
- **架构**：像素级对齐**实现** + **检查**是否对齐 — [`figma-pixel-implement`](../skills/figma-pixel-implement/SKILL.md) / [`figma-pixel-verify`](../skills/figma-pixel-verify/SKILL.md)。调研与边界见 [`figma-pixel-fidelity-research.md`](./figma-pixel-fidelity-research.md)。  
- **下一步**：可选真机 node 跑通 implement → verify；官方 MCP/skill 变更时刷新调研文。  
- **勿**把本文件当成可 install 的 skill；安装物是上述两个 skill 目录。
