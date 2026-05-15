---
name: git-release-finish
version: "1.0.0"
user-invocable: true
description: 当 Git 仓库需要发版时使用，涵盖 tag 命名规范不统一、主分支名称各异（master/main/develop）、release 分支合入主干存在冲突、MR/PR 分支混入无关文件等场景。适用于 GitLab、GitHub、Gitea 等平台，支持单仓库和多仓库。触发词：发版、打tag、发布版本、版本发布、release流程、release工作流、git-release、multi-repo release。
---

# Git 仓库版本发布工作流（git-release-finish）

## Overview

在版本迭代结束时，将 release 分支通过打 tag、创建 MR/PR、解决冲突、清理多余文件到最终合并的完整流程发布到主开发分支。

**配对 skill：** `git-release-start`（迭代开始，创建 release 分支）↔ `git-release-finish`（迭代结束，本 skill）

**依赖 skill：** 阶段6 冲突解决由 `git-conflict-resolve` skill 执行（语义分析驱动，支持 merge / rebase 多轮聚合）。

---

## 平台 CLI 映射

核心 git 操作（tag、push、merge）均为平台无关。仅 MR/PR 管理依赖平台 CLI。

| 平台 | CLI 工具 | 操作单元 | 认证验证 |
|------|---------|---------|---------|
| GitLab（SaaS / 自托管） | `glab` | MR | `glab auth status` |
| GitHub | `gh` | PR | `gh auth status` |
| Gitea | `tea` | PR | `tea login` |

**文档约定**：以下用 `<GIT_CLI>` 代指平台 CLI，用 `MR/PR` 代指合并请求，**实际执行时替换为对应平台命令**。

| 操作 | GitLab (`glab`) | GitHub (`gh`) |
|------|----------------|--------------|
| 创建 | `glab mr create` | `gh pr create` |
| 合并 | `glab mr merge --yes` | `gh pr merge --merge` |
| 关闭 | `glab mr close` | `gh pr close` |
| 查看 | `glab mr view` | `gh pr view` |

---

## 适用 / 不适用

**适用场景**（单仓库、多仓库均可）：
- 需要分析并遵循已有 tag 命名规范（命名可能不统一）
- 主分支名称不确定（master / main / develop 各异）
- release 分支合入主干可能存在代码冲突
- MR/PR 分支可能混入 AI 工具文件、临时脚本等无关文件
- 需要生成完整的发版操作报告

**不适用场景**：
- 非 Git 托管平台（SVN、Mercurial 等）

> **原则：流程必须完整执行。** 无论仓库数量多少、发版看起来多简单，每个阶段都不可跳过。"这次看起来很简单"是最常见的跳过前置检查后出错的原因。

## 调用前置条件

- 已安装对应平台 CLI 并完成认证（见上方平台 CLI 映射表）
- 各仓库可通过 remote 访问 release 分支
- 确认版本号（如 `8.2.60`）

---

## 阶段总览

| 阶段 | 操作 | 关键工具 |
|------|------|---------|
| 1 | 分析各仓库 tag 命名规范 | `git tag` |
| 2 | 创建并推送 tag | `git tag` + `git push` |
| 3 | 分析各仓库主开发分支 | `git remote show` + `git log` |
| 4 | 创建 MR/PR | `<GIT_CLI> mr/pr create` |
| 5 | 检测冲突 | `git merge-tree` |
| 6 | 解决冲突（有则处理） | `git-conflict-resolve` skill |
| 7 | 清理 MR/PR 分支多余文件 | `git ls-tree` + `comm` |
| 8 | 人工 review（提示） | — |
| 9 | 合并 MR/PR | `<GIT_CLI> mr/pr merge` |
| 10 | 输出报告 | — |

所有**仓库无关**的操作均应**并行执行**（并行打 tag、并行建 MR/PR、并行检查冲突）。

---

## 阶段1：分析 Tag 命名规范

> ⚠️ 禁止假设 tag 格式统一。每个仓库必须单独分析。

```bash
git tag --sort=-version:refname | head -30
```

### 识别规则

