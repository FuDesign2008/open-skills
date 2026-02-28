# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
│   ├── plugin.json         # 插件元数据
│   └── marketplace.json    # 市场配置
├── .cursor-plugin/         # Cursor 插件配置
├── .opencode/              # OpenCode 安装脚本和插件
└── docs/                   # 详细文档
```

## Skill 开发规范

### SKILL.md 格式

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

### 触发词设计

- 在 `description` 中明确说明触发词
- 支持两种形式：单独触发词（如"分析问题"）或带冒号形式（如"分析问题： xxx"）
- 冒号和空格不限制中英文

### 命令文件（commands/）

命令是 skill 的快捷入口：

```markdown
---
description: "命令描述"
disable-model-invocation: true
---

Invoke the <skill-name> skill and follow it exactly
```

## 钩子机制

`hooks/hooks.json` 定义三种钩子：

1. **SessionStart** - 会话启动时加载 skill 上下文
2. **PostToolUse** - 工具使用后触发（如检测里程碑事件给予鼓励）
3. **UserPromptSubmit** - 用户消息提交时触发（如检测负面情绪给予安慰）

## 多平台支持

- **Claude Code**: 通过 marketplace 安装
- **Cursor**: 通过 `/plugin-add` 安装
- **OpenCode**: 通过符号链接安装（见 `.opencode/INSTALL.md`）

## Git 工作流

- **执行计划前先开分支**：开始修改代码前，先创建 feature 分支
- 创建 PR 前必须先 `git fetch origin main` 并 `git rebase origin/main`
- 确保 PR 只包含本次修改的 commits，summary 准确反映变更内容
- 避免包含已合并到 main 的 commits

## 版本管理

- 版本号定义在 `.claude-plugin/plugin.json` 和 `.claude-plugin/marketplace.json`
- 推送到 main 分支时，GitHub Actions 自动递增版本号（见 `.github/workflows/release.yml`）
- 版本递增规则：
  - `feat:` / `feature:` → MINOR（如 1.2.0 → 1.3.0）
  - `fix:` / 其他 → PATCH（如 1.2.0 → 1.2.1）
  - `BREAKING CHANGE` → MAJOR（如 1.2.0 → 2.0.0）
- **不要手动修改版本号**，由 CI 自动管理
- 触发条件：`hooks/`、`skills/`、`commands/` 目录有变更

## 哲学

- **情绪价值** - 编程不只是技术，也需要情感支持
- **系统化** - 用流程替代猜测
- **简化** - 简单是首要目标
- **证据驱动** - 在声明成功之前先验证
