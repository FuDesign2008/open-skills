# 冲突标记分层防御设计文档

> **日期**：2026-07-03
> **涉及 skill**：`git-conflict-resolve`（L1+L2）、`git-release-finish`（L3+L4+L5）
> **状态**：设计已确认，待实现

---

## 1. 概述

### 1.1 问题

用户使用 `git-release-finish` skill 处理 `merge-release/8.2.70` 分支后，`resources/newEditorV1/1.0851b1a940ebbd064504.js` 仍残留 8 字符 diff3 格式的冲突标记，且已被 commit 推送。skill 的检测机制未拦截。

### 1.2 根因

三层防御同时失效：

1. **L1 预防失效**：`git-conflict-resolve` 的 Y.3 规则库缺少 rename + 构建产物 hash 文件的冲突类型，导致 Y.4 用错误策略解决，产出带冲突标记的结果
2. **L2 提交前失效**：Y.6 commit 前无 staged 文件扫描
3. **L3 合并前失效**：`git-release-finish` 阶段 8 门控与 `merge-tree` 结果耦合，对历史 commit 残留无保护

### 1.3 方案摘要

构建 **5 层纵深防御**，从预防到持续防护全覆盖。两个 skill 分工协作：conflict-resolve 负责 L1/L2（解决侧），release-finish 负责 L3/L4/L5（发版侧）。

---

## 2. 背景与根因分析

### 2.1 故障现场

```
文件：resources/newEditorV1/1.0851b1a940ebbd064504.js
内容：
  <<<<<<<< HEAD:resources/newEditorV1/1.e5d34e6e9c246aabf209.js
  //# sourceMappingURL=1.e5d34e6e9c246aabf209.js.map
  |||||||| 0dad395a3:resources/newEditorV1/1.8a3a0d14ef9377f9cbcf.js
  //# sourceMappingURL=1.8a3a0d14ef9377f9cbcf.js.map
  ========
  //# sourceMappingURL=1.0851b1a940ebbd064504.js.map
  >>>>>>>> origin/release/8.2.70:resources/newEditorV1/1.0851b1a940ebbd064504.js
```

特征：
- 8 个字符的冲突标记（标准 git 是 7 个）——手动编辑时数错字符数
- diff3 格式（含 `|||||||| base` 行）
- 本质是 **rename + 构建产物 hash 文件冲突**（webpack chunk hash 变更导致文件名变更）

### 2.2 故障链

```
[根因] Y.3 规则库无 rename + 构建产物冲突类型
   → Y.4 手动编辑，数错字符数，产出 8 字符 diff3 标记
       ↓
[过程缺陷] Y.5 验证滞后 + grep 噪音（CSS 注释 ========）+ 正则不精确
   → 漏检
       ↓
[流程缺陷] 阶段 8 门控与 merge-tree 耦合
   → 历史 commit 残留场景不触发
       ↓
[结果] 带冲突标记的 commit 被推送
```

### 2.3 现有 skill 的 5 个缺陷

| # | 缺陷 | 影响 |
|---|------|------|
| 1 | Y.3 规则库缺少 rename + 构建产物 hash 类型 | L1 预防失效（根因） |
| 2 | Y.5 验证滞后（批量而非即时） | 错误发现晚，回滚成本高 |
| 3 | Y.6 commit 前无门控 | L2 缺失 |
| 4 | 阶段 8 门控与 merge-tree 耦合 | L3 对历史残留无保护 |
| 5 | 检测命令不精确（宽匹配 + 全仓扫描） | 假阳性淹没真冲突 |

---

## 3. 设计方案

### 3.1 分层防御架构

```
故障路径：冲突解决 → commit → merge → 进入主干
                │        │        │
     L1 预防 ────┘        │        │  ← git-conflict-resolve
     L2 提交前 ────────────┘        │  ← git-conflict-resolve
     L3 合并前 ────────────────────┘  ← git-release-finish
     L4 历史扫描 ────────────────────  ← git-release-finish（前置检查）
     L5 持续 ─────────────────────────  ← pre-commit hook（可选）

         │ 所有层共享 │
         ▼            ▼
    ┌────────────────────────────────┐
    │  共享检测协议（内联到各层）     │
    │  精确正则 + git grep + 范围缩小 │
    └────────────────────────────────┘
```

**设计原则**：纵深防御——即使 conflict-resolve 的 L1/L2 都失效，release-finish 的 L3/L4 仍能拦截。

