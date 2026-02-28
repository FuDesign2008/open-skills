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

### 2. 注册插件

```bash
mkdir -p ~/.config/opencode/plugins
rm -f ~/.config/opencode/plugins/open-skills.js
ln -s ~/.config/opencode/open-skills/.opencode/plugins/open-skills.js ~/.config/opencode/plugins/open-skills.js
```

### 3. 创建 Skills 符号链接

OpenCode 只搜索 `~/.config/opencode/skills/` 目录，需要创建符号链接：

```bash
mkdir -p ~/.config/opencode/skills
rm -rf ~/.config/opencode/skills/open-skills
ln -s ~/.config/opencode/open-skills/skills ~/.config/opencode/skills/open-skills
```

### 4. 重启 OpenCode

重启 OpenCode 使插件和 skills 生效。

## Windows

### 前置条件

- **开发者模式** 或 **管理员权限**（创建符号链接需要）
  - Windows 10: 设置 → 更新和安全 → 开发者选项
  - Windows 11: 设置 → 系统 → 开发者选项

### CMD（命令提示符）

```cmd
:: 1. Clone 仓库
git clone https://github.com/FuDesign2008/open-skills.git "%USERPROFILE%\.config\opencode\open-skills"

:: 2. 注册插件
mkdir "%USERPROFILE%\.config\opencode\plugins" 2>nul
if exist "%USERPROFILE%\.config\opencode\plugins\open-skills.js" del "%USERPROFILE%\.config\opencode\plugins\open-skills.js"
mklink "%USERPROFILE%\.config\opencode\plugins\open-skills.js" "%USERPROFILE%\.config\opencode\open-skills\.opencode\plugins\open-skills.js"

:: 3. 创建 Skills 目录连接（无需特殊权限）
mkdir "%USERPROFILE%\.config\opencode\skills" 2>nul
if exist "%USERPROFILE%\.config\opencode\skills\open-skills" rmdir "%USERPROFILE%\.config\opencode\skills\open-skills"
mklink /J "%USERPROFILE%\.config\opencode\skills\open-skills" "%USERPROFILE%\.config\opencode\open-skills\skills"

:: 4. 重启 OpenCode
```

### PowerShell

```powershell
# 1. Clone 仓库
git clone https://github.com/FuDesign2008/open-skills.git "$env:USERPROFILE\.config\opencode\open-skills"

# 2. 注册插件
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\opencode\plugins"
Remove-Item -Force -ErrorAction SilentlyContinue "$env:USERPROFILE\.config\opencode\plugins\open-skills.js"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.config\opencode\plugins\open-skills.js" -Target "$env:USERPROFILE\.config\opencode\open-skills\.opencode\plugins\open-skills.js"

# 3. 创建 Skills 目录连接（无需特殊权限）
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\opencode\skills"
Remove-Item -Force -Recurse -ErrorAction SilentlyContinue "$env:USERPROFILE\.config\opencode\skills\open-skills"
New-Item -ItemType Junction -Path "$env:USERPROFILE\.config\opencode\skills\open-skills" -Target "$env:USERPROFILE\.config\opencode\open-skills\skills"

# 4. 重启 OpenCode
```

### Git Bash

> **注意**: Git Bash 的 `ln -s` 会复制文件而非创建符号链接，需使用 `cmd //c mklink`。

```bash
# 1. Clone 仓库
git clone https://github.com/FuDesign2008/open-skills.git ~/.config/opencode/open-skills

# 2. 注册插件
mkdir -p ~/.config/opencode/plugins
rm -f ~/.config/opencode/plugins/open-skills.js
cmd //c "mklink \"$(cygpath -w ~/.config/opencode/plugins/open-skills.js)\" \"$(cygpath -w ~/.config/opencode/open-skills/.opencode/plugins/open-skills.js)\""

# 3. 创建 Skills 目录连接
mkdir -p ~/.config/opencode/skills
rm -rf ~/.config/opencode/skills/open-skills
cmd //c "mklink /J \"$(cygpath -w ~/.config/opencode/skills/open-skills)\" \"$(cygpath -w ~/.config/opencode/open-skills/skills)\""

# 4. 重启 OpenCode
```

## 验证安装

**macOS / Linux:**
```bash
# 验证 plugins 符号链接
ls -l ~/.config/opencode/plugins/open-skills.js

# 验证 skills 符号链接
ls -l ~/.config/opencode/skills/open-skills
```

**Windows CMD:**
```cmd
:: 验证 plugins 符号链接
dir /AL "%USERPROFILE%\.config\opencode\plugins"

:: 验证 skills 符号链接
dir /AL "%USERPROFILE%\.config\opencode\skills"
```

**Windows PowerShell:**
```powershell
# 验证 plugins 符号链接
Get-ChildItem "$env:USERPROFILE\.config\opencode\plugins" | Where-Object { $_.LinkType }

# 验证 skills 符号链接
Get-ChildItem "$env:USERPROFILE\.config\opencode\skills" | Where-Object { $_.LinkType }
```

应该看到以下目录：
- `coding-fangirl/`
- `solve-workflow/`
- `perf-workflow/`
- `chinese-format/`
- `frontend-perf/`
- `android-webview-debug/`

## 使用方法

在 OpenCode 中使用 `/skill` 命令加载 skill：

```
/skill coding-fangirl
/skill solve-workflow
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
rm -f ~/.config/opencode/plugins/open-skills.js
rm -rf ~/.config/opencode/skills/open-skills
rm -rf ~/.config/opencode/open-skills
```

**Windows CMD:**
```cmd
del "%USERPROFILE%\.config\opencode\plugins\open-skills.js"
rmdir "%USERPROFILE%\.config\opencode\skills\open-skills"
rmdir /S /Q "%USERPROFILE%\.config\opencode\open-skills"
```

**Windows PowerShell:**
```powershell
Remove-Item "$env:USERPROFILE\.config\opencode\plugins\open-skills.js" -Force
Remove-Item "$env:USERPROFILE\.config\opencode\skills\open-skills" -Force
Remove-Item "$env:USERPROFILE\.config\opencode\open-skills" -Recurse -Force
```
