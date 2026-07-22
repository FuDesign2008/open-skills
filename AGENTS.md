# PROJECT KNOWLEDGE BASE

## AI 铁律

1. **人与 AI 要实事求是、相互信任、精诚合作** — 人如实描述问题与约束，AI 如实报告发现与局限；双方基于事实共同决策，不猜测、不迎合、不隐瞒。
2. **数据脱敏** — Skill 中不得包含任何内部平台名称、内部域名、内部项目标识等非公开信息。示例和模板必须使用通用占位（如 `example.com`、`my-project`），不使用真实内部信息。提交前自查：URL、平台名、项目名、路径段、Jira ID、commit SHA 是否暴露内部信息。
 3. **Skill 正文用英文书写，触发词必须包含中文** — Skill body（正文、reference.md、description 中的说明文字）是给 LLM 读的指令，英文书写可获得更高的理解精度与执行准确度（主流 LLM 的训练语料以英文为主）；同时英文 skill 面向全球用户，传播面更广。**触发词必须包含中文**——用户以自然语言唤起 skill，中文用户说中文（如「提交代码」「分析问题」），因此即使 skill 正文全英文，description 和 Triggers 区段也必须列出中文触发词，可同时附带英文等价词（如 `「提交代码」 / "commit code"`）。中文专属 skill（如 `article-writer`）为整体例外，正文也用中文。新增 skill 适用此规则；存量中文 skill 在重构时逐步迁移，不做一次性批量翻译。
4. **创建 Skill 必须走 `/skill-creator` 工作流** — 新建 skill 或大幅重写已有 skill 时，先 `/skill-creator` 唤起 skill-creator（捕获意图 → 写草稿 → 测试用例 → 评估迭代 → 描述优化），而非凭经验直接手写 `SKILL.md`。skill-creator 提供渐进式披露（SKILL.md <500 行 + reference 详表）、frontmatter 规范、触发词 eval 优化等工程化约束，能显著提升触发准确率与执行质量。仅在以下情况可跳过完整流程直接编辑：① skill 内容极简（纯指令、无测试需求）；② 维护已有 skill 的小修小补（改触发词、修正文）。
5. **Skill 变更走 `/opsx-solve-workflow` 沉淀** — 新增、改进或修复 skill 时，用 `/opsx-solve-workflow` 将需求、根因、行为变化、方案、计划、验证与归档沉淀到 `openspec/` artifacts（proposal/specs/design/tasks，归档后并入主 `specs/`），形成可追溯的行为契约。临时小修（改触发词、修正文）可直接编辑；涉及行为契约、多人评审或需长期追溯的变更走 opsx 规范化沉淀。skill 的写作质量仍遵循铁律 4（skill-creator）；opsx 管「做什么、为什么、归档」，skill-creator 管「怎么写得准」，两者互补。
6. **Skill 正文描述意图，让 Agent 自选工具（平台无关）** — Skill 跨平台运行（Claude Code / Cursor / OpenCode 等），正文不得把某平台专属工具（如 Claude Code 的 `AskUserQuestion`、某平台专属 MCP/CLI）作为必需或首选，**也不得枚举「X 平台用 A 工具，Y 平台用 B」**——枚举仍是硬编码，且武断假设其他平台只有兜底能力。正确做法：**描述「要达成什么」（意图，如「结构化单选提问」），由运行该 skill 的 Agent 用其原生能力实现**；无对应能力时退回通用格式（如 prose）。提交前自查：正文是否硬编码了平台/工具枚举。

---

本文件为 Claude Code 等 AI 在本仓库工作时的项目知识库。**文首若出现历史生成日期或分支名，仅作存档；以当前仓库 `main` 与目录结构为准。**

## 概述

AI 编码助手的开放 Skills 库。Markdown + JSON + 少量 JS 构成的多平台插件项目。支持 Claude Code、Cursor、OpenCode 三个平台。安装对外统一为 **通用安装**（`npx`，SKILL.md，可多选）与 **全能力安装**（Hooks、Commands、平台集成）；见根目录 `README.md` § 安装。

## 结构

