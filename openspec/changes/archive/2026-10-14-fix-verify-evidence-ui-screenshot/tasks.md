# Tasks — fix-verify-evidence-ui-screenshot

## 1. 规则层条款实施

- [x] 1.1 在 `skills/runtime-verification-discipline/SKILL.md` 新增「UI verification face precheck」小节：前置判定只认路径后缀与 diff 视图标记两条命令输出；含 UI 行为时验证含打开 UI 的检查并留截图；打不开时先做 A/B/C，A 类本轮接线，C 类与未就绪的 B 类写 limitation 三要素（受限原因 + 受阻层 + 后续动作）；描述文本不触发；`figma-pixel-verify` 的 `layout-probe` + `Screenshot: not-openable` 结束本前置；模拟 UI 计为打开 UI。
- [x] 1.2 在 `skills/runtime-verification-discipline/reference.md` 新增「Verification face precheck」示例段：路径后缀命中、视图标记命中、描述提及渲染但不命中、序列化负例、分类后的 limitation 模板、layout-probe 记录。
- [x] 1.3 复查 4 个 host（solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow）验证阶段薄引用句，确认无需改动即可传播新条款；记录复查结论。

## 2. 验证链

- [x] 2.1 `npm run lint:skill-description` 通过（executed：65 skills，0 errors）。
- [x] 2.2 `node scripts/lint-skill-deidentification.mjs --staged` 通过（executed：无新增内部标识符）。
- [x] 2.3 `node scripts/gen-skill-docs.mjs` 后 `git diff --exit-code docs/generated/skills-index.md` 通过（executed：65 skills，INDEX-CONSISTENT）。
- [x] 2.4 `openspec validate fix-verify-evidence-ui-screenshot` 通过（executed：change is valid）。
- [x] 2.5 铁律 10 自查通过（判定输入改为命令输出后复核：①路径后缀由 `git diff --name-only --merge-base origin/HEAD` 证实；②视图标记由同一 diff 的 `git diff -U0` 经闭合标签正则证实；③目标/任务卡/修复描述的措辞不是判定输入；④「打开了 UI」由本轮非空截图文件证实；⑤ limitation 三要素由报告文本证实；⑥ `layout-probe` 的 `Screenshot: not-openable` 由报告字段证实。）

## 3. 交付

- [x] 3.1 openspec 归档（openspec-archive-change），确认主 specs/ 更新 + archive 目录移动落盘（executed：specs 60 passed/0 failed；archive/2026-10-14-fix-verify-evidence-ui-screenshot/）。
- [x] 3.2 commit（fix: 前缀）+ push + 开 PR（target main，描述含根因/方案/验证证据/变更文件），不 merge（executed：commit 9b6070f，PR FuDesign2008/open-skills#329，target main，未 merge）。
