---
name: git-release-finish
version: "1.7.0"
user-invocable: true
description: "Use when releasing a Git repository version — tagging, merging release branches into main, resolving conflicts, or syncing changes between release branches. Handles ambiguous tag naming (v-prefix vs plain), unknown main branch (master/main/develop), cross-release hash-sensitive rebase, MR/PR extra file cleanup, GitLab ff-only merge method (forces cherry-pick strategy), protected branch rules, and multi-repo context isolation. GitLab, GitHub, Gitea; single or multi-repo. Triggers: 发版, 打tag, 发布版本, 版本发布, release流程, git-release, multi-repo release, release同步到另一个release."
---

# Git 仓库版本发布工作流（git-release-finish）

## Overview

在版本迭代结束时，将 release 分支通过打 tag、创建 MR/PR、解决冲突、清理多余文件到最终合并的完整流程发布到主开发分支。

**配对 skill：** `git-release-start`（迭代开始，创建 release 分支）↔ `git-release-finish`（迭代结束，本 skill）

**依赖 skill：** 阶段6 冲突解决由 `git-conflict-resolve` skill 执行（语义分析驱动，支持 merge / rebase 多轮聚合）。

**远程优先原则：** **先确认远端状态，再决定本地操作**。打 tag 前必须 `git fetch` + 验证远端 commit SHA，禁止在未验证的本地 HEAD 上直接打 tag。GitLab 优先使用 `glab api` 远程创建 tag，GitHub/Gitea 用本地 `git tag` 但锚定到远端 SHA。

---

## 文档结构（按需深入）

本 skill 采用**渐进式披露**：本文件是核心主干（每次发版必经的流程、决策表、护栏规则），**条件性场景内容**拆到 `references/` 按需读取，避免无关内容稀释注意力。

| 当你遇到... | 读这个 reference |
|------------|----------------|
| 阶段 3.5 判定 `merge_method = ff` + 非快进 | `references/ff-cherry-pick.md`（ff 专用 cherry-pick 流程 + GitHub 等价陷阱 + hash 一致性） |
| 需要把 release/A 变更同步到另一个 release/B | `references/cross-release-sync.md`（hash 一致性决策树） |
| 阶段 6 走 rebase 模式 / 保护分支 force push 被拒 / rebase 跳过 commit | `references/conflict-branches.md`（rebase 模式 + 保护分支备选 + 跳过 commit 审查） |
| 执行中报错（406 / tag 冲突 / CLI 报错 / 空 commit 等） | `references/error-handling.md`（错误处理表 + pre-commit hook） |
| 想速查端到端命令（人类视角） | `references/quick-reference.md`（命令速查表） |

> 主干已包含每个阶段的完整决策流程。**只有上表场景命中时才读对应 reference**——大多数 merge 模式、单仓库发版全程不需要任何 reference。

---

## 多仓库执行纪律（执行前置，全程适用）

> 📌 **单仓库用户**：本节可略过，直接跳到「平台 CLI 映射」。
> **多仓库（≥2）用户**：本节是执行护栏，必须严格遵守。
>
> ⚠️ 这些规则源自实战中反复出现的真实故障，不是理论洁癖。

### M.1 — 工作目录显式隔离

工具调用层没有「仓库上下文」的持久状态：上一次 `cd` 到仓库 A 后，下一次 `Bash` 调用若不带 `cd`，仍停留在 A。多仓库并行发版时，这会导致在仓库 A 的目录里执行了仓库 B 的操作（创建错误 MR、merge-tree 分析错误仓库、合并错误 MR）。

**规则**：多仓库场景下，**每个仓库的命令块必须以 `cd <REPO_PATH> &&` 开头**，即使你认为当前已经在正确目录。

```bash
# ✅ 正确：显式 cd，不依赖上一次调用残留的目录
cd /path/to/repo-A && git fetch origin release/8.2.73 && glab mr create ...

# ❌ 错误：依赖隐式目录状态，多仓库场景下必然串位
git fetch origin release/8.2.73
glab mr create ...
```

**每个确认表阶段**（阶段1/2/3/3.5 的输出表）必须显式标注「仓库」列，并在切换仓库时口头说明「现在切到仓库 B」。

