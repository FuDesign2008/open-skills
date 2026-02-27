---
name: git-commit
version: "1.0.0"
user-invocable: true
description: Git 提交代码（手动模式），生成 commit message 和命令，不自动执行。当用户说"git-commit"、"git commit"、"提交代码"或"git-commit: xxx"、"提交代码： xxx"（冒号与空格中英文不限），或说"commit"、"git 提交"、"帮我提交"、"写 commit message"、"生成 commit"、"提交一下"等（在上下文为手动提交、生成命令不自动执行时）触发。调用 git-commit-core SKILL 执行核心逻辑，设置 execute=false。
---

# Git Commit - 手动模式

> 生成 Git commit message 和命令，由用户手动执行

## 触发词识别

当用户**单独说**以下词（如 `git-commit`、`提交代码`）或使用**「词 + 冒号 + 空格 + 具体描述」**形式时，触发本技能（手动模式）。带冒号时，冒号、空格不限制中英文。与 git-commit-auto（自动执行）区分：本技能仅生成命令，由用户手动执行。

- "git-commit" 或 "git-commit: xxx" → 生成 commit message 和命令，由用户手动执行
- "git commit" 或 "git commit: xxx" → 同上（空格形式）
- "提交代码" 或 "提交代码： xxx" → 同上
- "commit"、"git 提交"、"帮我提交"、"写 commit message"、"生成 commit"、"提交一下" → 在上下文为手动提交意图时，同上

## 执行流程

### 步骤1：收集提交信息

从上下文或用户输入中收集以下信息：

- **type**: commit 类型（fix、feat、refactor、perf、style、docs、test）- 写入 commit message
- **scope**: 可选，作用域（ai-summary、share、auth、api、ui、core）- 写入 commit message
- **subject**: 中文简要描述（不超过50字符）- 写入 commit message
- **jira_id**: 可选，Jira ID（如 YNOTR-12167）- 写入 commit message
- **problem_description**: 可选，问题描述（仅用于上下文，不写入 commit message）
- **root_cause**: 可选，根本原因（仅用于上下文，不写入 commit message）
- **solution**: 可选，修复方案（仅用于上下文，不写入 commit message）
- **modified_files**: 可选，修改文件列表（仅用于上下文，不写入 commit message）
- **branch**: 可选，目标分支（如 fuyg-jira-fix-YNOTR-12167）

### 步骤2：调用核心逻辑

调用 `git-commit-core` SKILL，传递以下参数：

```
调用 git-commit-core SKILL，设置 execute=false

参数：
- execute: false
- type: [收集的type]
- scope: [收集的scope]
- subject: [收集的subject]
- jira_id: [收集的jira_id]
- problem_description: [收集的problem_description]
- root_cause: [收集的root_cause]
- solution: [收集的solution]
- modified_files: [收集的modified_files]
- branch: [收集的branch]
```

### 步骤3：输出结果

输出生成的 commit message 和执行命令，提示用户手动执行。

## 输出格式

### 单项目场景

```
## Git 提交代码（手动模式）

**检测到的项目**：
- project1: /path/to/project1

**生成的 Commit Message**：
```
fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167
```

**执行命令**：
```bash
# 1. 检查 Git 状态
git status

# 2. 添加修改的文件
git add .

# 3. 提交
git commit -m "fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167"

# 4. 查看提交信息
git log -1 --stat

# 5. 推送到远程（可选）
git push -u origin [branch-name]
```

**提示**：请确认后手动执行上述命令。
```

### 多项目场景

```
## Git 提交代码（手动模式 - 多项目）

**检测到的项目**：
- backend: /path/to/backend
- frontend: /path/to/frontend

**项目1：backend**

**生成的 Commit Message**：
```
fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167
```

**执行命令**：
```bash
cd /path/to/backend
git status
git add .
git commit -m "fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167"
git log -1 --stat
git push -u origin [branch-name]
```

**项目2：frontend**

**生成的 Commit Message**：
```
fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167
```

**执行命令**：
```bash
cd /path/to/frontend
git status
git add .
git commit -m "fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167"
git log -1 --stat
git push -u origin [branch-name]
```

**提示**：请按顺序为每个项目执行上述命令。
```

## 使用场景

### 场景1：Jira Bug 修复后提交

在 `jira-fix-workflow` 阶段7中调用：

```
阶段7：Git 提交代码

1. 收集提交信息：
   - Jira ID: [从阶段2获取]
   - 问题描述: [从阶段3获取]
   - 根本原因: [从阶段3获取]
   - 修复方案: [从阶段5获取]
   - 修改文件: [从阶段6获取]

2. 调用 git-commit SKILL，传递上述信息

3. 等待用户确认后执行命令
```

### 场景2：通用代码提交

用户直接触发：

```
用户：提交代码

收集信息：
- type: "feat"
- subject: "添加新功能"
- modified_files: ["src/feature.js"]
```

## 注意事项

1. 本 SKILL 仅生成命令，不执行 Git 操作
2. 用户需要手动确认并执行生成的命令
3. 多项目场景需要按顺序为每个项目执行命令
4. 执行前建议先运行 `git status` 确认修改内容
5. 推送操作是可选的，根据实际需求决定

## 与 git-commit-auto 的区别

| 特性 | git-commit | git-commit-auto |
|------|-----------|----------------|
| 执行模式 | 手动 | 自动 |
| 用户确认 | 需要 | 不需要 |
| 适用场景 | 需要人工审核 | 自动化流程 |
| 调用方 | jira-fix-workflow | jira-auto-fix-workflow |
