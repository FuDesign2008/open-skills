# git-release-finish — 参考表与样例

本文件为 `git-release-finish` skill 的辅助参考，包含各阶段确认表样例、完整错误处理表、平台 CLI 操作映射、审查报告样例、备选执行路径、深度排查指南。SKILL.md 主体仅在需要时引用本文件具体小节。

> 注：SKILL.md 必须可独立安装执行（通用安装 `npx skills` 仅打包 `SKILL.md`）。本文件为可选增强，缺失不影响 skill 主流程。

---

## 平台 CLI 操作映射（MR/PR 管理）

核心 git 操作（tag、push、merge）均为平台无关。仅 MR/PR 管理依赖平台 CLI。

| 操作 | GitLab (`glab`) | GitHub (`gh`) |
|------|----------------|--------------|
| 创建 | `glab mr create` | `gh pr create` |
| 合并 | `glab mr merge --yes` | `gh pr merge --merge` |
| 关闭 | `glab mr close` | `gh pr close` |
| 查看 | `glab mr view` | `gh pr view` |

---

## 阶段0 背景说明

**为什么需要前置检查**：阶段 5 的 `git merge-tree` 只检测**未来合并时的新冲突**，对**分支已有 commit 中残留的冲突标记**无感知。如果 merge-release 分支的某个历史 commit 已经包含了带冲突标记的文件（常见于 AI 自动解冲突失败但 commit 推送了的场景），merge-tree 不会报错，阶段 8 旧版本也不会触发（因为它依赖阶段 5/6 触发），最终残留标记随合并进入主干。

**共享检测协议**：阶段 0 使用的冲突标记检测正则与 `git-conflict-resolve` Y.4.5/Y.5/Y.6 保持一致。精确正则 `^<{7,} |^={7,}$|^>{7,} |^\|{7,} ` 锁定 git 冲突标记格式，排除 CSS 注释（`/* ====== */`）和 ASCII 艺术等假阳性。

---

## 阶段1 确认表样例

| 仓库 | release 分支 | tag 名称 | 示例（历史最新）|
|------|------------|---------|--------------|
| repo-A | release/X.Y.Z | `X.Y.Z` | `8.2.52` |
| repo-B | release/X.Y.Z | `vX.Y.Z` | `v8.2.40` |

---

## 阶段2 确认表样例

| 仓库 | tag 名称 | 远端 commit SHA | tag 验证 SHA | 状态 |
|------|---------|----------------|-------------|------|
| repo-A | `8.2.70` | `abc123def` | `abc123def` | ✅ |
| repo-B | `desktop-8.2.70` | `a1b2c3d4e` | `a1b2c3d4e` | ✅ |

---

## 阶段3 常见场景

| 情况 | 判断 |
|------|------|
| 有 `Merge branch 'release/X.Y.Z' into 'master'` 记录 | 主分支 = `master` |
| `origin/HEAD -> origin/main`，且无 release 合并记录 | 主分支 = `main` |
| `develop` 接收所有 feature，但 remote HEAD = `main` | 向用户确认 |
| remote HEAD 指向某分支，但该分支落后另一分支数百 commits | **remote HEAD 已过期**，以合并历史为准，向用户确认 |

> ⚠️ 仓库迁移或分支策略调整后，remote HEAD 可能仍指向旧的主分支。例如某仓库 remote HEAD = `master`，但 `master` 落后 `main` 数百个 commit，实际活跃主分支是 `main`。

## 阶段3 确认表样例

| 仓库 | 源分支 | 目标主分支 | 判断依据 |
|------|--------|----------|---------|
| repo-A | `release/X.Y.Z` | `master` | 历史合并记录 |
| repo-B | `release/X.Y.Z-perf` | `main` | remote HEAD + 用户确认 |

---

## 阶段6 保护分支备选路径（force push 被拒时）

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

> **注意**：此路径下原 release 分支保持不变（仍指向 rebase 前的 commit）。后续若有 release → main 的同步需求，需注意 hash 一致性问题（见 SKILL.md「跨 release 同步」场景）。

---

## 阶段6 rebase 后检查：跳过 commit 审查

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

## 阶段7 常见需剔除文件类型

