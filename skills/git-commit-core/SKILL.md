---
name: git-commit-core
version: "1.0.0"
description: Git 提交代码核心逻辑，提供多项目检测、commit message 生成、Git 操作封装。不直接触发，仅供其他 SKILL（如 git-commit、git-commit-auto）调用。当需要执行 Git 提交操作时，由包装层 SKILL 调用此核心逻辑。
---

# Git Commit Core - 核心逻辑

> 本 SKILL 提供 Git 提交的核心逻辑，不直接触发，仅供其他 SKILL 调用

## 调用方式

其他 SKILL 应通过以下方式调用：

1. 在文档中说明"调用 `git-commit-core` SKILL"
2. 通过上下文传递参数信息
3. 依赖 Claude 的智能识别来触发此 SKILL

## 核心功能

### 1. 多项目检测

**扫描规则**：
- 扫描范围：workspace 根目录的一级和二级子目录
- 识别标准：存在 `.git` 目录
- 自动过滤：排除以下目录
  - `node_modules`
  - `.cursor`
  - `dist`
  - `build`
  - `.git`
  - 隐藏目录（以 `.` 开头，除 `.git` 外）

**执行步骤**：
1. 获取 workspace 根目录路径
2. 扫描一级子目录，查找包含 `.git` 的目录
3. 扫描二级子目录，查找包含 `.git` 的目录
4. 过滤排除目录
5. 验证每个目录是否为有效 Git 仓库（执行 `git status` 验证）
6. 返回项目列表：`[{name: "项目名", path: "项目路径"}]`

**输出格式**：
```
检测到 N 个 Git 项目：
- project1: /path/to/project1
- project2: /path/to/project2
```

### 2. Commit Message 生成

**输入参数**（通过上下文传递）：

```typescript
{
  type: string,           // fix, feat, refactor, perf, style, docs, test - 写入 commit message
  scope?: string,         // 可选：ai-summary, share, auth, api, ui, core - 写入 commit message
  subject: string,        // 中文简要描述（不超过50字符）- 写入 commit message
  jira_id?: string,      // 可选：Jira ID（如 YNOTR-12167）- 写入 commit message
  // 以下参数仅用于上下文分析，不写入 commit message
  problem_description?: string,  // 可选：问题描述（仅用于上下文）
  root_cause?: string,    // 可选：根本原因（仅用于上下文）
  solution?: string,      // 可选：修复方案（仅用于上下文）
  modified_files?: string[], // 可选：修改文件列表（仅用于上下文）
  report_path?: string    // 可选：分析报告路径（仅用于上下文）
}
```

**输出格式**：

**单项目或主项目**：
```
<type>(<scope>): <subject> <Jira-ID>
```

**多项目中的其他项目**：
```
<type>(<scope>): <subject> <Jira-ID>
```

（单项目和多项目格式相同，都是标题行）

**格式规则**：
- Type 类型：fix、feat、refactor、perf、style、docs、test
- Scope 示例：ai-summary、share、auth、api、ui、core
- Subject：中文简要描述，不超过 50 字符
- Jira ID：如果提供，追加到标题末尾
- Commit message 只包含标题行，不包含详细描述
- 详细参数（problem_description、root_cause、solution 等）仅用于上下文分析，不写入 commit message

### 3. Git 操作封装

**参数控制**：
- `execute`: boolean - 是否执行 Git 命令
  - `false`: 仅生成命令，不执行
  - `true`: 实际执行 Git 操作

**Git 操作流程**：

1. **检查 Git 状态**
   ```bash
   git status
   ```
   - 检查是否有未提交的修改
   - 检查当前分支

2. **添加文件**
   ```bash
   git add .
   ```
   - 添加所有修改的文件
   - 包括代码文件和报告文件（如果存在）

3. **提交**
   ```bash
   git commit -m "<type>(<scope>): <subject> <Jira-ID>"
   ```
   - 使用生成的 commit message（只有标题行）

4. **查看提交信息**
   ```bash
   git log -1 --stat
   ```
   - 显示最后一次提交的详细信息
   - 显示修改的文件和行数统计

5. **推送到远程**（可选）
   ```bash
   git push -u origin [branch-name]
   ```
   - 推送到远程仓库
   - 设置上游分支

**执行模式**：

**手动模式（execute=false）**：
- 生成所有命令
- 输出完整的 commit message
- 提示用户手动执行

