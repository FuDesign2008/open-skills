# git-release-finish 多仓实战分析 —— 8.2.9x 收尾的 4 项改进建议

> **用途**：记录一次真实的多仓 release 收尾中发现的 4 项可改进点，供优化 `git-release-finish` skill 时参考。每一项均附**现象 / 证据 / 建议改法 / 验证方式**，可独立落地。
>
> **事件日期**：2026-09-24
> **流程宿主**：`solve-workflow`（Stage 6 执行）
> **涉及工程**：5 个独立 git 仓（非 open-skills 本体；产品标识已脱敏）
> **变更主题**：`release/8.2.90`、`release/8.2.91` 的 tag 创建与 trunk 同步
> **产物**：5 个 annotated tag + 5 个 MR（全部 Merged）+ 2 份发布报告

> **与既有文档的关系**：本仓库已有 [`superpowers/specs/2026-07-03-conflict-marker-defense-design.md`](superpowers/specs/2026-07-03-conflict-marker-defense-design.md)（冲突标记分层防御设计），它覆盖 **CSS 注释 `/* ====== */` 的误报** 与分层防御架构。本文的「发现 4」是同一正则的**另一类误报**（纯等号分隔线），两者互补而非重复；「发现 1／2／3」为其未涉及的新主题。

---

## 零、给接手者的速览（TL;DR）

| # | 发现 | 严重度 | 建议改动位置 |
|:--:|------|:--:|------|
| 1 | `merge_status` 卡在 `checking`，Phase 5.5 会误判为"不可合并"而停下 | 中 | `SKILL.md` → Phase 5.5 |
| 2 | ff 模式下大规模 commit（219）逐 commit cherry-pick 不现实 | **高** | `references/ff-cherry-pick.md` |
| 3 | 冲突裁决缺"子集差分验证"的机械判据（19 文件纯靠人读） | 中 | `SKILL.md` → Phase 6（或新建 reference） |
| 4 | `^={7,}$` 误报**纯等号分隔线**（既有文档只覆盖了 CSS 注释那一类） | 中 | `SKILL.md` → Phase 0 §The precise regex |

**另有两项分支识别层面的补充**（P2，见第七章）：同名 trunk 在不同仓库含义不同；`master` 可能是**活跃的平行 CI 分支**而非废弃主干。

---

## 一、实战背景（以下建议的依据来源）

### 1.1 仓库拓扑

| 代号 | 角色 | trunk | `merge_method` | 8.2.90 | 8.2.91 |
|------|------|-------|:--:|:--:|:--:|
| `repo-desktop` | Electron 桌面壳 | `master` | ff | ✅ | ✅ |
| `repo-editor-core` | 编辑器核心 | `master` | ff | ✅ | ✅ |
| `repo-agent` | Agent 模块 | `master` | **merge** | ✅ | ✅ |
| `repo-markdown` | Markdown 编辑器 | **`main`** | ff | ✅ | ❌ |
| `repo-bulb` | 富文本 SDK | **`main`** | ff | ✅ | ❌ |

后两者无 8.2.91 分支 —— 呼应常见的「版本存在性不统一」：**同一批发布中各仓库的版本集合可能不同**，需逐仓核实而非假定一致。

### 1.2 执行单元与结果

共 **8 个执行单元**（8.2.90 × 5 仓 + 8.2.91 × 3 仓），全部闭环。

- **7 个零冲突直通**：release 分支均为 trunk 的直接后代（`merge-base == trunk HEAD`），ff / 标准 merge 直接通过。
- **1 个复杂单元**（`repo-markdown`）：219 commits、35 冲突块、19 文件，走 squash 变体（见第三章）。

### 1.3 分支识别的两个陷阱

**陷阱 A：同名 trunk 在不同仓库含义不同。**

`repo-markdown` 与 `repo-bulb` 同时存在 `master` 与 `main`。四层证据交叉验证后确认主干为 `main`：

| 证据层 | 命令 / 来源 | 说明 |
|------|------|------|
| ① 远程 HEAD | `git ls-remote --symref origin HEAD` | 最权威；`git remote show origin` 实测易超时 |
| ② 平台默认分支 | `GET /projects/:id` → `default_branch` | |
| ③ **分支命名行为** | `git branch -a \| grep sync-release/` | `sync-release/*-to-main` 是历史同步的行为证据 |
| ④ **已合并 MR 分布** | `GET /projects/:id/merge_requests?state=merged&target_branch=main` | 版本发布 MR 全部落在 `main` |

