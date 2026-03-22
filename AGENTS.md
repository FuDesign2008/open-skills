# PROJECT KNOWLEDGE BASE

本文件为 Claude Code 等 AI 在本仓库工作时的项目知识库。**文首若出现历史生成日期或分支名，仅作存档；以当前仓库 `main` 与目录结构为准。**

## 概述

AI 编码助手的开放 Skills 库。Markdown + JSON + 少量 JS 构成的多平台插件项目。支持 Claude Code、Cursor、OpenCode 三个平台。安装对外统一为 **通用安装**（`npx`，仅 SKILL.md）与 **全能力安装**（Hooks、Commands、平台集成）；见根目录 `README.md` § 安装。

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
├── docs/                   # 安装指南、实现文档（含 generated/ 自动生成索引）
├── scripts/                # gen-skill-docs.mjs：由 skills 生成 docs/generated/skills-index.md
└── .github/workflows/      # CI：版本递增（release.yml）、skills 索引校验（docs-skills-verify.yml）
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
| 安装文档 | `docs/INSTALL.md`、`.opencode/INSTALL.md` | **通用安装**（npx）与 **全能力安装**（插件 / OpenCode 符号链接）口径见 `README.md` § 安装；总览见 `docs/README.md`；OpenCode 架构见 `.opencode/AGENTS.md` |
| Skill 完整列表 | `docs/generated/skills-index.md` | **自动生成**，勿手改；改 skill 后运行 `node scripts/gen-skill-docs.mjs` |

## Skill 清单

**名称、版本、`user-invocable`、描述（触发条件）** 以自动生成的 [docs/generated/skills-index.md](docs/generated/skills-index.md) 为准（`node scripts/gen-skill-docs.mjs`）。下表仅保留 **类别与依赖**，供快速扫一眼关系。

| Skill | 类别 | 依赖 |
|-------|------|------|
| solve-workflow | 工作流 | 无 |
| perf-workflow | 工作流 | 无 |
| frontend-perf | 知识库 | perf-workflow |
| chinese-format | 格式规范 | 无 |
| android-webview-debug | 工具 | 无 |
| git-commit | Git | 无 |
| jira-fix-workflow | Jira 工作流 | git-commit、jira-read |
| jira-read | Jira 工具 | 无 |
| typescript-check | 工具 | 无 |
| file-operation-fallback | 工具 | 无 |
| article-writer | 内容创作 | 无 |

> 💕 AI 编码陪伴（coding-fangirl）已迁移至独立工程 [oh-my-fangirl](https://github.com/FuDesign2008/oh-my-fangirl)。

## 钩子机制

三种钩子类型（定义在 `hooks/hooks.json`）：

Hooks 已随 coding-fangirl 迁移至 [oh-my-fangirl](https://github.com/FuDesign2008/oh-my-fangirl)，本仓库不再包含 hooks。

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

**触发词设计**：支持两种形式——单独触发词（如「分析问题」）或带冒号形式（如「分析问题： xxx」）；冒号和空格不限制中英文。详见 `skills/AGENTS.md`。

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

- **执行计划前先开分支**：开始修改代码前，先创建 feature 分支
- **禁止直接推送 main**：必须先创建 feature 分支
- **合并 PR 时**：优先使用「Create a merge commit」，避免「Squash and merge」。Squash 会切断 main 与 feature 分支的提交图，后续在同一分支继续开发再合并 main 时易产生冲突。
- **PR 合并后同步主分支**：合并 PR 后，主动执行 `git checkout main && git pull origin main` 同步当前仓库主分支（即「Merge PR 与发布流程」第 4 步）。
- **PR 合并后继续开发**：若上游已用 Squash 合并过，在本地继续提交前必须先 `git merge origin/main` 或 `git pull origin main`，再开发。
- PR 前：`git fetch origin main && git rebase origin/main`
- PR 仅含本次变更 commits
- Commit 前缀：`feat:` 新功能、`fix:` 修复、`docs:` 文档、`chore:` 杂项

### Merge PR 与发布流程

1. **合并 PR**：`gh pr merge <编号> --merge`
2. **检查版本发布**：等待 CI 完成（约 15–20 秒），`gh release list -L 3` 确认新版本
3. **更新本地安装**（均为 **全能力安装** 路径）：
   - **OpenCode**：`cd ~/.config/opencode/open-skills && git pull`，然后 `for cmd in commands/*.md; do ln -sf "$(pwd)/$cmd" ~/.config/opencode/commands/; done`
   - **Claude Code**：`claude plugin update open-skills@open-skills-marketplace`
4. **工作区同步**：`git checkout main && git pull origin main`

## 版本管理

- 版本号在 `.claude-plugin/plugin.json` 和 `marketplace.json`
- **禁止手动修改**：CI（`.github/workflows/release.yml`）自动递增
- 规则：`feat:` → MINOR、`fix:` → PATCH、`BREAKING CHANGE` → MAJOR
- 触发条件：`hooks/`、`skills/`、`commands/`、`.opencode/`、`.cursor-plugin/` 有变更时
- **受保护 main**：采用做法 B。工作流在 `chore/version-bump-*` 分支提交版本号变更，自动创建 PR，并以 **squash** 合并回 `main`；squash 提交标题带 `[skip ci]`，避免再次触发发版流程。

## 多平台差异

对外安装口径统一为两类：**通用安装**（仅 `SKILL.md`，`npx skills`）与 **全能力安装**（Hooks、Commands、平台集成）。详见根目录 `README.md` § 安装与 `docs/INSTALL.md`。

| 平台 | 全能力安装（推荐） | 配置目录 | 钩子实现 |
|------|-------------------|---------|---------|
| Claude Code | Marketplace 插件 | `.claude-plugin/` | Shell 脚本（hooks/） |
| Cursor | `/plugin-add` | `.cursor-plugin/` | Shell 脚本（hooks/） |
| OpenCode | raw + 符号链接（见 `.opencode/INSTALL.md`） | `.opencode/` | ES Module 插件 |

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

# Skills 索引生成脚本语法
node --check scripts/gen-skill-docs.mjs
```

## 子目录知识库

- `skills/AGENTS.md` — Skill 开发详细规范、分类、依赖关系
- `.opencode/AGENTS.md` — OpenCode 插件架构、API 模式、安装机制
