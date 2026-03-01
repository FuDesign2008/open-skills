---
description: "一键完成 git commit、push 和创建 PR。自动创建分支、生成 commit message、推送并创建 Pull Request"
disable-model-invocation: true
---

## 上下文获取

RUN git status
RUN git diff HEAD
RUN git branch --show-current
RUN git log --oneline -5

## 任务说明

根据上述 git 状态信息，执行以下操作：

### 1. 安全检查

- 如果当前在 main/master 分支，询问用户是否需要创建新分支
- 如果有未暂存的更改，确认是否需要添加到暂存区
- 如果有冲突或未合并的文件，提醒用户先解决

### 2. 分支管理

- 如果在 main/master 分支且用户同意，创建新的 feature 分支
- 分支命名建议：根据更改内容推断（如 feat/xxx, fix/xxx）
- 询问用户确认分支名称

### 3. 提交更改

- 分析 git diff 生成规范的 commit message
- commit message 格式：
  - feat: 新功能
  - fix: bug 修复
  - docs: 文档更新
  - refactor: 重构
  - test: 测试
  - chore: 杂项
- 询问用户确认 commit message

### 4. 推送到远程

- 执行 git push
- 如果是首次推送，使用 -u 参数

### 5. 创建 Pull Request

- 使用 gh pr create 创建 PR
- PR 标题使用 commit message
- PR body 包含：
  - 变更说明
  - 测试情况
  - 相关 issue（如有）

## 执行要求

- 每个关键步骤前都要与用户确认
- 遇到错误时提供清晰的解决建议
- 完成后输出 PR 链接
