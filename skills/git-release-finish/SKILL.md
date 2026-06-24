---
name: git-release-finish
version: "1.3.0"
user-invocable: true
description: "Use when releasing a Git repository version — tagging, merging release branches into main, resolving conflicts, or syncing changes between release branches. Handles ambiguous tag naming (v-prefix vs plain), unknown main branch (master/main/develop), cross-release hash-sensitive rebase, and MR/PR extra file cleanup. GitLab, GitHub, Gitea; single or multi-repo. Triggers: 发版, 打tag, 发布版本, 版本发布, release流程, git-release, multi-repo release."
---

# Git 仓库版本发布工作流（git-release-finish）

## Overview

在版本迭代结束时，将 release 分支通过打 tag、创建 MR/PR、解决冲突、清理多余文件到最终合并的完整流程发布到主开发分支。

**配对 skill：** `git-release-start`（迭代开始，创建 release 分支）↔ `git-release-finish`（迭代结束，本 skill）

**依赖 skill：** 阶段6 冲突解决由 `git-conflict-resolve` skill 执行（语义分析驱动，支持 merge / rebase 多轮聚合）。

**远程优先原则：** 与配对 skill `git-release-start` 一致——**先确认远端状态，再决定本地操作**。打 tag 前必须 `git fetch` + 验证远端 commit SHA，禁止在未验证的本地 HEAD 上直接打 tag。GitLab 优先使用 `glab api` 远程创建 tag，GitHub/Gitea 用本地 `git tag` 但锚定到远端 SHA。

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
| 5.5 | 验证 MR 可合并性（merge-tree=0 后强制执行） | `glab mr view` / `gh pr view` |
| 6 | 解决冲突（有则处理） | `git-conflict-resolve` skill |
| 7 | 清理 MR/PR 分支多余文件 | `git ls-tree` + `comm` |
| 8 | AI 审查冲突文件（门控） | `git diff` + `grep` |
| 9 | 合并 MR/PR | `<GIT_CLI> mr/pr merge` |
| 10 | 输出报告 | — |

所有**仓库无关**的操作均应**并行执行**（并行打 tag、并行建 MR/PR、并行检查冲突）。

### 执行路径

根据阶段 5 / 5.5 的结果，阶段 6–8 按以下路径选择执行：

| 情况 | 执行路径 |
|------|---------|
| merge-tree=0 且 MR 可合并 | 1→2→3→4→5→**5.5**→**9**→10（跳过 6/7/8） |
| merge-tree=0 但 MR 不可合并 | 1→2→3→4→5→**5.5**→**6(rebase)**→**8**→**9**→10（跳过 7） |
| 冲突 > 0，source ≤ 3 commits 且冲突 ≤ 1 文件 | 1→2→3→4→5→**6(rebase)**→**8**→**9**→10（跳过 7） |
| 冲突 > 0，其余情况 | 1→2→3→4→5→**6(merge)**→**7**→**8**→**9**→10 |

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

> ⚠️ **tag 命名可能随版本演变**：同一仓库的 tag 命名规范并非一成不变。例如 markdown-editor 仓库历史用 `v8.2.60`（v 前缀），后续版本改为 `8.2.63`（无前缀）。**以最新 tag 为准**，不要因为看到旧 tag 有前缀就假设新版本也必须有。若历史 tag 中存在命名规范不一致，向用户确认本次应遵循哪套规范。

### 输出：确认表

| 仓库 | release 分支 | tag 名称 | 示例（历史最新）|
|------|------------|---------|--------------|
| repo-A | release/X.Y.Z | `X.Y.Z` | `8.2.52` |
| repo-B | release/X.Y.Z | `vX.Y.Z` | `v8.2.40` |

**在确认 tag 名称后与用户对齐，再执行阶段2。**

---

## 阶段2：创建并推送 Tag

> ⚠️ **远程优先**：打 tag 前必须 fetch 并验证远端 commit SHA。禁止在未验证的本地 HEAD 上直接 `git tag`——本地分支可能落后远端，导致 tag 打在旧 commit 上。

### 2.0 前置检查（所有平台，必须执行）

对每个仓库**并行**执行：

