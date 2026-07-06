# git-conflict-resolve — Reference

> 本文件为 `SKILL.md` 的扩展参考，收录详细输出模板与完整错误处理表。**核心执行逻辑在 `SKILL.md` 中自包含**；本文件仅在通用安装（`npx skills`）之外的全能力安装路径下可用。
>
> 与 SKILL.md 通过 `<!-- SYNC-SECTION: <phase> -->` 标记同步。

## Y.1 输出格式（累积冲突清单模板）

```
【冲突盘点 — 第 N 轮】
当前轮新增冲突文件（M 个）：
  - path/to/file-a.ts（新增）
  - path/to/file-b.ts（新增）

累积冲突文件总清单（K 个，含历史各轮）：
  - path/to/file-a.ts（第1轮）
  - path/to/file-b.ts（第2轮）
  ...
```

## Y.2 输出模板（语义分析）

```
【语义分析 — <FILE>】
main 侧意图：[保持不变 / hotfix / 功能开发 / 重构 / 删除 / 版本字段更新 / 其他]
  具体改动：...

release 侧意图：[保持不变 / hotfix / 功能开发 / 重构 / 删除 / 版本字段更新 / 其他]
  具体改动：...

两侧关系：[互斥（一方覆盖另一方）/ 互补（两侧都要保留）/ 单侧有变动（另一侧与 BASE 相同）]
```

## Y.4 提示模板

### 🟢 高置信度自动解决日志

```
✅ [高置信度] <FILE>
   规则：release 重构，main 未改 → 取 release 侧
   操作：git checkout --theirs <FILE> && git add <FILE>
```

### 🟡 中置信度 A/B/C 提示

```
【冲突文件】<FILE>
【main 侧改动】...
【release 侧改动】...
【AI 建议】以 release 为主体，main 的 hotfix 已被 release 中的 xxx 覆盖
【请选择】
A = 接受 AI 建议（取 release 侧）
B = 保留 main 侧
C = 我来手动编辑，完成后通知我
```

### 🔴 低置信度三方视图提示

```
【冲突文件】<FILE>
【BASE（公共祖先）第 X-Y 行】
...（代码）

【main 侧（ours）第 X-Y 行】
...（代码）

【release 侧（theirs）第 X-Y 行】
...（代码）

【AI 分析】两侧逻辑均有实质变动，无法判断权威侧
【请选择】
A = 取 release 侧
B = 取 main 侧
C = 我来手动合并，完成后通知我
```

## Y.6 汇总表模板

```
⚠️ 以下文件在本次冲突解决过程中有变动，请人工重点 review：

| 文件 | 出现轮次 | 解决方式 | 置信度 | 逻辑验证 | 需重点复查 |
|------|---------|---------|--------|---------|----------|
| src/effects/database/search-database.ts | 第1轮 | AI 自动（取 release 侧）| 🟢 高 | ✅ | — |
| package.json | 第1轮 | AI 自动（version 字段取 release）| 🟢 高 | ✅ | — |
| src/components/editor.tsx | 第2轮 | 用户选 A（release 侧）| 🟡 中 | ✅ | — |
| src/utils/helper.ts | 第1轮 | 用户手动合并 | 🔴 低 | ⚠️ | ⚠️ 重点复查 |

重点需要 review 的文件（⚠️/❌ 验证 或 🔴 低置信度）：
  - src/utils/helper.ts：验证结论 ⚠️，疑似丢失 release 变更

确认以上文件逻辑正确后，回复「继续」以完成提交。
```

## Y.5 验证标记输出格式

```
✅ <FILE> — 逻辑一致（release 意图完整保留，main 必要变更已处理）
⚠️ <FILE> — 疑似丢失 release 变更：xxx 函数/逻辑未出现在解决结果中
❌ <FILE> — 逻辑冲突：存在残留 <<<<< 标记或明显语义矛盾
```

## 错误处理（完整表）

| 场景 | 处理方式 |
|------|---------|
| `git show :1:/:2:/:3:` 无输出 | 文件无对应阶段，用 `git status` 确认文件状态（可能已自动解决或为新增文件） |
| `git merge-base` 报错 | 用 `git log --oneline --graph -10` 确认分支拓扑，手动指定 base commit |
| rebase 中 `git rebase --continue` 再次报冲突 | 正常，回到 Y.1 追加累积清单，继续循环 |
| 逻辑验证出现 ❌ 后无法确定正确解法 | 暂停，向用户展示 ❌ 文件的三方视图，等待人工决定 |
| `git checkout --theirs/--ours` 报 pathspec not found | 先 `git add -A`，再重试 |

## 快速参考命令

```bash
# ── 冲突标记检测（精确正则，所有防御层共享） ──
# 匹配 git 冲突标记格式：行首 7+ 字符 + 空格/行尾
# 覆盖标准 7 字符、非标准 8+ 字符、diff3 的 ||||||| base 标记
RE='^<{7,} |^={7,}$|^>{7,} |^\|{7,} '

# Y.4.5 单文件即时验证
git grep -nE "$RE" -- "$FILE" 2>/dev/null

# Y.5 累积清单扫描
for f in $CONFLICT_FILES; do git grep -lE "$RE" -- "$f" 2>/dev/null; done

# Y.6 commit 前门控（staged 文件）
git diff --cached --name-only | while read f; do
  git grep -lE "$RE" -- "$f" 2>/dev/null && echo "❌ $f"
done

# ── 三方版本内容 ──
git show :1:<file>   # BASE
git show :2:<file>   # main 侧（ours）
git show :3:<file>   # release 侧（theirs）

# 各侧增量（需先计算 MERGE_BASE）
MERGE_BASE=$(git merge-base origin/$SRC origin/$TGT)
git diff $MERGE_BASE origin/$TGT -- <file>   # main 增量
git diff $MERGE_BASE origin/$SRC -- <file>   # release 增量

# ── 冲突类型识别 ──
git status --porcelain                        # 冲突状态码（UU/AA/DU/UD）
git diff --name-status --diff-filter=U        # rename 信息

# ── 按置信度执行解决 ──
git checkout --theirs <file> && git add <file>   # 取 release 侧
git checkout --ours <file> && git add <file>     # 取 main 侧

# rename + 构建产物 hash 专用（删旧 + 取新）
OLD=$(grep "^<<<<<<<" "$f" | sed 's/^.*HEAD://')
NEW=$(grep "^>>>>>>>" "$f" | sed 's/^.*://' | tail -1)
git rm -f "$OLD" 2>/dev/null
git checkout origin/<SOURCE> -- "$NEW" && git add "$NEW"

# rebase 继续
git rebase --continue
```
