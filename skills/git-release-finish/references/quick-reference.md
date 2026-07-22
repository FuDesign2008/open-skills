# 快速参考命令（人类速查）

> **何时读本文件**：想速查端到端命令时。LLM 执行发版时通常不需要——主干各阶段已含完整命令。本表是为人类快速回忆整理的压缩速查。

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

# ── 阶段3.5 环境指纹识别 ──
# merge method（ff 是关键陷阱）
glab api "projects/:fullpath" | python3 -c "import sys,json; print('merge_method:', json.load(sys.stdin).get('merge_method'))"
# release 分支保护规则
glab api "projects/:fullpath/protected_branches" | python3 -c "import sys,json; [print(b['name'], b.get('push_access_levels'), b.get('merge_access_levels')) for b in json.load(sys.stdin)]"
# ff 模式判定：release 是否为 target 后代（target 是 release 祖先 → 可 ff）
git merge-base --is-ancestor origin/<TARGET> origin/<RELEASE> && echo "可ff" || echo "非快进→cherry-pick"
# ff 模式专用：cherry-pick 同步（多仓库每条加 cd <REPO> && 前缀，见 ff-cherry-pick.md）
git log origin/<TARGET>..origin/<RELEASE> --oneline                      # 列独有 commit
cd <REPO> && git checkout origin/<TARGET> -b sync-release/<V>-to-<TARGET> # 派生分支
git cherry-pick <C1> <C2> ...                                             # 逐个 pick（空 commit 用 --skip）

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

# ── 阶段0 前置健康检查 ──
# 工作区残留扫描（精确正则 + git grep）
git grep -lE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' 2>/dev/null
# 历史 merge commit 残留扫描（pickaxe）
git log --all --merges --since="30 days ago" \
  -S'^<<<<<<< ' --pickaxe-regex --format="%h %s" 2>/dev/null

# ── 阶段8 独立残留扫描门控（无条件执行） ──
BASE=$(git merge-base origin/<MAIN_BRANCH> HEAD)
git diff --name-only $BASE..HEAD | while read f; do
  git grep -nE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' -- "$f" 2>/dev/null && echo "❌ $f"
done
git diff origin/<MAIN_BRANCH>..HEAD -- <conflict_file>  # diff 审查（若阶段6执行了）
```