```bash
# 1. Fetch 远端最新状态
git fetch origin <RELEASE_BRANCH>

# 2. 取远端 release 分支 HEAD SHA（tag 锚定目标）
REMOTE_SHA=$(git rev-parse origin/<RELEASE_BRANCH>)
echo "远端 $RELEASE_BRANCH HEAD: $REMOTE_SHA"

# 3. 分叉检测：本地是否落后远端
LOCAL_SHA=$(git rev-parse HEAD)
BEHIND=$(git rev-list --count HEAD..origin/<RELEASE_BRANCH> 2>/dev/null || echo 0)
[ "$BEHIND" -gt 0 ] && echo "⚠️ 本地落后远端 $BEHIND 个 commit，tag 将锚定到远端 SHA（非本地 HEAD）"

# 4. tag 远端已存在检查
git ls-remote --tags origin | grep -q "refs/tags/<TAG_NAME>$" \
  && { echo "❌ tag <TAG_NAME> 已存在于远端，终止"; exit 1; }
```

### 2.1 创建 Tag（按平台分流）

**GitLab — 远程创建（优先）**：

```bash
# REMOTE_SHA 来自 2.0；若分步执行需重新获取
REMOTE_SHA=$(git rev-parse origin/<RELEASE_BRANCH>)
# 通过 GitLab API 直接在远端创建 tag（纯 tag，无 Release 对象）
# 与 git-release-start 的 glab api 远程创建分支范式一致
glab api POST "projects/:fullpath/repository/tags" \
  -f tag_name=<TAG_NAME> \
  -f ref=$REMOTE_SHA \
  -f message="Release <VERSION>"
# 无需 git push——API 直接在远端创建
```

**GitHub / Gitea — 本地创建锚定到远端 SHA**：

```bash
# REMOTE_SHA 来自 2.0；若分步执行需重新获取
REMOTE_SHA=$(git rev-parse origin/<RELEASE_BRANCH>)
# 锚定到远端 SHA（非本地 HEAD），确保 tag 指向正确的 commit
git tag <TAG_NAME> $REMOTE_SHA
git push origin <TAG_NAME>
```

### 2.2 验证 Tag 指向正确 commit

```bash
# REMOTE_SHA 来自 2.0；若分步执行需重新获取
REMOTE_SHA=$(git rev-parse origin/<RELEASE_BRANCH>)
# 远端 tag 的 commit SHA 必须等于 $REMOTE_SHA
TAG_SHA=$(git ls-remote origin refs/tags/<TAG_NAME> | awk '{print $1}')
echo "tag <TAG_NAME> -> $TAG_SHA"
echo "expected        -> $REMOTE_SHA"
# 若为 annotated tag，ls-remote 返回 tag 对象 SHA，需解引用：
# git ls-remote origin "refs/tags/<TAG_NAME>^{}"
```

> ⚠️ 若 `TAG_SHA` ≠ `REMOTE_SHA`（排除 annotated tag 解引用差异），说明 tag 打在了错误 commit 上，必须删除重打（见错误处理）。

### 输出：确认表

| 仓库 | tag 名称 | 远端 commit SHA | tag 验证 SHA | 状态 |
|------|---------|----------------|-------------|------|
| repo-A | `8.2.70` | `9bb86f93b` | `9bb86f93b` | ✅ |
| repo-B | `desktop-8.2.70` | `a1b2c3d4e` | `a1b2c3d4e` | ✅ |

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
| remote HEAD 指向某分支，但该分支落后另一分支数百 commits | **remote HEAD 已过期**，以合并历史为准，向用户确认（见下方） |

> ⚠️ **remote HEAD 可能指向已废弃/落后的分支**：仓库迁移或分支策略调整后，remote HEAD 可能仍指向旧的主分支。例如 markdown-editor 仓库 remote HEAD = `master`，但 `master` 落后 `main` 402 commits，实际活跃主分支是 `main`。
>
> **排查方法**：当 remote HEAD 指向的分支与候选分支存在显著 commit 差距时，用合并历史确认：
> ```bash
> # 对比候选分支的 commit 差距
> echo "HEAD branch ahead of main: $(git rev-list --count origin/main..origin/<HEAD_BRANCH> 2>/dev/null)"
> echo "main ahead of HEAD branch: $(git rev-list --count origin/<HEAD_BRANCH>..origin/main 2>/dev/null)"
> # 若 HEAD branch 落后数百 commits → remote HEAD 已过期，以合并历史为准
> ```

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
| 0 | 任意 | 创建 MR 后**先验证可合并性**（阶段 5.5），确认可合并再进阶段 9 |
| 0（但 MR 实际不可合并） | 任意 | **必须用 rebase 策略**（见阶段6） |
| > 0 | ≤ 3 且冲突仅 1 个文件 | 可用 rebase（逐提交解冲突代价可接受） |
| > 0 | 其他所有情况 | **必须用 merge 策略**（见阶段6） |

