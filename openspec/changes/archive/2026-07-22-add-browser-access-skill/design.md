# Design: add-browser-access-skill

## Context

open-skills 仓库的 `effective-web-research` 与 `browser-debug-toolkit` 缺乏真实浏览器操控能力（前者只有静态层 WebSearch/WebFetch/curl + 可信度纪律；后者偏调试、依赖外部 chrome-devtools-mcp）。外部 plugin `eze-is/web-access` v2.5.3（MIT）提供了成熟的 CDP Proxy 浏览器操控能力。本变更把 web-access 的技术与能力**融合进 open-skills**，让两个目标 skill 自身变强。

## Goals / Non-Goals

**Goals**
- 让 `effective-web-research` 能处理动态/登录/反爬内容（CDP 升级逃生出口）
- 让 `browser-debug-toolkit` 把 CDP Proxy 作为 chrome-devtools-mcp 的并列实时操控手段
- open-skills 自包含：不运行时依赖外部 plugin

**Non-Goals**
- 不把两个目标 skill 改成同质化的通用联网 skill（保持各自定位：调研纪律 / 调试决策）
- 不把 web-access 的全部内容复制成第二个通用 skill（browser-access 只承载浏览器操控底座，不含可信度纪律）
- 不改动 solve-workflow 等上游 workflow 的 dependencies（传递依赖自然解析到仓库内 browser-access）

## Decisions

### Decision 1: 新增 open-skills 内部公共 skill `browser-access` 承载移植脚本

不复制脚本进两个 skill（双份维护、违反 DRY），不放仓库根 scripts/ 共享（破坏 skill 自包含分发），而是新增 `skills/browser-access/` 公共 skill 承载全部移植脚本 + 通用 CDP 方法论，两个目标 skill 通过 `dependencies` 强依赖它。

### Decision 2: 强依赖而非软委托

用户明确选择"强依赖以达到最佳效果"。`effective-web-research` 与 `browser-debug-toolkit` 的 frontmatter 加 `dependencies: [browser-access]`。因为 `browser-access` 是 open-skills **内部** skill（随仓库安装），强依赖不会向 solve-workflow 等上游引入外部 plugin 传染——这正是"融合进 open-skills"相对"强依赖外部 web-access"的核心优势（阶段 3 审查的 R1 外部传染 / R2 双源安装风险被彻底消除）。

### Decision 3: 脚本原样移植，最小分叉

5 个脚本（1315 行）原样 `cp`，只改 `config.env.template` 注释里的 skill 名字符串；不改逻辑、不改环境变量名（`WEB_ACCESS_BROWSER` 保留，避免波及 browser-discovery.mjs）。降低与上游的分叉面积，便于将来 rebase。

### Decision 4: 知识层内化 + 本职化用法

两个目标 skill 各自在 SKILL.md 内化浏览哲学要点与升级阶梯（不空洞指向 browser-access），并按本职定位差异化：effective-web-research 写"调研向 CDP 升级"，browser-debug-toolkit 写"调试向 CDP Proxy vs chrome-devtools-mcp"。browser-access 持有完整方法论文档。

### Decision 5: capability 首次纳入 openspec 用 ADDED

`effective-web-research` 和 `browser-debug-toolkit` 此前不在 `openspec/specs/`，本 delta 用 `## ADDED Requirements` 为其首次建立行为契约（不用 MODIFIED，因主 specs 无对应 requirement）。

## Risks / Trade-offs

| 风险 | 等级 | 缓解 |
|------|------|------|
| 移植脚本与上游 web-access 分叉，需长期维护 | 中 | SKILL.md 顶部标注来源+版本+移植日期；必要时从上游 rebase |
| MIT 版权声明遗漏 | 低 | SKILL.md 顶部集中声明 web-access 版权与来源（脚本头部上游本无版权注释，集中声明已满足 MIT 要求） |
| `browser-debug-toolkit` 强依赖传递到 solve-workflow | 低 | 已验证：传递依赖指向仓库内 browser-access，随仓库安装，无外部传染 |
| 站点经验库起步为空 | 低 | `references/site-patterns/` 留 .gitkeep，使用中积累 |

## Migration Plan

1. 新增 `skills/browser-access/`（脚本 + SKILL.md + templates + references + .gitignore）
2. 改 `skills/effective-web-research/SKILL.md` + `reference.md`
3. 改 `skills/browser-debug-toolkit/SKILL.md` + 新建 `reference.md`
4. 登记 `RELEASE-NOTES.md` / `README.md` / `README.zh-CN.md`
5. `node --check` 所有移植脚本；核对 frontmatter

无运行时迁移：browser-access 是新增 skill，不改既有 skill 的既有行为契约（effective-web-research / browser-debug-toolkit 只做能力追加）。

## Open Questions

- 是否需要把 browser-access 的脚本改动回流上游 `eze-is/web-access`？当前决定：不主动回流，保持本仓库独立分叉，除非上游主动同步。
