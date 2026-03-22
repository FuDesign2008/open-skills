# Skills 开发规范

每个 skill = 一个子目录 + `SKILL.md` 文件。各 skill **版本号以对应 `SKILL.md` frontmatter 为准**；全表见仓库根目录运行 `node scripts/gen-skill-docs.mjs` 生成的 `docs/generated/skills-index.md`。

## 目录结构

```
skills/
├── coding-fangirl/          # 情绪陪伴；含 context.json 供 Hook 使用；多模式在 modes/
│   ├── SKILL.md
│   ├── context.json
│   └── modes/               # _index.json + 各模式 *.md（可扩展）
├── solve-workflow/
├── perf-workflow/
├── frontend-perf/           # 含 reference.md（前端性能参考资料）
│   ├── SKILL.md
│   └── reference.md
├── chinese-format/
├── android-webview-debug/
├── git-commit/
├── jira-fix-workflow/
├── jira-read/
├── typescript-check/
├── file-operation-fallback/
└── article-writer/
```

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
| 工具 | file-operation-fallback | Write/StrReplace 失败时自动降级到 Shell 命令 |

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
