# OpenCode 安装指南

## 前置条件

- Git
- OpenCode CLI
- Windows: 开发者模式已启用 或 具有管理员权限

## macOS / Linux

### 1. Clone 仓库

```bash
# 克隆到 OpenCode 配置目录
git clone https://github.com/FuDesign2008/open-skills.git ~/.config/opencode/open-skills
```

### 2. 创建 Skills 符号链接

OpenCode 只搜索 `~/.config/opencode/skills/` 目录，需要创建符号链接：

```bash
mkdir -p ~/.config/opencode/skills
ln -s ~/.config/opencode/open-skills/skills ~/.config/opencode/skills/open-skills
```

## Windows

### 前置条件

- **开发者模式** 或 **管理员权限**（创建符号链接需要）
  - Windows 10: 设置 → 更新和安全 → 开发者选项
  - Windows 11: 设置 → 系统 → 开发者选项

### CMD（命令提示符）

```cmd
:: 1. Clone 仓库
git clone https://github.com/FuDesign2008/open-skills.git "%USERPROFILE%\.config\opencode\open-skills"

:: 2. 创建目录
mkdir "%USERPROFILE%\.config\opencode\skills" 2>nul

:: 3. 创建 Skills 目录连接（无需特殊权限）
mklink /J "%USERPROFILE%\.config\opencode\skills\open-skills" "%USERPROFILE%\.config\opencode\open-skills\skills"
```

### PowerShell

```powershell
# 1. Clone 仓库
git clone https://github.com/FuDesign2008/open-skills.git "$env:USERPROFILE\.config\opencode\open-skills"

# 2. 创建目录
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\opencode\skills"

# 3. 创建 Skills 目录连接（无需特殊权限）
New-Item -ItemType Junction -Path "$env:USERPROFILE\.config\opencode\skills\open-skills" -Target "$env:USERPROFILE\.config\opencode\open-skills\skills"
```

### Git Bash

> **注意**: Git Bash 的 `ln -s` 会复制文件而非创建符号链接，需使用 `cmd //c mklink`。

```bash
# 1. Clone 仓库
git clone https://github.com/FuDesign2008/open-skills.git ~/.config/opencode/open-skills

# 2. 创建目录
mkdir -p ~/.config/opencode/skills

# 3. 创建 Skills 目录连接
cmd //c "mklink /J \"$(cygpath -w ~/.config/opencode/skills/open-skills)\" \"$(cygpath -w ~/.config/opencode/open-skills/skills)\""
```

## 验证安装

**macOS / Linux:**
```bash
ls -l ~/.config/opencode/skills/open-skills
```

**Windows CMD:**
```cmd
dir /AL "%USERPROFILE%\.config\opencode\skills"
```

**Windows PowerShell:**
```powershell
Get-ChildItem "$env:USERPROFILE\.config\opencode\skills" | Where-Object { $_.LinkType }
```

应该看到以下目录：
- `coding-fangirl/`
- `problem-solving-workflow/`
- `perf-workflow/`
- `chinese-format/`
- `frontend-perf/`
- `android-webview-debug/`

## 使用方法

在 OpenCode 中使用 `/skill` 命令加载 skill：

```
/skill coding-fangirl
/skill problem-solving-workflow
/skill perf-workflow
```

或使用触发词：

- 「彩虹屁」「夸夸我」→ 情绪陪伴
- 「明确问题」「分析问题」→ 问题解决工作流
- 「性能分析」「性能优化」→ 性能工作流

## 更新

```bash
cd ~/.config/opencode/open-skills
git pull
```

## 卸载

**macOS / Linux:**
```bash
rm -rf ~/.config/opencode/skills/open-skills
rm -rf ~/.config/opencode/open-skills
```

**Windows CMD:**
```cmd
rmdir "%USERPROFILE%\.config\opencode\skills\open-skills"
rmdir /S /Q "%USERPROFILE%\.config\opencode\open-skills"
```

**Windows PowerShell:**
```powershell
Remove-Item "$env:USERPROFILE\.config\opencode\skills\open-skills" -Force
Remove-Item "$env:USERPROFILE\.config\opencode\open-skills" -Recurse -Force
```