> ⚠️ **merge-tree=0 陷阱**：`git merge-tree` 只统计**文本内容冲突**，不检测结构性合并问题（如分支偏离过大导致 GitLab/GitHub 拒绝合并）。merge-tree=0 不代表 MR 一定可合并，**必须执行阶段 5.5 验证**。
>
> ⚠️ **rebase 陷阱**：rebase 在**每个**冲突提交处停下，80 commits 的分支意味着反复中断。除非 source 分支极短（≤ 3 commits）且冲突极少，否则一律改用 merge 策略，一次解决所有冲突。

---

## 阶段 5.5：验证 MR 可合并性（merge-tree=0 时强制执行）

> ⚠️ merge-tree 报告 0 冲突 ≠ MR 一定可合并。创建 MR 后必须执行此验证。

```bash
# GitLab
glab mr view <MR_ID> 2>&1 | grep -iE "merge_status|can_be_merged|has_conflicts"

# GitHub
gh pr view <PR_ID> --json mergeable,mergeStateStatus 2>&1
```

| 验证结果 | 处理 |
|---------|------|
| `can_be_merged` / `MERGEABLE` | ✅ 进入阶段 9 合并 |
| 不可合并 | ❌ 改用 rebase 策略（阶段 6），不直接进入阶段 9 |

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
>
> ⚠️ **Force push 前确认**：若 `<RELEASE_BRANCH>` 是共享分支（多人协作），force push 会破坏他人的工作基础。执行前询问用户：**"是否有他人基于此分支工作？确认 force push？"**

#### 保护分支备选路径（force push 被拒时）

> ⚠️ 若 `<RELEASE_BRANCH>` 是**保护分支**（GitLab `release/*` 保护规则常见 push=No one），force push 会被远端直接拒绝（`remote: rejected`），即使非 force 的普通 push 也可能被拒。

**检测**：force push 返回 `! [remote rejected]` 或 `pre-receive hook declined`。

**处理**：不修改 release 分支，改为推到新分支并创建新 MR：

```bash
# 1. 将 rebase 结果推到新分支（非 force push，普通 push）
git push origin rebase-release/<VERSION>

# 2. 关闭原来因冲突而搁置的 MR/PR
glab mr close <OLD_ID>   # GitLab
gh pr close <OLD_ID>     # GitHub

# 3. 创建指向 rebase-release/<VERSION> 的新 MR/PR（参考阶段4命令）
#    源分支: rebase-release/<VERSION>
#    目标分支: <MAIN_BRANCH>
```

> **注意**：此路径下原 release 分支保持不变（仍指向 rebase 前的 commit）。后续若有 release → main 的同步需求，需注意 hash 一致性问题（见"跨 release 同步"场景）。

### rebase 后检查：跳过 commit 审查

若 rebase 过程中出现 `warning: skipped previously applied commit <SHA>`：

```bash
# 1. 查看被跳过的 commit
git show <SKIPPED_SHA> --stat --oneline

# 2. 查找 target 上的对应 commit（同 message 或同文件改动）
git log origin/<MAIN_BRANCH> --oneline --grep="<关键字>" | head -5

# 3. 对比 diff 是否完全一致
diff <(git show <SKIPPED_SHA> --format=) <(git show <TARGET_SHA> --format=)
```

| 对比结果 | 处理 |
|---------|------|
| diff 完全一致 | ✅ 安全跳过，无需处理 |
| diff 不一致 | ❌ 该 commit 未被完整包含，需手动 cherry-pick `<SKIPPED_SHA>` |

---

## 阶段7：清理 MR/PR 分支多余文件

> ⚠️ **本阶段仅适用于 merge 模式**（阶段6 产生了 `merge-release/<VERSION>` 分支）。rebase 模式不会将 target 的额外文件带入，跳过本阶段直接进入阶段8。

> MR/PR 分支可能混入意外引入的本地文件（Stage 6 冲突解决时 `git add -A` 可能将本地 untracked 文件意外 stage 并 commit）。

### 检查规则

