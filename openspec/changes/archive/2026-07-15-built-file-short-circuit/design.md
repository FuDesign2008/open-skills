## Context

`git-conflict-resolve` 当前的冲突解决流程为：Y.1 冲突盘点 → Y.2 语义分析（`git show :1:/:2:/:3:` 读取三方内容）→ Y.3 识别冲突类型 → Y.4 分类执行。构建产物（webpack/vite chunk、minified bundle、构建目录产物）的识别规则散落在 Y.3 步骤 2 与 Y.3 高置信度表中，**位于 Y.2 读取之后**；rename+hash 专用策略还依赖 `grep "^<<<<<<<" "$FILE"` 读取冲突标记。

真实案例：打包 chunk 的 rename+hash 冲突被解错（冲突标记残留在 minified 文件内 + 旧 hash 版本被错误保留），需开修复 MR 回填——直接暴露了「对构建产物做语义分析既费 token 又易错」。

约束：skill 正文英文 + 触发词含中文（铁律 3）；数据脱敏（铁律 2，示例用 `my-project`/`dist/` 等通用占位）；SKILL.md <500 行（现 541 行已超，需 reference 抽离）；skill frontmatter version 手动递增（区别于 plugin.json 的 CI 版本）。利益相关：使用 `git-release-finish` / `git-conflict-resolve` 的发版人员。

## Goals / Non-Goals

**Goals:**
- 构建产物冲突在语义分析前被识别并短路：不读内容、不分析，直接取 release 侧
- 扩展识别范围（构建目录前缀 + 文件特征 + 用户补充），保守默认（边界模糊不短路）
- rename+hash 冲突改用 git rename 元数据获取文件名，不读文件内容
- 控制 SKILL.md 行数（reference.md 抽离详细规则）
- `git-release-finish` 作为调用方轻量联动（短路自动生效，不加参数）

**Non-Goals:**
- 不改源码/配置文件的语义分析流程（Y.2→Y.3→Y.4 保持不变）
- 不引入新依赖或外部工具
- 不改 git 底层合并/重命名检测策略
- 不做构建产物的「白名单认证」体系（保守默认即可，YAGNI）

## Decisions

**D1. 短路闸门位置 = 新增 Y.1.5（Y.1 与 Y.2 之间）**
Y.1 给出冲突文件清单后是首个能「按文件名判类型」的时机；Y.2 是费 token 根源，必须在它之前短路。
- Alternatives：① Y.2 内部最前面识别（Y.2 职责变重，短路与分析混在一起）② 重组 Y.2/Y.3 为类型分流（改动最大，可能触发铁律 4「大幅重写」）。选定 Y.1.5：职责单一、改动集中、不破坏现有框架。

**D2. 识别策略 = 构建目录前缀 ∪ 文件特征，保守默认**
单一信号不可靠：hash chunk 文件名最准但只覆盖有 hash 的产物；目录前缀覆盖无 hash 产物（如 `dist/index.html`、`vendors.js`）。两者并集 + 用户补充。**保守默认**：既不在已知构建目录、又无产物特征的文件**不短路**，走语义分析——宁可读也不误判。

**D3. 覆盖策略 = 一律取 release 侧**
构建产物是机器生成派生物，权威始终是发版分支，无「两侧意图」需权衡。含整目录覆盖、rename+hash 删旧取新。

**D4. rename+hash 不读文件 = git rename 元数据**
用 `git diff --name-status --diff-filter=U`（diff3 下携带 rename 信息）或 `git status` 从 git index 取两侧文件名，不碰文件内容。**Fallback**：当 rename 元数据缺失时，降级为「只读冲突标记行提取文件名」（`git show :2:/:3:` 前几行 grep 标记，非全文）——仍优于原策略（原策略隐式读全文）。

**D5. 短路后仍执行 Y.4.5 残留验证**
短路取 release 侧理论上无残留，但 rename+hash 删旧取新等操作可能出错，保留 fail-fast 验证。

**D6. 抽离 reference.md**
SKILL.md 现超 500 行；识别清单（目录前缀/特征正则）+ 详细短路规则抽到 `skills/git-conflict-resolve/reference.md`，SKILL.md 保留流程骨架 + 指向 reference。

**D7. git-release-finish 轻量联动（不强耦合）**
短路在 `git-conflict-resolve` 内自动生效，调用方无需改参数。阶段 5 冲突检测后加一句「构建产物将走短路」提示；阶段 8 残留扫描确认扫描范围覆盖构建产物路径（沿用现有 `git diff --name-only` 范围设计）。

**D8. 版本号递增**
`git-conflict-resolve` `1.1.0` → `1.2.0`（新增子阶段，minor）；`git-release-finish` `1.4.0` → `1.5.0`（联动提示属功能增强，minor）。

**D9. 执行方式 = 走完整 `/skill-creator`（铁律 4，用户确认）**
本次是对两个成熟 skill 的功能性增强，幅度超过「小修小补」。按铁律 4 严格解读，阶段 5 通过 `/skill-creator` 工作流执行（捕获意图 → 草稿 → 测试用例 → 评估迭代 → 描述优化），skill-creator 支持「修改和改进已有 skill」。

## Risks / Trade-offs

- **[误判：源码被当构建产物短路 → 丢失 main 侧改动]** → ① 识别规则精确（构建目录前缀需显式匹配、hash 需 8+ 位 hex）；② 保守默认（边界模糊不短路）；③ 短路前检测 main 侧相对 base 是否有独立源码级改动，若是则降级走语义分析；④ 最坏情况 git 可回滚。
- **[rename 元数据缺失]** → D4 的 fallback：只读标记行（非全文）。
- **[使用者补充目录误伤源码]** → 显式声明，使用者自负；reference.md 提示风险。
- **[SKILL.md 仍可能超长]** → reference 抽离 + 精简原则（规则只写一次、Pitfall 只记非直觉）。
- **[流程变长，学习成本]** → Trade-off：省 token + 杜绝残留标记的价值 > 流程长度。

## Migration Plan

- 纯 skill 文本变更，无运行时/数据迁移。
- 回滚：`git revert` 即可完全回退。
- 部署：修改两个 SKILL.md + 新增 reference.md；`docs/generated/skills-index.md` 由 pre-commit hook（husky）自动更新——需先 `npm install` 启用。
- 验证：`node scripts/gen-skill-docs.mjs && git diff --exit-code docs/generated/skills-index.md`（与 CI 一致）。

## Open Questions

- 主要技术决策已定；铁律 4 执行方式（走 skill-creator）已由用户确认。
- 阶段 5 通过 skill-creator 执行时，若其流程对「已有 skill 增量改」提出新约束（如要求整体重写 vs 增量改的选择），回到本 design 更新 D9。
