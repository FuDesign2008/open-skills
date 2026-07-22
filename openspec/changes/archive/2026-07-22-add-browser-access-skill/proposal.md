# Proposal: add-browser-access-skill

## Why

open-skills 仓库内的 `effective-web-research`（联网调研纪律）与 `browser-debug-toolkit`（浏览器运行时调试）**真正"操控浏览器"的能力偏弱**：

- `effective-web-research` 的联网手段只停留在内置 `WebSearch` / `WebFetch` / `curl` 静态层，遇到需要登录态、JS 动态渲染、反爬平台（小红书、公众号等）的页面时没有真实浏览器操控手段——它有"研究纪律"，缺"操控工具"。
- `browser-debug-toolkit` 偏调试（DOM/计算样式/盒模型/网络面板），操控手段高度依赖需额外安装的 `chrome-devtools-mcp`，操作 API 不丰富，且偏向"检查"而非"导航/交互/抓取"。

外部独立 plugin [`eze-is/web-access`](https://github.com/eze-is/web-access) v2.5.3（MIT）恰好补齐这块短板：CDP Proxy 直连用户日常浏览器（天然带登录态）+ 一套 curl HTTP API + 浏览哲学 + 站点经验积累 + 子 Agent 并行分治。本变更把 web-access 的技术与能力**融合进 open-skills**，让两个目标 skill 自身变强，而不是运行时依赖外部 plugin。

## What Changes

- **新增公共 skill `browser-access`**（open-skills 内部底座）：从 web-access v2.5.3 移植 5 个脚本（`cdp-proxy.mjs` 672 行 / `check-deps.mjs` 206 / `browser-discovery.mjs` 138 / `find-url.mjs` 253 / `match-site.mjs` 46）+ `templates/config.env.template` + `references/cdp-api.md` + `references/site-patterns/`（空起步）；改写 SKILL.md 为"open-skills 内部公共底座"定位，`user-invocable: true`，顶部保留 web-access MIT 版权与来源声明。
- **`effective-web-research`（调研向本职化）**：frontmatter 加 `dependencies: [browser-access]`；Step 0 路由表追加 CDP 行；新增「动态/登录/反爬内容获取（CDP 升级）」小节——升级阶梯（WebSearch→WebFetch→curl/Jina→CDP）+ 内化浏览哲学要点 + "静态层拿不到目标内容时的逃生出口"；`reference.md` 追加 CDP 升级决策树 + curl HTTP API 速查；description 补触发词。
- **`browser-debug-toolkit`（调试向本职化）**：frontmatter 加 `dependencies: [browser-access]`；Scene→Tool 决策表新增 CDP Proxy 列；新增「CDP Proxy vs chrome-devtools-mcp」对比节；新建 `reference.md` 放 curl API 速查 + 调试场景用法；version 1.1.0→1.2.0；description 补触发词。

## Capabilities

### New Capabilities

- `browser-access`: open-skills 内部公共浏览器操控底座——CDP Proxy 直连日常浏览器（带登录态），HTTP API 操控动态页面/交互/媒体/视频，站点经验积累，子 Agent 并行分治

### Modified Capabilities

- `effective-web-research`: 强依赖 `browser-access`；新增"静态层失效时升级到 CDP"的调研能力（动态/登录/反爬内容获取）
- `browser-debug-toolkit`: 强依赖 `browser-access`；CDP Proxy 作为 `chrome-devtools-mcp` 的并列实时操控手段纳入决策表（带登录态、curl 可批处理、真实手势 /clickAt、操控+验证而不仅检查）

## Impact

- 新增文件：`skills/browser-access/`（SKILL.md + 5 脚本 + templates + references + .gitignore）
- 修改文件：`skills/effective-web-research/SKILL.md` + `reference.md`、`skills/browser-debug-toolkit/SKILL.md` + 新建 `reference.md`、`RELEASE-NOTES.md`、`README.md` / `README.zh-CN.md`（登记）
- **依赖链影响（已审查）**：`browser-access` 是 open-skills **内部** skill，随 `npx skills add FuDesign2008/open-skills` 一起安装；`browser-debug-toolkit` 虽被 `solve-workflow` 等 4 个 workflow 强依赖，但传递依赖指向的是仓库内 skill，前置检查不指向外部 plugin，**不引入外部传染**（这是选择"融合进 open-skills"而非"强依赖外部 web-access"的核心理由）。
- 风险：移植脚本与上游 web-access 形成分叉，需长期维护（缓解：SKILL.md 顶部标注来源+版本，必要时 rebase）；MIT 版权声明须保留。
