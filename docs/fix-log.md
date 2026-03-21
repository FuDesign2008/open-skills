# 修复与变更记录

## 2026-03-21：文档 A+B+C（单一事实源、精简 README、自动生成索引）

**状态**：已修复

**修复方式**：新增 `scripts/gen-skill-docs.mjs` 从 `skills/*/SKILL.md` 生成 `docs/generated/skills-index.md`；新增 CI `.github/workflows/docs-skills-verify.yml`（变更 skills 或脚本时校验生成物与仓库一致）；精简 `README.md`（决策树、稳定锚点、链向索引与 `docs/README.md`）；重写 `docs/INSTALL.md` 开篇分工与 npx 表格（不再写死「7 个」）；`AGENTS.md` / `skills/AGENTS.md` 以生成索引为权威枚举、本地表保留类别与依赖并补全 `article-writer`。

**验证场景列表**：

**场景 1** — 本地生成与一致性

1. 在仓库根目录执行 `node scripts/gen-skill-docs.mjs`。
2. 执行 `git diff --exit-code docs/generated/skills-index.md`（无未提交改动时应退出码 0）。

**预期结果**：`docs/generated/skills-index.md` 含 12 行 skill 数据且与 `SKILL.md` frontmatter 一致。

**场景 2** — 新用户读文档

1. 打开 `README.md`，跟随「怎么装」与链接。
2. 打开 `docs/generated/skills-index.md` 查看完整 skill 列表。

**预期结果**：徽章与列表数量一致；INSTALL 与 README 职责可读清。

---

## 2026-03-21：solve-workflow 1.1 放宽「锚定只读」澄清问题

**状态**：已修复

**修复方式**：在 `skills/solve-workflow/SKILL.md` 中放宽阶段 1.1：允许在用户已提供路径/`@`/符号等 **锚点** 下做 **窄范围** Read/Grep 以澄清需求与范围；仍禁止无锚点漫游、1.1 输出写根因；门控「增强能力」与 Red Flags、阶段 1「禁止」条款与之对齐。版本 `1.7.1` → `1.7.2`。

**验证场景列表**：

**场景 1** — 用户 `@` 某文件并描述模糊需求

1. 模型处于阶段 1.1，仅读取该文件及相关锚定路径。
2. 输出为澄清问题与待确认项，不展开根因链。

**预期结果**：可借助只读代码把问题问清楚，根因与存在性仍在 1.2 系统完成。

---

## 2026-03-21：solve-workflow 阶段 2 补回精简版方案输出格式

**状态**：已修复

**修复方式**：在 `skills/solve-workflow/SKILL.md` 中于「阶段 2：探索方案」下补充「双对比表（首/尾同构）+ 中间展开 + 推荐度星级刻度」的极简规范；版本 `1.7.0` → `1.7.1`。PR #62 精简后丢失的「开头/结尾表格」与「推荐度」语义被收回，篇幅控制在数行规则内。

**验证场景列表**：

**场景 1** — 手动触发 solve-workflow 并进入「探索方案」

1. 打开 `skills/solve-workflow/SKILL.md`，阅读「阶段 2」小节。
2. 确认含：输出顺序 ①表→②展开→③同表；表头含「推荐度」；星级五档说明；微任务可缩列但保留推荐度且首尾表一致。

**预期结果**：模型按该段执行时，会在阶段 2 先给对比表、展开后再给同结构表，并以星级表达推荐强弱。
