# AGENTS.md

本文件为 AI 编码代理（如 Claude Code、Cursor、OpenCode）提供项目工作指南。

## 项目概述

Open Skills 是一个 AI 编码助手的 Skills 库，支持 **Claude Code**、**Cursor**、**OpenCode** 三个平台。提供情绪陪伴、问题解决工作流、性能优化等能力。

## 架构

```
open-skills/
├── skills/                 # Skill 定义（核心）
│   └── <skill-name>/
│       └── SKILL.md        # 必需：Skill 定义文件
├── commands/               # 快捷命令（调用 skill）
├── hooks/                  # 钩子配置
│   └── hooks.json          # 定义 SessionStart、PostToolUse、UserPromptSubmit 钩子
├── .claude-plugin/         # Claude Code 插件配置
├── .cursor-plugin/         # Cursor 插件配置
├── .opencode/              # OpenCode 安装脚本和插件
└── docs/                   # 详细文档
```

## 构建与测试

本项目主要是 Markdown 和 JSON 配置文件，无传统构建流程。

### 验证命令

```bash
# 验证 JSON 格式
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json'))"
node -e "JSON.parse(require('fs').readFileSync('hooks/hooks.json'))"

# 验证 SKILL.md frontmatter 格式
grep -r "^---$" skills/*/SKILL.md

# 验证 OpenCode 插件语法
node --check .opencode/plugins/open-skills.js
```

### 无测试框架

本项目无自动化测试，依赖人工验证 skill 触发和行为。

## 代码风格指南

### Markdown 规范

**SKILL.md 格式**：

```markdown
---
name: skill-name
version: "1.0.0"
user-invocable: true
description: 触发条件和用途说明（包含触发词）
---

# Skill 标题

Skill 内容...
```

**触发词设计**：
- 在 `description` 中明确说明触发词
- 支持两种形式：单独触发词（如"分析问题"）或带冒号形式（如"分析问题： xxx"）
- 冒号和空格不限制中英文

**命令文件格式**（`commands/*.md`）：

```markdown
---
description: "命令描述"
disable-model-invocation: true
---

Invoke the <skill-name> skill and follow it exactly
```

### JSON 规范

- 使用 2 空格缩进
- 文件末尾无空行
- 属性名使用 camelCase
- 示例：`hooks/hooks.json`、`.claude-plugin/plugin.json`

### JavaScript 规范（OpenCode 插件）

- 使用 ES Module 格式（`export const`）
- 导出函数命名：`<Name>Plugin`
- Hook 使用 mutation 模式：直接修改 `output` 对象，不返回值
- 示例：

```javascript
export const OpenSkillsPlugin = async ({ client, directory }) => {
  return {
    'experimental.chat.system.transform': async (input, output) => {
      output.system.push(...additions);  // 直接修改 output
    },
  };
};
```

### Shell 脚本规范（hooks/）

- 使用 `#!/usr/bin/env bash` shebang
- 使用 `printf` 而非 `echo` 输出 JSON
- 错误时静默失败，不阻塞主流程

## 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| Skill 目录 | kebab-case | `solve-workflow/` |
| Skill 文件 | 固定名 | `SKILL.md` |
| 命令文件 | 单词或 kebab-case | `solve.md`、`perf.md` |
| Hook 脚本 | kebab-case | `session-start`、`emotion-comfort` |
| 插件导出 | PascalCase + Plugin | `OpenSkillsPlugin` |

## Git 工作流

- **⚠️ 必须先创建分支**：任何代码修改前，必须先创建 feature 分支。main 是保护分支，禁止直接推送
- 创建 PR 前必须先 `git fetch origin main` 并 `git rebase origin/main`
- 确保 PR 只包含本次修改的 commits
- 避免包含已合并到 main 的 commits

### Commit 规范

- `feat:` / `feature:` → 新功能
- `fix:` → Bug 修复
- `docs:` → 文档更新
- `chore:` → 杂项（版本号更新等）

## 版本管理

- 版本号定义在 `.claude-plugin/plugin.json` 和 `.claude-plugin/marketplace.json`
- 推送到 main 分支时，GitHub Actions 自动递增版本号
- **不要手动修改版本号**，由 CI 自动管理
- 触发条件：`hooks/`、`skills/`、`commands/`、`.opencode/` 目录有变更

## 多平台支持

| 平台 | 安装方式 | 配置目录 |
|------|---------|---------|
| Claude Code | marketplace 安装 | `.claude-plugin/` |
| Cursor | `/plugin-add` 安装 | `.cursor-plugin/` |
| OpenCode | 符号链接安装 | `.opencode/` |

## 错误处理

- **Hook 脚本**：静默失败，不阻塞主流程
- **插件加载**：使用 try-catch 或条件检查（如 `fs.existsSync`）
- **Skill 内容**：确保 frontmatter 格式正确，否则 skill 无法被识别

## 哲学

- **情绪价值** - 编程不只是技术，也需要情感支持
- **系统化** - 用流程替代猜测
- **简化** - 简单是首要目标
- **证据驱动** - 在声明成功之前先验证
