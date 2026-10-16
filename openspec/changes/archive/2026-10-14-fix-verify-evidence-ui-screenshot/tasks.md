# Tasks — fix-verify-evidence-ui-screenshot

## 1. 规则层条款实施

- [x] 1.1 在 `skills/runtime-verification-discipline/SKILL.md` 新增「UI verification face precheck」小节：变更集合 = 跟踪 diff ∪ 未跟踪且未被 ignore 的路径；base 先取 `origin/HEAD`，否则取分支创建 reflog 的来源，否则取严格祖先 ref；路径后缀与视图标记两条命令输出；含 UI 行为时验证含打开 UI 的检查并留截图；打不开时先做 A/B/C，A 类本轮接线，C 类与未就绪的 B 类写 limitation 三要素；描述文本不触发；`figma-pixel-verify` 的 `layout-probe` + `Screenshot: not-openable` 结束本前置；模拟 UI 计为打开 UI。
- [x] 1.2 在 `skills/runtime-verification-discipline/reference.md` 新增「Verification face precheck」示例段：路径后缀命中、视图标记命中、描述提及渲染但不命中、序列化负例、分类后的 limitation 模板、layout-probe 记录。
- [x] 1.3 复查 4 个 host（solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow）验证阶段薄引用句，确认无需改动即可传播新条款；记录复查结论。

## 2. 验证链

- [x] 2.1 `npm run lint:skill-description` 通过（executed：65 skills，0 errors）。
- [x] 2.2 `node scripts/lint-skill-deidentification.mjs --staged` 通过（executed：无新增内部标识符）。
- [x] 2.3 `node scripts/gen-skill-docs.mjs` 后 `git diff --exit-code docs/generated/skills-index.md` 通过（executed：65 skills，INDEX-CONSISTENT）。
- [x] 2.4 `openspec validate fix-verify-evidence-ui-screenshot` 通过（executed：change is valid）。
- [x] 2.5 铁律 10 自查通过（变更集合复核：①base 先 `origin/HEAD`，否则 HEAD reflog 最旧的 `checkout: moving from <src> to <current>`，否则严格祖先 ref 中 committer 时间戳最大者；都没有才 `git diff HEAD`；②未跟踪路径由 `git ls-files --others --exclude-standard` 并入；③临时仓库核对：基线为 `develop`、无 `origin/HEAD`/`main`/`master`、功能分支已提交 `app.css` 且工作区干净时，base 解析为 `develop`，跟踪 diff 含 `app.css`；`develop` 后续又有新提交、以及旁边有分叉分支时，base 仍是 `develop`。本地基线为 `main` 时同样命中。）

## 3. 交付

- [x] 3.1 openspec 归档（openspec-archive-change），确认主 specs/ 更新 + archive 目录移动落盘（executed：specs 60 passed/0 failed；archive/2026-10-14-fix-verify-evidence-ui-screenshot/）。
- [x] 3.2 commit（fix: 前缀）+ push + 开 PR（target main，描述含根因/方案/验证证据/变更文件），不 merge（executed：commit 9b6070f，PR FuDesign2008/open-skills#329，target main，未 merge）。
