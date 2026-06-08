---
name: git-release-start
version: "1.0.0"
user-invocable: true
description: 当版本迭代开始时需要创建 release 分支时使用，适用于分支命名规范不统一、多仓库需同步创建、或需要确保本地 tracking 正确指向 origin/release/X.Y.Z 的场景。支持 GitLab、GitHub 等平台，单仓库和多仓库均可。触发词：创建release分支、开release分支、开分支、迭代分支、create release branch。
---

# Git 仓库 Release 分支创建工作流（git-release-start）

## Overview

在版本迭代开始时，从主开发分支创建 release 分支。**核心原则：先在远程创建，再同步到本地**——`git checkout -b release/X origin/master` 会让本地分支 tracking 指向 `origin/master` 而非 `origin/release/X`，埋下后续 push/pull 混乱的隐患。

**配对 skill：** `git-release-start`（迭代开始，本 skill）↔ `git-release-finish`（迭代结束，打 tag + 合并）

---

## 平台 CLI 映射

| 平台 | CLI 工具 | 远程创建分支 |
|------|---------|------------|
| GitLab（SaaS / 自托管） | `glab` | `glab api POST "projects/:fullpath/repository/branches?branch=<NAME>&ref=<BASE>"` |
| GitHub | `gh` | `gh api repos/:owner/:repo/git/refs -f ref=refs/heads/<NAME> -f sha=<BASE_SHA>` |

**文档约定**：以下用 `<GIT_CLI>` 代指平台 CLI。核心 git 操作（fetch、checkout）均为平台无关。

---

## 适用 / 不适用

**适用场景**：
- 版本迭代开始时，需要从主分支创建新的 release 分支
- 多个仓库需要统一创建同版本的 release 分支
- 需要确保分支的 tracking 指向正确（而非指向 master/main）
- 已有历史 release 分支命名，需要遵循统一规范

**不适用场景**：
- 非 Git 托管平台

> **原则：流程必须完整执行。** 无论仓库数量多少，每个阶段都不可跳过。"就创建个分支而已"是常见的跳过验证后 tracking 指向错误的原因。

## 调用前置条件

- 已安装对应平台 CLI 并完成认证
- 确认版本号（如 `8.2.70`）
- 确认基础分支（如 `master` 或 `main`）

---

## 阶段总览

| 阶段 | 操作 | 关键工具 |
|------|------|---------|
| 1 | 确认版本号与基础分支 | — |
| 2 | 分析各仓库 release 分支命名规范 | `git branch -r` |
| 3 | 远程创建 release 分支 | `<GIT_CLI>` api |
| 4 | 本地同步 + 设置 tracking | `git fetch` + `git checkout --track` |
| 5 | 更新环境文件 | `echo` / 文本写入 |
| 6 | 验证 | `git branch` + `cat` |
| 7 | 输出报告 | — |

---

## 阶段1：确认版本号与基础分支

> ⚠️ 创建前确认，避免创建错误版本或基于错误分支。

### 1.1 版本号确认

若用户消息中已明确版本号，直接使用，无需重复询问。否则向用户确认：
- 新版本号（如 `8.2.70`）
- 上一个版本号（用于阶段2对比历史分支命名，如 `8.2.60`）

检查：
- 新版本 tag 是否已存在：`git ls-remote origin refs/tags/<TAG_PATTERN>`
- 新版本 release 分支是否已存在：`git ls-remote origin refs/heads/release/<VERSION>`
- 若已存在，报错停止，询问是否复用或改名

### 1.2 基础分支确认

release 分支从哪个分支创建？通常是主开发分支。

```bash
# 确认基础分支存在且是最新
git fetch origin <BASE_BRANCH>
git log --oneline origin/<BASE_BRANCH> -3
```

**输出：确认表（阶段1仅确认版本号与 base 分支，release 分支名由阶段2分析后确定）**

| 仓库 | 版本号 | 基础分支 |
|------|--------|---------|
| repo-A | 8.2.70 | master |

**在确认后进入阶段2（分析 release 分支命名规范）。**

---

## 阶段2：分析 Release 分支命名规范

> ⚠️ release 分支命名可能不是简单的 `release/X.Y.Z`，需要查历史。本阶段输出最终分支名，完成后才能进入阶段3创建。

```bash
# 查看已有的 release 分支
git branch -r | grep "origin/release"
```

### 识别规则

| 历史分支模式 | 命名规范 |
|-------------|---------|
| `origin/release/8.2.60`, `origin/release/8.2.52` | `release/{VERSION}` |
| `origin/release/8.2.60-perf` | `release/{VERSION}-perf` |
| `origin/release/mobile-7.5.720` | `release/mobile-{VERSION}`（产品前缀） |

**多产品仓库**：每个产品线有独立的 release 分支命名，本次只创建当前产品线的分支。

### 输出：确认表

| 仓库 | release 分支名 | 历史示例 |
|------|---------------|---------|
| repo-A | `release/8.2.70` | `release/8.2.60` |
| repo-B | `release/8.2.70-perf` | `release/8.2.60-perf` |

**在确认分支名称后与用户对齐，再执行阶段3。**

---

## 阶段3：远程创建 Release 分支

> ⚠️ **核心教训**：必须在远程创建，再同步到本地。不能先本地建再 push。
> 
> 原因：`git checkout -b release/X origin/master` 创建的本地分支 tracking 指向 `origin/master` 而非 `origin/release/X`，后续 push 和 pull 会出现混乱。