**在 merge-release 中、但在 release 分支和 target 分支中均不存在的文件 = 意外引入的本地文件，需剔除**：

```bash
comm -23 \
  <(git ls-tree -r HEAD --name-only | sort) \
  <(sort \
      <(git ls-tree -r origin/<RELEASE_BRANCH> --name-only) \
      <(git ls-tree -r origin/<TARGET_BRANCH> --name-only) \
    | uniq)
```

### 常见需剔除的文件类型

| 类型 | 示例路径 |
|------|---------|
| AI 工具配置 | `.claude/`, `.omc/`, `.codemap/`, `opencode.json` |
| 临时调试文件 | `ci-build-error.txt`, `ci-fix-log.txt` |

> **注意**：若文件在 release 分支**或** target 分支中存在，则**不剔除**。
> 来自 target 的文件（AGENTS.md、docs/、独有 package 等）均为预期存在，不属于多余文件。

### 剔除操作

```bash
# 从 git index 移除（若报 "pathspec not found" 说明文件不在 index，见下方 fallback）
git rm --cached -rf <EXTRA_PATH_1> <EXTRA_PATH_2>

# Fallback：若 git rm --cached 失败（文件已在 worktree 但未入 index）
git add -A
git rm --cached -rf <EXTRA_PATH_1>

git commit --amend --no-edit --no-verify
git push origin merge-release/<VERSION> --force-with-lease
```

### 验证：零多余文件

```bash
comm -23 \
  <(git ls-tree -r HEAD --name-only | sort) \
  <(sort \
      <(git ls-tree -r origin/<RELEASE_BRANCH> --name-only) \
      <(git ls-tree -r origin/<TARGET_BRANCH> --name-only) \
    | uniq) \
  | wc -l
# 输出应为 0（无意外引入的本地文件）
```

---

## 阶段8：AI 审查冲突文件（门控）

> ⚠️ **门控阶段**：审查不通过 → 禁止进入阶段 9 合并。必须逐文件审查，确认所有冲突处理正确后才能合并 MR/PR。

冲突解决后、合并前，AI 需主动审查所有冲突文件，确保合并结果完整且正确。

### 8.1 无残留冲突标记

扫描工作区，确认无遗留的 `<<<<<<` / `======` / `>>>>>>` 标记：

```bash
grep -rn "<<<<<<< \|=======\|>>>>>>>" --include="*" . 2>/dev/null | grep -v node_modules | grep -v .git
# 输出应为空
```

### 8.2 冲突文件 diff 审查

对阶段 5 记录的每个冲突文件，执行 diff 审查：

```bash
# 查看冲突文件在合并分支与 target 分支之间的 diff
git diff origin/<MAIN_BRANCH>..HEAD -- <conflict_file>
```

审查要点：

| 检查项 | 方法 | 判定 |
|------|------|------|
| 两侧 import/require 均保留 | diff 中不应缺少任一侧的 import | 缺任何一侧 → ❌ |
| 两侧新增函数/类均保留 | diff 应同时包含 source 和 target 侧的新增代码块 | 缺代码块 → ❌ |
| 无重复定义 | 同一符号不应出现两次定义 | 重复 → ❌ |
| 无注释掉的代码 | diff 中不应出现 `//` 或 `/* */` 包裹的整段逻辑 | 有 → ⚠️ 标注 |
| 无意外删除 | 除冲突标记外，不应有不在 source/target 任一分支中的删除 | 有 → ❌ |

### 8.3 rebase 跳过 commit 等价性验证（若适用）

若阶段 6 rebase 过程中有 commit 被跳过，验证等价性：

```bash
# 对比跳过 commit 与 target 对应 commit 的 diff
diff <(git show <SKIPPED_SHA> --format=) <(git show <TARGET_SHA> --format=)
# 输出应为空（完全一致）
```

不一致 → ❌ 被跳过的 commit 未完整包含在 target 中，需手动 cherry-pick。

### 8.4 审查结论

| 结论 | 判定 | 后续 |
|------|------|------|
| ✅ 通过 | 全部检查项无 ❌，⚠️ 不超过 2 个且均有合理解释 | 进入阶段 9 合并 |
| ❌ 不通过 | 任一项为 ❌ | **禁止合并**，回到阶段 6 修复后重新审查 |

### 审查报告输出

对每个冲突文件输出一份审查结论：

