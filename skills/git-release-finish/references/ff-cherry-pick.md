# ff 模式专用流程（cherry-pick 策略）

> **何时读本文件**：阶段 3.5 判定 `merge_method = ff` 且 release 非 target 直接后代（非快进关系）时。merge 模式项目不需要本文件。

当阶段 3.5 判定为 `ff` 模式 + 非快进关系时，跳过阶段 6 的 merge/rebase 模式，改用 cherry-pick 策略：从 release cherry-pick 有效 commit 到 target 派生的新分支，再提 MR。

> ⚠️ **多仓库场景**：以下命令默认在单个 `<REPO_PATH>` 下连续执行；多仓库时**每条命令仍需以 `cd <REPO_PATH> &&` 开头**（见主干 M.1），工具调用层无持久 cwd 状态。

```bash
# 1. 列出 release 相对 target 的独有 commit
cd <REPO_PATH> && git log origin/<TARGET_BRANCH>..origin/<RELEASE_BRANCH> --oneline

# 2. 从 target 派生同步分支
cd <REPO_PATH> && git checkout origin/<TARGET_BRANCH> -b sync-release/<VERSION>-to-<TARGET>

# 3. 逐个 cherry-pick（按时间顺序）
cd <REPO_PATH> && git cherry-pick <COMMIT_1> <COMMIT_2> ...
# 遇冲突时调用 git-conflict-resolve skill（mode=rebase，cherry-pick 类似逐 commit 处理）
#   传参：source=<RELEASE_BRANCH>、target=<TARGET_BRANCH>、version=<VERSION>
#   启发式：版本号/依赖字段通常取 target 侧，构建产物取 release 侧
# 解决后继续 cherry-pick 下一个 commit

# 4. cherry-pick 可能产生空 commit（target 已有等价改动）→ --skip
#    cd <REPO_PATH> && git cherry-pick --skip

# 5a. 残留扫描（精确正则，与阶段 8 一致）
cd <REPO_PATH> && git grep -lE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' 2>/dev/null

# 5b. 推送同步分支
cd <REPO_PATH> && git push origin sync-release/<VERSION>-to-<TARGET>

# 5c. 创建 MR（源分支为 sync-release 分支，不是原 release 分支）
cd <REPO_PATH> && glab mr create \
  --source-branch sync-release/<VERSION>-to-<TARGET> \
  --target-branch <TARGET_BRANCH> \
  --title "Release <VERSION> (ff cherry-pick)" \
  --remove-source-branch=false
```

> ℹ️ **cherry-pick 策略的特点**：commit hash 会变更（与原 release 分支不同），但 ff 模式项目不依赖 hash 一致性（它不产生 merge commit）。若后续有跨 release 同步需求，需注意 hash 已变更（见 `cross-release-sync.md` 的 hash 一致性约束）。

---

## GitHub 的等价陷阱

GitHub 没有 `merge_method=ff` 的直接对应，只有三个布尔开关 `allow_merge_commit` / `allow_squash_merge` / `allow_rebase_merge`。当 `allow_merge_commit=false && allow_squash_merge=false && allow_rebase_merge=true`（仅允许 rebase 合并）时，PR 合并会**重写 commit 产生 hash 变更**，效果近似 ff-only。

release → main 的 PR 合并后，原 release 上的 commit hash 在 main 上会不同——跨 release 同步时按「rebase/hash 已变更」场景处理（见 `cross-release-sync.md`）。

GitHub 平台的 cherry-pick 流程与上方相同（git 原生操作），仅 MR 创建换成 `gh pr create`：
```bash
cd <REPO_PATH> && gh pr create \
  --base <TARGET_BRANCH> \
  --head sync-release/<VERSION>-to-<TARGET> \
  --title "Release <VERSION> (ff cherry-pick)"
```
