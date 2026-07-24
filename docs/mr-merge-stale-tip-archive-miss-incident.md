# Archive 提交未随 MR 合入目标分支 —— 事件复盘与 Skill 优化建议

> **用途**：记录一次 opsx-jira-fix-workflow 阶段 8 收尾中，「主修复已合入目标分支，但随后 push 的 OpenSpec archive 提交未进入同一目标分支」的真实事件；厘清原因与可观测证据，供优化 `opsx-jira-fix-workflow` / `opsx-solve-workflow` / `jira-fix-workflow` / `openspec-archive-change` / `finishing-a-development-branch` 等相关 Skill。
>
> **事件日期**：2026-07-23  
> **涉及工程**：某前端工程（内部仓库，路径已脱敏）  
> **涉及 Jira**：`<JIRA-ID>`（内部 Jira，链接已脱敏）  
> **涉及 MR**：
> - MR !469「主修复 + 真机验证 docs」（合入了旧 tip，**未含** archive）
> - MR !470「archive 补齐」（事后补合）

---

## 一、现象（先说清楚「出了什么问题」）

### 1.1 用户可见现象

收尾过程中出现：

> **主修复已合入 `<目标分支>`，但 archive 提交未进 `<目标分支>`。**

具体表现：

| 期望 | 实际 |
|------|------|
| 一次 `glab mr merge 469` 后，目标分支 tip 包含「主修复 + 真机验证 docs + OpenSpec archive / main specs sync」 | 目标分支 tip 停在真机验证 docs（`<验证 docs 提交>`），**不含** archive（`<archive 提交>`） |
| `openspec/changes/<change>/` 已迁到 `openspec/changes/archive/...`，且 `openspec/specs/` 已 sync | 目标分支上仍保留 **active** change；主 `specs/<capability>` **无** 新 requirement |
| Jira / fix-log 可宣称「archive 已合入」 | 只能再开 docs MR（!470）补齐 |

### 1.2 不是什么问题

- **不是** Git 丢 commit、force push 覆盖、或 cherry-pick 失败。  
- **不是** OpenSpec archive 命令本身写错目录。  
- **不是** MR 权限 / pipeline 永久失败（`glab` 报了 `✓ Pipeline succeeded` / `✓ Merged!`）。  
- **主修复代码本身是合进去的**（`<主修复提交>` 在 `<目标分支>` 上），业务修复未丢；丢的是 **同分支上、合并瞬间之后才应进入 tip 的收尾 commits**。

---

## 二、事件经过（时间线）

### 2.1 背景

- 工作流：`opsx-jira-fix-workflow`，change：`fix-<jira-id>-<topic>`。  
- 目标分支：`<目标分支>`。  
- 修复分支：`fix/jira-fix-<JIRA-ID>`。  
- 用户已确认真机验证 OK，并说「请继续」→ AI 进入阶段 8：archive → 合并 → Jira 回写。

### 2.2 关键操作序列（问题出在这里）

在**同一条 shell 流水线**里近似执行了：

```text
1. 本地 archive + sync specs + 更新 fix-log / tasks
2. git commit          → 得到 <archive 提交>
3. git push            → 源分支 tip 变为 <archive 提交>
4. glab mr merge 469   → 数秒内打印「Pipeline succeeded」「Merged!」
```

整段 **commit + push + merge 约 6–7 秒**。

### 2.3 合并后核对结果

| 检查项 | 结果 |
|--------|------|
| `origin/<目标分支>` tip | `<验证 docs 提交>`（docs: 真机验证通过留痕） |
| tip 是否包含主修复 `<主修复提交>` | ✅ 是 |
| tip 是否包含 archive `<archive 提交>` | ❌ 否 |
| `git branch -a --contains <archive 提交>` | 仅源分支 `fix/jira-fix-<JIRA-ID>`（及 remote 同名） |
| MR API `merge_commit_sha` | `None`（快进合并痕迹） |
| MR API `sha` / `diff_refs.head_sha`（查询时） | 可为 `<archive 提交>`（源分支 tip 已前进，但**合进去的不是这个 tip**） |

随后用 cherry-pick + !470 把 archive 补进 `<目标分支>`（`<补齐提交>`）。

---

## 三、根因（重点）

### 3.1 一句话

