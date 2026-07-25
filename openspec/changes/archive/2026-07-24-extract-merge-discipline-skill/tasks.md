## Implementation Tasks

### 新建 merge-discipline skill

- [x] 1.1 创建 `skills/merge-discipline/SKILL.md`（frontmatter: name/version/user-invocable: true/description 含中文触发词；正文: 定位 + 触发场景 + 覆盖率门控步骤 + tip 钉死 4 步 + 命令模板 + 判定矩阵 + 双策略 + Integration guide）
- [x] 1.2 验证 frontmatter（gen-skill-docs 解析通过 + 索引收录）

### opsx-jira-fix-workflow 整合

- [x] 2.1 frontmatter `dependencies` 加 `merge-tip-discipline`（11→12）+ 强依赖说明列表加一行
- [x] 2.2 「前置 skill 检查」dependencies 数量 11→12 + 核对规则更新
- [x] 2.3 SKILL.md 顺序约束行加 tip 钉死环节 + 判定矩阵概要对齐（达标→继续 tip 钉死与合并）
- [x] 2.4 SKILL.md 合并章节补指针段（顺序约束 → 门控 → 加载 merge-discipline → 合并）
- [x] 2.5 reference.md 门控规范段（~60 行）替换为合并前快查表（~15 行，门控 5 项 + tip 钉死 3 项指针式）

### opsx-solve-workflow 整合

- [x] 3.1 frontmatter `dependencies` 加 `merge-discipline`（12→13）+ 强依赖说明列表加一行
- [x] 3.2 「前置 skill 检查」dependencies 数量 12→13 + 核对规则更新
- [x] 3.3 SKILL.md 顺序约束行加 tip 钉死环节 + 判定矩阵概要对齐
- [x] 3.4 SKILL.md 阶段 8 合并章节补指针段
- [x] 3.5 reference.md 门控规范段替换为合并前快查表

### jira-fix-workflow 整合

- [x] 4.1 frontmatter `dependencies` 加 `merge-discipline`（11→12）+ 强依赖说明列表加一行
- [x] 4.2 「前置 skill 检查」dependencies 数量 11→12 + 核对规则更新
- [x] 4.3 SKILL.md 阶段 10 步骤 2.1 补指针段（步骤 2.1.1 指向 merge-discipline）
- [x] 4.4 reference.md 门控规范段替换为合并前快查表

### 验证

- [x] 5.1 `openspec validate extract-merge-discipline-skill` 通过
- [x] 5.2 `node scripts/gen-skill-docs.mjs` 通过 + 索引含 merge-discipline
- [x] 5.3 grep 三处一致：dependencies 含 merge-discipline / 顺序约束含 tip 钉死 / 检查清单指针式
- [x] 5.4 git diff --stat 确认改动范围（1 新 skill + 6 修改文件 + 索引）