### 3.2 两 skill 改进范围矩阵

| 防御层 | git-conflict-resolve | git-release-finish |
|--------|---------------------|-------------------|
| **L1 预防** | Y.3 冲突类型分类扩展 + Y.4.5 即时验证（新增子阶段） | — |
| **L2 提交前** | Y.6 staged 文件扫描（新增，门控 commit） | — |
| **L3 合并前** | — | 阶段 8 独立门控（重构：无条件执行，解耦 merge-tree） |
| **L4 历史** | — | 阶段 0 前置健康检查（新增：扫描最近 merge commits） |
| **L5 持续** | — | 附录：pre-commit hook 脚本（可选，用户自行安装） |

### 3.3 共享检测协议

所有 5 层共享的基础检测逻辑。在两个 SKILL.md 中各自内联完整定义（信息性标注「与另一 skill 保持一致」，非指令性引用，符合 AGENTS.md 铁律 4）。

#### 3.3.1 精确正则

基于 git 源码（`merge-ort.c` / `merge-recursive.c`）的冲突标记格式定义：

```bash
CONFLICT_MARKER_RE='^<{7,} |^={7,}$|^>{7,} |^\|{7,} '
```

| 标记类型 | 正则片段 | 匹配示例 | 排除假阳性 |
|---------|---------|---------|-----------|
| `<<<<<<<` ours | `^<{7,} ` | `<<<<<<<< HEAD:file.js` | CSS 的 `<<<` |
| `=======` 分隔 | `^={7,}$` | `========`（纯等号到行尾） | CSS 注释 `====== */` |
| `>>>>>>>` theirs | `^>{7,} ` | `>>>>>>>> origin/release` | Python `>>>` |
| `\|\|\|\|\|\|\|` base（diff3） | `^\|{7,} ` | `\|\|\|\|\|\|\| base_sha` | 逻辑或 `\|\|` |

#### 3.3.2 扫描范围三档

| 层 | 场景 | 范围 | 命令骨架 |
|----|------|------|---------|
| L1 (Y.4.5) | 单文件即时验证 | 1 个刚解决的文件 | `git grep -nE "$RE" -- "$FILE"` |
| L2 (Y.6) | 提交前门控 | staged 文件 | `git diff --cached --name-only \| xargs git grep -lE "$RE"` |
| L3 (阶段8) | 合并前门控 | 合并涉及文件 | `git diff --name-only <base>..HEAD \| xargs git grep -lE "$RE"` |
| L4 (阶段0) | 历史扫描 | 最近 merge commits | `git log --all -S"^<<<<<<< " --pickaxe-regex --since="1 month ago"` |

#### 3.3.3 底层命令选型

统一用 `git grep`（而非 `grep -r`）：
- 自动遵循 `.gitignore`（排除 untracked 构建产物）
- 只扫 tracked 文件（范围天然缩小）
- 配合精确正则，双重过滤——不依赖项目结构假设，不被 CSS 注释干扰

### 3.4 冲突类型分类规范（混合策略）

#### 3.4.1 识别方法（两步）

**步骤 1 — git 状态判断大类**：

```bash
git status --porcelain                    # 查看冲突状态码
git diff --name-status --diff-filter=U    # 查看 rename 信息
```

| git 状态码 | 大类 | 含义 |
|-----------|------|------|
| `UU` (both modified) | 内容冲突 | 同文件两侧都改 |
| `UU` + 冲突标记含不同文件名 | Rename 冲突 | 文件名变了（diff3 格式 HEAD/base/theirs 文件名不同） |
| `AA` (both added) | Add/Add 冲突 | 两侧都新增了同名文件 |
| `DU` / `UD` | Delete/Modify 冲突 | 一侧删除一侧修改 |

**步骤 2 — 文件特征细化**：

```bash
# 构建产物 hash 文件（webpack/vite/rollup chunk）
echo "$FILE" | grep -qE '[0-9a-f]{8,}\.(js|css|map)$'

# 配置文件
echo "$FILE" | grep -qE '(^|/)(package\.json|tsconfig\.json|\.config\.(js|ts))$'

# 构建产物目录
echo "$FILE" | grep -qE '(^|/)(dist|build|releases|resources|out)/'
```

#### 3.4.2 完整冲突类型矩阵

