---
name: git-release-finish
version: "1.5.0"
user-invocable: true
description: "Use when releasing a Git repository version — tagging, merging release branches into main, resolving conflicts, or syncing changes between release branches. Handles ambiguous tag naming (v-prefix vs plain), unknown main branch (master/main/develop), cross-release hash-sensitive rebase, and MR/PR extra file cleanup. GitLab, GitHub, Gitea; single or multi-repo. Triggers: 发版, 打tag, 发布版本, 版本发布, release流程, git-release, multi-repo release."
---

# Git 仓库版本发布工作流（git-release-finish）

## Overview

在版本迭代结束时，将 release 分支通过打 tag、创建 MR/PR、解决冲突、清理多余文件到最终合并的完整流程发布到主开发分支。

**配对 skill：** `git-release-start`（迭代开始，创建 release 分支）↔ `git-release-finish`（迭代结束，本 skill）

**依赖 skill：** 阶段6 冲突解决由 `git-conflict-resolve` skill 执行（语义分析驱动，支持 merge / rebase 多轮聚合）。

**远程优先原则：** **先确认远端状态，再决定本地操作**。打 tag 前必须 `git fetch` + 验证远端 commit SHA，禁止在未验证的本地 HEAD 上直接打 tag。GitLab 优先使用 `glab api` 远程创建 tag，GitHub/Gitea 用本地 `git tag` 但锚定到远端 SHA。

> 各阶段确认表样例、完整错误处理表、平台 CLI 操作映射、审查报告样例见 [reference.md](reference.md)。

---

## 平台 CLI 映射

核心 git 操作（tag、push、merge）均为平台无关。仅 MR/PR 管理依赖平台 CLI。

| 平台 | CLI 工具 | 操作单元 | 认证验证 |
|------|---------|---------|---------|
| GitLab（SaaS / 自托管） | `glab` | MR | `glab auth status` |
| GitHub | `gh` | PR | `gh auth status` |
| Gitea | `tea` | PR | `tea login` |

**文档约定**：以下用 `<GIT_CLI>` 代指平台 CLI，用 `MR/PR` 代指合并请求，**实际执行时替换为对应平台命令**。具体 create/merge/close/view 命令映射见 [reference.md](reference.md)「平台 CLI 操作映射」。

---

## 适用 / 不适用 / 前置条件

**适用场景**（单仓库、多仓库均可）：
- 需要分析并遵循已有 tag 命名规范（命名可能不统一）
- 主分支名称不确定（master / main / develop 各异）
- release 分支合入主干可能存在代码冲突
- MR/PR 分支可能混入 AI 工具文件、临时脚本等无关文件
- 需要生成完整的发版操作报告

**不适用场景**：非 Git 托管平台（SVN、Mercurial 等）。

**调用前置条件**：已安装对应平台 CLI 并完成认证、各仓库可通过 remote 访问 release 分支、确认版本号（如 `8.2.60`）。

> **原则：流程必须完整执行。** 无论仓库数量多少、发版看起来多简单，每个阶段都不可跳过。"这次看起来很简单"是最常见的跳过前置检查后出错的原因。

---

## 阶段总览

| 阶段 | 操作 | 关键工具 |
|------|------|---------|
| **0** | **前置健康检查（残留冲突标记扫描）** | **`git grep` + `git log -S`** |
| 1 | 分析各仓库 tag 命名规范 | `git tag` |
| 2 | 创建并推送 tag | `git tag` + `git push` |
| 3 | 分析各仓库主开发分支 | `git remote show` + `git log` |
| 4 | 创建 MR/PR | `<GIT_CLI> mr/pr create` |
| 5 | 检测冲突 | `git merge-tree` |
| 5.5 | 验证 MR 可合并性（merge-tree=0 后强制执行） | `glab mr view` / `gh pr view` |
| 6 | 解决冲突（有则处理） | `git-conflict-resolve` skill |
| 7 | 清理 MR/PR 分支多余文件 | `git ls-tree` + `comm` |
| 8 | **独立残留扫描门控（无条件执行）** | `git grep` + 精确正则 |
| 9 | 合并 MR/PR | `<GIT_CLI> mr/pr merge` |
| 10 | 输出报告 | — |

所有**仓库无关**的操作均应**并行执行**（并行打 tag、并行建 MR/PR、并行检查冲突）。

### 执行路径

根据阶段 5 / 5.5 的结果，阶段 6–7 按以下路径选择执行。**阶段 0 和阶段 8 在所有路径中无条件执行**——阶段 0 是前置保险，阶段 8 是合并前最终门控，两者不依赖冲突检测结果。

