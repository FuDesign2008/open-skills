## 1. 等价性夹具基线

- [x] 1.1 构造覆盖渲染特性的夹具集（标题/表格/链接/代码围栏/转义/列表/引用/粗斜体），验证 `node --test` 基线全绿
- [x] 1.2 用现有渲染器对每个夹具以固定 `--at 2026-01-01T00:00:00.000Z` 生成基线输出并存档，验证每份输出的 sha256 可复现（重复执行两次哈希一致）

## 2. 抽取共享渲染器 core

- [x] 2.1 新建 `skills/report-output-discipline/scripts/render-core.mjs`，迁入通用函数（`escapeHtml` / `normalizeTarget` / `renderInline` / 表格与列表与块解析 / `renderNav` / `renderShell` / `renderDocument` / `renderMarkdown` / `renderFile` / CSS），验证 `node --check` 通过
- [x] 2.2 在 `render-core.mjs` 内保留 CLI 入口（`node <path> <source.md> [--root <dir>] [--at <iso>] [--file-root <dir>]`），验证对夹具执行后输出文件生成
- [x] 2.3 改造 `skills/goal-driven-queue/scripts/render-html.mjs` 改为 import `render-core.mjs`，队列专属函数（`kindLabel` / `renderKpis` / `renderEntryPage` / `renderReviewPage` / `renderEvidencePage` / `readTrigger` / `maybeAutoOpen` / `listRunDirs`）留原位，验证该文件不含被迁走的通用函数定义
- [x] 2.4 对每个夹具执行字节级 diff：新路径输出与 1.2 的基线逐字节一致，验证 `diff` 无差异（有任何差异即停下修复，不得切换引用）

## 3. Mermaid flowchart 预渲染

- [x] 3.1 在 `render-core.mjs` 实现 Mermaid `flowchart` / `graph` 解析：方向（TB/TD/LR/BT/RL）、节点形状（`[]` `()` `{}` `([ ])` `(( ))`）、边（`-->` `---` `--x` 及 `|label|`）、带引号标题的 `subgraph`，验证 `skills/tech-review-doc/template.md` 四图全部产出 `<svg>`
- [x] 3.2 实现整图降级：受支持类型内出现 `classDef` / `style` / `linkStyle` / `&` 链 / 节点内 `<br/>` 时，整图输出可见降级标记并保留原码，验证 `sequenceDiagram` 与含 `classDef` 的图均落入降级
- [x] 3.3 断言输出无 `<script>`、无外部资源引用，验证 `grep` 结果为空

## 4. 共享纪律 skill 与注册表

- [x] 4.1 创建 `skills/report-output-discipline/SKILL.md`：`user-invocable: false`、`version: "1.0.0"`、单行双引号 description（含中文触发词）、正文正向描述判定规则与宿主引用方式，验证 `npm run lint:skill-description` 通过且长度 ≤1024
- [x] 4.2 创建 `skills/report-output-discipline/reference.md` 产物注册表，逐条填写产物名 / 产生 skill / 类别 / 消费证据 / 真源格式 / 派生格式 / 落盘路径 / 抑制方式 / 接入状态，覆盖所有有落盘产物的 skill，验证表内无空必填列
- [x] 4.3 在注册表首部写明白名单（无落盘产物 skill）的维护位置与增删理由，验证首部存在该说明

## 5. 契约测试

- [x] 5.1 新建 `scripts/report-output-format-contract.test.mjs`：断言注册表正向锚点（条目 skill 存在于 `skills/*/SKILL.md`）与反向锚点（全集减白名单后每个 skill 至少一条），验证测试通过
- [x] 5.2 同一测试断言消费证据规则：`machine`/`dual` 非空、非例外 `human` 为空、例外条目以「既有契约」开头，验证测试通过
- [x] 5.3 同一测试断言 Mermaid：四份模板图产出 `<svg>`、不支持类型产出降级标记、输出无 `<script>` 与外部资源，验证测试通过
- [x] 5.4 拆分 `skills/goal-driven-queue/scripts/render-html.test.mjs`：通用 20 项迁至 `render-core.test.mjs`，队列 17 项保留，验证两套测试合计仍为 37 项且全绿
- [x] 5.5 更新 `scripts/human-facing-html-contract.test.mjs:53,125` 与 `scripts/review-html-flow-contract.test.mjs` 中的旧路径锚点，验证 `node --test` 全绿

## 6. 三个宿主接入

- [x] 6.1 `skills/tech-review-doc/SKILL.md`：写入后调用共享渲染器派生同名 HTML、报告双路径、frontmatter 声明依赖，验证正文含渲染调用与路径告知
- [x] 6.2 `skills/test-guide-from-code/SKILL.md`：同上，验证正文含渲染调用、路径告知与渲染器不可用时的降级说明
- [x] 6.3 `skills/git-release-finish/SKILL.md`：同上，验证 Phase 10 含派生步骤与双路径告知
- [x] 6.4 三个宿主均在生成前确保目标仓库的忽略规则（只追加单行、不覆盖），验证正文含该步骤；写不进时说明并给出建议规则行

## 7. 既有队列宿主同步

- [x] 7.1 `skills/goal-driven-queue/SKILL.md:65` 与 `reference.md:110,112` 的渲染器路径与散文副本改为薄引用新位置，验证 `grep -rn "goal-driven-queue/scripts/render-html" skills/ --include=*.md` 仅剩 adapter 自身必要的引用
- [x] 7.2 `skills/goal-driven-workflow/SKILL.md:181` 改为按加载 `goal-driven-queue` 的目录解析 adapter（`renderReviewPage` / `renderEvidencePage` 留在队列侧），验证正文不再指向 core
- [x] 7.3 `goal-driven-queue` 与 `goal-driven-workflow` 的 frontmatter 声明 `report-output-discipline`，adapter 缺模块时降级打印 `.md` 路径而非抛错，验证正文含降级分支

## 8. 文档与收尾

- [x] 8.1 `AGENTS.md` Skill 清单新增 `report-output-discipline` 行，并在「Skill 调用分层」表登记为共享纪律，验证表格行存在
- [x] 8.2 运行 `node scripts/gen-skill-docs.mjs` 并提交 `docs/generated/skills-index.md`，验证 `git diff --exit-code` 干净
- [x] 8.3 运行 `npm run lint:skill-description` 与 `node --test`，验证全部通过
- [x] 8.4 运行 `openspec validate report-output-format-contract --strict`，验证通过
- [x] 8.5 残留清扫：`grep -rn "skills/goal-driven-queue/scripts/render-html.mjs" --include=*.md --include=*.mjs . | grep -v archive`，验证零命中或仅剩 adapter 自身