### M.2 — 跨仓库 failure pattern 即时传播

> ℹ️ **适用场景**：本节主要适用于「主流程漏检」或「阶段 9 撞墙后回溯」。阶段 3.5 本身并行检查所有仓库的 merge_method；M.2 是当某仓库在后续阶段撞墙时，对其他仓库**补查**的保险，不是主流程的重复。

多仓库场景下，任一仓库发现的环境限制（`ff` 合并模式、保护分支规则、CI pipeline 要求、CLI 认证问题），**立即对所有尚未进入阶段 9 的仓库执行相同检查**，不要等第二个仓库也撞墙。

这条规则针对的是「同一面墙撞两次」的失败模式：仓库 A 在 `glab mr merge` 时被 `406 Branch cannot be merged` 拦截（根因是 `ff` 模式），但处理完 A 后没有立即对仓库 B 检查 merge method，导致 B 重复踩坑。

| 仓库 A 发现 | 立即对仓库 B（及所有未处理仓库）执行 |
|------------|--------------------------------------|
| `merge_method = ff` | 阶段 3.5 环境指纹检查（提前知晓，直接走 cherry-pick 策略） |
| release 分支是保护分支（push=No one） | 检查 B 的 release 分支保护规则，提前规划保护分支备选路径 |
| CLI 认证失败 | `glab auth status` / `gh auth status` 验证 |
| pipeline 失败阻断合并 | 检查 B 的 CI 配置与 pipeline 状态 |

### M.3 — 并行执行边界

所有**仓库无关**的操作应**并行执行**（并行打 tag、并行建 MR/PR、并行检查冲突）。但**冲突解决（阶段6）**涉及工作区状态修改，**必须串行**——同一时刻只能在一个仓库的工作区里解冲突。

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
| **0** | **前置健康检查（残留冲突标记扫描）** | **`git grep` + `git log -S`** |
| 1 | 分析各仓库 tag 命名规范 | `git tag` |
| 2 | 创建并推送 tag | `git tag` + `git push` |
| 3 | 分析各仓库主开发分支 | `git remote show` + `git log` |
| **3.5** | **环境指纹识别（merge_method / 保护分支规则）** | **`glab api` / `gh api`** |
| 4 | 创建 MR/PR | `<GIT_CLI> mr/pr create` |
| 5 | 检测冲突 | `git merge-tree` |
| 5.5 | 验证 MR 可合并性（merge-tree=0 后强制执行） | `glab mr view` / `gh pr view` |
| 6 | 解决冲突（有则处理） | `git-conflict-resolve` skill |
| 7 | 清理 MR/PR 分支多余文件 | `git ls-tree` + `comm` |
| 8 | **独立残留扫描门控（无条件执行）** | `git grep` + 精确正则 |
| 9 | 合并 MR/PR | `<GIT_CLI> mr/pr merge` |
| 10 | 输出报告 | — |

所有**仓库无关**的操作按 **M.3** 执行（并行打 tag、建 MR/PR、检查冲突；**阶段 6 冲突解决必须串行**）。

### 执行路径

根据阶段 3.5（环境指纹）和阶段 5 / 5.5 的结果，阶段 6–7 按以下路径选择执行。**阶段 0、3.5、8 在所有路径中无条件执行**——阶段 0 是前置保险，3.5 是合并约束前置闸门，阶段 8 是合并前最终门控，三者不依赖冲突检测结果。

> 阶段 3.5 是所有路径的强制经过点：其判定结果决定后续走默认 merge/rebase（路径 1-4）还是 cherry-pick（路径 5）。

| 情况 | 执行路径 |
|------|---------|
| merge-tree=0 且 MR 可合并 | **0**→1→2→3→**3.5**→4→5→**5.5**→**8**→**9**→10（跳过 6/7） |
| merge-tree=0 但 MR 不可合并 | **0**→1→2→3→**3.5**→4→5→**5.5**→**6(rebase)**→**8**→**9**→10（跳过 7） |
| 冲突 > 0，source ≤ 3 commits 且冲突 ≤ 1 文件 | **0**→1→2→3→**3.5**→4→5→**6(rebase)**→**8**→**9**→10（跳过 7） |
| 冲突 > 0，其余情况 | **0**→1→2→3→**3.5**→4→5→**6(merge)**→**7**→**8**→**9**→10 |
| **阶段 3.5 判定 ff 模式 + 非快进** | **0**→1→2→3→**3.5(cherry-pick)**→**8**→**9**→10（跳过 4 默认 MR / 5 / 5.5 / 6 / 7，改走 ff 专用流程创建 sync-release MR，详见 `references/ff-cherry-pick.md`） |

