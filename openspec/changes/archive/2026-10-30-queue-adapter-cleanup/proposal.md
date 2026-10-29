## Why

`skills/goal-driven-queue/scripts/render-html.mjs`（662 行）是第三批遗留的「适配器整理」对象：第一批把通用渲染抽到 `report-output-discipline/scripts/render-core.mjs` 后，这个文件仍同时承担五件事——core 动态加载与降级桩、Markdown 文档解析与版式、入口/评审/证据页、浏览器打开、CLI。具体问题：

1. **边界被 re-export 抹掉**：适配器把 12 个 core 符号再导出，测试也从适配器导入 core 函数，读代码时分不清哪些属于通用渲染、哪些属于队列。
2. **降级逻辑与业务逻辑混写**：`core || {}` 的解构 + 默认桩占据文件头部，每个函数都要穿过这层才能看到。
3. **同一份知识写两遍**：`shellOptions` 组装在四个渲染函数里各写一遍；CLI 的取值型 flag 列表在 `parseArguments` 与错误处理分支里各维护一份，改一个忘另一个就会把 flag 值当成 Markdown 路径打印。
4. **单文件过长**：四个职责混在一起，任何一处修改都要在 600 行里定位。

## What Changes

- 把适配器拆成职责模块，`render-html.mjs` 收敛为 facade + CLI：
  - `core-bridge.mjs`：core 动态加载、降级桩、`unavailable` 错误
  - `queue-labels.mjs`：`kindLabel`、`chromeLabels`（中英文 chrome 文案）
  - `queue-document.mjs`：Markdown 解析、meta/KPI/章节、`renderDocument`、`renderFile`
  - `queue-pages.mjs`：入口页、评审页、证据页
  - `queue-open.mjs`：`readTrigger`、`openInBrowser`、`maybeAutoOpen`
- facade 继续导出宿主使用的公共 API（`renderNav`、`renderDocument`、`renderFile`、`renderEntryPage`、`renderReviewPage`、`renderEvidencePage`、`readTrigger`、`openInBrowser`、`maybeAutoOpen`、`main`），宿主路径与调用方式不变。`renderNav` 保留在适配器导出面上：宿主用它生成评审页/证据页的共享导航块，属于公共契约而非内部符号。
- 移除其余 core 符号的 re-export；测试改为直接从 core 导入通用函数。
- 抽出 `shellOptionsFor(options)` 与共享的取值型 flag 集合。
- **输出零变化**：新增等价测试，以固定输入对全部页面类型做字节级 SHA-256 基线比对；基线在重构前采集，重构后必须一致。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

（无——行为契约不变，本次只调整实现结构与测试导入路径）

## Impact

- **Skill 代码**：`skills/goal-driven-queue/scripts/` 新增 5 个模块，`render-html.mjs` 缩短为 facade；宿主（`goal-driven-queue`、`goal-driven-workflow`）引用的路径与导出名不变
- **测试**：适配器测试的 core 符号导入路径改为 `report-output-discipline/scripts/render-core.mjs`；仓库级契约测试（`human-facing-html-contract.test.mjs`）读取的文案位置改到 `queue-pages.mjs`；新增 `render-html.equivalence.test.mjs`
- **注册表**：`report-output-discipline/reference.md` 中指向适配器行号的 7 个证据锚点随函数位置更新
- **版本**：`goal-driven-queue` 0.18.0 → 0.18.1（内部重构，PATCH）
- **不涉及**：`render-core.mjs`、任何 SKILL.md 正文、任何 OpenSpec 行为需求
