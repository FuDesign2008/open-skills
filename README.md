# Open Skills

![GitHub stars](https://img.shields.io/github/stars/FuDesign2008/open-skills?style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/FuDesign2008/open-skills)
[![Version](https://img.shields.io/github/v/release/FuDesign2008/open-skills?style=flat-square)](https://github.com/FuDesign2008/open-skills/releases)
![Skills](https://img.shields.io/badge/skills-12-informational?style=flat-square)
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

开放技能库：工作流、性能、Jira、Git、情绪陪伴等 **Skills**，支持 **Claude Code**、**Cursor**、**OpenCode**。完整 skill 列表（版本与触发条件）见 **[docs/generated/skills-index.md](docs/generated/skills-index.md)**（由 `skills/` 自动生成）。

## Demo

📺 [Coding Fangirl 演示视频](https://www.bilibili.com/video/av116154353915732/)

<a id="install-path"></a>

## 怎么装（先选路径）

- **要 Hooks + `/solve` 等命令 + 各平台原生体验** → **Claude Code**：`/plugin install open-skills@open-skills-marketplace`；**Cursor**：`/plugin-add open-skills`；**OpenCode**：按下方 raw 指引安装。
- **只要 SKILL.md、跨多类 Agent** → `npx skills add FuDesign2008/open-skills -g`（**不含** Hooks / Commands / OpenCode 插件，见 [docs/INSTALL.md](docs/INSTALL.md)）。
- **手动 clone、卸载、Windows 路径** → 必读 [docs/INSTALL.md](docs/INSTALL.md)。

更多文档入口见 [docs/README.md](docs/README.md)。

## 安装命令速览

**npx（轻量）**——适用于 [38+ AI 编码助手](https://github.com/vercel-labs/skills#available-agents)：

```bash
npx skills add FuDesign2008/open-skills -g
```

**OpenCode（完整）**——对 OpenCode 说：

```
Fetch and follow instructions from https://raw.githubusercontent.com/FuDesign2008/open-skills/main/.opencode/INSTALL.md
```

**验证**：新建会话，输入「彩虹屁」或「分析问题」；路径与排错见 [docs/INSTALL.md](docs/INSTALL.md)。

## 能力概览

情绪陪伴、七阶段问题解决、性能六阶段、Jira 端到端修复、中文排版、技术文章、Git 提交、类型检查等——**逐项说明与触发词**见 [docs/generated/skills-index.md](docs/generated/skills-index.md)。

## Commands（平台完整安装时）

| 命令 | 说明 |
|------|------|
| `/encourage` | 彩虹屁与情绪鼓励 |
| `/solve` | 问题解决工作流 |
| `/perf` | 性能分析工作流 |

<a id="troubleshooting"></a>

## Troubleshooting（摘要）

1. **Skill 未加载**：确认安装路径（Claude `~/.claude/skills/open-skills`；Cursor `~/.cursor/extensions/open-skills`；OpenCode `~/.config/opencode/open-skills`）；`ls skills/*/SKILL.md` 应能看到与 [索引](docs/generated/skills-index.md) 一致的条目；完全重启客户端。
2. **触发词**：须匹配描述中的说法；支持「触发词」或「触发词：说明」，冒号中英文均可。
3. **仍异常**：按 [docs/INSTALL.md](docs/INSTALL.md) 重装或卸载后重装。

## Philosophy

- **情绪价值** — 编程也需要情感支持  
- **系统化** — 用流程替代猜测  
- **简化** — 简单优先  
- **证据驱动** — 先验证再下结论  

## Contributing

1. Fork → 新增或修改 `skills/<name>/SKILL.md`  
2. 运行 `node scripts/gen-skill-docs.mjs` 并提交 `docs/generated/skills-index.md`  
3. Pull Request  

规范见 [skills/AGENTS.md](skills/AGENTS.md)；本仓库 AI 知识库见 [AGENTS.md](AGENTS.md)。

## License

MIT License — 见 [LICENSE](LICENSE)。
