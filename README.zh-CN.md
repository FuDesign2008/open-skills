# Open Skills

![GitHub stars](https://img.shields.io/github/stars/FuDesign2008/open-skills?style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/FuDesign2008/open-skills)
[![Version](https://img.shields.io/github/v/release/FuDesign2008/open-skills?style=flat-square)](https://github.com/FuDesign2008/open-skills/releases)
![Skills](https://img.shields.io/badge/skills-11-informational?style=flat-square)

**[English](README.md)** | 中文

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

开放技能库：工作流、性能、Jira、Git 等 **Skills**。通过 `npx skills` 安装 **SKILL.md**，适用于 **Claude Code**、**Cursor**、**OpenCode** 及其他支持 skills CLI 的助手。完整 skill 列表（版本与触发说明）见 **[技能索引](docs/generated/skills-index.md)**。

> 💕 **AI 编码陪伴小迷妹** 已独立为 **[oh-my-fangirl](https://github.com/FuDesign2008/oh-my-fangirl)**，拥有独立版本迭代与更丰富的模式生态。

<a id="install-path"></a>

## 安装与更新

非交互全局安装（推荐；避免 PromptScript ✗ 噪音）：

```bash
git clone https://github.com/FuDesign2008/open-skills.git
cd open-skills
node scripts/install-skills.mjs
```

或底层 CLI 交互式安装：

```bash
npx skills add FuDesign2008/open-skills -g
```

更新：

```bash
npx skills update
```

参数与排错见 **[详细安装指南](docs/INSTALL.md)**。本仓库不分发斜杠命令、Hooks 或 Marketplace 插件。


## Contributing

1. Fork → 新增或修改 `skills/<name>/SKILL.md`
2. 运行 `node scripts/gen-skill-docs.mjs` 重新生成索引并提交 `docs/generated/skills-index.md`（**禁止手改** 该文件，手改会导致 CI `verify` 失败）
3. 遵循 [AGENTS.md](AGENTS.md) 的「AI 铁律」与 Skill 开发规范
4. Pull Request

Skill 编写规范与仓库协作约定见 [AGENTS.md](AGENTS.md)。

## License

MIT License — 见 [LICENSE](LICENSE)。
