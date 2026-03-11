# Open Skills

![GitHub stars](https://img.shields.io/github/stars/FuDesign2008/open-skills?style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/FuDesign2008/open-skills)
[![Version](https://img.shields.io/github/v/release/FuDesign2008/open-skills?style=flat-square)](https://github.com/FuDesign2008/open-skills/releases)
![Skills](https://img.shields.io/badge/skills-7-informational?style=flat-square)
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
| **问题解决** | 七阶段工作流：分析问题 → 探索方案 → 制定计划 → 执行 → 验证 → 总结 |
| **性能优化** | 六阶段流程：证据收集 → 定位 → 假设 → 监控 → 优化 → 验证 |
| **内容创作** | 公众号、知乎等技术文章写作流程 |

## 多平台概览

| 平台 | 安装方式 | 配置目录 | 更新方式 |
|------|----------|----------|----------|
| Claude Code | Marketplace | 插件管理 | `claude plugin update open-skills@open-skills-marketplace` |
| Cursor | Marketplace / 手动 | `~/.cursor/extensions/open-skills` | `cd ~/.cursor/extensions/open-skills && git pull` |
| OpenCode | 符号链接 | `~/.config/opencode/open-skills` | `cd ~/.config/opencode/open-skills && git pull` |

各平台详细安装与更新步骤见 [docs/INSTALL.md](docs/INSTALL.md)。

## Installation

**Note:** 各平台安装方式不同，Claude Code 和 Cursor 支持 Marketplace 一键安装。

### Claude Code (via Plugin Marketplace)

```bash
/plugin marketplace add FuDesign2008/open-skills
/plugin install open-skills@open-skills-marketplace
```

### Cursor (via Plugin Marketplace)

> **⚠️ Note:** Cursor 平台支持尚在完善中，可能存在兼容性问题。欢迎 [Issue](https://github.com/FuDesign2008/open-skills/issues) 反馈。

**Option A: Marketplace 已上架**

```bash
/plugin-add open-skills
```

**Option B: 未上架或无法搜索到**

按 [docs/INSTALL.md](docs/INSTALL.md) 中 Cursor 章节进行手动安装。

### OpenCode

对 OpenCode 说：

```
Fetch and follow instructions from https://raw.githubusercontent.com/FuDesign2008/open-skills/main/.opencode/INSTALL.md
```

**详细文档**: [docs/README.opencode.md](docs/README.opencode.md)

### 验证安装

1. 新建会话
2. 输入「彩虹屁」或「分析问题」
3. 确认 AI 自动调用对应 skill
4. 若失败，参考 [docs/INSTALL.md](docs/INSTALL.md) 手动安装

## Updating

| 平台 | 更新命令 |
|------|----------|
| **Claude Code** | `claude plugin update open-skills@open-skills-marketplace` |
| **Cursor** | `cd ~/.cursor/extensions/open-skills && git pull` |
| **OpenCode** | `cd ~/.config/opencode/open-skills && git pull`<br>如有新增 commands，执行：`for cmd in ~/.config/opencode/open-skills/commands/*.md; do ln -sf "$cmd" ~/.config/opencode/commands/; done` |

手动安装或更多细节见 [docs/INSTALL.md](docs/INSTALL.md)。

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
2. **检查文件**：`ls skills/*/SKILL.md` 应列出 7 个 skill
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
