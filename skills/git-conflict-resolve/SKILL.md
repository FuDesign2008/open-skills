---
name: git-conflict-resolve
version: "1.2.0"
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

> ⚠️ rebase 结果推送时若目标为保护分支（release/*、main、master），force push 可能被远端拒绝（`remote: rejected`）。推送前确认分支保护状态，必要时改推到新分支（如 `rebase-release/<VERSION>`）再创建新 MR，而非 force push 到原分支。

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

→ 若清单不为空，进入 Y.1.5 判定是否构建产物，再决定是否进入 Y.2 语义分析。

---

## 子阶段 Y.1.5 — 构建产物短路（编译后/打包后文件）

> ⚠️ **本阶段在 Y.2 语义分析之前执行**，是省 token 与避免解错的关键前置闸门。

构建产物（编译/打包后的派生文件）是机器生成的：内容巨大（minified 单行可达数十万字符），读取浪费大量 token；压缩代码无「两侧意图」可分析；强行合并极易残留冲突标记或保留旧版本。其权威始终是发版分支（release）——正确做法是**不读、不分析，直接取 release 侧覆盖**。

对累积清单中每个文件，按 [reference.md](reference.md)「构建产物识别清单」判定（构建输出目录前缀 ∪ 文件特征 ∪ 项目专属补充）：

- **命中构建产物** → 不读取三方内容、不进入 Y.2 语义分析，直接按下表短路解决：

  | 冲突类型 | 解决方式 |
  |---------|---------|
  | 内容冲突（UU）/ Add-Add | `git checkout --theirs <FILE> && git add <FILE>`（取 release 侧） |
  | 整目录构建产物 | `git rm -rfq <DIR> && git checkout origin/<SOURCE> -- <DIR> && git add <DIR>` |
  | rename + hash 冲突 | 用 git rename 元数据取文件名（**不读文件内容**），删旧 hash + 从 release 取新；详见 reference.md |

  解决后**仍执行 Y.4.5 即时验证**（冲突标记残留扫描），确保无残留。

- **未命中（源码/配置）** → 进入 Y.2 正常语义分析。

> ⚠️ **保守默认**：边界模糊的文件（既不在已知构建目录、又无明确产物特征）**一律不短路**，走 Y.2。误把源码当构建产物会丢失 main 侧改动，代价远大于多读一个文件——**宁可读也不误判**。

> 📖 识别清单、各冲突类型的详细命令、rename+hash 的 fallback 与原理，见 [reference.md](reference.md)。

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

### 冲突类型识别（推导前置）

推导规则前，先识别冲突的**结构类型**——不同类型的解决策略完全不同，误判会导致残留冲突标记或丢失改动。

**两步识别法**：

**步骤 1 — git 状态判断大类**：

```bash
git status --porcelain                        # 冲突状态码
git diff --name-status --diff-filter=U        # rename 信息
```

| git 状态码 | 大类 | 含义 |
|-----------|------|------|
| `UU`（both modified） | 内容冲突 | 同文件两侧都改 |
| `UU` + 冲突标记含不同文件名 | **Rename 冲突** | diff3 格式 HEAD/base/theirs 标签文件名不同 |
| `AA`（both added） | Add/Add 冲突 | 两侧独立新增了同名文件 |
| `DU` / `UD` | Delete/Modify 冲突 | 一侧删除一侧修改 |

**步骤 2 — 文件特征细化**：

> 构建产物的主识别与短路已在 **Y.1.5** 完成（命中即取 release 侧，不进入 Y.3）。此处特征检测保留为**兜底**：若 Y.1.5 未识别、但 Y.3 发现产物特征，按构建产物处理（取 release 侧）。

```bash
# 构建产物 hash 文件（webpack/vite/rollup chunk）
echo "$FILE" | grep -qE '[0-9a-f]{8,}\.(js|css|map)$'

# 配置文件
echo "$FILE" | grep -qE '(^|/)(package\.json|tsconfig\.json|\.config\.(js|ts))$'
```

### 推导规则库

按冲突类型 + 置信度组织。先匹配结构类型，再按场景推导。

**🟢 高置信度场景**：

| 冲突类型 | 场景 | 推导规则 |
|---------|------|---------|
| 内容冲突 | `version`/`testVersion` 版本字段：release 侧更新 | 取 release 侧（发版权威） |
| 内容冲突 | release 删除函数/模块，main **未改动**该代码（与 BASE 相同） | 遵循 release 删除意图（取 release 侧） |
| 内容冲突 | 构建产物路径（`dist/`、`resources/dist/`）hash 不同 | 整目录取 release 侧 |
| 内容冲突 | release 做了完整重构（同逻辑、不同结构），main 未改该区域 | 取 release 侧 |
| **Rename + 构建产物 hash** | diff3 标签含不同 hash 文件名，文件名匹配 `[0-9a-f]{8,}\.(js\|css\|map)` | **删旧 hash 文件 + 取 release 侧新文件**（见 Y.4 专节） |
| Add/Add | 构建产物同名新增 | 取 release 侧 |

> ⚠️ **Rename + 构建产物 hash 是易错场景**：不能简单 `git checkout --theirs`，因 rename 后文件名不同，需显式删除旧 hash 文件 + 从 release 分支取新文件。详细操作见 Y.4。

**🟡 中置信度场景**：

| 冲突类型 | 场景 | 推导规则 |
|---------|------|---------|
| 内容冲突 | release 删除函数/模块，main **对该代码有独立修改**（hotfix） | 人工确认 main 的修改是否仍有必要 |
| 内容冲突 | release 重构 + main 有独立 hotfix（两侧均改，方向不同） | 以 release 为主，人工确认 main hotfix 是否已被覆盖 |
| 内容冲突 | import 语句双侧均有变动 | 合并两侧 import，人工确认无重复 |
| 内容冲突 | 配置文件多字段：部分字段各侧修改不同 | 逐字段列出，人工选择 |
| Rename + 源代码 | 源码文件 rename（非构建产物） | 人工确认 rename 意图 |

**🔴 低置信度场景**：

| 冲突类型 | 场景 | 推导规则 |
|---------|------|---------|
| 内容冲突 | 业务逻辑双侧均有实质改动（方向互补或相关） | 展示三方视图，不建议自动解 |
| Add/Add | 非构建产物的同名新增 | 展示三方视图，人工合并 |
| Delete/Modify | 一侧删除一侧修改 | 展示三方视图，人工确认是否仍需保留 |
| 任意 | 无法归入以上类型的文件 | 默认低置信度，展示三方视图 |

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

#### Rename + 构建产物 hash 专用策略（不读文件内容）

> 此场景通常已在 **Y.1.5** 前置短路处理（构建产物命中即取 release 侧）。若 Y.1.5 未识别（兜底），按本策略处理，且**优先用 git rename 元数据取文件名，不读取文件内容**。

rename 后文件名变了，`git checkout --theirs` 可能指向不存在的路径，必须显式处理旧/新两个文件名：

```bash
# 1. 优先：从 git rename 元数据取两侧文件名（不读文件内容）
git diff --name-status --diff-filter=U
# 输出形如 R100 old-abc.js new-def.js → 得到 OLD_FILE / NEW_FILE

# 1b. Fallback：rename 元数据缺失时，只读冲突标记行取文件名（不读全文）
OLD_FILE=$(git show :2:<FILE> | grep "^<<<<<<<" | sed 's/^.*HEAD://')
NEW_FILE=$(git show :3:<FILE> | grep "^>>>>>>>" | sed 's/^.*://' | tail -1)

# 2. 删除旧 hash 文件（否则仓库残留两个功能相同的 chunk）
git rm -f "$OLD_FILE" 2>/dev/null

# 3. 从 release 分支取新 hash 文件
git checkout origin/<SOURCE> -- "$NEW_FILE"
git add "$NEW_FILE"
```

> ⚠️ **为什么不能简单 `git checkout --theirs`**：rename 冲突中 `--theirs` 的文件路径可能与工作区当前路径不同。不删旧文件 → 仓库中残留两个功能相同的 chunk（旧 hash + 新 hash），构建时可能引用错误版本。

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

### Y.4.5 — 即时验证（每个文件解决后强制执行）

> ⚠️ **fail fast 原则**：每个文件解决后立即扫描，而非等到 Y.5 批量验证。单个文件出错时立即发现，回滚成本低（只需重做一个文件）。等到 Y.5 才发现，可能已忘了该文件的解决过程。

在 Y.4 对**每个文件**执行完解决操作（`git checkout --theirs/--ours`、手动编辑、rename+hash 策略等）后，**立即**运行：

```bash
# 精确正则匹配 git 冲突标记格式（行首 7+ 字符 + 空格/行尾）
# 覆盖标准 7 字符、非标准 8+ 字符、diff3 的 ||||||| base 标记
git grep -nE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' -- "$FILE" 2>/dev/null \
  && {
    echo "❌ $FILE 解决失败：仍有冲突标记"
    # 回滚到冲突状态，重新进入 Y.2 分析
    git checkout MERGE_HEAD -- "$FILE" 2>/dev/null
    return 1
  } || echo "✅ $FILE 干净"
```

**为什么用精确正则而非宽匹配**：`<<<<<<<`（7 个 `<` + 空格）锁定 git 冲突标记格式，排除 CSS 注释里的 `===` 分隔线和 ASCII 艺术。`^={7,}$` 要求纯等号到行尾，CSS 注释 `/* ====== */` 不匹配（等号后有 `*/`）。

**为什么用 `git grep` 而非 `grep -r`**：`git grep` 自动遵循 `.gitignore`，只扫 tracked 文件，天然排除 untracked 构建产物，配合精确正则形成双重过滤。

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

**3. 残留冲突标记检查（累积清单范围）**

> 不再全仓扫描。只扫 Y.1 累积清单中的文件——这些是本次冲突涉及的文件，是唯一可能残留标记的位置。全仓扫描会被构建产物的 CSS 注释等假阳性淹没。

```bash
# 只扫累积清单文件，用精确正则匹配 git 冲突标记格式
for FILE in $CONFLICT_FILES_CUMULATIVE; do
  git grep -nE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' -- "$FILE" 2>/dev/null \
    && echo "❌ $FILE 有残留标记"
