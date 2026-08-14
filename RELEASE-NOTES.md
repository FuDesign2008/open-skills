# Release Notes

## [2.0.0] - 2026-08-14

### ⚠️ BREAKING CHANGES

**`perf-workflow` 与 `frontend-perf` 已删除**，替换为基于双栈实战（native C++ 工具链 + 大型 Web 富文本编辑器）验证的性能优化范式：

- **新增 `perf-optimize-workflow`**（编排入口）：基准建设 → 证据门禁 → 归因 → 单目标迭代优化 → A/B 交叉统计验证 → 基准留痕，可选无人值守迭代循环；继承原 `perf-workflow` 全部「性能*」触发词与原 `frontend-perf` 的前端触发词；前端知识层（React/Angular/Electron 版本特性、量化标准、优化手法）整合进其 `reference.md`（按栈成章，留其他栈扩展位）
- **新增 `perf-evidence-discipline`**（硬纪律，`user-invocable: false`）：九条证据有效性纪律（环境节流伪影 / 监控自污染 / 框架计数口径 / 设备画像节流矩阵 / 输入真实性 / 开关生命周期 / 单样本外推禁令 / 终极对照实验 / 负结果留痕），作为 `perf-optimize-workflow` 四个阶段的前置门禁

**迁移指引**：按名引用 `perf-workflow` / `frontend-perf` 的地方改用 `perf-optimize-workflow`（流程与触发词）或其 `reference.md`（前端知识）；`npx skills update` 后旧 skill 自动移除。

---

## [1.16.0] - 2026-07-22

### Changed

**effective-web-research**
- 新增「CDP 升级」逃生出口：静态层（WebSearch/WebFetch/curl）失效（登录墙 / JS 动态渲染 / 反爬平台如小红书·公众号）→ 升级到真实浏览器，委托外部 `web-access` skill 的 CDP（带登录态）
- 运行时局部强依赖 `web-access`（**不**声明 frontmatter `dependencies`，核心调研纪律不依赖它；仅 CDP 路径运行时检查、缺失中止 + 提示安装），不向 solve-workflow 上游传染外部 plugin
- description 补中文触发词（登录态访问 / 动态页面 / 反爬）；`reference.md` 追加 CDP 升级决策树 + curl API 速查

**browser-debug-toolkit v1.2.0**
- Scene→Tool 决策表**表内**新增 CDP Proxy（web-access）列，把 `web-access` CDP Proxy 作为 `chrome-devtools-mcp` 的并列实时操控手段
- 新增「CDP Proxy vs chrome-devtools-mcp」对比节（含 login tie-breaker + 运行时局部强依赖说明）；新建 `reference.md`（curl API 速查 + 调试 recipes）
- description 补中文触发词（登录态调试）

### Notes
- 本次利用外部 plugin [`eze-is/web-access`](https://github.com/eze-is/web-access) 的浏览器操控能力（不移植脚本、不在 open-skills 内新建 skill）；用户需 CDP 操控时自行安装 web-access，缺失则该路径中止 + 提示安装，核心调研纪律 / 调试决策独立可用。

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
