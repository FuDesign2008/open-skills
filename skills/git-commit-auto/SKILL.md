---
name: git-commit-auto
version: '1.0.0'
user-invocable: true
description: Git 提交代码（自动模式），自动执行 git add、commit、push。当用户说"git-commit-auto"、"自动提交代码"或需要自动提交代码时触发。调用 git-commit-core SKILL 执行核心逻辑，设置 execute=true。
---

# Git Commit Auto - 自动模式

> 自动执行 Git 提交操作，无需人工干预

## 触发词定义

**主要触发词**：

- `git-commit-auto`
- `自动提交代码`

**触发响应**：确认触发 → 调用 `git-commit-core` SKILL → 自动执行 → 输出结果

## 执行流程

### 步骤 1：收集提交信息

从上下文或用户输入中收集以下信息：

- **type**: commit 类型（fix、feat、refactor、perf、style、docs、test）- 写入 commit message
- **scope**: 可选，作用域（ai-summary、share、auth、api、ui、core）- 写入 commit message
- **subject**: 中文简要描述（不超过 50 字符）- 写入 commit message
- **jira_id**: 可选，Jira ID（如 YNOTR-12167）- 写入 commit message
- **problem_description**: 可选，问题描述（仅用于上下文，不写入 commit message）
- **root_cause**: 可选，根本原因（仅用于上下文，不写入 commit message）
- **solution**: 可选，修复方案（仅用于上下文，不写入 commit message）
- **modified_files**: 可选，修改文件列表（仅用于上下文，不写入 commit message）
- **report_path**: 可选，分析报告路径（仅用于上下文，不写入 commit message）
- **branch**: 可选，目标分支（如 fuyg-jira-fix-YNOTR-12167）

### 步骤 2：调用核心逻辑

调用 `git-commit-core` SKILL，传递以下参数：

```
调用 git-commit-core SKILL，设置 execute=true

参数：
- execute: true
- type: [收集的type]
- scope: [收集的scope]
- subject: [收集的subject]
- jira_id: [收集的jira_id]
- problem_description: [收集的problem_description]
- root_cause: [收集的root_cause]
- solution: [收集的solution]
- modified_files: [收集的modified_files]
- report_path: [收集的report_path]
- branch: [收集的branch]
```

### 步骤 3：自动执行

核心逻辑会自动执行以下操作：

1. 检测多项目（如果未指定项目列表）
2. 生成 commit message（只有标题行：`<type>(<scope>): <subject> <Jira-ID>`）
3. 对每个项目执行：
   - `git status` 检查
   - `git add .` 添加所有修改
   - `git commit -m "<type>(<scope>): <subject> <Jira-ID>"` 提交
   - `git push -u origin [branch]` 推送
4. 捕获执行结果（commit hash、推送状态等）

### 步骤 4：输出结果

输出执行结果，包括 commit hash、推送状态、改动统计等。

## 输出格式

### 单项目场景

```
## Git 提交代码（自动模式）

**项目**: backend
**分支**: fuyg-jira-fix-YNOTR-12167
**Commit**: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
**推送状态**: ✅ 成功

**改动统计**：
- 新增: +45 行
- 删除: -12 行
- 修改文件: 3 个

**下一步**：
1. 在Jira中创建Pull Request
2. 通知相关人员进行Code Review
3. 测试验证

**分析报告**: reports/YNOTR-12167-analysis.md
```

### 多项目场景

```
## Git 提交代码（自动模式 - 多项目）

**分支**: fuyg-jira-fix-YNOTR-12167
**涉及项目**: 2个

| 项目 | Commit Hash | 推送状态 | 改动 |
|------|------------|---------|------|
| backend | a1b2c3d | ✅ 成功 | +45/-12 (3 files) |
| frontend | e4f5g6h | ✅ 成功 | +23/-8 (2 files) |

**下一步**：
1. 在Jira中为每个项目创建Pull Request
2. 通知相关人员进行Code Review
3. 测试验证（注意多项目联动测试）

**分析报告**: backend/reports/YNOTR-12167-analysis.md
```

### 执行失败场景

```
## Git 提交代码（自动模式）

**项目**: backend
**分支**: fuyg-jira-fix-YNOTR-12167
**状态**: ❌ 执行失败

**错误信息**：
[具体的错误信息]

**建议**：
1. 检查 Git 状态：git status
2. 检查分支是否存在：git branch
3. 检查远程连接：git remote -v
4. 手动执行提交命令
```

## 使用场景

### 场景 1：Jira Bug 自动修复后提交

在 `jira-auto-fix-workflow` 阶段 7 中调用：

```
阶段7：Git 提交代码（自动）

1. 收集提交信息：
   - Jira ID: [从阶段2获取]
   - 问题描述: [从阶段3获取]
   - 根本原因: [从阶段3获取]
   - 修复方案: [从阶段5获取]
   - 修改文件: [从阶段6获取]
   - 报告路径: reports/[JIRA-ID]-analysis.md

2. 调用 git-commit-auto SKILL，传递上述信息

3. 自动执行并输出结果
```

### 场景 2：自动化流程中的代码提交

在 CI/CD 或其他自动化流程中调用：

```
自动化流程：代码提交

调用 git-commit-auto SKILL：
- type: "feat"
- subject: "添加新功能"
- modified_files: ["src/feature.js"]
- branch: "feature/new-feature"
```

## 安全机制

### 1. 修改前检查

- 自动检查 Git 状态
- 确认有未提交的修改
- 确认当前分支正确

### 2. 改动阈值检测

- 警告阈值：修改 >10 个文件或 >500 行
- 阻断阈值：修改 >20 个文件或 >1000 行
- 超过阈值时输出警告，但不阻断执行

### 3. 错误处理

- Git 操作失败时自动停止
- 输出详细的错误信息
- 提供降级方案（手动执行）

### 4. 多项目保护

- 每个项目独立执行
- 单个项目失败不影响其他项目
- 汇总所有项目的执行状态

## 注意事项

1. 本 SKILL 会自动执行所有 Git 操作，无需人工确认
2. 执行前会自动检测多项目，为每个项目独立提交
3. 报告文件只在主项目（第一个项目）中提交
4. 推送操作会自动执行，确保代码同步到远程
5. 建议在自动化流程中使用，不适合需要人工审核的场景

## 与 git-commit 的区别

| 特性     | git-commit        | git-commit-auto        |
| -------- | ----------------- | ---------------------- |
| 执行模式 | 手动              | 自动                   |
| 用户确认 | 需要              | 不需要                 |
| Git 操作 | 仅生成命令        | 自动执行               |
| 适用场景 | 需要人工审核      | 自动化流程             |
| 调用方   | jira-fix-workflow | jira-auto-fix-workflow |
| 推送操作 | 可选，手动执行    | 自动执行               |

## 错误处理

**未提交修改**：

- 自动执行 `git add .` 添加所有修改

**分支不存在**：

- 报错并终止
- 提示先创建分支

**Git 操作失败**：

- 显示详细错误信息
- 提供手动执行建议

**不在 Git 仓库**：

- 报错并终止
- 提示检查目录

**多项目检测失败**：

- 降级为单项目模式
- 使用当前目录作为项目目录