| 历史 tag 模式 | 命名规范 |
|-------------|---------|
| `8.2.52`, `8.2.51` | 无前缀：`{VERSION}` |
| `v8.2.40`, `v8.2.20` | v 前缀：`v{VERSION}` |
| `desktop-8.2.50`, `desktop-8.2.40` | 产品前缀：`desktop-{VERSION}` |
| `mobile-7.5.720` | 产品前缀：`mobile-{VERSION}` |

**多产品仓库**（单仓库含多条产品线）：
- 检查全部 tag（不只看最近 10 条），找有无 `product-` 前缀
- 每条产品线独立维护 tag，本次发版只打当前产品线的 tag

### 输出：确认表

| 仓库 | release 分支 | tag 名称 | 示例（历史最新）|
|------|------------|---------|--------------|
| repo-A | release/X.Y.Z | `X.Y.Z` | `8.2.52` |
| repo-B | release/X.Y.Z | `vX.Y.Z` | `v8.2.40` |

**在确认 tag 名称后与用户对齐，再执行阶段2。**

---

## 阶段2：创建并推送 Tag

对所有仓库**并行执行**：

```bash
# 在对应仓库目录下
git tag <TAG_NAME>
git push origin <TAG_NAME>
```

验证：

```bash
git ls-remote origin refs/tags/<TAG_NAME>
```

---

## 阶段3：分析各仓库主开发分支

> ⚠️ 主开发分支可能是 `master`、`main` 或 `develop`，各仓库不一定相同。

### 三层证据（按可信度排序）

**1. 远程合并历史（最强证据）**：

```bash
git log --oneline --merges -20 | grep -E "into '(master|main|develop)'"
```

有历史 release 分支合入记录的，直接采用。

**2. Remote HEAD**：

```bash
# 查询 remote 默认分支（需网络）
git remote show origin | grep "HEAD branch"

# 查看本地追踪（可能过期）
git symbolic-ref refs/remotes/origin/HEAD
git branch -r | grep "origin/HEAD"
```

> ⚠️ `git remote show origin` 与 `git symbolic-ref` 可能不一致（本地缓存与远端不同步），以 `git remote show origin` 为准。

**3. 用户确认（兜底）**：当两个来源冲突或无历史记录时，列出候选分支询问用户。

### 常见场景

| 情况 | 判断 |
|------|------|
| 有 `Merge branch 'release/X.Y.Z' into 'master'` 记录 | 主分支 = `master` |
| `origin/HEAD -> origin/main`，且无 release 合并记录 | 主分支 = `main` |
| `develop` 接收所有 feature，但 remote HEAD = `main` | 向用户确认 |

### 输出：确认表

| 仓库 | 源分支 | 目标主分支 | 判断依据 |
|------|--------|----------|---------|
| repo-A | `release/X.Y.Z` | `master` | 历史合并记录 |
| repo-B | `release/X.Y.Z-perf` | `main` | remote HEAD + 用户确认 |

**在确认目标分支后与用户对齐，再执行阶段4。**

---

## 阶段4：创建 MR/PR

对所有仓库**并行执行**：

```bash
# GitLab
glab mr create \
  --source-branch <RELEASE_BRANCH> \
  --target-branch <MAIN_BRANCH> \
  --title "Release <VERSION>" \
  --description "Merge <RELEASE_BRANCH> into <MAIN_BRANCH>" \
  --remove-source-branch=false

# GitHub
gh pr create \
  --base <MAIN_BRANCH> \
  --head <RELEASE_BRANCH> \
  --title "Release <VERSION>" \
  --body "Merge <RELEASE_BRANCH> into <MAIN_BRANCH>"
```

记录每个 MR/PR 的编号和 URL，汇总输出。

---

## 阶段5：冲突检测

对所有仓库**并行**做 dry-run，**不修改任何文件**：