**并且发现 `repo-markdown` 的 `master` 并非废弃分支，而是一条活跃的平行 CI 构建分支**：
- 独立 `.gitlab-ci.yml`（镜像不同、`npm ci --omit=optional` vs `npm install`）
- 规则 `if: $CI_COMMIT_BRANCH == "master"`，说明它被设计为独立触发
- 事件当日仍有他人提交

> **对 SOP 的影响**：现有措辞「`master` 可能是废弃旧主干」不足以覆盖「`master` 是一条平行的活跃分支」这一情形。若按废弃处理，可能误清理。

**陷阱 B：release 是否为 trunk 的后代，直接决定策略。**

- `merge-base(release, trunk) == trunk HEAD` ⇒ release 是 trunk 的直接后代 ⇒ ff 直通
- 否则 ⇒ ff 模式下必须走 cherry-pick（见第三章）

---

## 二、发现 1：`merge_status` 卡在 `checking`

### 现象

MR 创建后轮询 `merge_status`，连续 **6 次（约 24 秒）恒为 `checking`**。同仓库、同批次的另一 MR 在 2 次轮询内即返回 `can_be_merged`。

### 证据

```
GET /projects/:id/merge_requests/:iid
  merge_status          : checking        ← 卡住
  detailed_merge_status : None
  has_conflicts         : False
  state                 : opened

git 层面（同刻实测）：
  git merge-base --is-ancestor origin/<trunk> origin/<release>  → 成立（ff 有效）
  ahead = 26 / behind = 0
```

⇒ **不是分支问题、不是权限问题、不是冲突问题**。

### 处置（已验证有效）

```
GET /projects/:id/merge_requests/:iid/merge_ref
→ {"commit_id":"17b36046b3..."}
```

调用后立刻重查，`merge_status` 变为 `can_be_merged`。

### 根因判断

GitLab 端异步计算合并结果未及时完成。**多仓连续收尾时高发** —— 很可能受同批次前一个 MR 刚更新 trunk ref 影响而排队。

### 建议改法

Phase 5.5 增加「卡住」分支：

> **若 `merge_status` 在 N 次轮询（建议 N=6，间隔 4s）内恒为 `checking`**，且 `has_conflicts=false`、`state=opened`：
> 1. 调用 `GET /projects/:id/merge_requests/:iid/merge_ref` 强制重算
> 2. 等待 3s 后重查一次
> 3. 若转为 `can_be_merged` → 继续 Phase 9
> 4. 若仍为 `checking` → 继续等待（而非判定失败）；连续多次仍不变才视为异常
>
> **不要**把 `checking` 当作"不可合并"直接 abort。

### 验证方式

下次多仓收尾时，刻意在同一仓库连续合并 ≥2 个 MR，观察第二个 MR 是否更易卡住。

---

## 三、发现 2：ff 模式下大规模 cherry-pick 不可行，squash 变体更优

### 现象

`references/ff-cherry-pick.md` 步骤 3 建议：

```bash
git cherry-pick <COMMIT_1> <COMMIT_2> ...
```

本次实际场景（`repo-markdown`）：

| 指标 | 值 |
|------|-----|
| release 相对 trunk 的 commit 数 | **219** |
| trunk 相对共同祖先的 commit 数（另一条产品线） | 122 |
| 共同祖先 | 一条 2026-06-17 的提交 |
| 实测内容冲突 | **35 块**，覆盖 `src/`（40 文件）、`tests/`（8）、`openspec/`（5）、`docs/`（5）等 |

### 问题

逐 commit cherry-pick 意味着：

1. **219 次重放**
2. **同一文件会被反复中断** —— 因为两侧产品线并行修改了同一批核心文件（`features/*/widgets/*`、`core/*`、`styles/*`）
3. SOP 自己在 *Common Mistakes* 中已承认「大 commit 数的逐个重放是 days-of-interruptions 级别」—— **但该建议只针对 rebase 模式**，而 ff 仓库**无法用 merge commit 规避**（ff 拒绝产生 merge commit）