> ⚠️ **阶段 8 不再是"AI 审查冲突文件"（仅阶段 6 后触发），而是独立的残留扫描门控**。无论阶段 5 是否检测到冲突、阶段 6 是否执行，合并 MR 前都必须通过阶段 8 的残留冲突标记扫描。这覆盖了"分支已有 merge commit 残留冲突标记但 merge-tree 未检测到新冲突"的场景。

---

## 阶段0：前置健康检查（残留冲突标记扫描）

> ⚠️ **无条件执行**——在阶段 1（tag 分析）之前对每个仓库运行。这是防御历史残留的第一道保险：如果工作区或最近的 commit 中已有冲突标记残留，必须先清理再发版，否则残留会随 merge 进入主干。

### 为什么需要前置检查

阶段 5 的 `git merge-tree` 只检测**未来合并时的新冲突**，对**分支已有 commit 中残留的冲突标记**无感知。如果 merge-release 分支的某个历史 commit 已经包含了带冲突标记的文件（常见于 AI 自动解冲突失败但 commit 推送了的场景），merge-tree 不会报错，阶段 8 旧版本也不会触发（因为它依赖阶段 5/6 触发），最终残留标记随合并进入主干。

### 检测命令

**L4a — 工作区残留扫描**：

```bash
# 精确正则匹配 git 冲突标记格式（行首 7+ 字符 + 空格/行尾）
# 覆盖标准 7 字符、非标准 8+ 字符、diff3 的 ||||||| base 标记
# git grep 自动遵循 .gitignore，排除 untracked 构建产物
git grep -lE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' 2>/dev/null
```

**L4b — 历史 merge commit 残留扫描**（pickaxe 搜索）：

```bash
# 搜索最近 30 天的 merge commits 是否引入了冲突标记
# -S + --pickaxe-regex 搜索 commit diff 内容
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

### 共享检测协议

本阶段使用的冲突标记检测正则与 `git-conflict-resolve` Y.4.5/Y.5/Y.6 保持一致。精确正则 `^<{7,} |^={7,}$|^>{7,} |^\|{7,} ` 锁定 git 冲突标记格式，排除 CSS 注释（`/* ====== */`）和 ASCII 艺术等假阳性。

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

> ⚠️ **tag 命名可能随版本演变**：同一仓库的 tag 命名规范并非一成不变。例如某仓库历史用 `v8.2.60`（v 前缀），后续版本改为 `8.2.63`（无前缀）。**以最新 tag 为准**，不要因为看到旧 tag 有前缀就假设新版本也必须有。若历史 tag 中存在命名规范不一致，向用户确认本次应遵循哪套规范。

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

> ⚠️ 若 `TAG_SHA` ≠ `REMOTE_SHA`（排除 annotated tag 解引用差异），说明 tag 打在了错误 commit 上，必须删除重打（见 `references/error-handling.md`）。

### 输出：确认表

| 仓库 | tag 名称 | 远端 commit SHA | tag 验证 SHA | 状态 |
|------|---------|----------------|-------------|------|
| repo-A | `8.2.70` | `abc123def` | `abc123def` | ✅ |
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

> ⚠️ **remote HEAD 可能指向已废弃/落后的分支**：仓库迁移或分支策略调整后，remote HEAD 可能仍指向旧的主分支。例如某仓库 remote HEAD = `master`，但 `master` 落后 `main` 数百个 commit，实际活跃主分支是 `main`。
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

## 阶段3.5：环境指纹识别

> ⚠️ **无条件执行**——在创建 MR/PR 之前一次性收集各仓库的合并约束。这是避免「merge-tree=0、can_be_merged 都通过，但 `mr merge` 返回 406」陷阱的前置闸门。

### 为什么需要环境指纹

阶段 5 的 `git merge-tree` 和阶段 5.5 的 `can_be_merged` 都只检测**代码层面**的合并可行性，对**项目设置层面的合并约束**无感知。最典型的陷阱是 GitLab 项目设置 `merge_method = ff`（仅允许 fast-forward 合并）：

- `release/X.Y.Z` 不是 `master` 的直接后代（主分支在 release 分叉后有新提交）
- `git merge-tree` 报告 0 冲突（代码可以干净合并）
- MR 状态 `can_be_merged`（GitLab 判定代码层面无冲突、可产生合并结果——**但不校验 merge_method 约束**）
- 但 `glab mr merge` 返回 **406 "Branch cannot be merged"**——因为 ff 模式拒绝产生 merge commit，而 release 分支无法 fast-forward 到 master

这种陷阱无法在阶段 5/5.5 发现，只能在阶段 9 合并时撞墙。环境指纹识别把这道墙前移到阶段 3.5，提前决定走 cherry-pick 策略而非默认的 merge/rebase。

### 检测命令

对每个仓库**并行**执行（GitLab 为主，GitHub 类似）：

```bash
# 1. merge method（决定是否允许 merge commit）
glab api "projects/:fullpath" 2>/dev/null \
  | python3 -c "import sys,json; print('merge_method:', json.load(sys.stdin).get('merge_method'))"
