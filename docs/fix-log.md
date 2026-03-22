# 修复与变更记录

## 2026-03-22：coding-fangirl 模式 id 与文件名精简

**状态**：已修复

**修复方式**：`fangirl-daily` → `fangirl`（`fangirl.md`），`love-intense` → `love`（`love.md`），`roast-vent` → `roast`（`roast.md`）；同步更新 `modes/_index.json`、`SKILL.md`、`context.json`，skill 版本 **5.4.1**；运行 `node scripts/gen-skill-docs.mjs`。

**验证**：`modes/` 下仅存在 `fangirl.md`、`love.md`、`roast.md` 与 `_index.json`；`defaultModeId` 为 `fangirl`。

---

## 2026-03-22：coding-fangirl 模式库架构（modes + _index.json）

**状态**：已修复

**修复方式**：将三种互动模式从 `SKILL.md` 正文迁至 `skills/coding-fangirl/modes/*.md`，用 `modes/_index.json` 登记 `id`、别名、`tags` 与 `hookSafe`。`SKILL.md` 改为路由、Hook 安全约定、触发与全局规则，版本升至 5.4.0。更新 `context.json`、`skills/AGENTS.md` 目录说明、`docs/opencode-coding-fangirl-implementation.md` 注入说明，并运行 `node scripts/gen-skill-docs.mjs`。

**验证场景**：

1. 打开 `skills/coding-fangirl/modes/_index.json`，确认三条模式与文件路径一致。
2. 阅读 `SKILL.md`，确认「模式解析」与「Hook 与安全档位」可指导模型只通过索引切换模式。
3. `docs/generated/skills-index.md` 中 coding-fangirl 版本为 5.4.0，description 含「切换模式、列出模式」等触发说明。

---

## 2026-03-22：README Demo 脚注改为读者向表述

**状态**：已修复

**修复方式**：`README.md` 中 Coding Fangirl 演示区去掉 GitHub 技术限制、时间码与编码参数等内部说明；改为说明动图展示的内容、B 站完整演示与本地 MP4 路径。配图 alt 改为「在 Claude Code 中使用 Coding Fangirl 的示意」。

**验证场景**：打开仓库 `README.md` 中 Demo 一节，脚注应以用户价值为主，不出现「2:46」「256 色」等制作细节。

---

## 2026-03-22：README 演示改为 GIF 预览（GitHub 不播 `<video>`）

**状态**：已修复（后续同日复用本条目补充「精彩片段 + 画质」迭代，见下段）

**修复方式**：使用 `ffmpeg` 从 `docs/media/coding-fangirl-demo.mp4` 截取前 12 秒，生成 `docs/media/coding-fangirl-demo.gif`（约 680px 宽、8fps、palette 优化）。`README.md` 将 `<video>` 改为 Markdown 图片引用，并说明完整视频可本地打开 MP4 或跳转 Bilibili。

**迭代（同日）**：片头预览信息量不足；改为自原视频 **约 166s（2:46）起截取 14s**，覆盖「coding-fangirl 切换模式 → 恋爱模式 → 回复展开」；输出约 **850px 宽、10fps、256 色、`stats_mode=full`、Sierra 抖动**，文件约 283KB。`README.md` 配图说明与脚注已同步。

**验证场景列表**：

**场景 1** — GitHub 仓库首页 README 可见动图预览

1. 在 GitHub 打开本仓库默认展示的 `README.md`。
2. 滚动到「Demo for Coding Fangirl」一节。

**预期结果**：显示循环播放的 GIF 预览，无需依赖 `<video>` 标签。

**场景 2** — 本地克隆后仍可观看完整 MP4

1. 克隆仓库后打开 `docs/media/coding-fangirl-demo.mp4`。

**预期结果**：可播放完整约 4 分钟带音频视频，与 GIF 仅为片头预览一致。

---

## 2026-03-21：替换 README 演示视频为高清版

**状态**：已修复

**修复方式**：将 `docs/media/coding-fangirl-demo.mp4` 从 6 秒、9.7 KB、无音轨的占位文件替换为从 B 站下载的高清版 MP4。替换后文件约 9.9 MB，包含 H.264 视频流与 AAC 音频流，时长约 284.344 秒。

**验证场景列表**：

**场景 1** — README 内嵌视频可播放

1. 打开仓库首页 `README.md` 中的演示视频区域。
2. 播放内嵌视频。

**预期结果**：视频可正常播放，时长为完整演示内容，且带音频。

**场景 2** — 文件元数据检查

1. 检查 `docs/media/coding-fangirl-demo.mp4` 的文件大小。
2. 使用 `ffprobe` 查看视频与音频流信息。

**预期结果**：文件约 9.9 MB，包含视频流与音频流，不再是 6 秒占位文件。

---

## 2026-03-21：release workflow 改回做法 B（分支 + PR）

**状态**：已修复

