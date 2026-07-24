## Why

合并纪律规则（覆盖率门控 + tip 钉死）分散在三个同源工作流的 reference.md（~60 行/处逐字同步 = ~180 行重复）+ SKILL.md 合并章节。缺少单一事实源导致：三处同步维护负担重、三个 SKILL.md 超 500 行理想线（688/640/986）、本次 tip 钉死若再内联三处会加剧膨胀。抽取为独立横切 skill 可一举消除 ~270 行重复，让工作流回归轻盈。

## What Changes

- **新增** skill `merge-discipline`：承载完整合并纪律（覆盖率门控步骤 + tip 钉死 4 步 + 命令模板 + 判定矩阵 + 双策略降级），单一事实源
- **新增**三个工作流（opsx-jira-fix-workflow / opsx-solve-workflow / jira-fix-workflow）frontmatter `dependencies` 声明 `merge-discipline` 为强依赖
- **精简**三处 reference.md：「合并前覆盖率门控（强制）规范」整段（~60 行）替换为合并前快查表（progressive disclosure 轻量层，~15 行）
- **精简**三处 SKILL.md 合并章节：门控 + tip 钉死的完整规则委托 merge-discipline skill，SKILL 只留顺序约束 + 指针 + 关键 Red Flag
- 保留 progressive disclosure 两层：reference 留快查表（合并前自检），skill 留全量规范（执行时加载）

## Capabilities

### New Capabilities

- `merge-discipline`: 合并纪律横切契约——合并动作（glab/gh mr/pr merge）执行前必须加载，覆盖覆盖率门控触发判定 + tip 钉死 4 步（钉死 revision / Pipeline succeeded 语义 / 合入后祖先校验 / 双策略降级）+ 命令模板 + 失败处理。被三个工作流 frontmatter dependencies 强依赖。

### Modified Capabilities

（无——三个工作流的合并章节委托给 merge-discipline 是实现层变更，捕获在 design.md；无 spec 级 requirement 变更）

## Impact

- **新增文件**：`skills/merge-discipline/SKILL.md`（~100 行，含 frontmatter + 完整规范）
- **修改文件**：
  - `skills/opsx-jira-fix-workflow/SKILL.md`（frontmatter dependencies +12 → 含 merge-discipline；合并章节 8.3 指针化）
  - `skills/opsx-solve-workflow/SKILL.md`（同上，dependencies +1）
  - `skills/jira-fix-workflow/SKILL.md`（同上，阶段 10 步骤 2.1 指针化）
  - `skills/opsx-jira-fix-workflow/reference.md`（门控规范段 ~60 行 → 快查表 ~15 行）
  - `skills/opsx-solve-workflow/reference.md`（同上）
  - `skills/jira-fix-workflow/reference.md`（同上）
  - `docs/generated/skills-index.md`（gen-skill-docs 自动重生成）
- **无 breaking change**：规则语义不变（门控 + tip 钉死），仅承载位置从三处内联迁移到单一 skill + 三处快查表指针
- **三工作流前置检查更新**：dependencies 数量 +1，核对列表加 merge-discipline
