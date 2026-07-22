# Proposal: enhance-browser-skills-via-web-access

## Why

`effective-web-research`（联网调研纪律）与 `browser-debug-toolkit`（浏览器调试）缺真实浏览器操控能力：前者只有静态层 WebSearch / WebFetch / curl，遇登录态 / 动态渲染 / 反爬页面无逃生出口；后者偏调试、依赖 `chrome-devtools-mcp`（fresh session 无登录态 cookie），调试登录态问题抓瞎。外部 plugin [`eze-is/web-access`](https://github.com/eze-is/web-access) 恰提供 CDP Proxy 直连用户日常浏览器（带登录态）+ HTTP API + 浏览哲学的能力。

本变更让两个 skill 充分利用 web-access 的浏览器操控能力，采用**运行时局部强依赖**：**不**声明 frontmatter `dependencies`（核心调研纪律 / 调试决策不被拖累、solve-workflow 前置检查链不传递外部 plugin），仅在需要 CDP 操控时加载 web-access、缺失则中止并提示安装。

## What Changes

- **effective-web-research**：Step 0 路由表加 CDP 行；新增「Escalation — CDP via web-access」小节（升级阶梯 WebSearch→WebFetch→curl/Jina→CDP + 运行时检查 web-access + 浏览哲学要点）；`reference.md` 追加 CDP 决策树 + curl API 速查；description 补触发词（含中文）。
- **browser-debug-toolkit** v1.2.0：Scene→Tool 决策表**表内**加 CDP Proxy 列（修正前次 review 指出的"表内未纳入"）；新增「CDP Proxy (web-access) vs chrome-devtools-mcp」对比节 + login tie-breaker；新建 `reference.md`（curl API 速查 + 调试 recipes）；description 补触发词。
- **共同约束**：frontmatter **不**声明 `dependencies`；正文**英文**（铁律 3）；正向描述、无版本标记（检查清单 7/8）；SKILL.md 摘要 + reference.md 详表不重复（检查清单 9）；标注能力来自外部 web-access plugin + 其安装方式。
- **不做**：不移植脚本、不在 open-skills 内新建 skill（区别于已 close 的 `add-browser-access-skill` 融合方案）。

## Capabilities

### New Capabilities
（无）

### Modified Capabilities
- `effective-web-research`：新增"静态层失效升级到 CDP（via web-access）"Requirement（首次纳入 openspec 管理）
- `browser-debug-toolkit`：新增"web-access CDP Proxy 作为 chrome-devtools-mcp 并列手段纳入 Scene→Tool 决策表"Requirement（首次纳入 openspec 管理）

## Impact

- 文件：`skills/effective-web-research/SKILL.md` + `reference.md`、`skills/browser-debug-toolkit/SKILL.md` + 新建 `reference.md`、`docs/generated/skills-index.md`（重生成）、`RELEASE-NOTES.md`
- **依赖链**：不声明 frontmatter `dependencies` → solve-workflow 等 4 个上游 workflow 的前置检查链**不传递**外部 plugin（无传染，这是"运行时局部强依赖"相对"frontmatter 强依赖"的核心优势）
- **运行时依赖**：用户需要 CDP 操控时须安装 web-access plugin；缺失则该路径中止 + 提示安装，核心调研纪律 / 调试决策独立可用
- 风险：open-skills 不再自包含（CDP 能力依赖外部 plugin）；缓解：运行时局部强依赖，核心能力不依赖 web-access
