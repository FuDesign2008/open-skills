## 1. 等价基线（重构前）

- [x] 1.1 写 `skills/goal-driven-queue/scripts/render-html.equivalence.test.mjs`：固定输入覆盖 6 种 kind × 中英文、入口页、评审页、证据页（有图/无图/空证据）
- [x] 1.2 用当前实现采集 SHA-256 基线并写入测试常量，在当前代码上跑绿（记录提交前哈希，作为重构前对照）

## 2. 拆分适配器

- [x] 2.1 新增 `core-bridge.mjs`：core 动态导入、降级桩、`unavailable` 错误，导出适配器所需的 core 符号
- [x] 2.2 新增 `queue-labels.mjs`：`kindLabel`、`chromeLabels`、`shellOptionsFor`
- [x] 2.3 新增 `queue-document.mjs`：`parseDocument` 及其 meta/KPI/章节渲染、`renderDocument`、`renderFile`、`listRunDirs`
- [x] 2.4 新增 `queue-pages.mjs`：`renderEntryPage`、`renderReviewPage`、`renderEvidencePage`
- [x] 2.5 新增 `queue-open.mjs`：`readTrigger`、`openInBrowser`、`maybeAutoOpen`
- [x] 2.6 重写 `render-html.mjs`：facade（导入并再导出队列 API）+ CLI（`VALUE_FLAGS` 单点维护、降级打印路径、入口判断）

## 3. 测试与文档同步

- [x] 3.1 适配器测试的 core 符号改从 `report-output-discipline/scripts/render-core.mjs` 导入；队列 API 仍从 facade 导入
- [x] 3.2 `scripts/human-facing-html-contract.test.mjs` 的文案与 `normalizeTarget(item.image)` 断言改读实际归属文件
- [x] 3.3 更新 `skills/report-output-discipline/reference.md` 中指向适配器的证据锚点（逐条核对指向的函数名，不只检查行号非空）
- [x] 3.4 `goal-driven-queue` 版本 0.18.0 → 0.18.1；重新生成 skills 索引

## 4. 验证

- [x] 4.1 重构后等价测试仍绿（哈希与重构前一致）；若不一致，输出首个差异位置并判定原因
- [x] 4.2 `node --test` 全绿
- [x] 4.3 `openspec validate --all` 通过
- [x] 4.4 `npm run lint:skill-description`、`node scripts/lint-skill-deidentification.mjs --staged` 通过
- [x] 4.5 CLI 冒烟：对临时 Markdown 运行 `render-html.mjs`，确认写出 `.html` 并打印路径；确认 `--kind card` 等取值型 flag 不被当作源文件
- [x] 4.6 逐行核对删除侧 diff，确认删除内容只对应移动到新模块的行，无意外丢失

## 5. 归档与交付

- [x] 5.1 验证报告写入 `verification.md`（含基线与重构后哈希、测试输出摘要、两轮审查结论）
- [x] 5.2 `openspec archive queue-adapter-cleanup` 后核对 skip_specs 生效、主 spec 未被改动
- [ ] 5.3 提交、推送、开 PR；不自动合并，等待用户指定合并方式