### 已验证的替代做法（squash 变体）

```bash
git checkout origin/<TRUNK> -b sync-release/<VERSION>-to-<TRUNK>
git merge --squash origin/<RELEASE_BRANCH>     # 无 merge commit，符合 ff 约束
# ← 此处一次性解决全部冲突（本次为 35 块 / 19 文件）
git add -A && git commit
git push origin sync-release/<VERSION>-to-<TRUNK>
# MR: source = sync-release/<VERSION>-to-<TRUNK>, target = <TRUNK>
```

**关键性质**：`sync-release/*` 仍是 trunk 的**直接后代** ⇒ `merge_method=ff` 下 ff 合并成功，**不撞 406**。产物形态与 SOP 完全一致（仍是 `sync-release/*` 分支 + MR），命名也与仓库历史（`sync-release/8.2.80-to-main` 等）相符。

### 代价（应如实写入文档）

- 219 个 commit 在 trunk 上压成 **1 个 squash commit** ⇒ **历史粒度变粗**
- ff 模式下本不产生 merge commit，故**无 hash 一致性风险**（SOP 的 *Hash consistency* 一节已说明 ff 项目对此宽容）
- 附带好处：回滚更简单（revert 1 个 commit 而非 219 个）

### 建议改法

在 `references/ff-cherry-pick.md` 新增一节 **「大规模冲突场景：squash 变体」**，包含：

1. **触发条件建议**（可调）：commit 数 > 30 **或** 内容冲突块 > 10
2. 上述命令序列
3. 代价与适用性说明
4. **与逐 commit cherry-pick 的取舍矩阵**：

| 条件 | 建议做法 |
|------|------|
| commit 数少（≤30）且冲突少 | 逐 commit cherry-pick（保留粒度） |
| commit 数多 **或** 冲突多 | squash 变体（一次性裁决） |
| 需要保留每个 commit 的审计粒度 | 逐 commit（接受中断成本） |

### 验证方式

在下一个 ff 模式且 commit 数 > 50 的仓库上，对比两种做法的**耗时**与**中断次数**，用数据校准触发条件。

---

## 四、发现 3：冲突裁决应走「子集差分验证」

### 现象

19 个冲突文件若纯靠语义阅读，成本高且主观性强。本次全程改用**机械判据**，实际裁决分布如下：

| 区域 | 文件数 | 裁决 | 判据 |
|------|:--:|------|------|
| 变更日志 `docs/fix-log/*` | 4 | 取 ours | 逐标题比对：theirs 标题集合 ⊆ ours；同名条目内容逐字一致（仅空白差异）|
| 规格 `openspec/specs/*` | 3 | **并集** | 两侧各有独有 Requirement/Scenario → 按标题键双层去重合并 |
| 构建配置 / 样式 | 3 | 取 ours | 差分验证 `theirs-only-lines = 0` |
| 核心源码 | 6 | 取 ours | 同上 **＋ 符号存在性检查** |
| 源码（含风险注释） | 1 | **取 theirs** | `theirs = ours + N 行注释` |
| 测试 | 2 | 取 ours ×1 / 取 theirs ×1 | 同上 |

其中「取 ours」并非默认偷懒 —— 每一例都经过 `theirs ⊆ ours` 的机械验证。有 1 例（源码的当前行高亮实现）经三版本比对（base / ours / theirs）确认是**两条线的替代实现**，属设计分歧而非内容丢失。

### 机械判据（建议固化为流程）

```bash
# 判据 1（首选）：theirs 是否为 ours 的子集
diff <(ours_block) <(theirs_block) | grep -c '^>'
#   == 0  ⇒ theirs ⊆ ours ⇒ 直接取 ours
#   >  0  ⇒ 需并集或取 theirs

# 判据 2（复杂文件）：符号存在性检查
#   theirs 的每个顶层符号（函数/类/导出）是否在 ours 中存在
#   若 ours 的方法签名已内建 theirs 所需的参数，则是功能超集

# 判据 3（并集场景）：按标题键双层去重
#   ## → ### Requirement: → #### Scenario:
#   ours 全部保留；theirs 中标题不在 ours 的块整体追加
```

### 一个必须注意的实现陷阱

**解析冲突块时必须处理 diff3 格式。**

当仓库配置 `merge.conflictStyle=diff3` 时，冲突块形如：