```
open-skills/
├── skills/                 # 核心：Skill 定义（每个子目录 = 一个 skill）
│   └── <name>/SKILL.md     # 必需文件，含 frontmatter 元数据
├── commands/               # 快捷命令（.md 文件，调用对应 skill）
├── hooks/                  # Claude Code/Cursor 钩子（shell 脚本 + hooks.json）
├── .claude-plugin/         # Claude Code 平台配置（plugin.json + marketplace.json）
├── .cursor-plugin/         # Cursor 平台配置（plugin.json）
├── .opencode/              # OpenCode 平台（ES Module 插件 + 安装脚本）→ 见 .opencode/AGENTS.md
├── docs/                   # 安装指南、实现文档（含 generated/ 自动生成索引）
├── scripts/                # gen-skill-docs.mjs：由 skills 生成 docs/generated/skills-index.md
├── openspec/               # OpenSpec 规范治理（changes/ 变更提案、specs/ 主行为契约；opsx 沉淀落点，见铁律 5）
├── .claude/                # OpenSpec OPSX 原生 skills（openspec-*）+ opsx/* 快捷命令
└── .github/workflows/      # CI：版本递增（release.yml）、skills 索引校验（docs-skills-verify.yml）
```

## 在哪找什么

| 任务 | 位置 | 注意事项 |
|------|------|---------|
| 新增/修改 Skill | `skills/<name>/SKILL.md` | 格式和分类见下方「代码规范」章节 |
| 新增快捷命令 | `commands/<name>.md` | 固定格式：`disable-model-invocation: true` + `Invoke the <skill> skill` |
| 修改钩子行为 | `hooks/hooks.json` + 对应 shell 脚本 | Shell 脚本必须静默失败 |
| OpenCode 插件开发 | `.opencode/plugins/` 和 `.opencode/plugin/` | 见 .opencode/AGENTS.md |
| 平台配置 | `.claude-plugin/`、`.cursor-plugin/` | 仅元数据，不含逻辑 |
| CI/版本管理 | `.github/workflows/release.yml` | **禁止手动改版本号** |
| 安装文档 | `docs/INSTALL.md`、`.opencode/INSTALL.md` | **通用安装**（npx）与 **全能力安装**（插件 / OpenCode 符号链接）口径见 `README.md` § 安装；总览见 `docs/README.md`；OpenCode 架构见 `.opencode/AGENTS.md` |
| Skill 完整列表 | `docs/generated/skills-index.md` | **自动生成**，勿手改；改 skill 后由 pre-commit hook 自动更新（需先 `npm install`），或手动 `node scripts/gen-skill-docs.mjs` |
| OpenSpec 规范治理 | `openspec/` | `changes/` 变更提案（归档于 `changes/archive/`）、`specs/` 主行为契约；用 `/opsx-solve-workflow` 沉淀 skill 变更（铁律 5） |

## Skill 清单

**名称、版本、`user-invocable`、描述（触发条件）** 以自动生成的 [docs/generated/skills-index.md](docs/generated/skills-index.md) 为准（`node scripts/gen-skill-docs.mjs`）。下表仅保留 **类别与依赖**，供快速扫一眼关系。