| 情况 | 执行路径 |
|------|---------|
| merge-tree=0 且 MR 可合并 | **0**→1→2→3→4→5→**5.5**→**8**→**9**→10（跳过 6/7） |
| merge-tree=0 但 MR 不可合并 | **0**→1→2→3→4→5→**5.5**→**6(rebase)**→**8**→**9**→10（跳过 7） |
| 冲突 > 0，source ≤ 3 commits 且冲突 ≤ 1 文件 | **0**→1→2→3→4→5→**6(rebase)**→**8**→**9**→10（跳过 7） |
| 冲突 > 0，其余情况 | **0**→1→2→3→4→5→**6(merge)**→**7**→**8**→**9**→10 |

> ⚠️ **阶段 8 是独立的残留扫描门控**——无论阶段 5 是否检测到冲突、阶段 6 是否执行，合并 MR 前都必须通过阶段 8 的残留冲突标记扫描。这覆盖了"分支已有 merge commit 残留冲突标记但 merge-tree 未检测到新冲突"的场景。

---

## 阶段0：前置健康检查（残留冲突标记扫描）

> ⚠️ **无条件执行**——在阶段 1 之前对每个仓库运行。这是防御历史残留的第一道保险：阶段 5 的 `git merge-tree` 只检测**未来合并时的新冲突**，对**分支已有 commit 中残留的冲突标记**无感知。若历史 commit 已包含冲突标记，最终残留标记随合并进入主干。

> 背景与共享检测协议详见 [reference.md](reference.md)「阶段0 背景说明」。

### 检测命令

**L4a — 工作区残留扫描**（精确正则匹配 git 冲突标记格式，覆盖标准 7 字符、非标准 8+ 字符、diff3 的 `|||||||` base 标记；git grep 自动遵循 .gitignore）：

```bash
git grep -lE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' 2>/dev/null
```

**L4b — 历史 merge commit 残留扫描**（pickaxe 搜索最近 30 天）：

```bash
git log --all --merges --since="30 days ago" \
  -S'^<<<<<<< ' --pickaxe-regex \
  --format="COMMIT: %h %s" --name-only 2>/dev/null
```

### 结果判定

| 检测结果 | 处理 |
|---------|------|
| L4a 和 L4b 均为空 | ✅ 健康状态，进入阶段 1 |
| L4a 非空（工作区有残留） | ❌ **中止发版**。在工作区清理残留文件（手动解决或 checkout 干净版本）后重新执行 |
| L4b 非空（历史 commit 有残留） | ❌ **中止发版**。在对应 commit 上修复残留（或新建 fixup commit 清理）后重新执行 |

> ⚠️ **禁止"先发版后清理"**：残留冲突标记进入主干后，下游 CI/CD 可能基于错误内容构建。必须在发版前彻底清理。

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

> ⚠️ **tag 命名可能随版本演变**：同一仓库的 tag 命名规范并非一成不变（例如从 `v8.2.60` 改为 `8.2.63`）。**以最新 tag 为准**，不要因为看到旧 tag 有前缀就假设新版本也必须有。若历史 tag 中存在命名规范不一致，向用户确认本次应遵循哪套规范。

**确认表样例见 [reference.md](reference.md)「阶段1 确认表样例」。在确认 tag 名称后与用户对齐，再执行阶段2。**

---

## 阶段2：创建并推送 Tag

> ⚠️ **远程优先**：打 tag 前必须 fetch 并验证远端 commit SHA。禁止在未验证的本地 HEAD 上直接 `git tag`——本地分支可能落后远端，导致 tag 打在旧 commit 上。

### 2.0 前置检查（所有平台，必须执行）

对每个仓库**并行**执行：

```bash
git fetch origin <RELEASE_BRANCH>
REMOTE_SHA=$(git rev-parse origin/<RELEASE_BRANCH>)   # tag 锚定目标
echo "远端 $RELEASE_BRANCH HEAD: $REMOTE_SHA"
BEHIND=$(git rev-list --count HEAD..origin/<RELEASE_BRANCH> 2>/dev/null || echo 0)
[ "$BEHIND" -gt 0 ] && echo "⚠️ 本地落后远端 $BEHIND 个 commit，tag 将锚定到远端 SHA（非本地 HEAD）"
git ls-remote --tags origin | grep -q "refs/tags/<TAG_NAME>$" \
  && { echo "❌ tag <TAG_NAME> 已存在于远端，终止"; exit 1; }
```

### 2.1 创建 Tag（按平台分流）

**GitLab — 远程创建（优先，无需 git push，API 直接在远端创建纯 tag）**：