```
<<<<<<< HEAD
ours...
||||||| <base-sha>
base...
=======
theirs...
>>>>>>>
```

若解析脚本只认 `<<<<<<<` / `=======` / `>>>>>>>` 三段式，会**把 base 段误当成 ours**，从而得出「ours 是超集」的错误结论 —— 本次实测中该 bug 一度造成误判。

**建议**：解析前先探测 `^\|{7,}` 是否存在，或直接读 `git config merge.conflictStyle`。

### 建议改法

在 `SKILL.md` Phase 6（冲突解决）中固化，或新建 `references/conflict-triage.md`：

1. 子集差分验证优先（先算 `theirs-only-lines`）
2. 符号存在性检查（用于源码文件）
3. 并集合并的标题键双层去重（用于规格/文档）
4. **diff3 解析陷阱警示**

### 验证方式

下次冲突裁决时记录「机械判据直接得出结论」的比例 —— 比例越高，说明该流程越有效。

---

## 五、发现 4：`^={7,}$` 误报「纯等号分隔线」

> **与既有设计文档的分工**：`superpowers/specs/2026-07-03-conflict-marker-defense-design.md` 第 125/322 行已处理 **CSS 注释 `/* ====== */`** 这一类误报（因 `^={7,}$` 要求纯等号到行尾，带注释符号的不会匹配）。本节讨论的是**另一类**：**本身就是纯等号行**。

### 现象

Phase 0 的 L4a worktree 扫描在 **2 个仓库各命中 1 处**，且其中 1 处**落在合并范围内** ⇒ 按 SOP 判定表应当 **abort**，但实际是误报。

### 证据

| 文件 | 命中行 | 实际内容 |
|------|--------|---------|
| `resources/build/3rdpartylicenses.txt:1566,1590` | `===============` | 第三方许可证标题下划线（`The MIT License` / `GPL version 3` 之下）|
| `docs/gfm-alignment-test-cases.md:62` | `========` | Markdown 排版分隔线 |

**决定性判据**：`^<{7,} ` / `^>{7,} ` / `^\|{7,} ` 三种真标记均为 **NONE** —— **没有配对的开闭标记**。

### 根因

`^={7,}$` 无法区分「冲突标记的分隔行」与「纯等号分隔线」—— 二者在字符层面完全一致，只能靠**上下文配对**区分。

**且该误报具有传播性**：Phase 0 与 Phase 8 共用同一正则，而 Phase 8 的范围是 `git diff --name-only`（被合并改动的文件）—— 若误报文件恰在合并范围内（本次即如此），**Phase 8 会阻断合并**。

### 建议改法

**两条路（建议并用）**：

1. **补偿门控（推荐，成本低）**：Phase 0/8 命中后增加二次判别 —— **只有同时存在 `^<{7,} ` 或 `^>{7,} ` 时才判定为真残留**。纯 `=` 行单独出现不构成冲突标记。
2. **收敛正则**：将 `^={7,}$` 改为要求上下文存在配对标记（例如仅在已命中 `^<{7,}` 的文件中才启用该项检查）。

并在文档中明确写一句：**「Phase 0 命中不必然等于残留；判据是开闭标记配对」**。

### 验证方式

对含许可证文件 / Markdown 分隔线的仓库跑一遍新判据，确认不再误报，且真实冲突标记（含 diff3 的 `|||||||` 形态）仍能被捕获。

---

## 六、附：本次执行的关键数据（供校准）

### 6.1 零冲突单元（7 个）

| 仓库 | 版本 | trunk | 策略 | commit 数 | 冲突 | 验证 |
|------|:--:|-------|------|:--:|:--:|:--:|
| `repo-desktop` | 8.2.90 | master | ff | 286 | 0 | ✅ |
| `repo-desktop` | 8.2.91 | master | ff | 26 | 0 | ✅ |
| `repo-editor-core` | 8.2.90 | master | ff | 299 | 0 | ✅ |
| `repo-editor-core` | 8.2.91 | master | ff | 6 | 0 | ✅ |
| `repo-agent` | 8.2.90 | master | merge | 597 | 0 | ✅ |
| `repo-agent` | 8.2.91 | master | merge | 2 | 0 | ✅ |
| `repo-bulb` | 8.2.90 | main | ff | 4 | 0 | ✅ |

