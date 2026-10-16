# Tasks — fix-verify-evidence-ui-screenshot

## 1. 规则层条款实施

- [x] 1.1 在 `skills/runtime-verification-discipline/SKILL.md` 新增「UI verification face precheck」小节：变更集合 = 跟踪 diff ∪ 未跟踪且未被 ignore 的路径；base 先取 `origin/HEAD`，否则取当前分支 reflog 里 `branch: Created from` 的 `%H`（不读 HEAD reflog），否则取去掉书签后的严格祖先 ref；路径后缀与视图标记两条命令输出；含 UI 行为时验证含打开 UI 的检查并留截图；打不开时先做 A/B/C，A 类本轮接线，C 类与未就绪的 B 类写 limitation 三要素；描述文本不触发；`figma-pixel-verify` 的 `layout-probe` + `Screenshot: not-openable` 结束本前置；模拟 UI 计为打开 UI。
- [x] 1.2 在 `skills/runtime-verification-discipline/reference.md` 新增「Verification face precheck」示例段：路径后缀命中、视图标记命中、描述提及渲染但不命中、序列化负例、分类后的 limitation 模板、layout-probe 记录。
- [x] 1.3 复查 4 个 host（solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow）验证阶段薄引用句，确认无需改动即可传播新条款；记录复查结论。

## 2. 验证链

- [x] 2.1 `npm run lint:skill-description` 通过（executed：65 skills，0 errors）。
- [x] 2.2 `node scripts/lint-skill-deidentification.mjs --staged` 通过（executed：无新增内部标识符）。
- [x] 2.3 `node scripts/gen-skill-docs.mjs` 后 `git diff --exit-code docs/generated/skills-index.md` 通过（executed：65 skills，INDEX-CONSISTENT）。
- [x] 2.4 `openspec validate fix-verify-evidence-ui-screenshot` 通过（executed：change is valid）。
- [x] 2.5 铁律 10 自查通过（变更集合复核：①base 先 `origin/HEAD`，否则当前分支 reflog 中 `branch: Created from` 的 `%H`，否则去掉书签后的严格祖先；都没有才 `git diff HEAD`；②未跟踪路径由 `git ls-files --others --exclude-standard` 并入；③临时仓库核对：主工作区、linked worktree、`git branch -m` 之后，即使 `wip` 指向已提交的 `app.css`，跟踪 diff 仍含 `app.css` 与后续文件，且不含分出前就在 `develop` 上的 `old.css`。来源分支被删除、`git branch` 创建后只在 worktree 里提交、`develop` 分出后又有新提交，跟踪 diff 仍含 `app.css`、不含 `develop` 上后来的文件。）

## 3. 交付

- [x] 3.1 openspec 归档（openspec-archive-change），确认主 specs/ 更新 + archive 目录移动落盘（executed：specs 60 passed/0 failed；archive/2026-10-14-fix-verify-evidence-ui-screenshot/）。
- [x] 3.2 commit（fix: 前缀）+ push + 开 PR（target main，描述含根因/方案/验证证据/变更文件），不 merge（executed：commit 9b6070f，PR FuDesign2008/open-skills#329，target main，未 merge）。