| 大类 | 文件特征 | 解决策略 | 置信度 | 操作命令 |
|------|---------|---------|-------|---------|
| 内容冲突 | 构建产物 hash | 整目录取 release | 🟢 高 | `git checkout --theirs && git add` |
| 内容冲突 | 配置文件 | 字段级合并 | 🟡 中 | 逐字段列出，人工选 |
| 内容冲突 | 源代码 | 语义分析（现有 Y.2） | 按语义 | 现有流程 |
| **Rename + 构建产物** | hash 文件名变更 | **删旧 + 取 release 新文件** | 🟢 高 | 见 §3.4.3 |
| Rename + 源代码 | 源码 rename | 人工确认 | 🔴 低 | 三方视图 |
| Add/Add | 构建产物 | 取 release 侧 | 🟢 高 | `git checkout --theirs` |
| Add/Add | 其他 | 人工合并 | 🔴 低 | 三方视图 |
| Delete/Modify | 任意 | 人工确认必要性 | 🔴 低 | 三方视图 |

#### 3.4.3 关键场景：Rename + 构建产物 hash（新增规则）

本次故障的直接场景，Y.3 当前规则库完全缺失。

**识别特征**（同时满足）：
1. `git status` 显示 `UU`（内容冲突）
2. diff3 冲突标记的 HEAD/base/theirs 标签**含不同的 hash 文件名**
3. 文件名匹配 `[0-9a-f]{8,}\.(js|css|map)`

**解决策略**（不能只用 `git checkout --theirs`，因 rename 后文件名不同）：

```bash
# 1. 从冲突标记提取两侧文件名
OLD_FILE=$(grep "^<<<<<<<" "$FILE" | sed 's/^.*HEAD://')
NEW_FILE=$(grep "^>>>>>>>" "$FILE" | sed 's/^.*://' | tail -1)

# 2. 删除 HEAD 侧旧文件（避免仓库中同时存在两个 hash 的 chunk）
git rm -f "$OLD_FILE" 2>/dev/null

# 3. 从 release 分支取新文件
git checkout origin/<SOURCE> -- "$NEW_FILE"
git add "$NEW_FILE"

# 4. Y.4.5 即时验证
git grep -nE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' -- "$NEW_FILE" \
  && { echo "❌ 仍有冲突标记"; return 1; } || echo "✅ $NEW_FILE 干净"
```

**为什么不能简单 `git checkout --theirs`**：rename 冲突中，`--theirs` 的文件路径可能与当前工作区文件路径不同。不删除旧 hash 文件 → 仓库中残留两个功能相同的 chunk。

---

## 4. git-conflict-resolve 改进详情

### 4.1 改进清单

| # | 位置 | 改进 | 防御层 |
|---|------|------|-------|
| 1 | Y.3 规则库 | 扩展冲突类型分类（§3.4） | L1 |
| 2 | Y.4 后新增 Y.4.5 | 即时验证子阶段 | L1 |
| 3 | Y.5 检测命令 | 精确正则 + 只扫累积清单 + git grep | L1 |
| 4 | Y.6 commit 前新增门控 | staged 文件扫描 | L2 |
| 5 | 快速参考命令 | 同步更新 | — |

### 4.2 Y.4.5 即时验证（新增子阶段）

在 Y.4 **每个文件**解决后立即扫描该文件：

```bash
git grep -nE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' -- "$FILE" 2>/dev/null \
  && {
    echo "❌ $FILE 解决失败：仍有冲突标记"
    git checkout MERGE_HEAD -- "$FILE" 2>/dev/null
    return 1
  } || echo "✅ $FILE 干净"
```

### 4.3 Y.5 检测命令改进

| 项 | 原始 | 改进 |
|----|------|------|
| 范围 | 全仓 `grep -rl "<<<<<<" .` | 只扫累积清单 |
| 正则 | `<<<<<<`（6 字符宽匹配） | `^<{7,} \|^={7,}$\|^>{7,} \|^\|{7,} ` |
| 工具 | `grep -r` | `git grep` |

### 4.4 Y.6 commit 前门控（新增）

```bash
git diff --cached --name-only | while read f; do
  git grep -lE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' -- "$f" 2>/dev/null \
    && { echo "❌ 禁止提交：$f 含残留冲突标记"; exit 1; }
done
```

---

## 5. git-release-finish 改进详情

### 5.1 改进清单

