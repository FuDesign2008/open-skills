---
name: git-conflict-resolve
version: "1.0.0"
user-invocable: true
description: 当 Git merge 或 rebase 过程中出现代码冲突时使用，尤其适用于 AI 自动解冲突容易出错（取错侧、丢失重构、还原旧版代码）、需要语义分析和逻辑验证的场景。也适用于 rebase 多轮停止需跨轮聚合冲突文件的情况。触发词：解冲突、处理冲突、git-conflict-resolve、解决 merge 冲突、解决 rebase 冲突、conflict resolve、冲突解决。
---

# Git 冲突解决工作流（git-conflict-resolve）

## Overview

语义驱动的 Git 冲突解决协议，替代盲目的 `-X ours`/`-X theirs` 策略。

对每个冲突文件：先做语义分析理解两侧意图，再推导解决规则（含置信度）。高置信度自动解决，中置信度展示建议等确认，低置信度展示三方视图等人工决定。解决后逐文件逻辑验证，最终生成人工复查清单。

**配对 skill**：被 `git-release-finish` 阶段6 调用；也可独立调用处理任意 merge/rebase 冲突。

---

## 输入参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `source` | 被合入的源分支（通常是 release） | `release/8.2.60` |
| `target` | 合并目标分支（通常是 main/master） | `master` |
| `version` | 版本号（用于创建 merge 分支名称） | `8.2.60` |
| `mode` | 冲突场景：`merge` 或 `rebase` | `merge` |

独立调用示例：
> 执行 `git-conflict-resolve` skill，source=release/8.2.60，target=master，version=8.2.60，mode=merge

---

## 子阶段 Y.0 — 模式识别与初始化

1. 读取输入参数，确认 `mode`（`merge` 或 `rebase`）
2. 初始化**累积冲突文件清单**（全局变量，跨轮持久保留，**禁止在任何时刻清空**）
3. 按模式执行初始化：

**merge 模式**（默认）：

```bash
# 从 target 分支创建 merge 分支（不带 -X 自动策略，让冲突自然浮现）
git checkout origin/<TARGET> -b merge-release/<VERSION>
git merge origin/<SOURCE> --no-commit --no-edit
```

> ⚠️ 不使用 `-X ours` 或 `-X theirs`，避免盲目取侧导致逻辑丢失。冲突由后续语义分析逐文件决定。

**rebase 模式**：

```bash
# 基于远端 source 创建本地工作分支（避免污染原始远端分支）
git checkout origin/<SOURCE> -b rebase-release/<VERSION>

# 将 source 的提交逐个 replay 到 target 上
git rebase origin/<TARGET>
# 遇到冲突时停止 → 进入 Y.1
# 若无冲突 rebase 一次完成 → 跳过 Y.1～Y.4，直接进入 Y.5
```