# 输出：merge / squash / rebase_merge / ff

# 2. release 分支保护规则（决定 push 是否被拒、谁可合并）
glab api "projects/:fullpath/protected_branches" 2>/dev/null \
  | python3 -c "import sys,json; [print(f'{b[\"name\"]}: push={[l.get(\"access_level_description\") for l in b.get(\"push_access_levels\",[])]}, merge={[l.get(\"access_level_description\") for l in b.get(\"merge_access_levels\",[])]}') for b in json.load(sys.stdin) if 'release' in b['name'] or '*' in b['name']]"

# 3. CI 门控（决定 pipeline 是否阻断合并）
glab api "projects/:fullpath" 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('only_allow_merge_if_pipeline_succeeds:', d.get('only_allow_merge_if_pipeline_succeeds'))"

# GitHub 等价（:owner/:repo 由 gh 自动从当前仓库 remote 推导，与 glab :fullpath 同机制）
gh api repos/:owner/:repo 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('allow_squash_merge:', d.get('allow_squash_merge'), 'allow_merge_commit:', d.get('allow_merge_commit'), 'allow_rebase_merge:', d.get('allow_rebase_merge'))"

# 4. release 是否为 target 的后代（ff 模式项目决定走哪条策略）
#    target 是 release 的祖先 → release 可 ff 到 target（默认流程）
#    否则非快进 → ff 模式项目必须走 cherry-pick
git merge-base --is-ancestor origin/<TARGET_BRANCH> origin/<RELEASE_BRANCH> \
  && echo "后代关系：是（可 ff，默认流程）" \
  || echo "后代关系：否（非快进，ff 模式项目必须走 cherry-pick）"