对所有仓库**并行执行**：

```bash
# GitLab — 使用 API 在远程创建分支（`:fullpath` 在 repo 目录内自动解析）
glab api --method POST \
  "projects/:fullpath/repository/branches?branch=<RELEASE_BRANCH>&ref=<BASE_BRANCH>"

# GitHub — `gh` 在 repo 目录内执行时 `:owner/:repo` 自动解析
BASE_SHA=$(git rev-parse origin/<BASE_BRANCH>)
gh api repos/:owner/:repo/git/refs \
  -f ref="refs/heads/<RELEASE_BRANCH>" \
  -f sha="$BASE_SHA"
# 若自动解析失败，手动替换为实际值，如：gh api repos/myorg/myrepo/git/refs ...
```

**参数说明**：
- `branch`：新 release 分支完整名称（含路径，如 `release/8.2.70`）
- `ref` / `sha`：基于哪个分支创建（主开发分支）
- `:fullpath`：GitLab 自动解析，GitHub 需要手动替换 `:owner/:repo`

---

## 阶段4：本地同步 + 设置 Tracking

> ⚠️ 使用 `--track` 确保本地分支 tracking 指向 `origin/<RELEASE_BRANCH>`。

对所有仓库**并行执行**：

```bash
git fetch origin <RELEASE_BRANCH>
git checkout -b <RELEASE_BRANCH> --track origin/<RELEASE_BRANCH>
```

**验证 tracking**：

```bash
git branch -vv | grep '^\*'
# 期望输出：* release/8.2.70  <SHA> [origin/release/8.2.70] <commit message>
```

> **如果 `[origin/master]` 出现在 tracking 列**：说明用了错误的创建方式，需要 `git branch -u origin/release/8.2.70` 修正。

---

## 阶段5：更新环境文件

> 部分仓库需要在 `release-branch` 文件中记录当前分支名（CI 脚本等可能会读取）。

```bash
echo "<RELEASE_BRANCH>" > release-branch
git add release-branch
git commit -m "chore: update release-branch to <RELEASE_BRANCH>"
```

**注意**：如果仓库不使用 `release-branch` 文件（没有历史提交记录），跳过此步骤。

```bash
# 检查是否已有此文件
git log --oneline -- release-branch | head -3
```

---

## 阶段6：验证

对每个仓库执行以下验证：

```bash
# 5. push 通道畅通（无权限报错即可）
git push --dry-run origin <RELEASE_BRANCH>
# 期望：显示待推送内容或 "Everything up-to-date"，无 "rejected" 或权限报错
```

**若有任何一项不通过，中止并修正，确认后再进入阶段7。**

---

## 阶段7：输出报告

生成确认表：

| 仓库 | 远程分支 | 本地 tracking | release-branch | 状态 |
|------|---------|-------------|---------------|------|
| repo-A | `origin/release/8.2.70` | `[origin/release/8.2.70]` | `release/8.2.70` | ✅ |
| repo-B | `origin/release/8.2.70-perf` | `[origin/release/8.2.70-perf]` | N/A | ✅ |

---

## 错误处理

| 场景 | 处理方式 |
|------|---------|
| tag 已存在 | 报错停止，可能是重复发版 |
| release 分支已存在（远程） | 询问是否复用（直接 checkout）还是改名 |
| 基础分支不存在 | 报错停止，要求确认正确的 base ref |
| `glab api` 返回 401 / 403 | 检查 `glab auth status`，重新认证 |
| tracking 指向错误（`[origin/master]`） | `git branch -u origin/<RELEASE_BRANCH>` 修正 |
| 本地已有同名分支 | `git branch -D <NAME>` 删除本地，重新 checkout |
| push dry-run 失败 | 检查 remote URL 和权限 |

---

## 常见错误

| ❌ 错误做法 | ✅ 正确做法 | 后果 |
|------------|------------|------|
| `git checkout -b release/X origin/master` 然后 push | `glab api` 远程创建 → fetch → `--track` | tracking 指向 `origin/master`，后续 pull/push 混乱 |
| 本地先建分支再 push 到远程 | 远程先建分支再 fetch 到本地 | 同上 |
| 跳过阶段5不检查/不更新 `release-branch` | 确认并更新 | CI 可能读取错误的 release-branch 值 |
| 假设所有仓库命名一致 | 逐仓库查历史 branch 名 | 部分仓库分支名带特殊后缀（如 `-perf`）被遗漏 |
| 不验证 tracking 就认为完成了 | 阶段6逐项验证 | 错误的 tracking 在后续 merge/push 时才会暴露 |

---

## 快速参考命令

```bash
# 查看已有 release 分支
git branch -r | grep "origin/release"

# GitLab — 远程创建
glab api --method POST "projects/:fullpath/repository/branches?branch=<NAME>&ref=<BASE>"

# GitHub — 远程创建
gh api repos/<OWNER>/<REPO>/git/refs -f ref="refs/heads/<NAME>" -f sha="$(git rev-parse origin/<BASE>)"

# 本地同步
git fetch origin <NAME>
git checkout -b <NAME> --track origin/<NAME>

# 修正 tracking（如指向错误）
git branch -u origin/<NAME>

# 更新 release-branch
echo "<NAME>" > release-branch

# 验证
git branch --show-current
git branch -vv | grep '^\*'
git ls-remote origin refs/heads/<NAME>
git push --dry-run origin <NAME>
```
