# 场景：release 分支变更同步到另一个 release 分支

> **何时读本文件**：当 `release/A` 已合入主分支，需要把它的变更同步到另一个较新的 `release/B` 时。标准 release→main 发版不需要本文件。

> ⚠️ **核心约束 — hash 一致性问题**：
> 若 `release/A` 是通过 **rebase**（非 merge）合入主分支的，则同一批改动在 `release/A` 和主分支上有**不同的 commit hash**。
> 此时直接 merge `release/A` → `release/B`，会导致后续 `release/B` → 主分支时出现同一改动两套 hash，必然冲突。

## 决策流程

```
release/A 合入主分支的方式？
├── merge（保留原始 hash）
│   → ✅ 可直接 merge release/A → release/B
│       未来 release/B → 主分支干净
│
├── rebase（hash 已变更）
│   → ❌ 禁止 merge release/A → release/B
│   → ✅ 改为将 release/B rebase 到主分支
│       （或 merge 主分支到 release/B）
│       因为主分支已包含 release/A 的变更
│
└── cherry-pick（ff 模式项目，hash 已变更）
    → ⚠️ release/A 的改动在主分支上是新 hash
    → 同步到 release/B 时也应 cherry-pick 主分支上的对应 commit
       或直接 cherry-pick release/A 的原始 commit（接受 hash 差异）
    → 因 release/B → 主分支若同为 ff 模式，本就不产生 merge commit
       hash 差异不引发冲突，但仍需在 release/B 上解决内容冲突
```

> ℹ️ **ff 模式项目的跨 release 同步**：ff 项目不产生 merge commit，hash 一致性约束比 merge/rebase 项目宽松。但仍建议 cherry-pick release/A 的原始 commit 到 release/B，保持改动来源可追溯。若 release/B 同为 ff 模式，阶段 3.5 应已识别，直接走 cherry-pick 策略（见 `ff-cherry-pick.md`）。

## 操作步骤

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
# 解决冲突后 force push（参见 conflict-branches.md 的 rebase 模式）
```

## 示例

> `release/8.2.61` 以 rebase 方式合入 `master`。
> 需要将其变更同步到 `release/8.2.70`。
> ❌ 错误：`git merge release/8.2.61` → 后续 8.2.70 → master 必然冲突。
> ✅ 正确：`release/8.2.70` rebase 到 `master`（master 已有 8.2.61 变更）