**自动模式（execute=true）**：
- 自动执行所有 Git 操作
- 捕获执行结果
- 输出执行状态和 commit hash

### 4. 多项目处理

**单项目场景**：
- 在当前项目目录执行所有操作
- 生成单项目格式的 commit message

**多项目场景**：
1. 检测所有项目
2. 为每个有改动的项目生成独立的 commit message
3. 对每个项目依次执行：
   - `cd [项目目录]`
   - `git status` 检查
   - `git add .`（只添加该项目的改动）
   - `git commit -m "[该项目的commit message]"`
   - `git push -u origin [branch-name]`
4. 报告文件只在主项目（第一个项目）中提交
5. 汇总所有项目的提交状态

**项目识别**：
- 根据修改文件路径自动定位到对应项目
- 路径匹配：`backend/src/api.js` → backend 项目
- 记录每个项目的修改文件列表
- 记录每个项目的代码改动统计（+/- 行数）

## 输出格式

### 手动模式输出

```
## Git 提交代码（手动模式）

**检测到的项目**：
- project1: /path/to/project1

**生成的 Commit Message**：
fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167

**执行命令**：
```bash
git status
git add .
git commit -m "fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167"
git log -1 --stat
git push -u origin [branch]  # 可选
```

请确认后手动执行上述命令。
```

### 自动模式输出（单项目）

```
## Git 提交代码（自动模式）

**项目**: project1
**分支**: fuyg-jira-fix-[JIRA-ID]
**Commit**: [commit hash]
**推送状态**: ✅ 成功

**下一步**：
1. 在Jira中创建Pull Request
2. 通知相关人员进行Code Review
3. 测试验证

**分析报告**: reports/[JIRA-ID]-analysis.md
```

### 自动模式输出（多项目）

```
## Git 提交代码（自动模式 - 多项目）

**分支**: fuyg-jira-fix-[JIRA-ID]
**涉及项目**: 2个

| 项目 | Commit Hash | 推送状态 | 改动 |
|------|------------|---------|------|
| backend | a1b2c3d | ✅ 成功 | +45/-12 (3 files) |
| frontend | e4f5g6h | ✅ 成功 | +23/-8 (2 files) |

**下一步**：
1. 在Jira中为每个项目创建Pull Request
2. 通知相关人员进行Code Review
3. 测试验证（注意多项目联动测试）

**分析报告**: backend/reports/[JIRA-ID]-analysis.md
```

## 错误处理

**未提交修改**：
- 手动模式：提示用户有未提交修改
- 自动模式：自动执行 `git add .`

**分支不存在**：
- 提示错误，建议先创建分支

**Git 操作失败**：
- 显示错误信息
- 提供降级方案（手动执行）

**不在 Git 仓库**：
- 报错并终止
- 提示用户检查目录

**多项目检测失败**：
- 降级为单项目模式
- 使用当前目录作为项目目录

## 使用示例

### 示例1：手动模式调用

```
调用 git-commit-core SKILL，设置 execute=false

参数：
- type: "fix"
- scope: "ai-summary"
- subject: "修复分享链接中AI摘要按钮显示问题"
- jira_id: "YNOTR-12167"
- problem_description: "..."（仅用于上下文）
- root_cause: "..."（仅用于上下文）
- solution: "..."（仅用于上下文）
- modified_files: [...]（仅用于上下文）

生成的 commit message：
fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167
```

### 示例2：自动模式调用

```
调用 git-commit-core SKILL，设置 execute=true

参数：
- type: "fix"
- scope: "ai-summary"
- subject: "修复分享链接中AI摘要按钮显示问题"
- jira_id: "YNOTR-12167"
- problem_description: "..."（仅用于上下文）
- root_cause: "..."（仅用于上下文）
- solution: "..."（仅用于上下文）
- modified_files: [...]（仅用于上下文）
- report_path: "reports/YNOTR-12167-analysis.md"（仅用于上下文）
- branch: "fuyg-jira-fix-YNOTR-12167"

生成的 commit message：
fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167
```

## 注意事项

1. 本 SKILL 不直接触发，必须由包装层 SKILL 调用
2. 参数通过上下文传递，不通过函数调用
3. 多项目检测会自动执行，除非明确指定项目列表
4. Commit message 格式遵循现有规范，保持向后兼容
5. 执行模式由 `execute` 参数控制，包装层负责设置
