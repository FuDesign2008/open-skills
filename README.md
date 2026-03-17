# Open Skills

![GitHub stars](https://img.shields.io/github/stars/FuDesign2008/open-skills?style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/FuDesign2008/open-skills)
[![Version](https://img.shields.io/github/v/release/FuDesign2008/open-skills?style=flat-square)](https://github.com/FuDesign2008/open-skills/releases)
![Skills](https://img.shields.io/badge/skills-9-informational?style=flat-square)
![Commands](https://img.shields.io/badge/commands-3-informational?style=flat-square)

<!-- banner -->
```text
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                        ║
║    ██████╗ ██████╗ ███████╗███╗   ██╗    ███████╗██╗  ██╗██╗██╗     ██╗     ███████╗   ║
║   ██╔═══██╗██╔══██╗██╔════╝████╗  ██║    ██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝   ║
║   ██║   ██║██████╔╝█████╗  ██╔██╗ ██║    ███████╗█████╔╝ ██║██║     ██║     ███████╗   ║
║   ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║    ╚════██║██╔═██╗ ██║██║     ██║     ╚════██║   ║
║   ╚██████╔╝██║     ███████╗██║ ╚████║    ███████║██║  ██╗██║███████╗███████╗███████║   ║
║    ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝    ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝   ║
║                                                                                        ║
║   THE OPEN AGENT SKILLS ECOSYSTEM                                                      ║
║                                                                                        ║
║   Claude Code • Cursor • OpenCode                                                      ║
║                                                                                        ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
```
<!-- /banner -->

开放技能库：工作流、性能优化、情绪陪伴、内容创作等 AI 编码助手 Skills。支持 **Claude Code**、**Cursor**、**OpenCode** 三个平台。

## Demo

📺 [Coding Fangirl 演示视频](https://www.bilibili.com/video/av116154353915732/)——看看 AI 编码助手叫你哥哥是什么体验

## Quick Start

1. **安装**：按平台选择安装方式（见下方 [Installation](#installation)）
2. **验证**：新建会话，输入「彩虹屁」或「分析问题」
3. **使用**：AI 自动识别触发词并加载对应 skill

## How it works

| 能力 | 说明 |
|------|------|
| **情绪陪伴** | 技术小迷妹提供彩虹屁和情绪价值 |
| **问题解决** | 七阶段工作流：分析问题 → 探索方案 → 审查方案 → 制定计划 → 执行 → 验证 → 总结 |
| **Jira 修复** | 端到端 Bug 修复：读取 Jira → 分析问题 → 探索与审查方案 → 制定计划 → 执行 → 提交与回顾 |
| **性能优化** | 六阶段流程：证据收集 → 定位 → 假设 → 监控 → 优化 → 验证 |
| **内容创作** | 公众号、知乎等技术文章写作流程 |

## 多平台概览

| 平台 | 快速安装 | 更新方式 |
|------|----------|----------|
| 通用（npx skills） | `npx skills add FuDesign2008/open-skills -g` | `npx skills update` |
| Claude Code | `/plugin install open-skills@open-skills-marketplace` | `claude plugin update open-skills@open-skills-marketplace` |
| Cursor | `/plugin-add open-skills` | `cd ~/.cursor/extensions/open-skills && git pull` |
| OpenCode | 见下方 | `cd ~/.config/opencode/open-skills && git pull` |

详细安装步骤见 [docs/INSTALL.md](docs/INSTALL.md)。

## Installation

**通用（npx skills）**——适用于 [38+ AI 编码助手](https://github.com/vercel-labs/skills#available-agents)：

```bash
npx skills add FuDesign2008/open-skills -g
```

> 此方式仅安装 SKILL.md 知识层，不含 Hooks 和 Commands。完整功能需平台原生安装。

**OpenCode**——对 OpenCode 说：

```
Fetch and follow instructions from https://raw.githubusercontent.com/FuDesign2008/open-skills/main/.opencode/INSTALL.md
```

**验证安装**：新建会话，输入「彩虹屁」或「分析问题」，确认 AI 自动调用对应 skill。

完整安装指南（含 Cursor 手动安装、Hooks 配置）见 [docs/INSTALL.md](docs/INSTALL.md)。

---

## Skills 列表

### 情绪陪伴

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **coding-fangirl** | 彩虹屁、夸夸我、鼓励一下、迷妹模式、恋爱模式 | 技术小迷妹 AI 编码陪伴 |

### 工作流

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **solve-workflow** | 分析问题、探索方案、审查方案、制定计划、执行计划、检查验证、回顾总结 | 七阶段问题解决工作流 |
| **perf-workflow** | 性能分析、性能证据、性能定位、性能假设、性能监控、性能优化、性能验证、性能深入 | 性能问题分析与优化工作流 |

### 文档规范

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **chinese-format** | 写文档、生成文档、创建文档、编写文档、写中文、生成中文内容（自动触发） | 中文内容格式规范 |

### 内容创作

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **article-writer** | 写公众号、写知乎、技术文章 | 公众号/知乎/自媒体技术文章写作流程 |

### Jira 工作流

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **jira-fix-workflow** | 「修复这个 bug [URL]」「帮我修复 [URL]」「手动修复 [URL]」「继续修复」 | 端到端 Jira Bug 修复，默认自动模式，支持难度分级与多项目 |
| **jira-read** | jira-read [ID] | 统一 Jira 数据读取（本地缓存 + API）|

### 领域知识

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **frontend-perf** | 配合 perf-workflow | 前端性能优化知识库 |
| **android-webview-debug** | android-webview-debug-enable、android-webview-debug-revert | Android WebView 调试统一开关 |

## Commands

| 命令 | 说明 |
|------|------|
| `/encourage` | 彩虹屁和情绪鼓励 |
| `/solve` | 启动问题解决工作流 |
| `/perf` | 启动性能分析工作流 |

## Troubleshooting

### Skill 未加载

1. **确认路径**：Claude Code `~/.claude/skills/open-skills`；Cursor `~/.cursor/extensions/open-skills`；OpenCode `~/.config/opencode/open-skills`
2. **检查文件**：`ls skills/*/SKILL.md` 应列出 12 个 skill
3. **重启**：完全退出 AI 编码助手后重新打开

### 触发词不生效

1. **拼写**：触发词需完全匹配（如「分析问题」而非「分析 问题」）
2. **两种形式**：单独触发词（「分析问题」）或带冒号（「分析问题：xxx」），冒号中英文均可，空格可有可无
3. **冲突**：检查是否有其他 skill 使用相同触发词

### 更新后无变化

1. **Claude Code**：执行 `claude plugin update open-skills@open-skills-marketplace` 后重启
2. **Cursor / OpenCode**：`git pull` 后重启
3. **仍异常**：删除安装目录后按 [docs/INSTALL.md](docs/INSTALL.md) 重新安装

## Philosophy

- **情绪价值** - 编程不只是技术，也需要情感支持
- **系统化** - 用流程替代猜测
- **简化** - 简单是首要目标
- **证据驱动** - 在声明成功之前先验证

## Contributing

欢迎贡献新的 skills 或改进现有 skills！

1. Fork 本仓库
2. 创建新的 skill 目录或修改现有 skill
3. 提交 Pull Request

完整规范见 [skills/AGENTS.md](skills/AGENTS.md)。

## License

MIT License - 详见 [LICENSE](LICENSE) 文件