```bash
REMOTE_SHA=$(git rev-parse origin/<RELEASE_BRANCH>)   # 来自 2.0
glab api POST "projects/:fullpath/repository/tags" \
  -f tag_name=<TAG_NAME> \
  -f ref=$REMOTE_SHA \
  -f message="Release <VERSION>"
```

**GitHub / Gitea — 本地创建锚定到远端 SHA（非本地 HEAD）**：

```bash
REMOTE_SHA=$(git rev-parse origin/<RELEASE_BRANCH>)   # 来自 2.0
git tag <TAG_NAME> $REMOTE_SHA
git push origin <TAG_NAME>
```

### 2.2 验证 Tag 指向正确 commit

```bash
REMOTE_SHA=$(git rev-parse origin/<RELEASE_BRANCH>)   # 来自 2.0
TAG_SHA=$(git ls-remote origin refs/tags/<TAG_NAME> | awk '{print $1}')
echo "tag <TAG_NAME> -> $TAG_SHA ; expected -> $REMOTE_SHA"
# 若为 annotated tag，ls-remote 返回 tag 对象 SHA，需解引用：refs/tags/<TAG_NAME>^{}
```

> ⚠️ 若 `TAG_SHA` ≠ `REMOTE_SHA`（排除 annotated tag 解引用差异），说明 tag 打在了错误 commit 上，必须删除重打（见 [reference.md](reference.md)「错误处理」）。

**确认表样例见 [reference.md](reference.md)「阶段2 确认表样例」。**

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
git remote show origin | grep "HEAD branch"        # 查询 remote 默认分支（需网络，权威）
git symbolic-ref refs/remotes/origin/HEAD          # 本地追踪（可能过期）
git branch -r | grep "origin/HEAD"
```

> ⚠️ `git remote show origin` 与 `git symbolic-ref` 可能不一致（本地缓存与远端不同步），以 `git remote show origin` 为准。

**3. 用户确认（兜底）**：当两个来源冲突或无历史记录时，列出候选分支询问用户。

### remote HEAD 过期排查

> ⚠️ **remote HEAD 可能指向已废弃/落后的分支**：当 remote HEAD 指向的分支与候选分支存在显著 commit 差距时，用合并历史确认。

```bash
echo "HEAD branch ahead of main: $(git rev-list --count origin/main..origin/<HEAD_BRANCH> 2>/dev/null)"
echo "main ahead of HEAD branch: $(git rev-list --count origin/<HEAD_BRANCH>..origin/main 2>/dev/null)"
# 若 HEAD branch 落后数百 commits → remote HEAD 已过期，以合并历史为准
```

**常见场景与确认表样例见 [reference.md](reference.md)「阶段3 常见场景」与「阶段3 确认表样例」。在确认目标分支后与用户对齐，再执行阶段4。**

---

## 阶段4：创建 MR/PR

对所有仓库**并行**执行：

```bash
glab mr create \
  --source-branch <RELEASE_BRANCH> --target-branch <MAIN_BRANCH> \
  --title "Release <VERSION>" \
  --description "Merge <RELEASE_BRANCH> into <MAIN_BRANCH>" \
  --remove-source-branch=false                                            # GitLab

gh pr create \
  --base <MAIN_BRANCH> --head <RELEASE_BRANCH> \
  --title "Release <VERSION>" \
  --body "Merge <RELEASE_BRANCH> into <MAIN_BRANCH>"                       # GitHub
```

记录每个 MR/PR 的编号和 URL，汇总输出。

---

## 阶段5：冲突检测

对所有仓库**并行**做 dry-run，**不修改任何文件**：

```bash
BASE=$(git merge-base origin/<RELEASE_BRANCH> origin/<MAIN_BRANCH>)
git merge-tree $BASE origin/<RELEASE_BRANCH> origin/<MAIN_BRANCH> 2>&1 | grep -c "^changed in both"   # 内容冲突数量
echo "release ahead: $(git rev-list --count origin/<MAIN_BRANCH>..origin/<RELEASE_BRANCH>)"   # 分支差距
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

> ⚠️ **关键陷阱**：(1) **merge-tree=0 不代表 MR 一定可合并**——merge-tree 不检测结构性问题（如分支偏离过大被 GitLab/GitHub 拒绝），必须执行阶段 5.5；(2) **rebase 在每个冲突提交处停下**——80 commits 意味着反复中断，除非 source 极短（≤ 3 commits）且冲突极少，否则用 merge 策略。

---

## 阶段 5.5：验证 MR 可合并性（merge-tree=0 时强制执行）

