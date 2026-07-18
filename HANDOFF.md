# HANDOFF — open-skills 会话交接（2026-07-18）

> 给接手 AI 的上下文包。本文件只做索引与判断结论，不复制已有 artifact 内容（按路径/URL 引用）。

## 1. 当前状态（已落地）

- **PR #218 已合并并发布 v1.75.0**（merge commit `13e2cf9`，CI 全绿）：solve-workflow 7→8 阶段拆分、阶段2 临时改动登记/回滚门控、browser-debug-toolkit 范围扩大、步骤序号 1-based、env-capability-discovery 与 ensure-tests 与 node-version-discipline 转强依赖（共 12 个）、阶段8 更名「复盘改进」（别名「回顾总结」）、solve 家族批 1 契约同步 + review 修复。提交史见 `git log --oneline 357d7c2..e45a63e`。
- **opsx 变更已归档**：`openspec/changes/archive/2026-07-18-sync-solve-workflow-optimizations/`（proposal/specs/design/tasks）；主 specs 已同步（`openspec/specs/workflow-contract-sync/spec.md` 新增、`openspec/specs/env-capability-discovery/spec.md` 弱引用语义修订）。
- **本地安装已同步**：`~/.agents/skills` 已是新版（此前会话反复出现「加载旧版文本」错位，已消除）。
- **skill-creator 回溯评估产物**：`skills/solve-workflow-workspace/`（iteration-1 新旧对照报告 6 份 + benchmark + grading + `eval_set.json`）——行为抽查新版 100% vs 旧版 78%；触发率修正版实测 13/20（结论：description 不改，竞争失败多为合理路由）。

## 2. 待办（按建议优先级）

1. **批 2（主体遗留）**：
   - opsx-solve-workflow 八阶段拆分（1.1/1.2 小节 → 独立阶段，对照 solve-workflow 已完成的模式）
   - 镜像小数序号统一：jira-fix-workflow 阶段 0/1.5/2.5/3.5、opsx-jira-fix-workflow 阶段 0/6.4/7.1/7.2、opsx-solve-workflow 步骤 1.5/3.6 + openspec 原生 skill 阶段映射表编号
   - 注意：jira 的阶段 0/1.5/2.5 有域语义，重排需逐一决策（见归档 design.md「Non-Goals」）
2. **solve-workflow 543 行披露外迁**：Red Flags / 常见错误表 → `reference.md`（<500 理想线，skill-creator 审计发现）
3. **小项**：可选 description 路由边界句（「单点复盘/审查/调试请求由对应专家 skill 承接」）；核查 `AGENTS.md:64` jira 行 `git-commit、jira-read` 与 frontmatter 不一致（存量）

## 3. 关键规则与环境须知（吃过亏的地方）

- **铁律**：仓库根 `AGENTS.md` 必读。要点：大幅重写 skill 走 `/skill-creator`；行为契约变更走 `/opsx-solve-workflow` 沉淀；禁手动改版本号（CI 递增）；禁直推 main；commit 前缀 feat/fix/docs/chore；合并用 `--merge`。
- **发布流程**：`gh pr merge <N> --merge` → 等 ~25s 看 `gh release list` → `SKILLS_CLONE_TIMEOUT_MS=600000 npx skills add FuDesign2008/open-skills -g --skill '*' --yes`（裸超时曾失败一次，需加大超时）→ `git checkout main && git pull`。
- **依赖升级的联动点**（漏过两次，均被 review 抓到）：frontmatter + 强依赖清单 + 前置检查计数（注意「共 N 个/对 N 个/核对 N 个」多处的表述差异）+ reference.md 缺失提示 + AGENTS.md 清单表 + 被依赖方登记行（如 node-version-discipline 的 Hard/Soft-referencers）。收尾必跑计数 grep（见 AGENTS.md「验证命令」新增条目）。
- **skill-creator 的 `run_loop` 在本机失效**：其探针命令文件名带 uuid 后缀，而本机 `claude` shim 会加载全部全局 skill，模型按真实名调用 → 探针永不命中（测量全 0%）。修正方法见 `skills/solve-workflow-workspace/` 下 iteration-1 与 `/tmp/trig-test/run_eval_fixed.py` 的思路（探针名=真实名、解析 assistant 消息的 Skill 调用）。本机 shim 后端是 glm-5.2，不是 Claude。
- **非 TTY 环境**：`git rebase --continue` 会唤起 Vim 卡死，用 `git -c core.editor=true rebase --continue`。
- **混合工作区别用 `git add .`**（曾把 openspec artifacts 误带入别的 PR 分支，靠 add+remove 抵消才清干净）。
- **工具编辑约束**：同文件多处编辑只能逐轮进行（每轮每文件 1 个 Edit）；结构性大改可整文件 Write，但之后必须做删除侧 diff 逐行核对（AGENTS.md「验证命令」已收录该纪律）。

## 4. Suggested skills（接手时按需唤起）

- **`opsx-solve-workflow`** — 批 2 是行为契约变更，走 opsx 沉淀（触发：「opsx解决」「规范化解决」）
- **`solve-workflow`** — 常规八阶段驱动（触发：「分析问题」「探索方案」等阶段名；现为 12 强依赖）
- **`skill-creator`** — 若做 543 行外迁等结构性重写（触发：「优化这个 skill」）
- **`solution-review` / `code-design-review`** — 方案与设计审查（solve-workflow 阶段 4 自动加载）
- **`review`** — 合并前双轴 review（本 PR 曾用它抓到 6 处问题）
- **`learn-and-improve`** — 每轮收尾复盘沉淀（触发：「复盘改进」「回顾总结」）
- **`git-commit`** — 提交规范（触发：「提交代码」）

## 5. 快速启动建议

```bash
git status && git log --oneline -3          # 应在 main，e45a63e
gh pr list && gh release list -L 1           # 应无 open PR，v1.75.0
cat openspec/changes/archive/2026-07-18-sync-solve-workflow-optimizations/design.md  # 批2 边界
```

从「批 2」开始时，建议以 `opsx-solve-workflow` 走完整门禁（工程根即本仓库，`.claude/skills/` 原生 OPSX skills 齐备）。
