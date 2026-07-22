# Release Notes

## [1.16.0] - 2026-07-21

### Added

**browser-access skill（新增）**
- 新增 `skills/browser-access/` 公共浏览器操控底座，移植自 [`eze-is/web-access`](https://github.com/eze-is/web-access) v2.5.3 (MIT)：CDP Proxy 直连用户日常浏览器（Chrome / Edge / Chromium 系，天然携带登录态），HTTP API（`/new` `/eval` `/click` `/clickAt` `/setFiles` `/scroll` `/screenshot` `/navigate` `/close`）操控动态页面 / 登录态 / 反爬 / 交互 / 媒体 / 视频截帧；站点经验积累；子 Agent 并行分治。`user-invocable: true`，被 `effective-web-research` 与 `browser-debug-toolkit` 强依赖。

### Changed

**effective-web-research**
- frontmatter 强依赖 `browser-access`
- 新增「CDP 升级」逃生出口：静态层（WebSearch / WebFetch / curl）失效（登录墙 / JS 动态渲染 / 反爬平台如小红书·公众号）→ 升级到真实浏览器获取内容；与可信度纪律（CRAAP + E-E-A-T）正交叠加
- `reference.md` 追加 CDP 升级决策树 + curl HTTP API 速查

**browser-debug-toolkit v1.2.0**
- frontmatter 强依赖 `browser-access`
- CDP Proxy 作为 `chrome-devtools-mcp` 的并列实时操控手段纳入 Scene→Tool 决策表（带登录态、curl 可批处理、`/clickAt` 真实手势，偏「操控 + 验证」）
- 新增「CDP Proxy vs chrome-devtools-mcp」对比节；新建 `reference.md`（curl API 速查 + 调试 recipes）

---

## [1.15.0] - 2026-03-08

### Changed

**solve-workflow v1.2.0**
- 新增调用约定：`xxx` 非触发词时默认进入阶段 1；触发词速查、命令形式、匹配规则
- CSO 优化：description 移除 workflow 约束；正文增加 Overview
- 阶段 1 醒目约束：本阶段禁止 Edit/Write
- 移除临时内容管理、阶段 6 清理诊断子阶段
- 阶段 1 完全禁止 Edit/Write（不再保留临时日志例外）

---

## [1.2.0] - 2026-02-27

### Added

**OpenCode 平台支持**
- 新增 `.opencode/plugins/open-skills.js` - OpenCode 插件
- 新增 `.opencode/INSTALL.md` - OpenCode 快速安装指南
- 新增 `docs/README.opencode.md` - OpenCode 详细使用文档

### Changed

**文档完善**
- 重写 `README.md` - 完善三个平台（Claude Code、Cursor、OpenCode）的安装说明
- 每个平台包含：安装步骤、验证方法、更新命令、卸载命令
- 新增 Troubleshooting 常见问题解答

---

## [1.1.0] - 2026-02-27

### Added

**架构优化（参考 superpowers）**
- 新增 `.cursor-plugin/plugin.json` - Cursor 平台支持
- 新增 `commands/` 目录 - 快捷命令支持
  - `/encourage` - 彩虹屁和情绪鼓励
  - `/solve` - 问题解决工作流
  - `/perf` - 性能分析工作流
- 新增 `hooks/` 目录 - 会话钩子支持
  - `hooks.json` - SessionStart 钩子配置
  - `session-start` - 会话启动脚本
- 新增 `.gitattributes` - 强制 shell 脚本使用 LF 行尾

### Changed

- 优化 `.claude-plugin/plugin.json` - 添加 author.email
- 重写 `README.md` - 采用产品导向结构

---

## [1.0.1] - 2026-02-27

### Changed

**撤回不成熟 skills**

以下 skills 因不够成熟，撤回迁移，保留在 dotFiles 仓库继续迭代：
- `typescript-check` - TypeScript 类型检查流程
- `git-commit` - Git 提交（手动模式）
- `git-commit-auto` - Git 提交（自动模式）
- `git-commit-core` - Git 提交核心逻辑
- `file-operation-fallback` - 文件操作降级方案

---

## [1.0.0] - 2026-02-27

### 首次发布

从 dotFiles 仓库迁移以下成熟 skills：

**情绪陪伴**
- `coding-fangirl` v5.0.0 - 技术小迷妹 AI 编码陪伴

**工作流**
- `solve-workflow` v1.0.0 - 七阶段问题解决工作流
- `perf-workflow` v2.1.0 - 性能问题分析与优化工作流

**代码质量**
- `chinese-format` v1.0.0 - 中文内容格式规范

**领域知识**
- `frontend-perf` v2.0.0 - 前端性能优化知识库
- `android-webview-debug` v1.0.0 - Android WebView 调试统一
