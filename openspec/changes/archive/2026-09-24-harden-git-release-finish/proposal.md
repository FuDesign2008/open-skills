## Why

一次真实的多仓 release 收尾（5 个独立仓 × 2 个版本、8 个执行单元全部闭环）暴露了 `git-release-finish` 与 `git-conflict-resolve` 两个 skill 的 6 处行为缺口：`merge_status` 卡 `checking` 会被误判为不可合并、ff 模式下大规模 commit 逐个 cherry-pick 不可行、冲突裁决缺机械判据（19 文件纯靠人读）、`^={7,}$` 正则误报纯等号分隔线且会阻断合并、主干识别证据不全（`master` 可能是活跃平行 CI 分支而非废弃主干）、squash 路径缺内容等价性验证手法。完整证据链见 `docs/git-release-finish-multi-repo-analysis.md`（每项附现象/证据/处置/验证方式）。现在沉淀为 skill 行为契约，避免下次多仓收尾重蹈覆辙。

## What Changes

- Phase 5.5 新增 `merge_status=checking` 卡住分支：N 次轮询（建议 N=6、间隔 4s）恒为 `checking` 且无冲突时，调用 `merge_ref` 强制重算后重查；继续等待而非判定失败，不把 `checking` 当作不可合并 abort
- `references/ff-cherry-pick.md` 新增「大规模冲突场景：squash 变体」：触发条件（commit 数 > 30 或冲突块 > 10，可调）、命令序列（`merge --squash` 不产生 merge commit，符合 ff 约束）、代价说明、与逐 commit cherry-pick 的取舍矩阵；`sync-release/*` 仍为 trunk 直接后代 ⇒ ff 合并成功不撞 406
- `references/ff-cherry-pick.md` 补充 squash 路径的内容等价性验证手法：release 新增文件逐个 `git cat-file -e` 存在性核对 + 修改文件的方向性判据
- 残留标记判定增加配对判别（补偿门控）：命中仅含纯 `=` 行、且同文件无 `^<{7,} ` / `^>{7,} ` / `^\|{7,} ` 配对标记 ⇒ 判定误报放行；「Phase 0/8 命中不必然等于残留，判据是开闭标记配对」；git-release-finish（Phase 0 判定表、Phase 8.1、ff-cherry-pick 步骤 5、appendix hook）与 git-conflict-resolve（Y.4.5 / Y.5 / Y.6 / Quick Reference）判定语义两侧一致
- `git-conflict-resolve` 新增机械判据快速通道：子集差分验证（`theirs-only-lines = 0` ⇒ 高置信取 ours）、符号存在性检查（源码文件）、并集合并标题键双层去重（规格/文档）；机械判据产出 🟢 高置信证据，不替代语义分析
- `git-conflict-resolve` 新增 diff3 解析陷阱警示：`merge.conflictStyle=diff3` 时冲突块含 base 段（`^\|{7,}`），解析冲突块前先探测，防止把 base 段误当成 ours 得出错误超集结论
- Phase 3 主干识别新增第四层证据（`sync-release/*` 命名行为 + 已合并 MR 的 target 分布），并覆盖「`master` 是活跃平行 CI 分支」情形（独立 CI 配置 + 近期有他人提交即为信号），按废弃处理前必须先证伪

## Capabilities

### New Capabilities

- `merge-status-stalled-recovery`: MR mergeability 轮询遇 `checking` 卡住时的机械处置流程（重算 + 重查 + 继续等待），覆盖多仓连续收尾高发场景
- `ff-non-descendant-squash-sync`: ff 模式且 release 非 trunk 后代时的大规模冲突 squash 变体路径（触发条件、命令序列、取舍矩阵、内容等价性验证）
- `trunk-branch-identification`: 主干开发分支识别的证据分层（含第四层命名/MR 分布证据）与「活跃平行分支」情形的证伪要求
- `conflict-marker-residue-verdict`: 冲突残留标记判定的配对判别标准——纯 `=` 行单独出现不构成残留，判定以开闭标记配对为准（跨 release 收尾与冲突解决两处消费方一致）
- `conflict-mechanical-triage`: 冲突块裁决的机械判据（子集差分 / 符号存在性 / 并集标题键去重）与 diff3 格式解析前置探测

### Modified Capabilities

（无——已核对 `openspec/specs/` 现有 58 个能力，无既有 spec 覆盖上述行为；`built-artifact-conflict-handling` 只覆盖构建产物短路，本次不动）

## Impact

- **受影响文件**：`skills/git-release-finish/SKILL.md`（Phase 0 / 3 / 5.5 / 8 + appendix pre-commit hook）、`skills/git-release-finish/references/ff-cherry-pick.md`（squash 变体 + 验证手法 + 「唯一出路」措辞修正）、`skills/git-conflict-resolve/SKILL.md`（机械判据 + diff3 陷阱 + 残留判定同步）
- **版本**：两个 skill 的 frontmatter `version` 各 bump 一次（内容增强）
- **派生产物**：`docs/generated/skills-index.md` 由脚本再生（pre-commit 自动处理，须纳入提交）
- **无运行时代码 / API / 依赖变更**；对外的安装面（SKILL.md 分发）不变，行为契约为纯增量
- **既有设计文档** `docs/superpowers/specs/2026-07-03-conflict-marker-defense-design.md` 为只读参照，其覆盖的 CSS 注释误报与本变更的纯等号行误报互补，不做修改