> `repo-agent` 的 597 个 commit 是其**首次** trunk 同步（建仓以来 trunk 仅有 1 个 initial commit）。

### 6.2 复杂单元（1 个）

| 指标 | 值 |
|------|-----|
| 仓库 | `repo-markdown` |
| 版本 | 8.2.90 |
| trunk | `main`（**非** `master`）|
| `merge_method` | ff |
| release 是否为 trunk 后代 | **否**（trunk 领先 122 个另一产品线提交）|
| 策略 | `sync-release/8.2.90-to-main` + `merge --squash` |
| commit 数 | 219 |
| 冲突 | 35 块 / 19 文件 |
| 验证 | typecheck ✅ ＋ 单元测试 **1434 passed** ✅ ＋ 残留扫描 ✅ |
| 内容完整性 | release 新增文件 **641 个 → trunk 缺失 0** ✅ |

### 6.3 值得记入的验证手法（squash 路径的内容等价性）

收尾完成后，**不能用 hash 祖先关系**验证 squash 路径的正确性（cherry-pick/squash 会产生新 hash）。改用**内容判据**：

```bash
BASE=$(git merge-base origin/<TRUNK> origin/<RELEASE>)
git diff --name-status "$BASE..origin/<RELEASE>" | awk '$1=="A"{print $2}' > /tmp/added.txt
# 逐个检查：这些 release 新增的文件是否都存在于 trunk
while IFS= read -r f; do
  git cat-file -e "origin/<TRUNK>:$f" 2>/dev/null || echo "MISSING: $f"
done < /tmp/added.txt
```

本次结果：641 个新增文件 **0 缺失** —— 这是 squash 完整性的最强证据。

> 补充：对「内容有差异的修改文件」，还可做**方向性判据** —— 逐文件算 `release-only-lines`，
> 若该值集中在少数文件且均为「两条线的替代实现」或行位移，则属正常；若某文件 `release-only-lines` 很大
> 且无法用替代实现解释，才需深入核查。

---

## 七、给接手 AI 的落地清单

| 优先级 | 文件 | 建议改动 |
|:--:|------|------|
| **P0** | `references/ff-cherry-pick.md` | 新增「大规模冲突：squash 变体」一节（触发条件 + 命令 + 取舍矩阵）|
| **P0** | `SKILL.md` → Phase 5.5 | 新增 `merge_status` 卡在 `checking` 的处理分支（含 `merge_ref` 强制重算）|
| P1 | `SKILL.md` → Phase 0 §The precise regex | 补充误报判别（开闭标记配对）与正则收敛建议；**同步 Phase 8**（共用同一正则）|
| P1 | `SKILL.md` → Phase 6（或新建 `references/conflict-triage.md`）| 固化子集差分验证 + 符号存在性 + 并集双层去重 + **diff3 解析陷阱** |
| P2 | `SKILL.md` → Phase 3 | 补充第四层证据（`sync-release` 命名 + 已合并 MR 的 target 分布）；说明 `master` 可能是**活跃的平行分支**而非废弃主干 |
| P2 | `references/ff-cherry-pick.md` | 补充「squash 路径的内容等价性验证手法」（见 6.3）|

**改完后务必**（按 `docs/README.md` 的约定）：

```bash
node scripts/gen-skill-docs.mjs
```

并把 `docs/generated/skills-index.md` 与代码一起提交 —— CI 会据此检查技能列表与源文件一致。

---

## 八、方法论提示（供接手者参考）

本次复盘采用 **AAR（After-Action Review）** 框架，并识别出三处**双环学习**（质疑并证伪了底层假设）：

1. 「必须逐 commit cherry-pick」→ **证伪**：squash 变体在 ff 约束下同样合规且更优
2. 「`master` 一定是主干或废弃分支」→ **证伪**：它可能是一条平行的活跃 CI 分支
3. 「Phase 0 正则是精确的」→ **证伪**：`^={7,}$` 会误报纯等号分隔线

建议接手者在修改 skill 时同步检查：**这些假设是否还隐含在文档的其他段落中**（例如 Phase 3 的主干识别措辞、Phase 8 的门控强度说明、`references/ff-cherry-pick.md` 的 Common pitfalls 表）。