**在「刚 push 出新 tip」之后立刻合并，合并动作实际合入的是「上一轮已绿 pipeline 所对应的旧 tip」，新 tip（archive）未进入目标分支。**

### 3.2 因果链

```text
源分支 tip @ <验证 docs 提交>（真机验证 docs）
  └─ pipeline 已绿（可合）

同一流水线：
  push <archive 提交>（archive）     ← tip 前进，新 pipeline 刚创建 / 未完成
  立刻 glab mr merge 469
       │
       ├─ 「Pipeline succeeded」≈ 旧 tip <验证 docs 提交> 的绿结果
       │     （数秒内不可能是 <archive 提交> 的完整 CI）
       │
       └─ 合并结果：目标分支 fast-forward 到 <验证 docs 提交>
             （合入区间 ≈ <区间起点>..<验证 docs 提交> = 主修复 + 验证 docs）
             <archive 提交> 仍只在源分支上
```

### 3.3 为何「看起来像合成功了」却缺 commit

| 误导信号 | 实际含义 |
|----------|----------|
| `✓ Pipeline succeeded` | 多半是 **旧 tip** 的 pipeline，不是刚 push 的 tip |
| `✓ Merged!` | 目标分支确实前进了，但只到 **合并决策所依据的 tip** |
| MR 状态 `merged` | 不保证「合并瞬间源分支 HEAD 的每一个 commit」都在目标分支上 |
| 事后查 MR `head_sha == <archive 提交>` | 源分支 tip 已变；**合入内容**仍可能是更早的 tip |

### 3.4 与 Skill 现有规则的关系

`opsx-jira-fix-workflow` 已写：

> 默认推荐：验证通过后先 archive，确认 `openspec/specs/` 更新和 `openspec/changes/archive/` 迁移进入 diff，**再完成 PR**。  
> Red flag：先 PR/合并再 archive → specs 或 archive 可能不在最终 diff。

本次 AI **形式上**做了「先 archive 再 merge」，但缺了关键一步：

> **archive 提交 push 之后，必须确认「即将合入的 tip == 刚 push 的 tip」，且该 tip 的检查（pipeline / 无 race）通过，再执行 merge。**

现有规则防的是「根本没 archive 就合」；**防不住**「archive 已 commit+push，但 merge 合的是 push 前 tip」这种竞态。

---

## 四、可复用的判定证据（Skill / Agent 自检用）

合并后（或宣称「已合入」前）至少做：

```bash
# 1) 目标分支 tip 是否包含「本应合入」的 tip / commit
git fetch origin <target>
git merge-base --is-ancestor <expected_sha> origin/<target> && echo OK || echo MISSING

# 2) 区间是否覆盖 archive / specs sync 文件
git log origin/<target> --oneline -<n>
git ls-tree -r --name-only origin/<target> | grep 'openspec/changes/archive/.*<change>' || echo ARCHIVE_MISSING

# 3) 不要只信 glab「Merged!」；核对 tip 与预期 SHA
```

**强信号「发生了本事件」**：

1. merge 命令在「刚 push」后数秒内完成，且打印 Pipeline succeeded；  
2. `origin/<target>` tip = push **之前** 的 tip；  
3. 刚 push 的 SHA 仍 `contains` 仅在源分支。

---

## 五、Skill 优化建议（给作者）

### 建议 1：合并前强制「tip 钉死」（核心）

在阶段 8「执行合并」前增加硬步骤：

```text
MERGE_SHA=$(git rev-parse origin/<source-branch>)   # 或刚 push 返回的 SHA
# 等待该 SHA 的 pipeline 成功（或用户显式跳过 CI 并留痕）
glab mr merge <id> --sha "$MERGE_SHA" -y
# 合并后：
git fetch origin <target>
git merge-base --is-ancestor "$MERGE_SHA" origin/<target> || 失败并补救
```

要点：

- **禁止**「push 与 merge 无 tip 校验地串在同一无等待流水线」。  
- `glab mr merge --sha`（或等价 API）钉死合入 revision，避免合到旧 tip。

### 建议 2：拆开「修复 MR」与「archive/docs MR」（推荐默认策略之一）

当 MR **已经 open 且主修复已在审 / 已可合** 时：

