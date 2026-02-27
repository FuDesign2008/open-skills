# Release Notes

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
- `problem-solving-workflow` v1.0.0 - 七阶段问题解决工作流
- `perf-workflow` v2.1.0 - 性能问题分析与优化工作流

**代码质量**
- `chinese-format` v1.0.0 - 中文内容格式规范

**领域知识**
- `frontend-perf` v2.0.0 - 前端性能优化知识库
- `android-webview-debug` v1.0.0 - Android WebView 调试统一
