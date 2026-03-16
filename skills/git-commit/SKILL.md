---
name: git-commit
version: "3.0.0"
user-invocable: true
description: 当用户说「提交代码」「git commit」「帮我提交」「写 commit message」「生成 commit」「提交一下」「git-commit」「自动提交代码」「git-commit-auto」，或由 jira-fix-workflow 阶段7触发时使用。
---

# Git Commit - 统一入口（默认自动模式）

## 模式判断规则

| 信号 | 结果 |
|------|------|
| 上层传入 `execute=true`，或由 `jira-fix-workflow` 阶段7触发 | 自动模式 |
| 用户说「手动提交」「只生成命令」「不要执行」「给我命令」 | 手动模式 |
| 其他触发词或上下文不明确 | 默认自动模式 |

## 执行流程

### 步骤1：收集提交信息

写入 commit message 的字段：
- **type**：fix、feat、refactor、perf、style、docs、test
- **scope**（可选）：ai-summary、share、auth、api、ui、core
- **subject**：中文简要描述，不超过 50 字符
- **jira_id**（可选）：如 YNOTR-12167

（jira_id 可选；其余上下文字段如 branch、report_path 由调用方传入，不写入 commit）

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
<type>(<scope>): <Jira-ID> <subject>
```

规则：
- Subject 不超过 50 字符，使用中文
- 有 Jira ID 时放在 subject 之前
- 无 scope 时省略括号：`<type>: <subject>`
- commit message 只含标题行，无正文

### 步骤5：执行 Git 操作

**手动模式（execute=false）**：生成命令，不执行，提示用户手动运行。

**自动模式（execute=true）**：依次执行以下命令：

```bash
git status
git add .
git commit -m "<type>(<scope>): <ID> <subject>"
git log -1 --stat
git push -u origin [branch-name]
```

多项目时对每个项目独立执行上述步骤，末尾附汇总表。

## 输出格式

**自动模式**（默认）：
```
## Git 提交代码（自动模式）

**项目**: backend   **分支**: fix/YNOTR-12167
**Commit**: a1b2c3d  **推送状态**: ✅ 成功
**改动**: +45/-12 (3 files)

**下一步**：创建 PR → Code Review → 测试验证
```

**手动模式**（显式请求时）：
```
## Git 提交代码（手动模式）

**生成的 Commit Message**：
fix(ai-summary): YNOTR-12167 修复分享链接中AI摘要按钮显示问题

**执行命令**：
git status
git add .
git commit -m "fix(ai-summary): YNOTR-12167 修复分享链接中AI摘要按钮显示问题"
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

- 改动 >10 文件/500 行时警告，>20 文件/1000 行时再次警告（均不阻断）；单项目失败不影响其他项目
