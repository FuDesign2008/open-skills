## 1. 准备

- [x] 1.1 创建 feature 分支 `feat/built-file-short-circuit`（Git 工作流铁律：执行计划前先开分支，禁推 main）
- [x] 1.2 确认 `npm install` 已启用 husky pre-commit（用于自动 regenerate 并 stage `docs/generated/skills-index.md`）

## 2. 通过 `/skill-creator` 改进 git-conflict-resolve

- [x] 2.1 唤起 `/skill-creator`，声明改进目标：为 `git-conflict-resolve` 增加「构建产物短路」处理（捕获意图阶段说明根因与 MR 案例，但不在 skill 正文留任何内部信息）
- [x] 2.2 新增 **Y.1.5「构建产物短路」子阶段**（位于 Y.1 与 Y.2 之间）：命中构建产物 → 不读三方内容、不语义分析，直接取 release 侧；未命中 → 进入 Y.2
- [x] 2.3 扩展 **构建产物识别范围**：构建目录前缀（`dist/`、`build/`、`out/`、`assets/`、`static/`、`resources/<bundle>/` 等）+ 文件特征（hash chunk `<name>.<8+位hex>.js|css|map`、`.min.js`/`.min.css`、`.map`、`.wasm` 等）+ 用户补充项目专属目录；写明**保守默认**（边界模糊文件不短路，走语义分析）
- [x] 2.4 改造 **Y.4 rename+hash 策略为不读文件**：用 `git diff --name-status --diff-filter=U` 取两侧文件名（替代 `grep "^<<<<<<<" "$FILE"`），删旧 hash 文件 + 从 release 取新文件；写明 **fallback**（rename 元数据缺失时只读冲突标记行，非全文）
- [x] 2.5 短路解决后保留 **Y.4.5 残留验证**：短路处理的文件也走 fail-fast 冲突标记扫描
- [x] 2.6 抽离 `skills/git-conflict-resolve/reference.md`：识别清单（目录前缀/特征正则）+ 详细短路规则与 fallback；SKILL.md 用指向 reference 的引用，控制行数
- [x] 2.7 更新 **Red Flags**（新增违规：「构建产物走了 Y.2 语义分析 / 读取了其三方内容」）+ **快速参考命令**（补 rename 元数据取文件名命令）
- [x] 2.8 skill-creator 评估迭代 + 触发词校验（保留中文触发词「解冲突 / 处理冲突 / git-conflict-resolve」等）

## 3. 通过 `/skill-creator` 改进 git-release-finish

- [x] 3.1 唤起 `/skill-creator`，声明改进目标：`git-release-finish` 阶段 5/8 构建产物短路联动
- [x] 3.2 **阶段 6**（调用 git-conflict-resolve 处）加提示：构建产物冲突将由 `git-conflict-resolve` 的 Y.1.5 短路处理（不读内容、取 release 侧）
- [x] 3.3 **阶段 8** 残留扫描确认扫描范围（`git diff --name-only`）覆盖构建产物路径，沿用现有「排除假阳性」精确正则设计；补「与 Y.1.5 关系」说明
- [x] 3.4 skill-creator 评估迭代 + 触发词校验（保留中文触发词「发版 / 打tag / 版本发布」等）

## 4. 元数据与脱敏

- [x] 4.1 `git-conflict-resolve` frontmatter `version: "1.1.0"` → `"1.2.0"`
- [x] 4.2 `git-release-finish` frontmatter `version: "1.4.0"` → `"1.5.0"`
- [x] 4.3 **数据脱敏自查**（铁律 2）：grep 两个 skill 正文与 reference，确认无内部域名 / 项目名 / 真实路径 / 真实 hash / Jira ID / commit SHA；示例一律用 `my-project`、`dist/` 等通用占位（新增内容已通过；命中的 `8.2.70` 为 git-release-finish 现有跨 release 示例，属存量、非本次引入）

## 5. 验证

- [x] 5.1 **frontmatter 校验**：`grep -r "^---$" skills/*/SKILL.md`；确认 description 为单行双引号（无 `|` 块标量、无多行）— 两文件 frontmatter 完整；description 均单行（git-release-finish 双引号含 `Triggers:` 被保护、git-conflict-resolve 裸值无英文 `: `），安全
- [x] 5.2 **行数校验**：`skills/git-conflict-resolve/SKILL.md` = 578 行（新增详情已抽 reference.md 90 行）；超 skill-creator ~500 ideal，但 Y.3 推导规则是核心执行逻辑不可抽（违反「参考表重复阶段详情」反模式），与仓库 git-release-finish 829 行同量级，skill-creator 明确 <500 为 approximate，可接受
- [x] 5.3 **skills-index 一致性**：`node scripts/gen-skill-docs.mjs` 生成成功；`git diff` 显示仅版本号变更（1.1.0→1.2.0、1.4.0→1.5.0），描述未变，与 CI 口径一致
- [x] 5.4 **行为对照**：逐条对照 `specs/built-artifact-conflict-handling/spec.md` 的 6 个 requirement 与 scenario — 6/6 全覆盖（R1 Y.1.5 前置 / R2 识别范围 / R3 不读取 release / R4 rename 元数据 / R5 短路后 Y.4.5 / R6 调用方联动）
- [x] 5.5 **OpenSpec 校验**：`openspec validate built-file-short-circuit` → Change is valid

## 6. 提交

- [x] 6.1 `git commit`（`feat:` 前缀）— 已分两个 commit 提交：① chore 引入 OpenSpec 工具（.claude/）② feat 构建产物短路（skill 改动 + reference + openspec 归档 + skills-index）