```

### 结果分类与策略选择

| merge_method | release 是否为 target 后代 | 策略 |
|-------------|--------------------------|------|
| `merge` / `rebase_merge` | 任意 | 默认 merge 策略（阶段6 merge 模式） |
| `squash` | 任意 | 阶段 9 合并时去掉 `--squash=false` 参数（项目设置已强制 squash）；commit 历史会被压缩为单个提交，报告（阶段10）需记录"release 分支上的 N 个 commit 合并后在 main 上为 1 个 squash commit" |
| `ff` | ✅ 是（可直接快进） | 默认流程，`glab mr merge` 直接成功 |
| **`ff`** | ❌ **否（非快进关系）** | **改用 cherry-pick 策略** → **读 `references/ff-cherry-pick.md`** 执行 ff 专用流程（含 GitHub 等价陷阱、hash 一致性约束） |

> ⚠️ **ff 模式 + 非快进关系是最易踩的陷阱**。release 分支通常从 target 分叉后既有自己的提交，target 也有新提交，二者几乎不可能保持快进关系。遇到 `merge_method = ff` 的项目，默认就应准备 cherry-pick 策略，而非等到阶段 9 撞 406。

### 输出：环境指纹表

| 仓库 | merge_method | release 保护规则 | CI 门控 | 策略 |
|------|:--:|------|:--:|------|
| repo-A | `merge` | release/*: push=No one, merge=Dev+Maint | false | 默认 merge |
| repo-B | `ff` | release/*: push=No one | false | **cherry-pick** |

**ff 模式或保护分支异常时，与用户对齐策略后再执行阶段4。**

> ⚠️ **保护分支 + 非 ff 的组合**：若 release 分支是保护分支（push=No one），无论 merge_method 为何，阶段 6 rebase 模式的 force push 都会失败，必须走「保护分支备选路径」。环境指纹表检出 release 分支 push=No one 时，策略列应标注"保护分支备选"（详见 `references/conflict-branches.md`）。

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

> ℹ️ ff 模式 + 非快进的仓库不走本阶段默认 MR，改在 `references/ff-cherry-pick.md` 的流程里创建 sync-release 分支的 MR。

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

> 按表格从上到下匹配，**第一条命中即执行**（三行条件互斥）。

| 验证结果 | 处理 |
|---------|------|
| `can_be_merged` / `MERGEABLE` 且阶段 3.5 **未**判定 ff 陷阱 | ✅ 进入阶段 9 合并 |
| 不可合并（`conflict` / `UNMERGEABLE`） | ❌ 改用 rebase 策略（阶段 6），不直接进入阶段 9 |
| `can_be_merged` 且阶段 3.5 判定 `ff` 模式 + 非快进关系 | ⚠️ **阶段 9 的 `mr merge` 仍会返回 406**。必须改用阶段 3.5 的 cherry-pick 策略（`references/ff-cherry-pick.md`），不要直接进阶段 9 |

> ⚠️ **`can_be_merged` 不等于 `mr merge` 会成功**：`can_be_merged` 只表示「代码层面无冲突、可产生合并结果」，不绕过 `merge_method=ff` 等项目级约束。ff 模式陷阱的完整机制与权威判断见阶段 3.5。

---

## 阶段6：冲突解决

检测到冲突后，**调用 `git-conflict-resolve` skill** 处理全部冲突解决、逻辑验证与复查清单：

> ℹ️ **构建产物自动短路**：若冲突含编译后/打包后文件（`dist/`、`resources/<bundle>/`、hash chunk 等），`git-conflict-resolve` 的 **Y.1.5** 会自动短路——不读内容、直接取 release 侧。本阶段无需为此额外传参。

> 执行 `git-conflict-resolve` skill，传入以下参数：
> - `source`：`<RELEASE_BRANCH>`
> - `target`：`<MAIN_BRANCH>`
> - `version`：`<VERSION>`
> - `mode`：`merge`（默认）或 `rebase`（仅当阶段5判定为 source ≤ 3 commits 且冲突 ≤ 1 文件时）

> ⚠️ 若 `git-conflict-resolve` 未能完成（用户主动中止、遇到无法解决的冲突或 rebase 中断），**不得继续执行以下操作**，保持当前工作区状态等待人工介入后重新启动。

`git-conflict-resolve` 执行完毕并输出全局复查清单（Y.6）、用户确认后，按模式执行收尾：

**merge 模式**（默认）：

```bash
# 推送 merge 分支
git push origin merge-release/<VERSION>

