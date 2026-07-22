# 阶段 6 条件分支：rebase 模式 / 保护分支备选 / 跳过 commit 审查

> **何时读本文件**：阶段 6 走 **rebase 模式**（source ≤ 3 commits 且冲突 ≤ 1 文件）、**force push 被保护分支拒绝**、或 **rebase 跳过了 commit** 时。默认 merge 模式不需要本文件（见主干阶段 6）。

## rebase 模式

将 rebase 结果推回原 release 分支，触发原 MR/PR 自动更新：

```bash
# 将 rebase 结果推回原 release 分支，触发原 MR/PR 自动更新
git push origin rebase-release/<VERSION>:<RELEASE_BRANCH> --force-with-lease
# 原 MR/PR（<RELEASE_BRANCH> → <MAIN_BRANCH>）自动更新，无需关闭重建
```

> ⚠️ `--force-with-lease` 比 `--force` 更安全：若远端在此期间有新提交，会拒绝推送，避免覆盖他人提交。
>
> ⚠️ **Force push 前确认**：若 `<RELEASE_BRANCH>` 是共享分支（多人协作），force push 会破坏他人的工作基础。执行前询问用户：**"是否有他人基于此分支工作？确认 force push？"**

---

## 保护分支备选路径（force push 被拒时）

> ⚠️ 若 `<RELEASE_BRANCH>` 是**保护分支**（GitLab `release/*` 保护规则常见 push=No one），force push 会被远端直接拒绝（`remote: rejected`），即使非 force 的普通 push 也可能被拒。

**检测**：force push 返回 `! [remote rejected]` 或 `pre-receive hook declined`。

**处理**：不修改 release 分支，改为推到新分支并创建新 MR：

```bash
# 1. 将 rebase 结果推到新分支（非 force push，普通 push）
git push origin rebase-release/<VERSION>

# 2. 关闭原来因冲突而搁置的 MR/PR
glab mr close <OLD_ID>   # GitLab
gh pr close <OLD_ID>     # GitHub

# 3. 创建指向 rebase-release/<VERSION> 的新 MR/PR（参考主干阶段4命令）
#    源分支: rebase-release/<VERSION>
#    目标分支: <MAIN_BRANCH>
```

> **注意**：此路径下原 release 分支保持不变（仍指向 rebase 前的 commit）。后续若有 release → main 的同步需求，需注意 hash 一致性问题（见 `cross-release-sync.md`）。

---

## rebase 后检查：跳过 commit 审查

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

## 阶段 8.3：rebase 跳过 commit 等价性验证

若阶段 6 rebase 过程中有 commit 被跳过，阶段 8 需验证等价性：

```bash
# 对比跳过 commit 与 target 对应 commit 的 diff
diff <(git show <SKIPPED_SHA> --format=) <(git show <TARGET_SHA> --format=)
# 输出应为空（完全一致）
```

不一致 → ❌ 被跳过的 commit 未完整包含在 target 中，需手动 cherry-pick。