```bash
glab mr view <MR_ID> 2>&1 | grep -iE "merge_status|can_be_merged|has_conflicts"   # GitLab
gh pr view <PR_ID> --json mergeable,mergeStateStatus 2>&1                          # GitHub
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
git push origin merge-release/<VERSION>
glab mr close <OLD_ID>   # GitLab（关闭原搁置 MR/PR）
gh pr close <OLD_ID>     # GitHub
```

然后重新创建指向 `merge-release/<VERSION>` 的 MR/PR（参考阶段4命令）。

**rebase 模式**：

```bash
git push origin rebase-release/<VERSION>:<RELEASE_BRANCH> --force-with-lease   # 原 MR/PR 自动更新，无需关闭重建
```

> ⚠️ **Force push 双重确认**：(1) 用 `--force-with-lease` 而非 `--force`（远端有新提交时拒绝推送，避免覆盖他人提交）；(2) 若 `<RELEASE_BRANCH>` 是共享分支，force push 会破坏他人的工作基础——执行前询问用户："是否有他人基于此分支工作？确认 force push？"

> **保护分支备选路径**（force push 被拒、`remote rejected` / `pre-receive hook declined`）与 **rebase 后跳过 commit 审查**流程见 [reference.md](reference.md)「阶段6 保护分支备选路径」与「阶段6 rebase 后检查」。

---

## 阶段7：清理 MR/PR 分支多余文件

> ⚠️ **本阶段仅适用于 merge 模式**（阶段6 产生了 `merge-release/<VERSION>` 分支）。rebase 模式不会将 target 的额外文件带入，跳过本阶段直接进入阶段8。MR/PR 分支可能混入意外引入的本地文件（Stage 6 冲突解决时 `git add -A` 可能将本地 untracked 文件意外 stage 并 commit）。

### 检查规则与零多余文件验证

**在 merge-release 中、但在 release 分支和 target 分支中均不存在的文件 = 意外引入的本地文件，需剔除**：

```bash
comm -23 \
  <(git ls-tree -r HEAD --name-only | sort) \
  <(sort \
      <(git ls-tree -r origin/<RELEASE_BRANCH> --name-only) \
      <(git ls-tree -r origin/<TARGET_BRANCH> --name-only) \
    | uniq)   # 检查输出列表（多余文件）；追加 | wc -l 即为验证命令，输出应为 0
```

> 若文件在 release 分支**或** target 分支中存在，则**不剔除**。来自 target 的文件（AGENTS.md、docs/、独有 package 等）均为预期存在。常见需剔除文件类型（AI 工具配置、临时调试文件）见 [reference.md](reference.md)「阶段7 常见需剔除文件类型」。

### 剔除操作

```bash
git rm --cached -rf <EXTRA_PATH_1> <EXTRA_PATH_2>   # 若报 "pathspec not found" 用 fallback
# Fallback：git add -A && git rm --cached -rf <EXTRA_PATH_1>   # 文件已在 worktree 但未入 index
git commit --amend --no-edit --no-verify
git push origin merge-release/<VERSION> --force-with-lease
```

---

## 阶段8：独立残留扫描门控（无条件执行）

> ⚠️ **无条件门控**：无论阶段 5 是否检测到冲突、阶段 6 是否执行，合并 MR 前都必须通过阶段 8。这是合并前的最后一道防线——即使 `git-conflict-resolve` 的 L1/L2 防御都失效，阶段 8 仍能拦截带冲突标记的 commit。

### 8.1 残留冲突标记扫描（L3 防御 — 必执行）

扫描合并分支相对 target 的所有变更文件，检测残留冲突标记。**扫描范围用 `git diff --name-only` 而非全仓**——全仓扫描会被构建产物的 CSS 注释 `=========` 等假阳性淹没，只扫合并涉及的文件（唯一可能残留标记的位置）。

```bash
BASE=$(git merge-base origin/<MAIN_BRANCH> HEAD)
git diff --name-only $BASE..HEAD | while read f; do
  git grep -nE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' -- "$f" 2>/dev/null \
    && { echo "❌ $f 含残留冲突标记，禁止合并"; exit 1; }
done   # exit 1 → 阻断合并，回到阶段 6 修复后重新审查
```

> ⚠️ **精确正则排除假阳性**：`^={7,}$` 要求纯等号到行尾（CSS 注释 `/* ====== */` 不匹配）；`^<{7,} ` 要求 7+ 个 `<` 后跟空格（排除普通 `<` 操作符）。

### 8.2 冲突文件 diff 审查（仅阶段 6 执行时增强）

> 本节仅在阶段 6 执行了冲突解决时适用。若阶段 5 未检测到冲突（跳过了 6），8.1 通过后直接进入阶段 9。