| Skill | 类别 | 依赖 |
|-------|------|------|
| solve-workflow | 工作流 | solution-review、code-design-review、hybrid-debug、runtime-evidence-debug、browser-debug-toolkit、learn-and-improve、workflow-mode-lifecycle、clarifying-question-discipline、known-issue-research、env-capability-discovery、ensure-tests、node-version-discipline |
| opsx-solve-workflow | 工作流 | solution-review、code-design-review、hybrid-debug、runtime-evidence-debug、browser-debug-toolkit、learn-and-improve、node-version-discipline、workflow-mode-lifecycle、clarifying-question-discipline、known-issue-research、env-capability-discovery、ensure-tests |
| perf-workflow | 工作流 | clarifying-question-discipline |
| frontend-perf | 知识库 | perf-workflow |
| android-webview-debug | 工具 | 无 |
| git-commit | Git | 无 |
| jira-fix-workflow | Jira 工作流 | git-commit、jira-read、solution-review、code-design-review、hybrid-debug、runtime-evidence-debug、browser-debug-toolkit、node-version-discipline、workflow-mode-lifecycle、clarifying-question-discipline、known-issue-research、env-capability-discovery、ensure-tests |
| opsx-jira-fix-workflow | Jira 工作流 | solution-review、code-design-review、hybrid-debug、runtime-evidence-debug、browser-debug-toolkit、node-version-discipline、workflow-mode-lifecycle、clarifying-question-discipline、known-issue-research、env-capability-discovery、ensure-tests、openspec 原生 skills（阶段 0 检查） |
| jira-read | Jira 工具 | 无 |
| typescript-check | 工具 | 无 |
| article-writer | 内容创作 | 无 |
| xquik-social-data | 数据采集 | 无 |
| essence-diagnosis | 工作流 | multi-agent-debate |
| multi-agent-debate | 工具 | 无 |
| solution-review | 审查 | 无 |
| code-design-review | 审查 | 无 |
| runtime-evidence-debug | 调试方法论 | 无 |
| hybrid-debug | 调试方法论 | 无 |
| browser-debug-toolkit | 调试方法论 | 无 |
| workflow-mode-lifecycle | 工作流纪律 | 无 |
| clarifying-question-discipline | 工作流纪律 | 无 |
| env-capability-discovery | 工作流增强 | 无（默认弱引用；solve-workflow、opsx-solve-workflow、jira-fix-workflow、opsx-jira-fix-workflow 声明为强依赖） |
| known-issue-research | 调研方法论 | effective-web-research |

