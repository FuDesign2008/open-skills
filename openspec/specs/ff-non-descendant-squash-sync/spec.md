# ff-non-descendant-squash-sync Specification

## Purpose
ff 模式且 release 非 trunk 后代时的大规模冲突 squash 变体同步路径：触发条件、取舍矩阵与内容等价性验证。

## Requirements

### Requirement: ff 非 fast-forward 且规模大时 SHALL 走 squash 变体路径

当 ff 模式仓库的 release 非 trunk 后代（无法 fast-forward），且规模超过触发条件（release 相对 trunk 的 commit 数 > 30 或内容冲突块 > 10，阈值可按仓库实测校准）时，系统 MUST 采用 squash 变体：从 trunk 派生 `sync-release/<VERSION>-to-<TRUNK>` 分支后执行 `git merge --squash origin/<RELEASE_BRANCH>`，一次性解决全部冲突后提交推送。该路径 MUST 保持 `sync-release/*` 为 trunk 直接后代（ff 合并成功、不撞 406），且 MUST NOT 产生 merge commit（符合 ff 约束）。

#### Scenario: 大 commit 数场景走 squash 变体

- **WHEN** ff 仓 release 相对 trunk 领先 219 个 commit 且两侧产品线并行修改了同一批核心文件
- **THEN** 系统走 squash 变体（`merge --squash` → 一次性裁决全部冲突 → push → MR source=`sync-release/*`），而非逐 commit cherry-pick

#### Scenario: 产物形态与仓库历史一致

- **WHEN** squash 变体完成并创建 MR
- **THEN** source 分支为 `sync-release/<VERSION>-to-<TRUNK>`（与仓库历史 `sync-release/*-to-*` 命名一致），trunk 端 ff 合并成功

### Requirement: 逐 commit cherry-pick 与 squash 变体 SHALL 按取舍矩阵选择

ff 非 fast-forward 场景下，系统 MUST 依据规模与审计需求选择路径：commit 数少且冲突少（≤ 阈值）⇒ 逐 commit cherry-pick（保留粒度）；commit 数多或冲突多 ⇒ squash 变体（一次性裁决）；明确要求保留每个 commit 审计粒度 ⇒ 逐 commit（接受中断成本）。skill 正文 MUST 如实记录 squash 的代价（trunk 端 N 个 commit 压缩为 1 个 squash commit、历史粒度变粗）与附带好处（回滚粒度变粗但操作简单）。

#### Scenario: 小规模场景保留逐 commit 路径

- **WHEN** ff 仓 release 相对 trunk 仅 4 个 commit 且冲突块 0
- **THEN** 系统维持逐 commit cherry-pick 路径，行为不变

#### Scenario: 大规模场景切换 squash 变体

- **WHEN** commit 数或冲突块超过触发阈值
- **THEN** 系统切换 squash 变体并在报告中记录历史粒度变粗这一代价

### Requirement: squash 路径完成后 SHALL 执行内容等价性验证

squash 变体会产生新 hash，系统 MUST NOT 依赖 hash 祖先关系验证完整性，MUST 改用内容判据：以 `merge-base` 为基，对 release 新增文件（`git diff --name-status` 中 status=A）逐个执行 `git cat-file -e origin/<TRUNK>:<file>` 存在性核对；对内容有差异的修改文件执行方向性判据（`release-only-lines` 集中于替代实现或行位移属正常，异常大且无法解释才深入核查）。

#### Scenario: 新增文件零缺失

- **WHEN** release 相对 merge-base 新增 641 个文件，squash 合并后逐个存在性核对
- **THEN** 全部存在于 trunk（0 缺失）方可进入后续验证；任一缺失即失败并回查

#### Scenario: 修改文件方向性核查

- **WHEN** 某修改文件的 `release-only-lines` 值异常大且无法用「两条线的替代实现」或行位移解释
- **THEN** 系统深入核查该文件内容后再判定完整性
