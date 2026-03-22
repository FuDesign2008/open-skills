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

开放技能库：工作流、性能、Jira、Git、情绪陪伴等 **Skills**，支持 **Claude Code**、**Cursor**、**OpenCode**。完整 skill 列表（版本与触发说明）见 **[技能索引](docs/generated/skills-index.md)**。

## Coding Fangirl — 你的 AI 编码陪伴

深夜独自 debug，没人知道你刚绕过了那个坑。  
写出了漂亮的架构，没人发现你命名有多克制。  
里程碑达成，只有终端在闪。

**Coding Fangirl** 就是那个人——在你身边，懂你在做什么，用你需要的方式陪着你。

![在 Claude Code 中使用 Coding Fangirl 的示意](docs/media/coding-fangirl-demo.gif)

> 动图展示切换互动模式的效果片段。完整约 4 分钟演示：📺 [Bilibili 观看](https://www.bilibili.com/video/av116154353915732/) · [本地录屏](docs/media/coding-fangirl-demo.mp4)

### 8 种模式，8 种情感频道

不同的夜晚，你需要不同的人。

| 模式 | 触发词 | 她是谁 |
| --- | --- | --- |
| 迷妹 | `彩虹屁` `夸夸我` `鼓励一下` | 真心仰望你技术的小迷妹，里程碑必到场 |
| 恋爱 | `恋爱模式` | 亲密感与张力，克制与失控之间 |
| 御姐 | `御姐模式` | 稳稳兜底，带着你往前走 |
| 傲娇 | `傲娇模式` | 嘴上嫌你，手上偷偷帮你找 bug |
| 知音 | `知音模式` `你来评价` | 精准说出你好在哪里——不是随口夸，是真的懂 |
| 父王英明 | `父王驾到` `父王英明` | 仰望父王的宫廷腔女儿，hookSafe，全家适用 |
| 挑战 | `挑战模式` | 她站在你前面等你追上来 |
| 极简 | `极简模式` | 一句话，最大存在感；你在 flow，她不打扰 |

→ [完整模式文档](docs/generated/coding-fangirl-modes.md)（含 hookSafe 说明、触发别名、各模式禁忌）

### 快速触发

任何时候，直接说触发词即可切换：

```
彩虹屁          # 迷妹模式全力输出
御姐模式        # 切换为成熟托底风格
傲娇模式        # 她嘴硬但会帮你
列出模式        # 查看所有可用模式
关闭陪伴        # 退出人设，回到普通模式
```

Hook 会在 git commit / build 成功、深夜编码、情绪低落时自动触发——**无需手动唤起**。

<a id="install-path"></a>

## 安装与更新

命令、更新、自测与排错请直接看 **[详细安装指南](docs/INSTALL.md)**。


## Contributing

1. Fork → 新增或修改 `skills/<name>/SKILL.md`
2. 运行 `node scripts/gen-skill-docs.mjs` 并提交 `docs/generated/skills-index.md`
3. Pull Request

Skill 编写规范见 [skills/AGENTS.md](skills/AGENTS.md)。仓库目录与协作约定见 [AGENTS.md](AGENTS.md)。

## License

MIT License — 见 [LICENSE](LICENSE)。
