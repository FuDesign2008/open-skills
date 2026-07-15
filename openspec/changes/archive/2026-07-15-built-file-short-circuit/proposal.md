## Why

`git-conflict-resolve` 处理冲突时，对所有冲突文件无差别执行三方内容读取（`git show :1:/:2:/:3:`）做语义分析。对编译后/打包后的文件（webpack chunk、minified bundle、构建目录产物），这一步会读入巨大文件内容——单行 minified 文件可达几十万字符，瞬间耗尽大量 token；且对压缩代码做「两侧意图」语义分析毫无意义、极易出错（真实案例中，打包文件的冲突标记被残留、旧 hash 版本被错误保留，不得不开修复 MR 回填）。

构建产物的权威始终是发版分支（release），其内容是机器生成的派生物，不存在「两侧意图」需要权衡。正确做法是：**不读、不分析，直接用 release 侧覆盖**。

## What Changes

- 在 `git-conflict-resolve` 的 Y.1（冲突盘点）与 Y.2（语义分析）之间新增 **Y.1.5「构建产物短路」子阶段**：命中构建产物 → 不读三方内容、不做语义分析，直接取 release 侧解决（含整目录覆盖与 rename+hash 删旧取新）。
- **扩展构建产物识别范围**：构建目录前缀（`dist/`、`build/`、`out/`、`assets/`、`static/`、`resources/<bundle>/` 等）+ 文件特征（hash chunk 文件名、`.min.js`/`.min.css`、`.map`、`.wasm` 等资源）；支持用户补充项目专属目录。
- **rename + 构建产物 hash 冲突策略改为不读文件内容**：用 `git diff --name-status --diff-filter=U` 的 rename 信息获取两侧文件名（替代原 `grep "^<<<<<<<"` 读冲突标记），删旧 hash 文件 + 从 release 取新文件。
- `git-release-finish`（调用方）**轻量联动**：阶段 5 冲突检测后提示构建产物走短路；阶段 8 残留扫描确认覆盖构建产物路径（已有「排除假阳性」设计，保持一致）。
- 配套新增 `skills/git-conflict-resolve/reference.md`，将识别清单与详细短路规则抽离，控制 SKILL.md 行数（当前 541 行已超 skill-creator 的 <500 行约束）。

## Capabilities

### New Capabilities

- `built-artifact-conflict-handling`：当 Git merge/rebase 冲突文件为构建产物（编译后/打包后文件）时，跳过语义分析与文件内容读取，直接用发版分支（release）版本覆盖的处理契约。覆盖识别规则、覆盖策略、rename+hash 不读文件处理、以及与调用方 `git-release-finish` 的联动。

### Modified Capabilities

- 无。本仓库 `openspec/specs/` 为空，`git-conflict-resolve` 之前未用 OpenSpec 管理行为契约，本次为首次定义该能力。

## Impact

- `skills/git-conflict-resolve/SKILL.md`：新增 Y.1.5 子阶段、扩展 Y.3 步骤 2 识别范围、改造 Y.4 rename+hash 策略、更新 Red Flags/快速参考；frontmatter version `1.1.0` → `1.2.0`。
- `skills/git-conflict-resolve/reference.md`：新增（识别清单 + 详细短路规则）。
- `skills/git-release-finish/SKILL.md`：阶段 5/8 轻量联动提示；frontmatter version `1.4.0` → `1.5.0`（阶段 3 审查确认 minor 还是 patch）。
- `docs/generated/skills-index.md`：由 pre-commit hook 自动更新（版本号与描述变更）。
- 不受影响：非构建产物（源码）文件的冲突处理仍走 Y.2 语义分析 → Y.3/Y.4，行为不变。
- 铁律遵循：skill 正文英文、触发词含中文、数据脱敏（示例用通用占位 `my-project`/`dist/`）。
