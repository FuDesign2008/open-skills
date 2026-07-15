# Skill 分发约定

> 本仓库的 skill 分两类：**分发 skill**（供他人 `npx skills add` 安装）与**工程级 skill**（仅本仓库自用，不应被分发）。

## skill 分类

| 类别 | 路径 | 用途 | 是否分发 |
|------|------|------|---------|
| 分发 skill | `skills/*` | 通用工作流（solve-workflow、code-design-review、perf-workflow 等） | ✅ 是 |
| 工程级 skill | `.claude/skills/openspec-*` | open-skills 仓库自身的 openspec 工作流配置 | ❌ 否 |

## 为什么 openspec-* 不分发

`.claude/skills/openspec-*` 与 `openspec/` 目录是 **open-skills 仓库运行 `openspec init` 的产物**——即本仓库用 [openspec](https://github.com/Fission-AI/openspec) 方法论管理自身演进时的工程级配置。它们绑定本仓库的 `openspec/specs/`、`openspec/changes/` 数据，属于工程级 skill，对其他项目无意义。

openspec 官方设计即「CLI 全局 + skill 工程级」：

- **CLI**：`npm install -g @fission-ai/openspec`（全局，跨项目）
- **skill**：`openspec init` 在各项目内生成 `.claude/skills/openspec-*`（工程级，绑定该项目数据）

因此，他人若想使用 openspec，正确姿势是全局装 CLI + 在自己项目里 `openspec init`，**而不是**从本仓库 `npx skills add` 把 openspec skill 装到全局。

## 如何让 `npx skills add` 不把 openspec-* 列为候选

`npx skills add`（[vercel-labs/skills](https://github.com/vercel-labs/skills)）默认会扫描 `.claude/skills/`（它的 well-known 目录之一）。我们用其内置的 **internal 机制**把 openspec-* 从分发候选剔除——在 `SKILL.md` frontmatter 标记：

```yaml
metadata:
  internal: true
```

vercel-labs/skills 的 `discoverSkills` 默认排除 `metadata.internal === true` 的 skill（见其 `src/skills.ts` 的 `parseSkillMd`）。

> 该标记对 Claude Code 本地加载**透明**（Claude Code 忽略未识别的 frontmatter 字段），仓库内 `/opsx` 工作流与 openspec skill 的自动触发不受影响。

## 已知边界：`--all` 仍会安装 internal skill

`npx skills add <repo> --all` 会展开为 `--skill '*'`，触发 `includeInternal=true`，因此**会**安装 internal skill。

这是 vercel-labs/skills 的设计（`--all` 语义即「全装」），无法靠 `internal` 标记阻止。彻底阻止须把 openspec-* 移出 `.claude/skills/`，但这会破坏 `/opsx` 命令的 Skill tool 调用（按 skill 名查找），**不推荐**。

> **请勿对本仓库使用 `--all`**——它会把工程级的 openspec 配置误装到你的全局，且无实际用处（你的项目没有对应的 `openspec/` 数据）。

## 维护：`openspec update` 后需重新标记

⚠️ `openspec update` 会重新生成 SKILL.md，**冲掉 `internal: true` 标记**。

每次在 open-skills 仓库升级 openspec 并运行 `openspec update` 后，请重跑：

```bash
npm run mark:openspec-internal
# 或等价：node scripts/mark-openspec-internal.mjs
```

该脚本幂等，扫描所有 `.claude/skills/openspec-*/SKILL.md`，补回缺失的 `internal: true`。

### CI / git hook 校验

脚本支持 `--check` 模式：仅检查不写回，存在缺失则退出码 1，便于接入 CI 或 git hook 防止遗漏：

```bash
node scripts/mark-openspec-internal.mjs --check
```

## 参考

- [vercel-labs/skills](https://github.com/vercel-labs/skills) — `npx skills` CLI，候选发现与 internal 过滤逻辑见 `src/skills.ts`
- [Fission-AI/openspec](https://github.com/Fission-AI/openspec) — spec-driven development 工具
