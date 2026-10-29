# Verification — queue-adapter-cleanup

日期：2026-10-30 · Node：v22.22.2（`.nvmrc` = 22）· 分支：`refactor/queue-render-adapter`

## 命令输出（原始摘要）

```text
$ node --test
# tests 164 / pass 164 / fail 0

$ node --test skills/goal-driven-queue/scripts/render-html.equivalence.test.mjs
# tests 1 / pass 1 / fail 0

$ openspec validate --all
Totals: 67 passed, 0 failed (67 items)

$ npm run lint:skill-description
Checked 68 skills: 0 error(s), 0 warning(s)

$ node scripts/lint-skill-deidentification.mjs --staged
✅ pre-commit (--staged):无新增内部标识符。

$ node skills/goal-driven-queue/scripts/render-html.mjs <tmp>/card.md --root <tmp> --kind card --at 2026-01-01T00:00:00.000Z
<stdout> <tmp>/card.html
html_ok=16526 bytes
```

## 字节等价证明

`render-html.equivalence.test.mjs` 对 20 个固定输入取完整 HTML 的 SHA-256：

- `renderDocument`：card / triage / progress / verification / report / document × 中英文（12）
- `renderEntryPage`：中英文，含缺失目标、extras、KPI（2）
- `renderReviewPage`：中文、英文、带 `navHtml` 的导航透传（3）
- `renderEvidencePage`：中文有图、英文有图、空证据（3）

基线在**重构前**采集（旧适配器在 `HEAD` 上跑绿）。重构后又做反向核对：把 `git show HEAD:...render-html.mjs` 放入临时目录（旁边放完整 core 脚本目录，含 `render-mermaid.mjs`），用同一份测试文件运行——同样 20/20 通过。因此哈希不是「重构后自证」，而是新旧实现共用的对照基线。

## 结构性证明

- 函数清单对比：旧文件的 24 个函数全部在新模块中存在（`comm` 无 missing），新增只有 `shellOptionsFor` 与测试辅助函数。
- 删除侧逐行审计：移除 527 行非空内容，16 行未在新模块逐字出现，逐条判定均为有意变更——旧文件头注释、未使用的 `pathToFileURL` 与 `findRepoRoot`、core 桥接注释（迁至 `core-bridge.mjs`）、`baseLabels` re-export（改用 labels 内部导入）、四份重复的 `shellOptions` 组装（收敛为 `shellOptionsFor`）、两份 `valueFlags` 列表（收敛为 `VALUE_FLAGS`）。
- 公共导出面：新增测试断言适配器导出 `renderNav`、`renderDocument`、`renderFile`、`renderEntryPage`、`renderReviewPage`、`renderEvidencePage`、`readTrigger`、`openInBrowser`、`maybeAutoOpen`、`main`。`renderNav` 保留是因为两个宿主 SKILL.md 用它生成评审页/证据页的共享导航块。
- 适配器行数：662 → 127（facade + CLI）；职责模块 582 行（document 241 / pages 174 / labels 88 / open 51 / bridge 28）。

## 连带影响核对

- 宿主路径不变：`<queue-skill-dir>/scripts/render-html.mjs`，导出名不变（OpenSpec 需求 `report-output-format` 第 165 行仍成立）。
- 注册表 7 个证据锚点改指向新模块，并逐条核对指向的函数：任务卡/triage/核对/完成报告 → `queue-document.mjs:178`（`renderDocument`）；进度文档 → `queue-open.mjs:9`（`readTrigger`）；评审/证据 → `queue-pages.mjs:83`（`renderReviewPage`）；长跑页 → `queue-pages.mjs:110`（`renderEvidencePage`）。
- 契约测试改读实际归属文件；`render-html.test.mjs` 删除 3 个从未使用的导入与 1 个未使用的 `render` 辅助函数。

## 审查

- 第 1 轮独立审查：REQUEST CHANGES（Important 1：`renderNav` 导出被移除；Minor 2：`maybeAutoOpen` 默认参数、fixture 矩阵与文档不符）。三项均已修复：恢复 `renderNav` 导出并加导出面测试；去掉 `maybeAutoOpen` 默认参数；补齐英文文档与评审/证据页基线，并把矩阵写准。
- 第 2 轮复核：见 PR 说明或审查回执。

## 未验证 / 剩余风险

- 真实安装形态（`npx skills add --skill goal-driven-queue`）未重跑；安装模型复制整个 skill 目录，新增模块随之分发，路径引用均为目录内相对路径。
- 等价基线覆盖 20 种页面组合，不含 CSS 内容本身；本次未改 CSS。
- 入口页的可用性判定依赖 `fs.existsSync`，测试在临时目录中构造真实文件；未覆盖跨平台路径分隔符差异。