```bash
BASE=$(git merge-base origin/<RELEASE_BRANCH> origin/<MAIN_BRANCH>)

# 内容冲突数量
git merge-tree $BASE origin/<RELEASE_BRANCH> origin/<MAIN_BRANCH> 2>&1 \
  | grep -c "^changed in both"

# 分支差距
echo "release ahead: $(git rev-list --count origin/<MAIN_BRANCH>..origin/<RELEASE_BRANCH>)"
echo "main ahead:    $(git rev-list --count origin/<RELEASE_BRANCH>..origin/<MAIN_BRANCH>)"
```

> ⚠️ `git merge-tree` 只统计**内容冲突**，不检测 rename/rename 冲突（构建产物 hash 变更）。冲突数为 0 时，若仓库含构建产物，仍建议执行阶段6验证。

### 结果分类

| 内容冲突数 | source commits | 处理策略 |
|-----------|---------------|---------|
| 0 | 任意 | 直接进入阶段9合并 |
| > 0 | ≤ 3 且冲突仅 1 个文件 | 可用 rebase（逐提交解冲突代价可接受） |
| > 0 | 其他所有情况 | **必须用 merge 策略**（见阶段6） |

> ⚠️ **rebase 陷阱**：rebase 在**每个**冲突提交处停下，80 commits 的分支意味着反复中断。除非 source 分支极短（≤ 3 commits）且冲突极少，否则一律改用 merge 策略，一次解决所有冲突。

---

## 阶段6：冲突解决

检测到冲突后，**调用 `git-conflict-resolve` skill** 处理全部冲突解决、逻辑验证与复查清单：

> 执行 `git-conflict-resolve` skill，传入以下参数：
> - `source`：`<RELEASE_BRANCH>`
> - `target`：`<MAIN_BRANCH>`
> - `version`：`<VERSION>`
> - `mode`：`merge`（默认）或 `rebase`（仅当阶段5判定为 source ≤ 3 commits 且冲突 ≤ 1 文件时）

> ⚠️ 若 `git-conflict-resolve` 未能完成（用户主动中止、遇到无法解决的冲突或 rebase 中断），**不得继续执行以下操作**，保持当前工作区状态等待人工介入后重新启动。

`git-conflict-resolve` 执行完毕并输出全局复查清单（Y.6）、用户确认后，按模式执行：

**merge 模式**：

```bash
# 推送 merge 分支
git push origin merge-release/<VERSION>

# 关闭原来因冲突而搁置的 MR/PR
glab mr close <OLD_ID>   # GitLab
gh pr close <OLD_ID>     # GitHub
```

然后重新创建指向 `merge-release/<VERSION>` 的 MR/PR（参考阶段4命令）。

**rebase 模式**：

```bash
# 将 rebase 结果推回原 release 分支，触发原 MR/PR 自动更新
git push origin rebase-release/<VERSION>:<RELEASE_BRANCH> --force-with-lease
# 原 MR/PR（<RELEASE_BRANCH> → <MAIN_BRANCH>）自动更新，无需关闭重建
```

> ⚠️ `--force-with-lease` 比 `--force` 更安全：若远端在此期间有新提交，会拒绝推送，避免覆盖他人提交。

---

## 阶段7：清理 MR/PR 分支多余文件

> MR/PR 分支可能混入与本次 release 无关的文件（AI 工具文件、仅在 target 存在的临时脚本等）。

### 检查规则

**在 merge-release 但不在 release 分支的文件 = 需要剔除**：

```bash
comm -23 \
  <(git ls-tree -r HEAD --name-only | sort) \
  <(git ls-tree -r origin/<RELEASE_BRANCH> --name-only | sort)
```

### 常见需剔除的文件类型

| 类型 | 示例路径 |
|------|---------|
| AI 工具配置 | `.claude/`, `.omc/`, `.codemap/`, `opencode.json` |
| 临时调试文件 | `ci-build-error.txt`, `ci-fix-log.txt` |
| 环境标记文件 | `release-branch`（纯文本标记文件） |
| target 独有脚本 | `scripts/perf-benchmark/*.mjs`（仅在主干，不在 release） |

> **注意**：若文件在 release 分支中存在，则**不剔除**（即使看起来像临时文件，那是 release 分支的问题，不在此处处理）。

### 剔除操作

