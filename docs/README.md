# 文档索引

| 文档 | 适合谁 | 内容 |
|------|--------|------|
| [../README.md](../README.md) | 所有人 | 项目简介；**通用安装 / 全能力安装** 选型；排错见 INSTALL |
| [INSTALL.md](INSTALL.md) | 要复制命令、查范围、排错的用户 | **通用安装**（npx）详解、**全能力** OpenCode raw 入口、常见问题 |
| [README.opencode.md](README.opencode.md) | OpenCode 用户 | OpenCode 侧使用与排错 |
| [../.opencode/INSTALL.md](../.opencode/INSTALL.md) | OpenCode **全能力安装** | 插件、符号链接、命令 |
| [opencode-coding-fangirl-implementation.md](opencode-coding-fangirl-implementation.md) | 贡献者 | coding-fangirl 在 OpenCode 的实现说明 |
| [generated/skills-index.md](generated/skills-index.md) | 所有人 | 全部 skill 的版本、可唤起性、描述（触发条件）；由脚本生成，页首有维护提示 |

### 给维护者与贡献者

如果你要改仓库、提 PR，除了上表里的安装文档，通常还会翻到这些位置：

- **本页（docs/README.md）**：只是在文档之间指路，没有安装步骤。
- **[README.md](../README.md)**：给访客看项目是什么、怎么选安装方式。
- **[INSTALL.md](INSTALL.md)**：**通用安装**（npx）与速览、常见问题；OpenCode **全能力安装** 长篇在 [.opencode/INSTALL.md](../.opencode/INSTALL.md)。
- **[AGENTS.md](../AGENTS.md)**：仓库结构、协作约定、验证命令，偏「在仓库里干活」时查。

改了任意 **`skills/`** 下的 `SKILL.md` 之后，请在仓库根目录执行：

```bash
node scripts/gen-skill-docs.mjs
```

然后把生成出来的 **`docs/generated/skills-index.md`** 和代码一起提交，这样 PR 里的技能列表才会和源文件一致（CI 也会按这个文件检查）。
