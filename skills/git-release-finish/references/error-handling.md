# 错误处理 + pre-commit hook

> **何时读本文件**：执行中报错（406、tag 冲突、CLI 报错、空 commit、force push 被拒等），或想安装 pre-commit hook 做持续防护时。

## 错误处理表

| 场景 | 处理方式 |
|------|---------|
| tag 已存在 | ⚠️ 已发布 tag 不可移动（下游 CI/CD 可能已基于该 tag 部署）。建议新建版本号；确需覆盖须用户明确确认 |
| 打 tag 前发现本地落后远端 | 阶段 2 前置检查已捕获；tag 锚定到 `$REMOTE_SHA`（`git rev-parse origin/<RELEASE_BRANCH>`），不使用本地 HEAD |
| tag 打在了错误 commit 上 | 删除重打：`git push origin --delete <TAG>` + `git tag -d <TAG>` → 重新执行阶段 2（锚定到 `$REMOTE_SHA`）；GitLab 也可 `glab api DELETE "projects/:fullpath/repository/tags/<TAG>"` 远程删除 |
| MR/PR 已存在（同源同目标） | 复用已有 MR/PR，不重新创建 |
| merge-tree=0 但 MR 无法合并 | 改用 rebase 策略（阶段 6），创建 rebase-release 分支 |
| `glab mr merge` 返回 406 "Branch cannot be merged"（merge-tree=0 且 can_be_merged） | 项目 `merge_method = ff` 且 release 非 target 后代。阶段 3.5 应已捕获；若漏检，立即查 `glab api "projects/:fullpath"` 的 `merge_method`，改用阶段 3.5 的 cherry-pick 策略（`ff-cherry-pick.md`） |
| `glab api` 报 "Accepts 1 arg(s), received 2" | 多为参数被 shell 拆分。**先加引号**：`-f "key=value"`（`glab api "path" -f "tag_name=X" -f "ref=Y"`）；若该 glab 版本仍报错（实战遇到过 `-f` 不被接受），改用 `--raw-field "key=value"`。优先升级 glab 到最新稳定版 |
| 多仓库命令在错误仓库执行（创建了错误 MR / 分析了错误分支） | 违反 M.1 工作目录隔离。关闭错误 MR（`glab mr close <WRONG_ID>`），回到正确仓库目录用 `cd <REPO_PATH> &&` 前缀重试 |
| rebase 冲突过多 | 切换为 merge 策略（在 git-conflict-resolve 中重新执行 Y.0 merge 模式） |
| rebase 自动跳过 commit | 对比被跳过 commit 与 target 对应 commit 的 diff（见 `conflict-branches.md` 的审查流程） |
| cherry-pick 产生空 commit（"previous cherry-pick is now empty"） | target 已有等价改动，`git cherry-pick --skip` 跳过；若需保留记录用 `--allow-empty` |
| force push 被保护分支拒绝（`remote rejected` / `pre-receive hook declined`） | release 分支是保护分支（push=No one），改用"保护分支备选路径"（见 `conflict-branches.md`） |
| 冲突解决出现逻辑错误 | 交由 `git-conflict-resolve` Y.5 逻辑验证捕获，按 ⚠️/❌ 提示处理 |
| `git rm --cached` 报 "pathspec not found" | 文件不在 index，用 `git add -A` 先同步 worktree 再重试 |
| pipeline 未运行/失败 | ⚠️ 检查 pipeline 状态。若 pipeline 失败（红色），禁止合并；若仓库无 CI 配置则可忽略 |
| CLI 认证失败 | 检查 `<GIT_CLI> auth status`，重新执行 `<GIT_CLI> auth login` |

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