done
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
```

> ⚠️ **commit 前强制门控（L2 防御）**：在 `git commit` 前扫描所有 staged 文件，检测残留冲突标记。这是提交前的最后一道防线——即使 Y.4.5 即时验证被跳过或执行走样，这里仍能拦截。

```bash
# 扫描所有 staged 文件
git diff --cached --name-only | while read f; do
  git grep -lE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' -- "$f" 2>/dev/null \
    && { echo "❌ 禁止提交：$f 含残留冲突标记"; exit 1; }
done
# exit 1 → 阻断 commit，回到 Y.4 重新处理该文件
```

门控通过后：

```bash
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
| Y.4 解决文件后跳过 Y.4.5 即时验证，直接处理下一个 | Y.4.5 对每个文件必须执行，fail fast 原则 |
| Y.5 逻辑验证因"高置信度文件应该没问题"而跳过 | Y.5 对**累积清单中所有文件**必须逐一执行，无例外 |
| Y.6 复查清单生成后未等用户确认就自动 commit | 必须等用户回复「继续」后再执行 `git commit` |
| Y.6 commit 前门控检测到冲突标记后以"影响不大"为由强行提交 | 门控是硬性阻断，必须回 Y.4 修复后重新走门控 |
| 语义分析（Y.2）未实际运行 `git show :1:/:2:/:3:`，凭印象描述两侧内容 | 必须先执行命令读取三方内容，基于实际内容分析 |
| 对 rename + 构建产物 hash 冲突用 `git checkout --theirs`（不删旧文件） | 必须用 Y.4 rename+hash 专用策略：删旧 + 取新 |
| 对复杂双侧改动文件套用高置信度规则，跳过中/低置信度的人工确认 | 置信度必须依据 Y.3 判定标准推导，不得主观拔高 |
| 逻辑验证出现 ⚠️/❌ 后以"影响不大"为由继续提交 | ⚠️/❌ 文件禁止继续提交，必须重新处理 |
| 构建产物（编译/打包后文件）走了 Y.2 语义分析、或读取了其三方内容 | Y.1.5 前置短路：命中即取 release 侧，不读不分析（详见 reference.md） |
| rename + 构建产物 hash 冲突用 `grep` 读文件内容提取文件名 | 优先用 `git diff --name-status --diff-filter=U` 的 rename 元数据取文件名；fallback 只读冲突标记行，不读全文 |

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

# Y.1.5 构建产物短路（命中即取 release 侧，不读内容）
git checkout --theirs <file> && git add <file>                                       # 内容冲突/Add-Add
git rm -rfq <dir> && git checkout origin/<SOURCE> -- <dir> && git add <dir>           # 整目录产物

# rename + 构建产物 hash（优先 rename 元数据，不读文件内容）
git diff --name-status --diff-filter=U                                               # 取 OLD/NEW 文件名
git rm -f "$OLD" 2>/dev/null && git checkout origin/<SOURCE> -- "$NEW" && git add "$NEW"

# rebase 继续
git rebase --continue
```
