# Open Skills

![GitHub stars](https://img.shields.io/github/stars/FuDesign2008/open-skills?style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/FuDesign2008/open-skills)
[![Version](https://img.shields.io/github/v/release/FuDesign2008/open-skills?style=flat-square)](https://github.com/FuDesign2008/open-skills/releases)
![Skills](https://img.shields.io/badge/skills-11-informational?style=flat-square)
![Commands](https://img.shields.io/badge/commands-2-informational?style=flat-square)

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

开放技能库：工作流、性能、Jira、Git 等 **Skills**，支持 **Claude Code**、**Cursor**、**OpenCode**。完整 skill 列表（版本与触发说明）见 **[技能索引](docs/generated/skills-index.md)**。

> 💕 **AI 编码陪伴小迷妹** 已独立为 **[oh-my-fangirl](https://github.com/FuDesign2008/oh-my-fangirl)**，拥有独立版本迭代与更丰富的模式生态。

<a id="install-path"></a>

## 安装与更新

一行命令安装所有 skill（全局，适用于支持 `npx skills` 的编码助手）：

```bash
npx skills add FuDesign2008/open-skills -g
```

更新：

```bash
npx skills update
```

> 需要 **快捷命令、Hook、平台原生集成**（Claude Code / Cursor / OpenCode 全能力安装）？见 **[详细安装指南](docs/INSTALL.md)**。


## Contributing

1. Fork → 新增或修改 `skills/<name>/SKILL.md`
2. 运行 `node scripts/gen-skill-docs.mjs` 重新生成索引并提交 `docs/generated/skills-index.md`（**禁止手改** 该文件，手改会导致 CI `verify` 失败）
3. 遵循 [AGENTS.md](AGENTS.md) 的「AI 铁律」与 Skill 开发规范
4. Pull Request

Skill 编写规范与仓库协作约定见 [AGENTS.md](AGENTS.md)。

## License

MIT License — 见 [LICENSE](LICENSE)。