| 策略 | 做法 | 优点 |
|------|------|------|
| A. 钉 tip 同 MR 合入 | archive push → 等 CI → `--sha` merge | 一次 MR 完整 |
| B. 分 MR（本事件兜底） | 主修复先合；archive 单独 docs MR | 竞态面小；!470 已验证可行 |

Skill 应写明：若选择 A，必须执行建议 1；若 MR 已合并或 tip 竞态风险高，**自动降级到 B**，而不是假装一次合入成功。

### 建议 3：禁止把「Pipeline succeeded」当作「当前 tip 已绿」

在 SKILL / reference 增加：

> 若 merge 前刚 push 过新 commit，则：  
> - 不得采信合并输出里立即出现的 Pipeline succeeded（除非能证明其 `sha` == 刚 push 的 tip）；  
> - 必须查询 **该 tip** 的 pipeline 状态，或使用 `--sha <tip>` 让平台拒绝 tip 不匹配的合并。

### 建议 4：合并后「合入完整性」自检（强制留痕）

在「✓ Merged」之后、「Jira 回写」之前：

```text
- [ ] expected_sha（含 archive / specs sync）已是 target 祖先
- [ ] active change 目录不在 target 上（若策略要求已 archive）
- [ ] openspec/specs/<capability> 含本次 delta
失败 → 不得宣称收尾完成；自动开补齐 MR 或暂停请用户决策
```

本事件若有此步，会在 Jira 回写前发现 MISSING，而不是事后口头解释。

### 建议 5：修正阶段 8 文案中的「完成 PR」语义

当前「先 archive … 再完成 PR」易被执行成：

`archive commit → push → 立刻 merge 已有 MR`

应改为更不可歧义的步骤：

1. archive + sync；  
2. commit；  
3. push；  
4. **确认远程 tip == 本地 tip**；  
5. **等待该 tip 的检查通过**（或显式跳过并留痕）；  
6. `mr merge --sha <tip>`；  
7. **合入完整性自检**；  
8. Jira 回写。

### 建议 6：与「覆盖率门控被绕过」事件的关系

| 文档 | 问题类型 |
|------|----------|
| [merge-coverage-gate-bypass-incident.md](./merge-coverage-gate-bypass-incident.md) | 合并**前**该跑的门控没跑 |
| **本文** | 合并**动作**合入的 tip 与刚 push 的 tip 不一致 |

两者都是阶段 8 收尾纪律问题，但修复点不同：前者补触发锚点；本文补 **tip 钉死 + 合入后祖先校验**。建议在三个工作流的 reference「合并前检查清单」里**同时**挂上两条。

---

## 六、补救回顾（本事件）

1. 确认主修复已在 `<目标分支>`（业务不回滚）。  
2. 从源分支 cherry-pick archive 提交，开 !470 合入目标分支。  
3. Jira 已流转「已修复」，并追加 archive 合入说明。  

补救有效，但属于**事后修补**；Skill 应把「钉 tip + 祖先校验」前移，避免依赖补救 MR。

---

## 七、相关文件索引

| 文件 | 相关内容 |
|------|----------|
| `skills/opsx-jira-fix-workflow/SKILL.md` 阶段 8 | archive → 合并 → Jira；「先 archive 再完成 PR」 |
| `skills/opsx-jira-fix-workflow/reference.md` | 合并前覆盖率门控、Jira 评论模板 |
| `skills/opsx-solve-workflow/` / `jira-fix-workflow/` | 同源阶段 8 顺序（优化需三处同步） |
| `skills` / `.claude/skills` 下 `openspec-archive-change` | archive 目录迁移；**不**负责 merge tip 校验 |
| 姊妹事件 | [merge-coverage-gate-bypass-incident.md](./merge-coverage-gate-bypass-incident.md) |

---

## 八、给 Skill 作者的验收标准（改完怎么算好）

落地建议 1–5 后，下列场景应失败被拦截或自动走补齐路径，而不是静默「半套合入」：

1. `push` 新 tip 后立即 `mr merge`（无 `--sha`、无 tip 祖先校验）→ **必须**等待 / 钉 tip / 或拒绝。  
2. merge 成功但 `expected_sha` 不是 target 祖先 → **禁止**进入 Jira「已合入」表述；必须报 MISSING。  
3. 选择分 MR 策略时 → 主 MR 合入后明确列出「archive 待 !N」，不得假装 archive 已在目标分支。