> ⚠️ rebase 结果推送时若目标为保护分支（release/*、main、master），force push 可能被远端拒绝。推送前确认分支保护状态，必要时改用新分支推送（见 git-release-finish 阶段6 保护分支备选路径）。

---

## 子阶段 Y.1 — 冲突清单盘点（多轮聚合）

> ⚠️ rebase 每次 `git rebase --continue` 后若再次遇到冲突，**必须重新执行 Y.1**，将新增文件追加到累积清单，不得替换。

```bash
# 获取当前轮的冲突文件
git diff --name-only --diff-filter=U
```

**追加规则**：

```
累积清单 = 累积清单 ∪ 当前轮冲突文件
（集合追加，相同文件不重复，但保留出现的轮次信息）
```

**输出格式**：

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

**若当前轮冲突文件清单为空**：

| 模式 | 说明 | 后续动作 |
|------|------|---------|
| merge 模式 | git 已自动合并所有内容冲突（但语义层可能有问题） | **跳过 Y.2～Y.4，直接进入 Y.5**；重点验证版本字段和构建产物路径 |
| rebase 模式 | 当前提交无冲突 | 执行 `git rebase --continue`；若出现新冲突回到 Y.1；若 rebase 完成则进入 Y.5 |

→ 若清单不为空，进入 Y.2，对**当前轮冲突文件**逐一分析。

---

## 子阶段 Y.2 — 语义分析

> ⚠️ 本阶段只读，禁止修改任何文件。

对每个冲突文件，依次执行：

**1. 三方内容读取**

```bash
git show :1:<FILE>   # BASE：公共祖先版本
git show :2:<FILE>   # main 侧（ours）：target 分支的版本
git show :3:<FILE>   # release 侧（theirs）：source 分支的版本
```

> 说明：merge 和 rebase 两种模式中，`:2:` = main 侧，`:3:` = release 侧，语义一致。

**2. 变更增量分析**

```bash
# 计算公共祖先
MERGE_BASE=$(git merge-base origin/<SOURCE> origin/<TARGET>)

# main 侧相对 BASE 改了什么
git diff $MERGE_BASE origin/<TARGET> -- <FILE>

# release 侧相对 BASE 改了什么
git diff $MERGE_BASE origin/<SOURCE> -- <FILE>
```

**3. 语义描述输出**

```
【语义分析 — <FILE>】
main 侧意图：[保持不变 / hotfix / 功能开发 / 重构 / 删除 / 版本字段更新 / 其他]
  具体改动：...

release 侧意图：[保持不变 / hotfix / 功能开发 / 重构 / 删除 / 版本字段更新 / 其他]
  具体改动：...

两侧关系：[互斥（一方覆盖另一方）/ 互补（两侧都要保留）/ 单侧有变动（另一侧与 BASE 相同）]
```

---

## 子阶段 Y.3 — 规则推导

基于 Y.2 的语义分析结论，为每个文件推导解决规则并判定置信度。

### 置信度三档

| 置信度 | 判定标准 | 后续动作 |
|--------|---------|---------|
| 🟢 高 | 意图明确，一侧有绝对权威，无逻辑丢失风险 | 自动解决，输出操作说明 |
| 🟡 中 | 大体明确，但存在局部歧义或需要部分合并 | 展示建议，等用户 A/B/C 确认 |
| 🔴 低 | 无法判断权威侧，或双侧均有重要逻辑需保留 | 展示三方视图，等用户完全决定 |

### 推导规则库

**高置信度场景**：

| 场景 | 推导规则 |
|------|---------|
| `version`/`testVersion` 等版本字段：release 侧版本号更新 | 取 release 侧（发版权威） |
| release 删除函数/模块，main **未改动**该代码（与 BASE 相同） | 遵循 release 删除意图（取 release 侧） |
| 构建产物路径（`dist/`、`resources/dist/`）hash 不同 | 整目录取 release 侧 |
| release 做了完整重构（同逻辑、不同结构），main 未改该区域 | 取 release 侧 |

> 说明：若 Y.2 发现某侧内容与 BASE 完全相同（即该侧未改动），则属于 rename/rename 等元数据冲突，按构建产物规则处理（整目录取 release 侧），不列入上表推导。

**中置信度场景**：

| 场景 | 推导规则 |
|------|---------|
| release 删除函数/模块，main **对该代码有独立修改**（hotfix） | 建议：人工确认 main 的修改是否仍有必要（不可自动删除） |
| release 重构 + main 有独立 hotfix（两侧均改，方向不同） | 建议：以 release 为主，人工确认 main hotfix 是否已被 release 覆盖 |
| import 语句双侧均有变动 | 建议：合并两侧 import，人工确认无重复/冲突 |
| 配置文件多字段：部分字段各侧修改不同 | 建议：逐字段列出，人工选择 |

**低置信度场景**：

| 场景 | 推导规则 |
|------|---------|
| 业务逻辑双侧均有实质改动（方向互补或相关） | 展示三方视图，不建议自动解 |
| 任何无法归入以上模式的文件 | 默认低置信度，展示三方视图 |

---

## 子阶段 Y.4 — 分类执行

按 Y.3 的置信度分类，依次处理每个文件：

### 🟢 高置信度 — 自动解决

```bash
# 取 release 侧（theirs）
git checkout --theirs <FILE>
git add <FILE>

# 取 main 侧（ours）
git checkout --ours <FILE>
git add <FILE>

# 整目录取 release 侧（构建产物等）
git rm -rfq <DIR>
git checkout origin/<SOURCE> -- <DIR>
git add <DIR>
```

输出日志：

```
✅ [高置信度] <FILE>
   规则：release 重构，main 未改 → 取 release 侧
   操作：git checkout --theirs <FILE> && git add <FILE>
```

### 🟡 中置信度 — 展示建议，等用户确认

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

### 🔴 低置信度 — 三方视图，等用户决定

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

### rebase 多轮继续

当前轮所有文件处理完毕后：

```bash
git rebase --continue
```

若出现新冲突 → **回到 Y.1**，追加累积清单，继续执行 Y.2～Y.4。  
若 rebase 完成 → 进入 Y.5。

---

## 子阶段 Y.5 — 逻辑验证

> 对**累积清单中所有文件**逐一验证（不只是本轮）。

**1. release 意图完整性验证**

```bash
# 对比解决结果与 release 侧原始版本
git show origin/<SOURCE> -- <FILE>
```

检查：release 侧的关键改动（函数、import、逻辑块）是否在解决结果中完整保留？

**2. main 必要变更验证**

```bash
# 对比解决结果与 main 侧原始版本
git show origin/<TARGET> -- <FILE>
```

检查：main 侧有无独立的必要变更（如 hotfix）被错误丢弃？

**3. 残留冲突标记检查（全局）**

```bash
grep -rl "<<<<<<" . \
  --exclude-dir={node_modules,.git,dist,build} \
  2>/dev/null
```

**⚠️ 判定依据**（满足任一即标记为 ⚠️）：

- release 侧存在的函数/类/方法，在解决结果中消失
- release 侧已删除的代码块，在解决结果中重新出现（被"还原"）
- release 侧的 import 语句，在解决结果中缺失
- 版本字段（version/testVersion）与 release 侧不一致
- release 侧对某逻辑做了重构，解决结果退回了旧实现

**❌ 判定依据**（满足任一即标记为 ❌）：

- 文件中存在残留冲突标记（`<<<<<<<`、`=======`、`>>>>>>>`）
- 解决结果中同一函数/变量出现两份实现（合并重复）
- 语法层面明显错误（如多余的 `}`、未闭合的括号）

**验证标记输出**：

```
✅ <FILE> — 逻辑一致（release 意图完整保留，main 必要变更已处理）
⚠️ <FILE> — 疑似丢失 release 变更：xxx 函数/逻辑未出现在解决结果中
❌ <FILE> — 逻辑冲突：存在残留 <<<<< 标记或明显语义矛盾
```

> ⚠️ / ❌ 文件：**禁止继续提交**，必须重新处理后再进入 Y.6。

---

## 子阶段 Y.6 — 全局复查清单 + 提交

**输出汇总表**（含累积清单中所有文件）：

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

**用户确认后（按 mode 执行）**：

**merge 模式**：

```bash
git add -A
git commit --no-verify -m "Merge release/<VERSION> into <TARGET>"
```

> ⚠️ `--no-verify` 仅在 pre-commit hooks 阻断合并提交（如格式化提示）时使用；若 hooks 做类型检查，应优先修复错误。

**rebase 模式**：

```bash
# rebase 各提交已被逐一 apply，无需额外 merge commit
# 通知调用方（git-release-finish）执行 force-push 收尾
git rebase --continue   # 若最后一轮有残余提交待完成
# rebase 完成后退出，由 git-release-finish 阶段6 接管 force-push
```

---

## 禁止行为（Red Flags）

> 以下行为违反本协议。AI 发现自己即将这样做时，必须立即停止并回到正确步骤。

| 违规行为 | 正确做法 |
|---------|---------|
| rebase 新一轮冲突出现后，**清空**累积清单重新开始 | 必须**追加**，累积清单贯穿全程，禁止清空 |
| Y.5 逻辑验证因"高置信度文件应该没问题"而跳过 | Y.5 对**累积清单中所有文件**必须逐一执行，无例外 |
| Y.6 复查清单生成后未等用户确认就自动 commit | 必须等用户回复「继续」后再执行 `git commit` |
| 语义分析（Y.2）未实际运行 `git show :1:/:2:/:3:`，凭印象描述两侧内容 | 必须先执行命令读取三方内容，基于实际内容分析 |
| 对复杂双侧改动文件套用高置信度规则，跳过中/低置信度的人工确认 | 置信度必须依据 Y.3 判定标准推导，不得主观拔高 |
| 逻辑验证出现 ⚠️/❌ 后以"影响不大"为由继续提交 | ⚠️/❌ 文件禁止继续提交，必须重新处理 |

---

## 错误处理

| 场景 | 处理方式 |
|------|---------|
| `git show :1:/:2:/:3:` 无输出 | 文件无对应阶段，用 `git status` 确认文件状态（可能已自动解决或为新增文件） |
| `git merge-base` 报错 | 用 `git log --oneline --graph -10` 确认分支拓扑，手动指定 base commit |
| rebase 中 `git rebase --continue` 再次报冲突 | 正常，回到 Y.1 追加累积清单，继续循环 |
| 逻辑验证出现 ❌ 后无法确定正确解法 | 暂停，向用户展示 ❌ 文件的三方视图，等待人工决定 |
| `git checkout --theirs/--ours` 报 pathspec not found | 先 `git add -A`，再重试 |

---

## 快速参考命令

```bash
# 三方版本内容
git show :1:<file>   # BASE
git show :2:<file>   # main 侧（ours）
git show :3:<file>   # release 侧（theirs）

# 各侧增量（需先计算 MERGE_BASE）
MERGE_BASE=$(git merge-base origin/$SRC origin/$TGT)
git diff $MERGE_BASE origin/$TGT -- <file>   # main 增量
git diff $MERGE_BASE origin/$SRC -- <file>   # release 增量

# 当前冲突文件列表
git diff --name-only --diff-filter=U

# 验证无残留冲突标记
grep -rl "<<<<<<" . --exclude-dir={node_modules,.git,dist,build} 2>/dev/null

# 按置信度执行解决
git checkout --theirs <file> && git add <file>   # 取 release 侧
git checkout --ours <file> && git add <file>     # 取 main 侧

# rebase 继续
git rebase --continue
```
