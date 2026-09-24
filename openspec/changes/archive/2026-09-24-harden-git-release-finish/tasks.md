## 0. 验证基线（红——在改文本前确认缺口存在）

- [x] 0.1 grep 基线：`grep -n "checking" skills/git-release-finish/SKILL.md` 无处置分支、`grep -n "only way" skills/git-release-finish/references/ff-cherry-pick.md` 命中旧措辞、`grep -c '^={7,}' 类旧判定语义` 统计 9 处消费点（记录红证据）

## 1. git-release-finish/SKILL.md — Phase 5.5（P0：merge_status 卡住）

- [x] 1.1 Phase 5.5 判定表新增 `checking` 行 + 处置段：N 次轮询（建议 N=6、间隔 4s）恒 `checking` 且 `has_conflicts=false`、`state=opened` → 调平台 mergeability 重算接口（GitLab：`GET .../merge_ref`）→ 等 3s 重查 → 转 `can_be_merged` 继续 / 仍 `checking` 继续有限等待；明确不把 `checking` 归类为不可合并（英文正文、意图化表述）

## 2. git-release-finish/references/ff-cherry-pick.md — P0：squash 变体（发现 2 + P2-2）

- [x] 2.1 新增「Large-scale conflicts: squash variant」节：触发条件（commits > 30 或冲突块 > 10，可校准）+ `merge --squash` 命令序列（`sync-release/<VERSION>-to-<TRUNK>` 仍为 trunk 直接后代、无 merge commit）+ 代价说明（历史粒度变粗、回滚简单）
- [x] 2.2 同节内加取舍矩阵：小规模+少冲突 → 逐 commit（保留粒度）；大规模或多冲突 → squash 变体；需逐 commit 审计粒度 → 逐 commit（接受中断）
- [x] 2.3 新增「Content-equivalence verification for the squash path」节：以 merge-base 为基对 release 新增文件（status=A）逐个 `git cat-file -e origin/<TRUNK>:<file>` 核对 + 修改文件 `release-only-lines` 方向性判据
- [x] 2.4 修正开头「The only way forward is to replay release's commits onto target via cherry-pick」为双路径表述（小规模 cherry-pick / 大规模 squash 变体）

## 3. git-release-finish/SKILL.md — P1：残留判定配对门控（发现 4）

- [x] 3.1 Phase 0 §regex 权威段：增配对判别标准（判定真残留须同文件存在 `^<{7,} ` 或 `^>{7,} ` / `^\|{7,} `；纯 `=` 行单独出现为误报——许可证下划线、Markdown 分隔线）+ 判定表 L4a 行更新（非空 → 先跑配对判别再定 abort）
- [x] 3.2 Phase 8.1 门控同步：命中文件先判配对，仅纯 `=` 行无配对 → 记录误报放行不 `exit 1`；配对成立 → 维持阻断
- [x] 3.3 Appendix pre-commit hook 同步判定语义（与 Phase 0/8 一致）

## 4. git-conflict-resolve/SKILL.md — P1：机械判据 + diff3 + 判定同步（发现 3 + 发现 4 消费方）

- [x] 4.1 Y.2 前新增「Mechanical triage fast path」小节：子集差分验证（`theirs-only-lines = 0` ⇒ 🟢 高置信取 ours 并记录判据；> 0 ⇒ 升级并集/取 theirs 判断）+ 符号存在性检查（源码文件顶层符号/签名覆盖 → 功能超集；替代实现三版本比对如实记录）+ 并集标题键双层去重（规格/文档）；定位为语义分析前置快速通道、无法机械判定回落置信度分层
- [x] 4.2 新增 diff3 解析陷阱警示：解析冲突块前探测 `^\|{7,}` 或读 `git config merge.conflictStyle`；含 base 段时按 ours/base/theirs 四段解析，不得把 base 误当 ours
- [x] 4.3 Y.4.5 / Y.5 / Y.6 / Quick Reference 四处残留判定同步配对门控语义（引用同一标准，规则只写一次、此处按名称引用 Phase 0 权威定义所在 skill）

## 5. git-release-finish/SKILL.md — P2：Phase 3 trunk 识别（P2-1）

- [x] 5.1 三层证据扩为四层：增「分支命名行为 + 已合并 MR target 分布」（`sync-release/*-to-<X>` 命名、版本 MR 的 target）；远程 HEAD 查询优先 `git ls-remote --symref origin HEAD`（`git remote show origin` 标注易超时）
- [x] 5.2 增「候选分支可能是活跃平行 CI 分支」情形：独立 CI 配置 / 近期他人提交任一成立 → 不按废弃处置、不清理、报告中注明其角色

## 6. 版本与索引

- [x] 6.1 `skills/git-release-finish/SKILL.md` frontmatter `version` 2.0.0 → 2.1.0
- [x] 6.2 `skills/git-conflict-resolve/SKILL.md` frontmatter `version` 1.2.0 → 1.3.0
- [x] 6.3 `node scripts/gen-skill-docs.mjs` 再生 `docs/generated/skills-index.md` 并确认随提交

## 7. 验证（绿——阶段 7 正式执行，此处登记验收命令）

- [x] 7.1 `openspec validate harden-git-release-finish` 通过
- [x] 7.2 `npm run lint:skill-description` 通过；`node scripts/lint-skill-deidentification.mjs --staged` 通过（存量问题不属本变更，另行说明）
- [x] 7.3 grep 清扫零残留：旧「命中即残留」判定语义（9 处消费点逐一核对为配对判别）、`only way` 旧措辞、「deprecated 二分」残留；`docs/generated/skills-index.md` 与源文件一致（`git diff --exit-code docs/generated/skills-index.md`）
- [x] 7.4 行为核对：5 个 delta spec 全部 scenario 逐条对映到实现文本，任何 scenario 无实现落点即回改
