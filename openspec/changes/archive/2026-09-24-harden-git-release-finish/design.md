## Context

一次真实多仓 release 收尾（5 仓 × 2 版本、8 执行单元）的 AAR 复盘（`docs/git-release-finish-multi-repo-analysis.md`）确认了 `git-release-finish`（v2.0.0）与 `git-conflict-resolve`（v1.2.0）的 6 处行为缺口。当前状态：`ff-cherry-pick.md` 步骤 3 无条件逐 commit cherry-pick；Phase 5.5 判定表无 `checking` 分支；残留正则 9 处使用点均无配对判别；`git-conflict-resolve` 为纯语义路径（无机械判据、无 diff3 解析警示）；Phase 3 仅三层证据且只考虑「废弃分支」情形。本仓为纯 Markdown skills 库，无运行时代码；对外分发面为 SKILL.md。

## Goals / Non-Goals

**Goals:**

- 将复盘的 6 项发现沉淀为 5 个 capability 的行为契约（proposal ↔ specs 已对映，validate 通过）
- 残留标记判定语义在全部 9 处消费点保持一致（配对判别为唯一权威标准，写一次、引用处处）
- 冲突裁决方法论保持单一权威源：机械判据归位 `git-conflict-resolve`，`git-release-finish` Phase 6 维持薄委托
- 被证伪假设的残留措辞清扫（「唯一出路」「deprecated 二分」「正则精确」三处）

**Non-Goals:**

- 不修改 `built-artifact-conflict-handling` 既有 spec 与 `docs/superpowers/specs/2026-07-03-conflict-marker-defense-design.md`（CSS 注释误报与本次纯等号行误报互补，互不覆盖）
- 不修改任何 frontmatter `description`（触发路由不变，description lint 仅作回归确认）
- 不新增脚本或运行时代码；不做跨 skill 契约编号引用（跨 skill 一律名称引用）
- 不改根 `package.json` 版本（CI 自动递增）

## Decisions

1. **机械判据落点 = `git-conflict-resolve`，而非复盘字面建议的 `references/conflict-triage.md`**。冲突裁决方法论的本仓权威归属是 `git-conflict-resolve`（含独立调用场景）；另立 reference 会造成方法论双源、违反「规则只写一次」与所有权方向。备选（新 reference）已否决：独立调用场景不可见 + 后续漂移。
2. **发现 4 采用补偿门控（判定层），不改扫描正则本身**。扫描仍用既有正则保证真标记不漏；判定要求同文件存在 `^<{7,} ` / `^>{7,} ` / `^\|{7,} ` 配对，纯 `=` 行单独出现判误报。备选（收敛正则）已否决：正则收敛会牺牲「真标记 + 分隔行同文件」的上下文表达力，且 9 处使用点同步成本更高。权威定义置于 Phase 0 §regex 段（本仓该段的既有职责位），其余消费点引用。
3. **squash 变体以触发条件 + 取舍矩阵呈现，不替换逐 commit 路径**。阈值（commit > 30 或冲突块 > 10）标注可校准；skill 正文如实记录代价（历史粒度变粗）与 ff 约束合规性（`merge --squash` 无 merge commit）。
4. **merge_status 处置为 Phase 5.5 判定表新增行 + 意图化平台表述**（「平台 mergeability 重算接口」GitLab 即 `merge_ref`），不硬编码平台 CLI 为唯一路径（铁律 6）。
5. **skill 正文英文书写（铁律 3），OpenSpec artifacts 中文**——与既有 spec（如 `built-artifact-conflict-handling`）语言惯例一致；新增段落不携带「v2.1 新增」类历史标记（正文活在当下）；新增内容全部正向描述流程。
6. **版本策略**：两个 skill frontmatter `version` 各 bump（内容增强，次版本号 +1）；根版本由 CI 递增。

## Risks / Trade-offs

- [孤儿分隔线（开闭标记被删仅剩 `=======`）在新判据下放行] → 扫描报告记录误报识别结果；真标记三类独立捕获不受影响；复盘以一手证据判定配对为决定性判据，接受该理论残余风险
- [机械判据被运行时 AI 当作跳过语义分析的捷径] → spec 明文「不替代语义分析：无法机械判定时回落置信度分层」；skill 正文将把机械判据定位为语义分析前置的快速通道
- [squash 阈值不当导致该逐 commit 的场景走了 squash（粒度损失）或反之（中断成本）] → 取舍矩阵保留审计粒度逃生行；阈值标注可校准；复盘给出耗时/中断次数对比实验法
- [9 处消费点同步遗漏（两侧判定语义漂移）] → 阶段 7 以 grep 全库清扫旧判定语义（`命中即残留` 措辞与「only way」措辞零残留）作为机器验收
- [轮询参数（N=6/4s）在个别平台不适用] → spec 标注「建议」值；处置为意图化步骤，参数可调

## 审查记录（阶段 4，`staged-review-flow` 双轴）

- Standards 轴：核心四维 + 战略五维全过（二类门快速通道）；`code-design-review` 未触发（非源码改动；跨 skill 依赖方向已在决策 1 解决）
- Spec 轴：6 发现 + 2 P2 全覆盖、proposal↔specs 逐条对映、铁律 2/3/5/6/7/8 符合
- 结论：**Pass**，3 项非阻塞（孤儿分隔线残余风险 / 「唯一出路」措辞归 grep 验收 / 轮询参数建议值）已转入上文风险与验收项

## Open Questions

（无——三个非阻塞项均已有明确缓解与验收路径，无待决决策）