```
【冲突文件审查报告】
- .gitignore: ✅ 8.2.70 的 .omc/.sisyphus 改动叠加在 master 之上，无残留标记，两侧均有
- release-branch: ✅ 已解决为 release/8.2.70
- src/bridge/api/MainProcessAPI.ts: ✅ registerResourceInterceptors(8.2.61) + selectCollectFolder(8.2.70) 均完整保留
- skipped commit 7437368df: ✅ 与 master 7421ca91b diff 一致

结论：✅ 通过，可进入阶段 9 合并
```

> ⛔ **门控**：审查结论为 ❌ 时，**不得继续执行阶段 9**。修复冲突后必须重新通过阶段 8 审查。

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

补充验证 merge commit 已真实落到目标分支：

```bash
git fetch origin <MAIN_BRANCH>
git log origin/<MAIN_BRANCH> --oneline -5
# 确认最新 commit 中包含 release/<VERSION> 合并信息
```

---

## 阶段10：输出报告

生成报告文件（建议路径：`$(git rev-parse --show-toplevel)/release-<VERSION>-report.md`），内容包含：

1. **打 tag 汇总**：仓库 / tag 名 / commit SHA / remote 验证状态
2. **MR/PR 汇总**：仓库 / 源分支 → 目标分支 / 编号及链接 / 合并状态
3. **冲突处理详情**（如有）：
   - 分支差距（各仓库 source/target 超前 commit 数）
   - target 独有提交列表（冲突来源）
   - 冲突文件清单及解决方式：**直接引用 `git-conflict-resolve` Y.6 全局复查清单**，不重新生成
   - 清理的多余文件列表
4. **需人工关注事项**（如残留风险、待补充 cherry-pick 等）
5. **跨 release 同步**（如有）：源 release / 目标 release / 处理方式 / 冲突详情

---

## 场景：release 分支变更同步到另一个 release 分支

当 `release/A` 已合入主分支，但需将其变更同步到 `release/B`（较新 release）时：

> ⚠️ **核心约束 — hash 一致性问题**：
> 若 `release/A` 是通过 **rebase**（非 merge）合入主分支的，则同一批改动在 `release/A` 和主分支上有**不同的 commit hash**。
> 此时直接 merge `release/A` → `release/B`，会导致后续 `release/B` → 主分支时出现同一改动两套 hash，必然冲突。

### 决策流程

```
release/A 合入主分支的方式？
├── merge（保留原始 hash）
│   → ✅ 可直接 merge release/A → release/B
│       未来 release/B → 主分支干净
│
└── rebase（hash 已变更）
    → ❌ 禁止 merge release/A → release/B
    → ✅ 改为将 release/B rebase 到主分支
        （或 merge 主分支到 release/B）
        因为主分支已包含 release/A 的变更
```

### 操作步骤

```bash
# 1. dry-run 评估冲突
BASE=$(git merge-base origin/release/A origin/release/B)
git merge-tree $BASE origin/release/A origin/release/B | grep -c "^changed in both"

# 2. 检查 release/A 在主分支上的合入方式
git log origin/<MAIN_BRANCH> --oneline --merges | grep "release/A"
# 若找不到 merge commit → 很可能是 rebase 入的

# 3. 若为 rebase 入 → 将 release/B rebase 到主分支
git checkout -B release/B origin/release/B
git rebase origin/<MAIN_BRANCH>
# 解决冲突后 force push（参见阶段6 rebase 模式）
```

### 示例

> `release/8.2.61` 以 rebase 方式合入 `master`。
> 需要将其变更同步到 `release/8.2.70`。
> ❌ 错误：`git merge release/8.2.61` → 后续 8.2.70 → master 必然冲突。
> ✅ 正确：`release/8.2.70` rebase 到 `master`（master 已有 8.2.61 变更）

---

## 错误处理

