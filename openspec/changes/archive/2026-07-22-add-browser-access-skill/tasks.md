# Tasks: add-browser-access-skill

## 1. 新增 browser-access skill（公共底座）

- [x] 1.1 移植 5 个脚本到 `skills/browser-access/scripts/`（cdp-proxy / check-deps / browser-discovery / find-url / match-site）
- [x] 1.2 移植 `templates/config.env.template`，注释 web-access→browser-access
- [x] 1.3 移植 `references/cdp-api.md` + 建 `references/site-patterns/.gitkeep`
- [x] 1.4 写 `skills/browser-access/SKILL.md`（公共底座定位 + 来源/版权声明 + user-invocable:true）
- [x] 1.5 写 `skills/browser-access/.gitignore`（config.env / site-patterns/*.md / *.log）
- [x] 1.6 `node --check` 全部移植脚本通过

## 2. 增强 effective-web-research（调研向）

- [x] 2.1 frontmatter 加 `dependencies: [browser-access]`，description 补触发词
- [x] 2.2 Step 0 路由表追加 CDP 行
- [x] 2.3 新增「动态/登录/反爬内容获取（CDP 升级）」小节
- [x] 2.4 `reference.md` 追加 CDP 升级决策树 + curl HTTP API 速查

## 3. 增强 browser-debug-toolkit（调试向）

- [x] 3.1 frontmatter 加 `dependencies: [browser-access]`，version 1.1.0→1.2.0，description 补触发词
- [x] 3.2 Scene→Tool 决策表新增 CDP Proxy 列
- [x] 3.3 新增「CDP Proxy vs chrome-devtools-mcp」对比节
- [x] 3.4 新建 `reference.md`（curl API 速查 + 调试场景用法）

## 4. 登记

- [x] 4.1 `RELEASE-NOTES.md` 新增条目
- [x] 4.2 `README.md` / `README.zh-CN.md` 登记（若有 skill 总览表）

## 5. 验证

- [x] 5.1 移植脚本 `node --check` 全绿
- [x] 5.2 三个 skill 的 frontmatter 格式正确（dependencies / user-invocable）
- [x] 5.3 OpenSpec delta spec 格式自检（ADDED Requirements + SHALL/MUST + Scenario WHEN/THEN）