| # | 位置 | 改进 | 防御层 |
|---|------|------|-------|
| 1 | 阶段 1 前新增阶段 0 | 前置健康检查 | L4 |
| 2 | 阶段 8 重构 | 独立门控（解耦 merge-tree） | L3 |
| 3 | 阶段 8.1 检测命令 | 精确正则 + 范围缩小 + git grep | L3 |
| 4 | 新增附录 | pre-commit hook 脚本（可选） | L5 |

### 5.2 阶段 0 — 前置健康检查（新增）

```bash
# L4a: 工作区残留扫描
git grep -lE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' 2>/dev/null

# L4b: 历史 merge commit 扫描
git log --all --merges --since="30 days ago" \
  -S'^<<<<<<< ' --pickaxe-regex --format="%h %s" 2>/dev/null

# 任一非空 → 报警中止
```

### 5.3 阶段 8 重构 — 独立门控

不再依赖阶段 5/6 触发。合并 MR 前**无条件执行**：

```bash
BASE=$(git merge-base origin/<MAIN_BRANCH> HEAD)
git diff --name-only $BASE..HEAD | while read f; do
  git grep -nE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' -- "$f" 2>/dev/null \
    && { echo "❌ $f 含残留冲突标记，禁止合并"; exit 1; }
done
```

### 5.4 附录 — pre-commit hook 脚本（L5，可选）

```bash
#!/bin/bash
# 安装：保存为 .git/hooks/pre-commit && chmod +x
git diff --cached | grep -qE '^<{7,} |^={7,}$|^>{7,} |^\|{7,} ' \
  && { echo "❌ staged 内容含冲突标记，禁止提交"; exit 1; } || exit 0
```

---

## 6. 测试策略

### 6.1 Mock Git 仓库构造

在 `git-conflict-resolve-workspace/mock-repo/` 构造测试仓库，覆盖 5 种场景：

| 场景 | 文件 | 预期行为 |
|------|------|---------|
| rename + 构建产物 hash 冲突 | `dist/1.aaa111.js` ↔ `dist/1.bbb222.js` | L1 识别为 hash 类型，删旧+取新 |
| diff3 格式冲突（8 字符非标准） | `src/normal.js` | 精确正则仍能匹配 |
| CSS 注释噪音 | `styles.css` 含 `/* ====== */` | **不应误报** |
| 内容冲突（源代码） | `src/app.ts` 两侧都改 | 走语义分析流程 |
| 干净文件 | `README.md` | 不应触发任何报警 |

### 6.2 测试用例（evals.json）

对每个 skill 构造 3 个测试用例（with-skill vs old_skill baseline），验证各防御层。

### 6.3 评估流程

1. snapshot 旧版 skill → workspace/skill-snapshot/
2. 写改进版 SKILL.md
3. 对每个 eval 跑两个 subagent（with-skill vs old_skill）
4. 用 `generate_review.py` 生成 viewer 供人工 review
5. 根据反馈迭代

---

## 7. 实现计划

| 步骤 | 操作 | 备注 |
|------|------|------|
| 1 | 开 feature 分支 `feat/conflict-marker-defense` | 按 AGENTS.md Git 工作流 |
| 2 | snapshot 旧版两个 skill 到 workspace | 作为 eval baseline |
| 3 | 改写 `skills/git-conflict-resolve/SKILL.md` | §4 全部改进 |
| 4 | 改写 `skills/git-release-finish/SKILL.md` | §5 全部改进 |
| 5 | 构造 mock git repo | §6.1 |
| 6 | 写 evals.json + 跑测试 | §6.2-6.3 |
| 7 | 生成 eval-viewer 供人工 review | skill-creator 标准 |
| 8 | 根据反馈迭代 | 直至满意 |
| 9 | 更新 docs/generated/skills-index.md | pre-commit hook 自动 |
| 10 | 提交 + PR | |

---

## 8. 风险与权衡

| 风险 | 缓解 |
|------|------|
| Y.4.5 即时验证增加单文件处理耗时 | 每文件仅 1 次 git grep，开销可忽略 |
| 精确正则可能漏匹配未来 git 版本的新格式 | 正则基于 git 源码格式定义，向后兼容（7+ 字符） |
| mock repo 测试可能与真实场景有差异 | eval 用例基于本次真实故障现场构造 |
| pre-commit hook 可能被用户绕过（`--no-verify`） | L5 是可选增强，L1-L4 不依赖它 |
| 改动面大（两 skill 都动） | 改动集中在检测协议和门控，现有语义分析流程不变 |
