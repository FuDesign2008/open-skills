# Open Skills 详细安装指南

本文档提供各平台的手动安装、更新和卸载说明。

> **推荐**：Claude Code 和 Cursor 用户优先使用 [Marketplace 安装](../README.md#installation)。

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
| 7 个 SKILL.md 知识层（solve-workflow、perf-workflow 等） | 包含 |
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

### Skill 未加载

1. 确认安装路径正确
2. 检查 SKILL.md 文件是否存在
3. 重启 AI 编码助手

### 触发词不生效

1. 检查触发词拼写是否正确
2. 尝试使用完整触发词（如「明确问题：xxx」）
3. 查看是否有其他 skill 冲突

### 更新后问题

1. 执行 `git pull` 更新
2. 清除缓存后重启
3. 如有问题，重新 clone
