# Tasks: add-ai-env-verification

## 1. 新建 runtime-verification-discipline skill

- [x] 1.1 经 `skill-creator` 工作流创建 `skills/runtime-verification-discipline/SKILL.md`：frontmatter（name=runtime-verification-discipline、version、user-invocable: false、description 含中文触发词且 ≤1024 字符）+ 英文正文落实 8 条契约要求（环境分层 / 选层规则 / 提供者解析 / attempt-first+A/B/C / 充分性 / 诚实标注 / 正交边界 / 集成指南）。零 frontmatter dependencies。
- [x] 1.2 创建 `skills/runtime-verification-discipline/reference.md`：环境分层展开示例、提供者解析（工程自带可发现约定 → 本工程能力 → 交还）示例、4 个 host 的集成片段。
- [x] 1.3 校验新 skill：`npm run lint:skill-description`（≤1024）、frontmatter YAML 合法（description 单行双引号，不用 `|` 块标量）、`node scripts/lint-skill-deidentification.mjs --staged` 脱敏通过。

## 2. 4 个 host 集成（薄引用 + dependencies）

- [x] 2.1 `skills/solve-workflow/SKILL.md`：frontmatter `dependencies` 增加 `runtime-verification-discipline`；Stage 7「Running tests」段（约 L304/309）的「AI cannot execute → tell the user」二分改为「验证执行遵循 runtime-verification-discipline」薄引用。
- [x] 2.2 `skills/opsx-solve-workflow/SKILL.md`：frontmatter `dependencies` 增加；Stage 7「Test execution」段（约 L299/302）同款二分改为薄引用。
- [x] 2.3 `skills/jira-fix-workflow/SKILL.md`：frontmatter `dependencies` 增加；Stage 8（约 L207-209）新增对 runtime-verification-discipline 的引用。
- [x] 2.4 `skills/opsx-jira-fix-workflow/SKILL.md`：frontmatter `dependencies` 增加；验证环节「manual-verification items」措辞（约 L361 及 reference.md:26,42）对齐为「默认 AI 环境验证，仅真硬边界列人工项」。
- [x] 2.5 4 个 host 的 reference.md 检查：验证模板用「executed/pending (manual)」状态标签，与新纪律兼容（C 类硬边界交还的诚实输出即 pending/manual），未把交还人表述为默认 → 按薄引用纪律**无需改动**，已在执行报告留痕。

## 3. 正交互注与登记

- [x] 3.1 `skills/completion-evidence-discipline/SKILL.md`：Integration guide 加一句——与 `runtime-verification-discipline` 正交（新鲜度 × 环境/执行者），一条 pass claim 需两轴都过。
- [x] 3.2 `AGENTS.md`「Skill 清单」表：登记 `runtime-verification-discipline`（类别=工作流纪律；依赖=无；被 4 个 host 强依赖）。
- [x] 3.3 运行 `node scripts/gen-skill-docs.mjs` 重生 `docs/generated/skills-index.md`（或交由 pre-commit 自动处理）。

## 4. 验证

- [x] 4.1 `openspec validate add-ai-env-verification` 通过。
- [x] 4.2 `npm run lint:skill-description` 与脱敏通过（新文件无内部标识符；description 曾 1035 超限，已压缩至 ≤950）。
- [x] 4.3 残留 grep：4 个 host 的「AI cannot execute → tell the user」二分零命中（已全部替换为薄引用）。