对阶段 5 记录的每个冲突文件执行 diff 审查：`git diff origin/<MAIN_BRANCH>..HEAD -- <conflict_file>`。

**审查要点表（import/函数保留、重复定义、注释代码、意外删除等）见 [reference.md](reference.md)「阶段8.2 冲突文件 diff 审查要点」。**

### 8.3 rebase 跳过 commit 等价性验证（若适用）

若阶段 6 rebase 过程中有 commit 被跳过，验证等价性：`diff <(git show <SKIPPED_SHA> --format=) <(git show <TARGET_SHA> --format=)` 输出应为空。不一致 → ❌ 需手动 cherry-pick。

> 详细审查流程见 [reference.md](reference.md)「阶段6 rebase 后检查」。

### 8.4 审查结论

| 结论 | 判定 | 后续 |
|------|------|------|
| ✅ 通过 | 8.1 无残留标记 + 8.2/8.3（若执行）全部检查项无 ❌ | 进入阶段 9 合并 |
| ❌ 不通过 | 8.1 检测到残留标记，或 8.2/8.3 任一项为 ❌ | **禁止合并**，回到阶段 6 修复后重新审查 |

**审查报告输出样例见 [reference.md](reference.md)「阶段8 审查报告样例」。**

> ⛔ **门控**：8.1 检测到残留冲突标记时，**不得继续执行阶段 9**。修复后必须重新通过阶段 8 扫描。

---

## 阶段9：合并 MR/PR

用户确认后，对所有仓库**并行**执行（**📋 CI 门控**：pipeline 红而合并 = 把未验证代码送进主干）：

```bash
glab mr view <MR_ID> --json mergeStatus,detailedMergeStatus 2>/dev/null \
  | grep -qiE '"mergeable"|\"can_be_merged\"' \
  || echo "⚠️ MR 状态非可合并（CI 可能未通过），确认合并？"   # CI 门控检查
glab mr merge <MR_ID> --squash=false --remove-source-branch=false --yes   # GitLab（输出 ✓ Merged!）
gh pr merge <PR_ID> --merge --delete-branch=false                         # GitHub（输出 ✓ Pull request ... was merged）
```

补充验证 merge commit 已真实落到目标分支：`git fetch origin <MAIN_BRANCH> && git log origin/<MAIN_BRANCH> --oneline -5`（确认最新 commit 中包含 `release/<VERSION>` 合并信息）。

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
BASE=$(git merge-base origin/release/A origin/release/B)
git merge-tree $BASE origin/release/A origin/release/B | grep -c "^changed in both"   # dry-run 评估冲突
git log origin/<MAIN_BRANCH> --oneline --merges | grep "release/A"   # 检查 release/A 在主分支上的合入方式（找不到 merge commit → 很可能是 rebase 入的）
# 若为 rebase 入 → 将 release/B rebase 到主分支
git checkout -B release/B origin/release/B
git rebase origin/<MAIN_BRANCH>   # 解决冲突后 force push（参见阶段6 rebase 模式）
```

**示例（release/8.2.61 → release/8.2.70）见 [reference.md](reference.md)「跨 release 同步示例」。**

---

## 附录：pre-commit hook 脚本（L5 可选增强）

> **持续防护**：将此脚本安装到 `.git/hooks/pre-commit`，每次 `git commit` 都自动检测 staged 内容的冲突标记。不依赖任何 skill 执行——这是 git 原生 hook，安装后永久生效。
>
> **与 skill 的关系**：skill 的 L1-L4 防御在 skill 执行时触发；pre-commit hook 在**任何 commit 操作**时触发（包括手动 commit、其他 skill 的 commit）。两者互补，不冲突。

### 安装

```bash
# 保存到项目的 .git/hooks/pre-commit
cat > .git/hooks/pre-commit << 'HOOK'
#!/bin/bash
# 检测 staged 内容中的 git 冲突标记
# 精确正则匹配：行首 7+ 字符 + 空格/行尾
git diff --cached | grep -qE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' \
  && {
    echo "❌ pre-commit: staged 内容含冲突标记，禁止提交"
    echo "请先解决冲突标记后再 commit"
    exit 1
  } || exit 0
HOOK
chmod +x .git/hooks/pre-commit
```

### 注意事项

- hook 可被 `git commit --no-verify` 绕过——L5 是可选增强，L1-L4 不依赖它
- 若项目已有 pre-commit hook（如 lint），将冲突标记检测追加到现有 hook 末尾
- hook 内容与 `git-conflict-resolve` Y.6 门控、`git-release-finish` 阶段 8 扫描使用相同的精确正则，保持一致性
