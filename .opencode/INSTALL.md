# OpenCode 安装指南

## 前置条件

- Git
- OpenCode CLI

## macOS / Linux

```bash
# 克隆到 OpenCode 配置目录
git clone https://github.com/FuDesign2008/open-skills.git ~/.config/opencode/open-skills
```

## Windows

### CMD

```cmd
git clone https://github.com/FuDesign2008/open-skills.git %USERPROFILE%\.config\opencode\open-skills
```

### PowerShell

```powershell
git clone https://github.com/FuDesign2008/open-skills.git $env:USERPROFILE\.config\opencode\open-skills
```

### Git Bash

```bash
git clone https://github.com/FuDesign2008/open-skills.git ~/.config/opencode/open-skills
```

## 验证安装

```bash
# 检查文件是否存在
ls ~/.config/opencode/open-skills/skills/
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

```bash
rm -rf ~/.config/opencode/open-skills
```
