# Skills 开发规范

每个 skill = 一个子目录 + `SKILL.md` 文件。各 skill **版本号以对应 `SKILL.md` frontmatter 为准**；全表见仓库根目录运行 `node scripts/gen-skill-docs.mjs` 生成的 `docs/generated/skills-index.md`。

## 目录结构

```
skills/
├── coding-fangirl/          # 情绪陪伴；含 context.json 供 Hook 使用；多模式在 modes/
│   ├── SKILL.md
│   ├── context.json
│   └── modes/               # _index.json + 各模式 *.md（可扩展）
├── solve-workflow/          # orchestrator（user-invocable: true）
│   ├── SKILL.md
│   └── reference.md         # 常见错误等参考资料
├── solve-analyze/           # 子 skill：阶段1.2 技术分析（user-invocable: false）
├── solve-plan/              # 子 skill：阶段3 方案审查（user-invocable: false）
├── solve-finish/            # 子 skill：阶段5+6+7 执行/验证/总结（user-invocable: false）
├── perf-workflow/
├── frontend-perf/           # 含 reference.md（前端性能参考资料）
│   ├── SKILL.md
│   └── reference.md
├── chinese-format/
├── android-webview-debug/
├── git-commit/
├── jira-fix-workflow/       # orchestrator（user-invocable: true）
│   ├── SKILL.md
│   └── reference.md         # 状态目录、state.json schema、常见错误等参考资料
├── jira-fix-analyze/        # 子 skill：阶段2 根因分析（user-invocable: false）
├── jira-fix-plan/           # 子 skill：阶段3+4 方案审查+计划制定（user-invocable: false）
├── jira-fix-execute/        # 子 skill：阶段5+6 执行+验证（user-invocable: false）
├── jira-fix-submit/         # 子 skill：阶段7+8 提交+合并（user-invocable: false）
├── jira-read/
├── typescript-check/
└── article-writer/
```

## 子 skill 约定

`user-invocable: false` 的子 skill 遵循以下规则：

### 命名规范

- 格式：`{parent-skill}-{stage-name}`
- 示例：`jira-fix-analyze`（jira-fix-workflow 的阶段2子 skill）、`solve-plan`（solve-workflow 的阶段3子 skill）

### 使用方式

子 skill 只能由 orchestrator 通过 Skill 工具调用，**禁止用户直接触发**：

- **Claude Code / OpenCode**：orchestrator 使用 `Skill` 工具加载子 skill，完整执行其内容
- **Cursor 等平台**：orchestrator 读取子 skill 的 `SKILL.md` 完整内容并遵照执行

### 文件规范

- 每个子 skill 目录只包含 `SKILL.md`（无其他配置文件）
- frontmatter 必须设置 `user-invocable: false`
- frontmatter `description` 说明「由哪个 skill 的哪个阶段调用」及「禁止独立调用」
- 文件开头必须有醒目提示：「本 skill 由 `{parent}` 在**阶段X**调用，请勿独立使用」
- 文件结尾必须说明完成后如何返回 orchestrator 继续执行

## 分类与依赖

| 类别 | Skills | 说明 |
|------|--------|------|
| 情绪陪伴 | coding-fangirl | 核心 skill，被三个 Hook 引用，有专属 context.json |
| 工作流 | solve-workflow, perf-workflow | 多阶段流程，有严格阶段边界 |
| 知识库 | frontend-perf | **依赖 perf-workflow**，为其提供前端领域专属数据 |
| 格式规范 | chinese-format | 自动触发，无需用户主动调用 |
| 内容创作 | article-writer | 公众号 / 知乎等技术文章流程 |
| 工具 | android-webview-debug | enable/revert 双模式，带修改记录和回滚 |
| Git | git-commit | 统一入口，默认自动执行，含多项目检测与错误处理 |
| Jira | jira-fix-workflow | 默认自动模式；`--manual` 进手动确认模式；含规则制难度分级（极难自动终止）；批量场景可在外部编排工具中自行接入（非本仓库内置命令） |
| Jira | jira-read | 本地缓存优先，支持 mcp-atlassian API 降级；需配置 `$JIRA_CACHE_DIR` |
| 工具 | typescript-check | TypeScript 类型错误检查流程 |

## SKILL.md 必须包含

```yaml
---
name: kebab-case-name       # 必须与目录名一致
version: "X.Y.Z"            # 语义化版本
user-invocable: true|false   # false 表示仅被其他 skill 调用
description: |               # 必须包含所有触发词
  触发条件说明。当用户说"触发词1"、"触发词2"时触发。
---
```

## 触发词规则

- 在 `description` 中列出所有触发词
- 支持两种形式："触发词" 或 "触发词：具体描述"
- 冒号中英文均可，空格可有可无
- 工作流 skill 的阶段名即为触发词（如"分析问题"触发 solve-workflow 的阶段 1）

## 新增 Skill 检查清单

1. 目录名 kebab-case
2. `SKILL.md` frontmatter 完整（name、version、description 含触发词）
3. 如需命令入口 → 在 `commands/` 添加对应 `.md`
4. 如需 Hook 触发 → 在 `hooks/hooks.json` 添加配置
5. 如需 OpenCode 支持 → 在 `.opencode/plugins/` 或 `.opencode/plugin/` 添加 JS/TS 代码
6. 在仓库根目录执行 `node scripts/gen-skill-docs.mjs`，将更新后的 `docs/generated/skills-index.md` 一并提交

## 反模式

- ❌ SKILL.md 缺少 frontmatter 或 description 不含触发词
- ❌ `user-invocable: false` 但无其他 skill 引用它
- ❌ 目录名与 frontmatter `name` 不一致
- ❌ 工作流 skill 跳过阶段（分析阶段禁止 Edit/Write）
- ❌ 支持文件（如 reference.md）未在 SKILL.md 中引用
