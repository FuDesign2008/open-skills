# Tasks — fix-verify-evidence-ui-screenshot

## 1. 规则层条款实施

- [x] 1.1 在 `skills/runtime-verification-discipline/SKILL.md` 新增「UI-behavior verification face」小节：前置判定（文件类型信号 + 验证目标信号，可核验）、含 UI 行为时验证须含打开 UI 的检查并留截图、环境受限时显式 limitation 留痕三要素（受限原因 + 受阻层 + 后续动作）、负例边界（非 UI 行为改动不受约束）、模拟 UI 计为打开 UI、非 UI 检查照常免截图与不得伪造截图衔接。
- [x] 1.2 在 `skills/runtime-verification-discipline/reference.md` 新增「Verification face precheck」示例段：判定信号 worked examples（含文件类型信号命中例、目标信号命中例、负例）与 limitation 留痕模板（三要素）。
- [x] 1.3 复查 4 个 host（solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow）验证阶段薄引用句，确认无需改动即可传播新条款；记录复查结论。

## 2. 验证链

- [x] 2.1 `npm run lint:skill-description` 通过（executed：65 skills，0 errors）。
- [x] 2.2 `node scripts/lint-skill-deidentification.mjs --staged` 通过（executed：无新增内部标识符）。
- [x] 2.3 `node scripts/gen-skill-docs.mjs` 后 `git diff --exit-code docs/generated/skills-index.md` 通过（executed：65 skills，INDEX-CONSISTENT）。
- [x] 2.4 `openspec validate fix-verify-evidence-ui-screenshot` 通过（executed：change is valid）。
- [x] 2.5 铁律 10 自查通过（executed，结论：①「验证面含 UI 行为」判定输入 = 文件后缀集合（`git diff --name-only` 可证实）+ 目标文本（读取可证实）；②「打开了 UI」输入 = 本轮保存的非空截图文件（文件系统可证实，既有条款）；③ limitation 条目三要素（报告文本可证实）；④ 负例边界判定输入与正例同源，同一命令证实。全部满足「一条命令或一次文本读取可证实」。）

## 3. 交付

- [x] 3.1 openspec 归档（openspec-archive-change），确认主 specs/ 更新 + archive 目录移动落盘（executed：specs 60 passed/0 failed；archive/2026-10-14-fix-verify-evidence-ui-screenshot/）。
- [x] 3.2 commit（fix: 前缀）+ push + 开 PR（target main，描述含根因/方案/验证证据/变更文件），不 merge（executed：commit 9b6070f，PR FuDesign2008/open-skills#329，target main，未 merge）。