```bash
# 从 git index 移除（若报 "pathspec not found" 说明文件不在 index，见下方 fallback）
git rm --cached -rf <EXTRA_PATH_1> <EXTRA_PATH_2>

# Fallback：若 git rm --cached 失败（文件已在 worktree 但未入 index）
git add -A
git rm --cached -rf <EXTRA_PATH_1>

git commit --amend --no-edit --no-verify
git push origin merge-release/<VERSION> --force
```

### 验证：零多余文件

```bash
comm -23 \
  <(git ls-tree -r HEAD --name-only | sort) \
  <(git ls-tree -r origin/<RELEASE_BRANCH> --name-only | sort) \
  | wc -l
# 输出应为 0
```

---

## 阶段8：冲突文件人工 review 提示

`git-conflict-resolve` 的子阶段 Y.6 已输出全局复查清单（含所有冲突文件、解决方式、置信度、逻辑验证结论）。

阶段8 直接引用 Y.6 的输出，**不得在 Y.6 复查清单确认完成前自动执行阶段9**。

多仓库场景下，各仓库的 Y.6 复查清单需**全部**得到用户确认后，再统一进入阶段9。

---

## 阶段9：合并 MR/PR

用户确认后，对所有仓库**并行**执行：

```bash
# GitLab
glab mr merge <MR_ID> --squash=false --remove-source-branch=false --yes

# GitHub
gh pr merge <PR_ID> --merge --delete-branch=false
```

验证合并成功（GitLab 输出 `✓ Merged!`，GitHub 输出 `✓ Pull request ... was merged`）。

---

## 阶段10：输出报告

生成报告文件（建议路径：`<workspace>/release-<VERSION>-report.md`），内容包含：

1. **打 tag 汇总**：仓库 / tag 名 / commit SHA / remote 验证状态
2. **MR/PR 汇总**：仓库 / 源分支 → 目标分支 / 编号及链接 / 合并状态
3. **冲突处理详情**（如有）：
   - 分支差距（各仓库 source/target 超前 commit 数）
   - target 独有提交列表（冲突来源）
   - 冲突文件清单及解决方式：**直接引用 `git-conflict-resolve` Y.6 全局复查清单**，不重新生成
   - 清理的多余文件列表
4. **需人工关注事项**（如残留风险、待补充 cherry-pick 等）

---

## 错误处理

| 场景 | 处理方式 |
|------|---------|
| tag 已存在 | 报错停止，询问是否覆盖（`git tag -f` + `git push --force`）|
| MR/PR 已存在（同源同目标） | 复用已有 MR/PR，不重新创建 |
| rebase 冲突过多 | 切换为 merge 策略（在 git-conflict-resolve 中重新执行 Y.0 merge 模式） |
| 冲突解决出现逻辑错误 | 交由 `git-conflict-resolve` Y.5 逻辑验证捕获，按 ⚠️/❌ 提示处理 |
| `git rm --cached` 报 "pathspec not found" | 文件不在 index，用 `git add -A` 先同步 worktree 再重试 |
| pipeline 未运行警告 | 平台 CI 提示（`! No pipeline running`）为正常提示，不影响合并 |
| CLI 认证失败 | 检查 `<GIT_CLI> auth status`，重新执行 `<GIT_CLI> auth login` |

---

## 快速参考命令

```bash
# 查看 tag 历史
git tag --sort=-version:refname | head -30

# 查看主分支合并历史
git log --oneline --merges -20 | grep -E "into '(master|main|develop)'"

# 冲突 dry-run（检测冲突文件数量）
git merge-tree $(git merge-base origin/$SRC origin/$TGT) origin/$SRC origin/$TGT | grep -c "^changed in both"

# 检查多余文件（阶段7）
comm -23 <(git ls-tree -r HEAD --name-only | sort) <(git ls-tree -r origin/$SRC --name-only | sort)

# 合并 MR/PR（按平台选择）
glab mr merge $MR_ID --squash=false --remove-source-branch=false --yes   # GitLab
gh pr merge $PR_ID --merge --delete-branch=false                          # GitHub

# 冲突解决相关命令 → 见 git-conflict-resolve skill 快速参考
```