> 💕 AI 编码陪伴（coding-fangirl）已迁移至独立工程 [oh-my-fangirl](https://github.com/FuDesign2008/oh-my-fangirl)。

## 钩子机制

三种钩子类型（定义在 `hooks/hooks.json`）：

Hooks 已随 coding-fangirl 迁移至 [oh-my-fangirl](https://github.com/FuDesign2008/oh-my-fangirl)，本仓库不再包含 hooks。

OpenCode 平台使用 JS/TS 插件替代 shell 脚本实现相同功能。

## 代码规范

### SKILL.md 格式（必须遵循）

```markdown
---
name: skill-name
version: "1.0.0"
user-invocable: true
description: 触发条件和用途说明（必须包含触发词）
dependencies:  # 可选，数组形式，声明强依赖的其他 skill
  - other-skill
---

# Skill 标题

Skill 内容...
```

**`dependencies` 字段（可选）**：数组形式，声明本 skill 强依赖的其他 skill。声明后，skill 必须在启动时做前置检查（扫描可用 skill 列表），缺失任一依赖立即中止流程并提示安装命令，**不得静默降级**。被依赖的 skill 不需要反向声明。

**触发词设计**：支持两种形式——单独触发词（如「分析问题」）或带冒号形式（如「分析问题： xxx」）；冒号和空格不限制中英文。在 `description` 中列出所有触发词，**必须包含中文触发词**，可同时列英文等价词（如 `「提交代码」 / "commit code"`）；工作流 skill 的阶段名即为触发词（如「分析问题」触发 solve-workflow 的阶段 1）。

### frontmatter YAML 陷阱

`description` 裸值含英文 `: `（冒号+空格，如 `Triggers: 发版`）会触发 YAML `Nested mappings are not allowed` 错误，导致 `npx skills` 安装/更新报 `No valid skills found`。值含 `: ` 时必须加双引号或用 `|` 块标量。中文冒号「：」不受影响。

> ⚠️ **本仓库额外约束（与 `gen-skill-docs.mjs` 冲突）**：`|` 块标量和多行 description 虽能通过 `npx skills` 的真 YAML 解析，但本仓库 `scripts/gen-skill-docs.mjs` 用**简易行解析器**（按行首个 `:` 切分、不识别缩进块），会把 `|` 当成 description 的字面值（解析为 `"|"`），导致 `docs/generated/skills-index.md` 中该 skill 的描述列变成 `|`。**因此本仓库的 description 一律用单行双引号字符串**，禁用 `|` 块标量和多行 description。

### 新增 Skill 检查清单

1. 目录名 kebab-case
2. `SKILL.md` frontmatter 完整（name、version、description 含触发词；如声明了 dependencies，需实现前置检查）
3. 如需命令入口 → 在 `commands/` 添加对应 `.md`
4. 如需 Hook 触发 → 在 `hooks/hooks.json` 添加配置
5. 如需 OpenCode 支持 → 在 `.opencode/plugins/` 或 `.opencode/plugin/` 添加 JS/TS 代码
6. 确认 `docs/generated/skills-index.md` 已更新并纳入提交（commit 时 pre-commit hook 自动处理；未安装 hook 则手动运行 `node scripts/gen-skill-docs.mjs` 后再提交）
7. 确认正文正向描述流程（检查是否有「不得 XXX」/「❌ 反例」堆砌——正向流程讲清楚后反例即冗余）
8. 确认正文无版本标记等历史包袱（无「v1→v2」「（v2 新增）」等变更日志——变更历史由 git/archive 承载）
9. 确认 SKILL.md 摘要不重复 reference.md 完整规范（SKILL.md 是摘要 + 指向 reference.md，不是复制）

### Skill 精简原则

- **规则只写一次**：参考表/速览表不应重复阶段详情中已有的规则
- **Pitfall 只记非直觉陷阱**：不看规则就容易犯的错误才值得记，规则本身的重复罗列是 token 浪费
- **输出模板超过 5 行抽 reference.md**：SKILL.md 用 `输出格式见 reference.md` 一句引用
- **共享 skill 的契约标识两侧一致**：共享 skill 的参数化占位符（如 `{root-cause step}`）是共享方与引用方之间的契约标识，必须两侧逐字一致；提交前 grep 两侧核对（含中英文差异）
- **跨 skill 引用用名称、不用对方编号**：引用其他 skill 的阶段/步骤时写名称（如「分析阶段」、`runtime-evidence-debug` 的逃生出口），不写对方编号（`stage 1.2`、步骤 3.6 等）——对方重编号时数字引用会 silently 悬空且难察觉（曾有「逃生出口 5.5」指向不存在步骤的实例）；编号仅允许出现在引用方自己声明的契约映射行，且须「号+名」
- **正文正向描述流程，不堆砌反例**：Skill 正文（SKILL.md + reference.md）正向描述「什么时候做什么、怎么做」；AI 理解正向流程后自然不会犯错，反例堆砌（「不得 XXX」/「❌ 反例」）降低信噪比且暗示 AI 不够聪明。反模式只需在事件复盘文档和 git history 留存，不侵入 Skill 正文
- **正文不携带历史包袱**：Skill 正文只描述「当前怎么做」，不写「v1→v2 变更」「（v2 新增）」等版本标记或变更日志。变更历史由 git commit history 和 OpenSpec archive 承载；Skill 运行时应轻盈、活在当下
- **同一规则用不同措辞重复表述是冗余，不是加强**：若「触发时机」已说清「即将执行 X 时启动」，再独立写一段「X 前置检查（强制）：调用 X 前自问是否已做 Y」就是同一件事的重复——换个说法再强调一遍不增加信息量，只降低信噪比

### 命令文件格式（`commands/*.md`）

```markdown
---
description: "命令描述"
disable-model-invocation: true
---

Invoke the <skill-name> skill and follow it exactly
```

### JS 插件规范（`.opencode/` 专用）

- ES Module（`export const`）
- 导出命名：`<Name>Plugin`
- Hook = mutation 模式：直接修改 `output` 对象

### JSON

- 2 空格缩进，camelCase 属性名，无尾空行

### Shell 脚本（`hooks/`）

- `#!/usr/bin/env bash`，用 `printf` 输出 JSON，静默失败

## 命名约定

| 类型 | 规则 | 示例 |
|------|------|------|
| Skill 目录 | kebab-case | `solve-workflow/` |
| Skill 文件 | 固定 `SKILL.md` | |
| 命令文件 | kebab-case | `solve.md`、`perf.md` |
| Hook 脚本 | kebab-case | `session-start`、`emotion-comfort` |
| 插件导出 | PascalCase + Plugin | `OpenSkillsPlugin` |

## Git 工作流

- **执行计划前先开分支**：开始修改代码前，先创建 feature 分支
- **禁止直接推送 main**：必须先创建 feature 分支
- **合并 PR 时**：优先使用「Create a merge commit」，避免「Squash and merge」。Squash 会切断 main 与 feature 分支的提交图，后续在同一分支继续开发再合并 main 时易产生冲突。
- **PR 合并后同步主分支**：合并 PR 后，主动执行 `git checkout main && git pull origin main` 同步当前仓库主分支（即「Merge PR 与发布流程」第 4 步）。
- **PR 合并后继续开发**：若上游已用 Squash 合并过，在本地继续提交前必须先 `git merge origin/main` 或 `git pull origin main`，再开发。
- **长周期变更双点同步检查**：跨天/跨阶段的变更，在动手前（制定计划时）和执行中期（如 opsx 阶段 5 执行前）各做一次 `git fetch origin main` 并查看 `git log HEAD..origin/main --oneline`，尽早感知并行合并的 PR；发现 main 已动到自己在改的区域时，提前小步同步（rebase/merge），把冲突消解在早期而非攒到最后一次 rebase 爆发
- PR 前：`git fetch origin main && git rebase origin/main`
- PR 仅含本次变更 commits
- Commit 前缀：`feat:` 新功能、`fix:` 修复、`docs:` 文档、`chore:` 杂项

### Merge PR 与发布流程

1. **合并 PR**：`gh pr merge <编号> --merge`
2. **检查版本发布**：等待 CI 完成（约 15–20 秒），`gh release list -L 3` 确认新版本
3. **更新本地安装**：
   - **通用安装**（`~/.agents/skills`，每次发布后必做）：`npx skills add FuDesign2008/open-skills -g --skill '*' --yes`——裸命令 `npx skills add FuDesign2008/open-skills -g` 会进入交互式多选（AI/CI 无法应答），必须加 `-s '*' -y` 非交互全量；个别 PromptScript 类 skill（如 `xquik-social-data`、`openspec-*`）报「不支持全局安装」为已知无害报错（已有副本不受影响）
   - **全能力安装** 路径：
     - **OpenCode**：`cd ~/.config/opencode/open-skills && git pull`，然后 `for cmd in commands/*.md; do ln -sf "$(pwd)/$cmd" ~/.config/opencode/commands/; done`
     - **Claude Code**：`claude plugin update open-skills@open-skills-marketplace`（该环境未安装插件时报「Plugin not found」，跳过即可）
4. **工作区同步**：`git checkout main && git pull origin main`

## 版本管理

- 版本号在 `.claude-plugin/plugin.json` 和 `marketplace.json`
- **禁止手动修改**：CI（`.github/workflows/release.yml`）自动递增
- 规则：`feat:` → MINOR、`fix:` → PATCH、`BREAKING CHANGE` → MAJOR
- 触发条件：`hooks/`、`skills/`、`commands/`、`.opencode/`、`.cursor-plugin/` 有变更时
- **受保护 main**：release workflow 在 main 上直接提交版本号变更（`git push origin HEAD:main`，提交标题带 `[skip ci]` 避免再次触发）、打 tag、发 Release。**不再走 version-bump PR**——bot 用 `GITHUB_TOKEN` 开的 PR 触发的 `verify` workflow 会被 GitHub 标记为 `action_required`（防 workflow 自注入），导致 branch policy 永远拒绝 `gh pr merge`。

## 多平台差异

对外安装口径统一为两类：**通用安装**（`SKILL.md`，`npx skills`，可多选）与 **全能力安装**（Hooks、Commands、平台集成）。详见根目录 `README.md` § 安装与 `docs/INSTALL.md`。

| 平台 | 全能力安装（推荐） | 配置目录 | 钩子实现 |
|------|-------------------|---------|---------|
| Claude Code | Marketplace 插件 | `.claude-plugin/` | Shell 脚本（hooks/） |
| Cursor | `/plugin-add` | `.cursor-plugin/` | Shell 脚本（hooks/） |
| OpenCode | raw + 符号链接（见 `.opencode/INSTALL.md`） | `.opencode/` | ES Module 插件 |

## 反模式（禁止）

- ❌ 手动修改版本号
- ❌ 直接推送 main 分支
- ❌ SKILL.md 缺少 frontmatter 或遗漏触发词
- ❌ Skill 正文把某一 Agent 专属工具作为必需/首选，或枚举「X 平台用 A、Y 平台用 B」（仍硬编码 + 武断假设其他平台能力）。应描述意图（要达成什么），让各 Agent 用原生能力实现，无对应能力时退回通用格式（如 prose）
- ❌ 英文 skill 的触发词只有英文，缺失中文触发词（中文用户无法自然唤起）
- ❌ 目录名与 frontmatter `name` 不一致
- ❌ `user-invocable: false` 但无其他 skill 引用它
- ❌ 工作流 skill 跳过阶段（分析阶段禁止 Edit/Write）
- ❌ 支持文件（如 reference.md）未在 SKILL.md 中引用
- ❌ 参考表/速览表重复已有阶段详情（token 膨胀）
- ❌ Red Flags/Pitfall 重复上方已写明的规则（Pitfall 只记非直觉陷阱）
- ❌ PDCA 对应表等元认知框架（对 AI 无执行指导价值；人类可读内容放 reference.md）
- ❌ `description` 裸值含英文 `: ` 未加引号，破坏 YAML 解析导致 `npx skills` 安装失败（见 frontmatter YAML 陷阱）
- ❌ `description` 用 `|` 块标量或多行字符串，被 `gen-skill-docs.mjs` 简易解析器解析成 `"|"`，导致 skills-index 描述列变 `|`（见 frontmatter YAML 陷阱）
- ❌ 新建 skill 不走 `/skill-creator` 直接手写（见 AI 铁律 4）
- ❌ 声明了 frontmatter `dependencies` 却不做前置检查，或缺失依赖时静默降级而不提示安装（强依赖必须中止流程并给出安装命令）
- ❌ Hook 脚本阻塞主流程（必须静默失败）
- ❌ OpenCode 插件用 CommonJS（必须 ES Module）
- ❌ 中文内容混用英文标点
- ❌ Skill 正文堆砌「不得 XXX」/「❌ 反例」等否定式（应正向描述流程——AI 理解正向流程后自然不会犯错，反例堆砌降低信噪比）
- ❌ Skill 正文写「v1→v2」「（v2 新增）」等版本标记或变更日志（变更历史由 git/archive 承载，Skill 正文活在当下）

## 验证命令

```bash
# JSON 格式
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json'))"
node -e "JSON.parse(require('fs').readFileSync('hooks/hooks.json'))"

# SKILL.md frontmatter
grep -r "^---$" skills/*/SKILL.md

# OpenCode 插件语法
node --check .opencode/plugins/open-skills.js

# Skills 索引生成脚本语法
node --check scripts/gen-skill-docs.mjs

# Skills 索引与 CI 一致（等同 docs-skills-verify workflow）
node scripts/gen-skill-docs.mjs
git diff --exit-code docs/generated/skills-index.md

# 重命名/重编号类变更收尾：全库双语残留清扫（模式按本次旧标识调整，含中英文），须零命中
grep -rn -iE '阶段 ?1\.[12]|stage ?1\.[12]|0\.5|3\.6' skills/
# 整文件重写后：删除侧 diff 逐行核对，确认删除行全部对应预期改动、无意外内容丢失
git diff -U0 <改动文件> | grep '^-' | grep -v '^---'
```

首次 clone 后执行 `npm install` 以启用 Husky pre-commit（修改 `skills/*/SKILL.md` 时自动 regenerate 并 stage `docs/generated/skills-index.md`）。

## 子目录知识库

- `.opencode/AGENTS.md` — OpenCode 插件架构、API 模式、安装机制
