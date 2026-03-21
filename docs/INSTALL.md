# Open Skills 详细安装指南

本文档负责 **手动路径、卸载、多系统命令** 与 **npx 能力边界**。若你只需「怎么选安装方式」，先看 [README.md](../README.md) 的 **「怎么装」**；**完整 skill 名称与版本** 以自动生成的 [skills-index.md](generated/skills-index.md) 为准。

**与 README 的分工**：README = 门面 + 决策树 + 链接；INSTALL = 可复制的 clone / 配置 / 卸载步骤；索引 = `skills/` 单一事实源。

> **推荐**：Claude Code / Cursor 优先 [Marketplace / 插件安装](../README.md#install-path)。

---

## 通用安装（npx skills）— 推荐轻量方式

支持 Claude Code、Cursor、OpenCode 等主流 AI 编码助手，无需关心平台差异。

### 安装

```bash
# 全部安装（全局，推荐）
npx skills add FuDesign2008/open-skills -g

# 仅安装某个 skill
npx skills add FuDesign2008/open-skills --skill solve-workflow -g

# 查看可安装的 skill 列表
npx skills add FuDesign2008/open-skills --list
```

### 更新

```bash
npx skills update
```

### 覆盖范围说明

| 能力 | 是否包含 |
|------|----------|
| 仓库 `skills/` 下全部 `SKILL.md`（与 [skills-index.md](generated/skills-index.md) 同步；默认全量安装，亦可用 `--skill` 只装子集） | 包含 |
| Hooks（情绪安抚 / 里程碑庆祝 / 欢迎语） | **不包含** |
| Commands（`/solve`、`/perf`、`/encourage`） | **不包含** |
| OpenCode 插件 | **不包含** |

如需 Hooks 和 Commands，请使用各平台完整安装方式（见下方章节）。

---

## Claude Code 手动安装

### macOS / Linux

```bash
# 克隆到 Claude Code skills 目录
git clone https://github.com/FuDesign2008/open-skills.git ~/.claude/skills/open-skills
```

### Windows

#### PowerShell

```powershell
git clone https://github.com/FuDesign2008/open-skills.git $env:USERPROFILE\.claude\skills\open-skills
```

#### CMD

```cmd
git clone https://github.com/FuDesign2008/open-skills.git %USERPROFILE%\.claude\skills\open-skills
```

### 验证安装

```bash
# macOS / Linux
ls ~/.claude/skills/open-skills/skills/

# Windows (PowerShell)
ls $env:USERPROFILE\.claude\skills\open-skills\skills\
```

应该看到以下目录：`coding-fangirl/`、`solve-workflow/`、`perf-workflow/` 等。

### 更新

```bash
# macOS / Linux
cd ~/.claude/skills/open-skills && git pull

# Windows (PowerShell)
cd $env:USERPROFILE\.claude\skills\open-skills; git pull
```

### 卸载

```bash
# macOS / Linux
rm -rf ~/.claude/skills/open-skills

# Windows (PowerShell)
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\skills\open-skills"
```

---

## Cursor 手动安装

### macOS / Linux

```bash
# 克隆到 Cursor extensions 目录
git clone https://github.com/FuDesign2008/open-skills.git ~/.cursor/extensions/open-skills
```

### Windows

```powershell
git clone https://github.com/FuDesign2008/open-skills.git $env:USERPROFILE\.cursor\extensions\open-skills
```

### 配置路径

1. 打开 Cursor 设置（`Cmd/Ctrl + ,`）
2. 搜索「Skills」或「Extensions」
3. 添加 skills 路径：`~/.cursor/extensions/open-skills/skills`

### 验证安装

在 Cursor Agent chat 中输入「彩虹屁」，应该触发 `coding-fangirl` skill。

### 更新

```bash
# macOS / Linux
cd ~/.cursor/extensions/open-skills && git pull

# Windows (PowerShell)
cd $env:USERPROFILE\.cursor\extensions\open-skills; git pull
```

### 卸载

```bash
# macOS / Linux
rm -rf ~/.cursor/extensions/open-skills

# Windows (PowerShell)
Remove-Item -Recurse -Force "$env:USERPROFILE\.cursor\extensions\open-skills"
```

---

## OpenCode 手动安装

OpenCode 安装需要配置插件、skills 和 commands 符号链接，请参考详细的 [OpenCode 安装指南](../.opencode/INSTALL.md)。

---

## 常见问题

更完整的摘要见 [README.md — Troubleshooting](../README.md#troubleshooting)。

### Skill 未加载

1. 对照 README 中的路径说明确认安装目录
2. 本地仓库可执行 `node scripts/gen-skill-docs.mjs`，核对 `docs/generated/skills-index.md` 是否列出预期 skill
3. 完全退出并重启客户端

### 触发词不生效

1. 对照 [skills-index.md](generated/skills-index.md) 中的描述原文
2. 尝试「触发词：具体说明」形式（冒号中英文均可）
3. 排查与其他 skill 触发词冲突

### 更新后问题

1. Marketplace：`claude plugin update …`；clone 安装：`git pull`
2. 清除缓存后重启
3. 仍异常则删除安装目录后按上文重装