| 类型 | 示例路径 |
|------|---------|
| AI 工具配置 | `.claude/`, `.omc/`, `.codemap/`, `opencode.json` |
| 临时调试文件 | `ci-build-error.txt`, `ci-fix-log.txt` |

---

## 阶段8.2 冲突文件 diff 审查要点（详细）

| 检查项 | 方法 | 判定 |
|------|------|------|
| 两侧 import/require 均保留 | diff 中不应缺少任一侧的 import | 缺任何一侧 → ❌ |
| 两侧新增函数/类均保留 | diff 应同时包含 source 和 target 侧的新增代码块 | 缺代码块 → ❌ |
| 无重复定义 | 同一符号不应出现两次定义 | 重复 → ❌ |
| 无注释掉的代码 | diff 中不应出现 `//` 或 `/* */` 包裹的整段逻辑 | 有 → ⚠️ 标注 |
| 无意外删除 | 除冲突标记外，不应有不在 source/target 任一分支中的删除 | 有 → ❌ |

---

## 阶段8 审查报告样例

```
【残留扫描报告】
- 8.1 残留标记扫描：✅ 合并涉及 42 个文件，无残留冲突标记
- 8.2 冲突文件 diff 审查（若执行）：
  - .gitignore: ✅ 8.2.70 的 .omc/.sisyphus 改动叠加在 master 之上
  - src/bridge/api/MainProcessAPI.ts: ✅ 两侧新函数均完整保留
- 8.3 rebase 跳过 commit（若执行）：
  - skipped commit 7437368df: ✅ 与 master 7421ca91b diff 一致

结论：✅ 通过，可进入阶段 9 合并
```

---

## 跨 release 同步示例

> `release/8.2.61` 以 rebase 方式合入 `master`。
> 需要将其变更同步到 `release/8.2.70`。
> ❌ 错误：`git merge release/8.2.61` → 后续 8.2.70 → master 必然冲突。
> ✅ 正确：`release/8.2.70` rebase 到 `master`（master 已有 8.2.61 变更）

---

## 错误处理（完整表）

| 场景 | 处理方式 |
|------|---------|
| tag 已存在 | ⚠️ 已发布 tag 不可移动（下游 CI/CD 可能已基于该 tag 部署）。建议新建版本号；确需覆盖须用户明确确认 |
| 打 tag 前发现本地落后远端 | 阶段 2 前置检查已捕获；tag 锚定到 `$REMOTE_SHA`（`git rev-parse origin/<RELEASE_BRANCH>`），不使用本地 HEAD |
| tag 打在了错误 commit 上 | 删除重打：`git push origin --delete <TAG>` + `git tag -d <TAG>` → 重新执行阶段 2（锚定到 `$REMOTE_SHA`）；GitLab 也可 `glab api DELETE "projects/:fullpath/repository/tags/<TAG>"` 远程删除 |
| MR/PR 已存在（同源同目标） | 复用已有 MR/PR，不重新创建 |
| merge-tree=0 但 MR 无法合并 | 改用 rebase 策略（阶段 6），创建 rebase-release 分支 |
| rebase 冲突过多 | 切换为 merge 策略（在 git-conflict-resolve 中重新执行 Y.0 merge 模式） |
| rebase 自动跳过 commit | 对比被跳过 commit 与 target 对应 commit 的 diff（阶段 6 审查流程） |
| force push 被保护分支拒绝（`remote rejected` / `pre-receive hook declined`） | release 分支是保护分支（push=No one），改用"保护分支备选路径"：推到新分支 `rebase-release/<VERSION>` → 关闭原 MR → 创建新 MR（见阶段6 rebase 模式） |
| 冲突解决出现逻辑错误 | 交由 `git-conflict-resolve` Y.5 逻辑验证捕获，按 ⚠️/❌ 提示处理 |
| `git rm --cached` 报 "pathspec not found" | 文件不在 index，用 `git add -A` 先同步 worktree 再重试 |
| pipeline 未运行/失败 | ⚠️ 检查 pipeline 状态。若 pipeline 失败（红色），禁止合并；若仓库无 CI 配置则可忽略 |
| CLI 认证失败 | 检查 `<GIT_CLI> auth status`，重新执行 `<GIT_CLI> auth login` |
