# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-01 | **Branch:** fix/opencode-coding-fangirl-cleanup

## 概述

AI 编码助手的开放 Skills 库。Markdown + JSON + 少量 JS 构成的多平台插件项目。支持 Claude Code、Cursor、OpenCode 三个平台。

## 结构

```
open-skills/
├── skills/                 # 核心：Skill 定义（每个子目录 = 一个 skill）
│   └── <name>/SKILL.md     # 必需文件，含 frontmatter 元数据
├── commands/               # 快捷命令（.md 文件，调用对应 skill）
├── hooks/                  # Claude Code/Cursor 钩子（shell 脚本 + hooks.json）
├── .claude-plugin/         # Claude Code 平台配置（plugin.json + marketplace.json）
├── .cursor-plugin/         # Cursor 平台配置（plugin.json）
├── .opencode/              # OpenCode 平台（ES Module 插件 + 安装脚本）→ 见 .opencode/AGENTS.md
├── docs/                   # 安装指南、实现文档
└── .github/workflows/      # CI：自动版本递增（release.yml）
```

## 在哪找什么

| 任务 | 位置 | 注意事项 |
|------|------|---------|
| 新增/修改 Skill | `skills/<name>/SKILL.md` | 见 skills/AGENTS.md 了解格式和分类 |
| 新增快捷命令 | `commands/<name>.md` | 固定格式：`disable-model-invocation: true` + `Invoke the <skill> skill` |
| 修改钩子行为 | `hooks/hooks.json` + 对应 shell 脚本 | Shell 脚本必须静默失败 |
| OpenCode 插件开发 | `.opencode/plugins/` 和 `.opencode/plugin/` | 见 .opencode/AGENTS.md |
| 平台配置 | `.claude-plugin/`、`.cursor-plugin/` | 仅元数据，不含逻辑 |
| CI/版本管理 | `.github/workflows/release.yml` | **禁止手动改版本号** |
| 安装文档 | `docs/INSTALL.md`、`docs/README.opencode.md` | |

## Skill 清单

| Skill | 类别 | 触发词 | 依赖 |
|-------|------|--------|------|
| coding-fangirl (v5.2.0) | 情绪陪伴 | 彩虹屁、夸夸我、鼓励一下、迷妹模式、恋爱模式 | 无 |
| solve-workflow (v1.1.0) | 工作流 | 分析问题（含明确问题）、评估方案、审查方案、制定计划、执行计划、检查验证、回顾改进 | 无 |
| perf-workflow (v2.1.0) | 工作流 | 性能分析、性能证据、性能定位、性能优化 | 无 |
| frontend-perf (v2.0.0) | 知识库 | 随 perf-workflow 自动加载 | perf-workflow |
| chinese-format (v1.1.0) | 格式规范 | 写文档、生成文档（自动触发） | 无 |
| android-webview-debug | 工具 | android-webview-debug-enable/revert | 无 |

## 钩子机制

三种钩子类型（定义在 `hooks/hooks.json`）：

| 钩子 | 触发时机 | Shell 脚本 | 作用 |
|------|---------|-----------|------|
| SessionStart | 会话启动/恢复 | `hooks/session-start` | 欢迎语 + 加载 coding-fangirl 上下文 |
| PostToolUse | Bash 工具调用后 | `hooks/milestone-celebrate` | 检测 git commit/push/test/build 并庆祝 |
| UserPromptSubmit | 用户发送消息 | `hooks/emotion-comfort` | 检测负面情绪并安慰 |

OpenCode 平台使用 JS/TS 插件替代 shell 脚本实现相同功能。

## 代码规范

### SKILL.md 格式（必须遵循）

```markdown
---
name: skill-name
version: "1.0.0"
user-invocable: true
description: 触发条件和用途说明（必须包含触发词）
---

# Skill 标题

Skill 内容...
```

### 命令文件格式（`commands/*.md`）

```markdown
---
description: "命令描述"
disable-model-invocation: true
---

Invoke the <skill-name> skill and follow it exactly
```

### JS 插件规范（`.opencode/` 专用）

- ES Module（`export const`）
- 导出命名：`<Name>Plugin`
- Hook = mutation 模式：直接修改 `output` 对象

### JSON

- 2 空格缩进，camelCase 属性名，无尾空行

### Shell 脚本（`hooks/`）

- `#!/usr/bin/env bash`，用 `printf` 输出 JSON，静默失败

## 命名约定

| 类型 | 规则 | 示例 |
|------|------|------|
| Skill 目录 | kebab-case | `solve-workflow/` |
| Skill 文件 | 固定 `SKILL.md` | |
| 命令文件 | kebab-case | `solve.md`、`perf.md` |
| Hook 脚本 | kebab-case | `session-start`、`emotion-comfort` |
| 插件导出 | PascalCase + Plugin | `OpenSkillsPlugin` |

## Git 工作流

- **禁止直接推送 main**：必须先创建 feature 分支
- PR 前：`git fetch origin main && git rebase origin/main`
- PR 仅含本次变更 commits
- Commit 前缀：`feat:` 新功能、`fix:` 修复、`docs:` 文档、`chore:` 杂项

## 版本管理

- 版本号在 `.claude-plugin/plugin.json` 和 `marketplace.json`
- **禁止手动修改**：CI（`.github/workflows/release.yml`）自动递增
- 规则：`feat:` → MINOR、`fix:` → PATCH、`BREAKING CHANGE` → MAJOR
- 触发条件：`hooks/`、`skills/`、`commands/`、`.opencode/` 有变更时

## 多平台差异

| 平台 | 安装 | 配置目录 | 钩子实现 |
|------|------|---------|---------|
| Claude Code | marketplace 安装 | `.claude-plugin/` | Shell 脚本（hooks/） |
| Cursor | `/plugin-add` 安装 | `.cursor-plugin/` | Shell 脚本（hooks/） |
| OpenCode | 符号链接安装 | `.opencode/` | ES Module 插件 |

## 反模式（禁止）

- ❌ 手动修改版本号
- ❌ 直接推送 main 分支
- ❌ SKILL.md 缺少 frontmatter 或遗漏触发词
- ❌ Hook 脚本阻塞主流程（必须静默失败）
- ❌ OpenCode 插件用 CommonJS（必须 ES Module）
- ❌ 中文内容混用英文标点

## 验证命令

```bash
# JSON 格式
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json'))"
node -e "JSON.parse(require('fs').readFileSync('hooks/hooks.json'))"

# SKILL.md frontmatter
grep -r "^---$" skills/*/SKILL.md

# OpenCode 插件语法
node --check .opencode/plugins/open-skills.js
```

## 子目录知识库

- `skills/AGENTS.md` — Skill 开发详细规范、分类、依赖关系
- `.opencode/AGENTS.md` — OpenCode 插件架构、API 模式、安装机制
