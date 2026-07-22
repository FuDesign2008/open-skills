# Design: enhance-browser-skills-via-web-access

## Context

`effective-web-research` 与 `browser-debug-toolkit` 缺真实浏览器操控能力。外部 plugin `web-access`（eze-is/web-access）提供 CDP Proxy 直连用户日常浏览器（带登录态）+ HTTP API + 浏览哲学。本变更换个轻量路线让两个 skill 利用 web-access——区别于已 close 的 `add-browser-access-skill` 融合方案（移植脚本+新建内部 skill），本方案不移植、不新建，纯委托。

## Goals / Non-Goals

**Goals**
- effective-web-research 获得 CDP 升级逃生出口（静态层失效→带登录态真实浏览器）
- browser-debug-toolkit 把 web-access CDP Proxy 作为 chrome-devtools-mcp 的并列操控手段（表内纳入）
- 复用外部 web-access 的成熟能力，不在 open-skills 内重复实现

**Non-Goals**
- 不新建 open-skills 内部 skill、不移植 web-access 脚本
- 不让核心调研纪律 / 调试决策依赖 web-access（仅 CDP 路径依赖）
- 不声明 frontmatter `dependencies`（不向上传染 solve-workflow 等）

## Decisions

### Decision 1: 运行时局部强依赖（不声明 frontmatter dependencies）
AGENTS.md 规定"声明 dependencies 即启动前置检查 + 缺失中止"。这会拖累核心能力（只想查个 API 文档也要 web-access）并向上传染 solve-workflow。故 frontmatter 不声明，改为"需 CDP 时运行时检查 web-access、缺失中止+提示安装"。核心能力独立，符合用户选定的粒度。

### Decision 2: 委托外部 web-access，不移植不新建
脚本随上游迭代（v2.5.3），移植=分叉维护负担；新建内部 skill=重复实现。直接委托 web-access skill 执行 CDP 操控，open-skills 只写"何时升级 + 如何委托"的指引。

### Decision 3: browser-debug-toolkit 决策表表内纳入 CDP Proxy
前次 review（close 的 PR）指出"CDP Proxy 只在表外小节、未进 Scene→Tool 表"是 spec 部分实现。本次显式在表内加 CDP Proxy 列。

### Decision 4: 正文英文 + 正向描述（遵循最新 AGENTS.md）
铁律 3（正文英文）+ 检查清单 7（正向描述不堆反例）/ 8（无版本标记）/ 9（SKILL.md 摘要≠reference 重复）。description 单行双引号。

## Risks / Trade-offs

| 风险 | 等级 | 缓解 |
|------|------|------|
| open-skills CDP 能力依赖外部 plugin 活跃度 | 中 | web-access 活跃(v2.5.3)；运行时局部，核心不依赖 |
| 双源安装（open-skills + web-access 不同源） | 低 | 仅 CDP 路径运行时提示安装，非启动即暴露 |
| 用户不知需装 web-access | 低 | Escalation 小节 + reference 明确标注来源 + 安装方式 |

## Migration Plan

1. 改 `skills/effective-web-research/SKILL.md`（description + Step 0 行 + Escalation 小节，英文）+ `reference.md`（CDP 决策树 + API 速查）
2. 改 `skills/browser-debug-toolkit/SKILL.md`（version + description + 决策表 CDP 列 + 对比节，英文）+ 新建 `reference.md`
3. 重生成 `docs/generated/skills-index.md` + 登记 `RELEASE-NOTES.md`
4. 自查：frontmatter YAML 合规、正文英文、正向描述、无版本标记、SKILL.md/reference 不重复

## Open Questions

无（粒度已定、工程约定已对齐）。