| 场景 | 处理方式 |
|------|---------|
| tag 已存在 | 报错停止，询问是否覆盖（`git tag -f` + `git push --force`）|
| 打 tag 前发现本地落后远端 | 阶段 2 前置检查已捕获；tag 锚定到 `$REMOTE_SHA`（`git rev-parse origin/<RELEASE_BRANCH>`），不使用本地 HEAD |
| tag 打在了错误 commit 上 | 删除重打：`git push origin --delete <TAG>` + `git tag -d <TAG>` → 重新执行阶段 2（锚定到 `$REMOTE_SHA`）；GitLab 也可 `glab api DELETE "projects/:fullpath/repository/tags/<TAG>"` 远程删除 |
| MR/PR 已存在（同源同目标） | 复用已有 MR/PR，不重新创建 |
| merge-tree=0 但 MR 无法合并 | 改用 rebase 策略（阶段 6），创建 rebase-release 分支 |
| rebase 冲突过多 | 切换为 merge 策略（在 git-conflict-resolve 中重新执行 Y.0 merge 模式） |
| rebase 自动跳过 commit | 对比被跳过 commit 与 target 对应 commit 的 diff（阶段 6 审查流程） |
| force push 被保护分支拒绝（`remote rejected` / `pre-receive hook declined`） | release 分支是保护分支（push=No one），改用"保护分支备选路径"：推到新分支 `rebase-release/<VERSION>` → 关闭原 MR → 创建新 MR（见阶段6 rebase 模式） |
| 冲突解决出现逻辑错误 | 交由 `git-conflict-resolve` Y.5 逻辑验证捕获，按 ⚠️/❌ 提示处理 |
| `git rm --cached` 报 "pathspec not found" | 文件不在 index，用 `git add -A` 先同步 worktree 再重试 |
| pipeline 未运行警告 | 平台 CI 提示（`! No pipeline running`）为正常提示，不影响合并 |
| CLI 认证失败 | 检查 `<GIT_CLI> auth status`，重新执行 `<GIT_CLI> auth login` |

---

## 快速参考命令

```bash
# 查看 tag 历史
git tag --sort=-version:refname | head -30

# ── 阶段2：远程优先打 tag（前置检查 + 平台分流）──
# 前置检查（所有平台）
git fetch origin <RELEASE_BRANCH>
REMOTE_SHA=$(git rev-parse origin/<RELEASE_BRANCH>)
echo "remote HEAD: $REMOTE_SHA"
# 分叉检测
git rev-list --count HEAD..origin/<RELEASE_BRANCH>  # >0 说明本地落后
# tag 远端已存在检查
git ls-remote --tags origin | grep "refs/tags/<TAG_NAME>$"

# GitLab：远程创建 tag（glab api，纯 tag 无 Release 对象）
glab api POST "projects/:fullpath/repository/tags" \
  -f tag_name=<TAG_NAME> -f ref=$REMOTE_SHA -f message="Release <VERSION>"

# GitHub / Gitea：本地锚定到远端 SHA
git tag <TAG_NAME> $REMOTE_SHA && git push origin <TAG_NAME>

# 验证 tag 指向正确 commit
git ls-remote origin refs/tags/<TAG_NAME>  # 应返回 $REMOTE_SHA
# ── 阶段2 结束 ──

# 查看主分支合并历史
git log --oneline --merges -20 | grep -E "into '(master|main|develop)'"

# 冲突 dry-run（检测冲突文件数量）
git merge-tree $(git merge-base origin/$SRC origin/$TGT) origin/$SRC origin/$TGT | grep -c "^changed in both"

# 验证 MR 可合并性（阶段 5.5 — merge-tree=0 后强制执行）
glab mr view <MR_ID> | grep -iE "merge_status|can_be_merged"   # GitLab
gh pr view <PR_ID> --json mergeable,mergeStateStatus            # GitHub

# 检查多余文件（阶段7）
comm -23 <(git ls-tree -r HEAD --name-only | sort) <(git ls-tree -r origin/$SRC --name-only | sort)

# 合并 MR/PR（按平台选择）
glab mr merge $MR_ID --squash=false --remove-source-branch=false --yes   # GitLab
gh pr merge $PR_ID --merge --delete-branch=false                          # GitHub

# 冲突解决相关命令 → 见 git-conflict-resolve skill 快速参考

# rebase 跳过 commit 审查（阶段6）
git show <SKIPPED_SHA> --stat --oneline
diff <(git show <SKIPPED_SHA> --format=) <(git show <TARGET_SHA> --format=)

# 跨 release 同步：检查 release/A 合入主分支方式
git log origin/<MAIN_BRANCH> --oneline --merges | grep "release/A"

# AI 审查冲突文件（阶段8）
grep -rn "<<<<<<< \|=======\|>>>>>>>" --include="*" . | grep -v node_modules | grep -v .git
git diff origin/<MAIN_BRANCH>..HEAD -- <conflict_file>
```