**修复方式**：关闭错误方向的 PR `#64`，并将 `.github/workflows/release.yml` 改为：版本号变更先提交到 `chore/version-bump-<version>-<run_id>`，随后通过 `gh pr create` 创建 PR，再用 `gh pr merge --squash -t "... [skip ci]"` 合并回 `main`，最后同步 `origin/main` 再打 tag / 发 release。`AGENTS.md` 同步改为做法 B，并补上 `.cursor-plugin/` 也会触发版本递增。

**验证场景**：合并命中触发路径的 PR 后，Auto Version Bump 应自动创建版本号 PR、完成 squash 合并，并继续创建 tag 与 GitHub Release；不会再因直推 `main` 触发 GH006。

---

## 2026-03-21：删除 docs/README.opencode.md

**状态**：已修复

**修复方式**：移除 `docs/README.opencode.md`；`docs/README.md` 去掉对应索引行并收紧 OpenCode 指路；`docs/INSTALL.md` 与 `AGENTS.md` 中对该文件的引用改为 `.opencode/AGENTS.md`（架构 / Hook 差异）或 `.opencode/INSTALL.md`。

**验证场景**：仓库内 `grep README.opencode` 无残留业务引用；OpenCode 用户仍可从 `docs/README.md` → `.opencode/INSTALL.md` / `.opencode/AGENTS.md` 到达说明。

---

## 2026-03-21：README 安装节改为仅引导 INSTALL

**状态**：已修复

**修复方式**：`README.md` § 安装去掉与 `docs/INSTALL.md` 重复的表格与分平台命令，改为一段话区分「通用 / 全能力」并链向 **详细安装指南**；文档索引保留链至 `docs/README.md`。

---

## 2026-03-21：INSTALL 章节顺序与表格一致（通用先于全能力）

**状态**：已修复

**修复方式**：将 `docs/INSTALL.md` 中 **通用安装详解** 整节移到 **全能力安装与更新** 之前，与 **两种安装方式** 表中「通用在前、全能力在后」一致。锚点 `#通用安装-npx-详解`、`#全能力安装说明` 未改。

---

## 2026-03-21：INSTALL 通用详解段首去重

**状态**：已修复

**修复方式**：删除 `docs/INSTALL.md` **通用安装详解** 段首中「需要全能力则见…」一句，与上文 **两种安装方式** 表及 **怎么选** 已表达的内容重复。

---

## 2026-03-21：INSTALL 能力边界去掉重复指路

**状态**：已修复

**修复方式**：删除 `docs/INSTALL.md` **通用安装详解 — 能力边界** 表后整段（与本节段首「需要全能力时见全能力安装与更新」及表内「否」列重复）。

---

## 2026-03-21：INSTALL 全能力章节纳入更新步骤

**状态**：已修复

**修复方式**：`docs/INSTALL.md` 中 **全能力安装说明** 改为 **全能力安装与更新**（保留锚点 id `全能力安装说明`）；为 Claude Code、Cursor、OpenCode 分别补充 **安装** 与 **更新**（Claude 终端 `claude plugin update …`；Cursor 插件界面或重复 `/plugin-add`；OpenCode `git pull` + 重链 `commands`，并指向 `.opencode/INSTALL.md`）。**常见问题 — 更新后仍是旧行为** 改为引用该节各平台更新步骤。

**验证场景**：只读 `INSTALL.md`「全能力安装与更新」，能独立完成三端安装与更新命令复制。

---

## 2026-03-21：INSTALL 内联 Claude/Cursor 插件命令

**状态**：已修复

**修复方式**：`docs/INSTALL.md` 中 **全能力安装说明 — Claude Code / Cursor** 不再链到 `README.md`，改为直接写出 `/plugin install open-skills@open-skills-marketplace` 与 `/plugin-add open-skills`；**通用安装详解** 段首与 **能力边界** 文末对插件的指向改为本页 **全能力安装说明**。

**验证场景**：只打开 `docs/INSTALL.md`，在「全能力安装说明」内即可完成 Claude Code / Cursor 安装命令复制。

---

## 2026-03-21：INSTALL 删除「复制即用」并入详节

**状态**：已修复

**修复方式**：移除 `docs/INSTALL.md` 中 **两种安装方式** 下的 `### 复制即用`（npx 与 OpenCode raw、装完自测）。**OpenCode raw** 并入 **全能力安装说明 — OpenCode**；**装完自测** 独立为 **## 装完自测**（锚点 `#装完自测`）；**通用安装详解** 段首补充与全能力 / README 的交叉引用。`README.md` 安装表与文末链接改为 `#通用安装-npx-详解`、`#全能力安装说明`、`#装完自测`，弃用 `#复制即用`。

**验证场景**：从 `README` 点进上述三个锚点，应分别看到 npx 命令块、OpenCode raw 块、自测三步。

---

## 2026-03-21：INSTALL 删除「阅读地图」

**状态**：已修复

**修复方式**：从 `docs/INSTALL.md` 移除 **阅读地图** 整段（短文无需目录表）；「复制即用」段首去掉对阅读地图的交叉引用。

**验证场景**：通读 `docs/INSTALL.md`，确认从开篇到「两种安装方式」衔接自然、无断链。

---

## 2026-03-21：弃用 `安装命令速览` 锚点 id