# 关闭原来因冲突而搁置的 MR/PR
glab mr close <OLD_ID>   # GitLab
gh pr close <OLD_ID>     # GitHub
```

然后重新创建指向 `merge-release/<VERSION>` 的 MR/PR（参考阶段4命令）。

**rebase 模式 / 保护分支 force push 被拒 / rebase 跳过 commit**：
这些条件分支的完整命令与审查流程见 **`references/conflict-branches.md`**（含 rebase force push、保护分支备选路径、跳过 commit 等价性验证）。

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

## 阶段8：独立残留扫描门控（无条件执行）

> ⚠️ **无条件门控**：无论阶段 5 是否检测到冲突、阶段 6 是否执行，合并 MR 前都必须通过阶段 8。这是合并前的最后一道防线——即使 `git-conflict-resolve` 的 L1/L2 防御都失效，阶段 8 仍能拦截带冲突标记的 commit。

### 8.1 残留冲突标记扫描（L3 防御 — 必执行）

扫描合并分支相对 target 的所有变更文件，检测残留冲突标记。

> **为什么扫描范围是 `git diff --name-only` 而非全仓**：全仓扫描会被构建产物的 CSS 注释 `=========` 等假阳性淹没。只扫合并涉及的文件——这是唯一可能残留标记的位置。
>
> **与 Y.1.5 的关系**：构建产物的冲突通常由 `git-conflict-resolve` Y.1.5 短路解决（取 release 侧，不残留）。阶段 8 是短路失效时的**最后防线**——若短路意外在产物中残留标记，此处检出并阻断合并。

```bash
# 精确正则：匹配 git 冲突标记格式（行首 7+ 字符 + 空格/行尾）
# 覆盖标准 7 字符、非标准 8+ 字符、diff3 的 ||||||| base 标记
# git grep 自动遵循 .gitignore，排除 untracked 构建产物
BASE=$(git merge-base origin/<MAIN_BRANCH> HEAD)
git diff --name-only $BASE..HEAD | while read f; do
  git grep -nE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' -- "$f" 2>/dev/null \
    && { echo "❌ $f 含残留冲突标记，禁止合并"; exit 1; }
done
# exit 1 → 阻断合并，回到阶段 6 修复后重新审查
```

> ⚠️ **精确正则排除假阳性**：`^={7,}$` 要求纯等号到行尾，CSS 注释 `/* ====== */` 不匹配（等号后有 `*/`）。`^<{7,} ` 要求 7+ 个 `<` 后跟空格，排除普通代码中的 `<` 操作符。

### 8.2 冲突文件 diff 审查（仅阶段 6 执行时增强）

> 本节仅在阶段 6 执行了冲突解决时适用。若阶段 5 未检测到冲突（跳过了 6），8.1 通过后直接进入阶段 9。

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

> 8.3 rebase 跳过 commit 等价性验证（若阶段 6 rebase 有 commit 被跳过）→ 详见 `references/conflict-branches.md`。

### 8.4 审查结论

| 结论 | 判定 | 后续 |
|------|------|------|
| ✅ 通过 | 8.1 无残留标记 + 8.2（若执行）全部检查项无 ❌ | 进入阶段 9 合并 |
| ❌ 不通过 | 8.1 检测到残留标记，或 8.2 任一项为 ❌ | **禁止合并**，回到阶段 6 修复后重新审查 |

> ⛔ **门控**：8.1 检测到残留冲突标记时，**不得继续执行阶段 9**。修复后必须重新通过阶段 8 扫描。

---

## 阶段9：合并 MR/PR

用户确认后，对所有仓库**并行**执行：

```bash
# 📋 CI 门控检查：pipeline 红而合并 = 把未验证代码送进主干
glab mr view <MR_ID> --json mergeStatus,detailedMergeStatus 2>/dev/null \
  | grep -qiE '"mergeable"|\"can_be_merged\"' \
  || echo "⚠️ MR 状态非可合并（CI 可能未通过），确认合并？"

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

> ⚠️ 若 `glab mr merge` 返回 406 或其他错误，查 `references/error-handling.md`。

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
5. **跨 release 同步**（如有）：源 release / 目标 release / 处理方式 / 冲突详情（详见 `references/cross-release-sync.md`）

---

## 进阶场景与参考（按需阅读）

本主干覆盖标准发版全流程。以下场景命中时再读对应 reference：

- **`references/ff-cherry-pick.md`** — ff 模式专用 cherry-pick 流程、GitHub 等价陷阱、跨 release hash 一致性
- **`references/cross-release-sync.md`** — release/A 变更同步到 release/B 的 hash 一致性决策树
- **`references/conflict-branches.md`** — 阶段 6 rebase 模式、保护分支备选路径、rebase 跳过 commit 等价性验证
- **`references/error-handling.md`** — 错误处理表（406 / tag 冲突 / CLI 报错 / 空 commit 等）+ pre-commit hook 安装
- **`references/quick-reference.md`** — 端到端命令速查（人类视角）
