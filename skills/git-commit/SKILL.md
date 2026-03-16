---
name: git-commit
version: "3.0.0"
user-invocable: true
description: 当用户说「提交代码」「git commit」「帮我提交」「写 commit message」「生成 commit」「提交一下」「git-commit」「自动提交代码」「git-commit-auto」「自动执行」「直接提交」，或由 jira-fix-workflow / jira-auto-fix-workflow 阶段7触发时使用。说「手动提交」「只生成命令」「不要执行」时进入手动模式，其余默认自动执行。
---

# Git Commit - 统一入口（默认自动模式）

## 触发词

| 模式 | 触发词 |
|------|--------|
| **手动**（显式） | `手动提交`、`只生成命令`、`不要执行`、`给我命令`、`生成命令不执行` |
| **自动**（默认） | `提交代码`、`git commit`、`git-commit`、`帮我提交`、`写 commit message`、`生成 commit`、`提交一下`、`自动提交代码`、`git-commit-auto`、`自动执行`、`直接提交`，以及上下文不明确时 |

## 模式判断规则

**优先级由高到低**：

| 优先级 | 信号 | 结果 |
|--------|------|------|
| 1 | 上层调用方明确传入 `execute=true` | 自动模式 |
| 2 | 由 `jira-auto-fix-workflow` 触发（阶段7） | 自动模式 |
| 3 | 用户说「手动提交」「只生成命令」「不要执行」「给我命令」 | 手动模式 |
| 4 | 其他触发词（「提交代码」「git commit」「帮我提交」等） | 自动模式 |
| 5 | 上下文不明确 | 默认自动模式 |

## 执行流程

### 步骤1：收集提交信息

写入 commit message 的字段：
- **type**：fix、feat、refactor、perf、style、docs、test
- **scope**（可选）：ai-summary、share、auth、api、ui、core
- **subject**：中文简要描述，不超过 50 字符
- **jira_id**（可选）：如 YNOTR-12167

仅用于上下文（不写入 commit message）：
- problem_description、root_cause、solution、modified_files、report_path、branch

### 步骤2：判断模式

确定 `execute=false`（手动）或 `execute=true`（自动），规则见「模式判断规则」。

### 步骤3：多项目检测

**扫描规则**：
- 扫描范围：workspace 根目录的一级和二级子目录
- 识别标准：存在 `.git` 目录
- 排除目录：`node_modules`、`.cursor`、`dist`、`build`、`.git`、隐藏目录（`.` 开头）
- 对每个候选目录执行 `git status` 验证是否有效

**多项目场景**：报告文件只在主项目（第一个）中提交；为每个有改动的项目独立生成 commit message。

### 步骤4：生成 Commit Message

**格式**：
```
<type>(<scope>): <subject> <Jira-ID>
```

规则：
- Subject 不超过 50 字符，使用中文
- 有 Jira ID 时追加到末尾
- 无 scope 时省略括号：`<type>: <subject>`
- commit message 只含标题行，无正文

### 步骤5：执行 Git 操作

**手动模式（execute=false）**：生成命令，不执行，提示用户手动运行。

**自动模式（execute=true）**：依次执行以下命令：

```bash
git status                                         # 检查状态与当前分支
git add .                                          # 添加所有改动
git commit -m "<type>(<scope>): <subject> <ID>"   # 提交
git log -1 --stat                                  # 确认提交详情
git push -u origin [branch-name]                   # 推送到远程
```

多项目时对每个项目独立执行上述步骤，末尾附汇总表。

## 输出格式

**自动模式**（默认）：
```
## Git 提交代码（自动模式）

**项目**: backend   **分支**: fuyg-jira-fix-YNOTR-12167
**Commit**: a1b2c3d  **推送状态**: ✅ 成功
**改动**: +45/-12 (3 files)

**下一步**：创建 PR → Code Review → 测试验证
```

**手动模式**（显式请求时）：
```
## Git 提交代码（手动模式）

**生成的 Commit Message**：
fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167

**执行命令**：
git status
git add .
git commit -m "fix(ai-summary): 修复分享链接中AI摘要按钮显示问题 YNOTR-12167"
git log -1 --stat
git push -u origin [branch-name]  # 可选

**提示**：请确认后手动执行上述命令。
```

多项目时对每个项目独立输出，末尾附汇总表。

## 错误处理

| 场景 | 处理方式 |
|------|---------|
| 无未提交改动 | 手动模式提示；自动模式执行 `git add .` 后继续 |
| 分支不存在 | 报错，建议先创建分支 |
| Git 操作失败 | 显示错误，提供降级方案（建议说「手动提交」重试） |
| 不在 Git 仓库 | 报错并终止，提示检查目录 |
| 多项目检测失败 | 降级为单项目模式，使用当前目录 |

## 安全机制（自动模式）

- 改动 >10 文件或 >500 行时警告；>20 文件或 >1000 行时警告（不阻断）
- 单项目失败不影响其他项目

## 注意事项

1. 多项目场景自动扫描 workspace，对每个有改动的项目独立提交
2. 报告文件只在主项目（第一个）中提交
3. 推送：手动模式可选，自动模式必执行