**状态**：已修复

**修复方式**：删除 `docs/INSTALL.md` 中 `<a id="安装命令速览"></a>`。`README.md` 与 `INSTALL.md` 内链改为 `docs/INSTALL.md#复制即用`（对应 `### 复制即用`），不再保留历史兼容 id。

**验证场景**：在 GitHub 上打开 `docs/INSTALL.md`，从 `README` 安装区链接跳转，应落在「复制即用」小节（npx 与 OpenCode raw）。

---

## 2026-03-21：INSTALL 去掉独立「安装命令速览」小节

**状态**：已修复

**修复方式**：`docs/INSTALL.md` 中 **阅读地图** 与独立 `## 安装命令速览` 功能重叠；短文下保留二级标题会造成层级冗余。已删除 `## 安装命令速览`，将 npx / OpenCode raw / 装完自测并入 **两种安装方式** 下的 `### 复制即用`。阅读地图该行链接文案改为「两种安装方式 — 复制即用」；文内交叉引用同步。（锚点 id 后改为 `#复制即用`，见上条。）

**验证场景**：从 `README.md` 点击 `docs/INSTALL.md#复制即用`，应落在「两种安装方式」内的复制命令与 raw 块。

---

## 2026-03-21：INSTALL 结构与可读性重组

**状态**：已修复

**修复方式**：重写 `docs/INSTALL.md` 阅读顺序：开篇分工一句 + **阅读地图**（表格跳转）→ **两种安装方式**（决策表 + 一句话怎么选）→ **安装命令速览**（仅 npx / raw / 验证，去掉与后文重复的说明）→ 新增 **全能力安装说明**（Claude/Cursor 链 README、OpenCode 链 `.opencode/INSTALL.md`、目录对照表前置到该节）→ **通用安装详解**（合并安装/列表/更新/能力边界，减少与速览的重复命令叙述）→ **常见问题**（与上文目录节交叉引用）。保留锚点 `#通用安装-npx-详解`、`#常见问题`、`#troubleshooting`；新增 `#全能力安装说明` 供文内跳转（复制区锚点后改为 `#复制即用`，见上条）。

**验证场景列表**：

**场景 1** — README 链入 INSTALL

1. 打开 `README.md` 安装区表格与文末「更多文档」链接。
2. 依次点击 `docs/INSTALL.md#复制即用`、`#常见问题`。

**预期结果**：对应小节内容完整；速览含 npx 与 OpenCode raw；常见问题可正常滚动定位。

**场景 2** — 文内锚点

1. 在 `docs/INSTALL.md` 中依次验证 `#复制即用`、`#通用安装-npx-详解`、`#全能力安装说明`、`#常见问题` 可定位到对应小节。

**预期结果**：各小节标题与内容匹配。

---

## 2026-03-21：文档统一「通用安装 / 全能力安装」分类

**状态**：已修复

**修复方式**：在 `docs/INSTALL.md` 开篇增加两类对照表，速览小节改为「通用安装：npx」「全能力安装：OpenCode raw」；原 npx 长节改名为 **通用安装详解** 并设锚点 `#通用安装-npx-详解`；常见问题与推荐语同步用词。`README.md`、`AGENTS.md`、`docs/README.md`、`docs/README.opencode.md`、`.opencode/INSTALL.md`、`docs/CURSOR_MARKETPLACE_PUBLISH.md` 交叉对齐同一分类。

---

## 2026-03-21：INSTALL 移除 Claude/Cursor 手动 clone 长篇

**状态**：已修复

**修复方式**：从 `docs/INSTALL.md` 删除「Claude Code 手动安装」「Cursor 手动安装」及重复的 OpenCode 小节；开篇与 npx 表格改指向 README 插件与 `.opencode/INSTALL.md`；常见问题中「更新/仍异常」改为插件 / npx / OpenCode 分流。`README.md` 路径 3 改为 OpenCode 完整安装链；`docs/README.md`、`docs/CURSOR_MARKETPLACE_PUBLISH.md` 同步去掉对「INSTALL 手动安装 Cursor」的依赖。

---

## 2026-03-21：全库文档一致性（对照 README 改版）

**状态**：已修复

**修复方式**：重写 `docs/INSTALL.md` 开篇，与当前 `README.md`（安装决策在 README、命令与排错在 INSTALL）对齐；`README.md` 补充链至 `INSTALL#常见问题`；`docs/README.opencode.md` 触发词表与架构树注明「示意 / 以 skills-index 为准」；`.opencode/INSTALL.md` 验证节改指向 `docs/generated/skills-index.md`，oh-my-opencode 注入文案与 `docs/opencode-coding-fangirl-implementation.md` 对齐（里程碑庆祝、不写情绪感知）；`AGENTS.md` 去掉易误导的文首生成元数据；`skills/AGENTS.md` 弱化对外部 `/ralph` 命令的硬编码；实现文档更新日期刷新。

**验证场景**：从 `README` → `INSTALL` → `skills-index` 与 `.opencode/INSTALL` 阅读一遍，链接与职责描述无自相矛盾。

---

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
