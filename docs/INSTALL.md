# Open Skills 详细安装指南

本文档提供各平台的手动安装、更新和卸载说明。

> **推荐**：Claude Code 和 Cursor 用户优先使用 [Marketplace 安装](../README.md#installation)。

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

应该看到以下目录：`coding-fangirl/`、`problem-solving-workflow/`、`perf-workflow/` 等。

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

详细说明请参考 [OpenCode 安装指南](../.opencode/INSTALL.md)。

### macOS / Linux

```bash
git clone https://github.com/FuDesign2008/open-skills.git ~/.config/opencode/open-skills
```

### Windows

```powershell
# PowerShell
git clone https://github.com/FuDesign2008/open-skills.git $env:USERPROFILE\.config\opencode\open-skills

# CMD
git clone https://github.com/FuDesign2008/open-skills.git %USERPROFILE%\.config\opencode\open-skills
```

### 验证安装

```bash
ls ~/.config/opencode/open-skills/skills/
```

### 更新

```bash
cd ~/.config/opencode/open-skills && git pull
```

### 卸载

```bash
rm -rf ~/.config/opencode/open-skills
```

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
