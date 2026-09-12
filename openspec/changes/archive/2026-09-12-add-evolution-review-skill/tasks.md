# Tasks: add `evolution-review` skill

## 1. Author the skill

- [x] 1.1 Draft `skills/evolution-review/SKILL.md` v1.0.1（frontmatter 四件套 + 六步机制表 + 铁律 6 条 + 台账模板 + 溯源节降为口头声明，正文英文）
- [x] 1.2 Draft `skills/evolution-review/evals/evals.json`（2 evals / 7 assertions，覆盖数据优先/三值判定/滚动窗口/配额上下限/沉没成本识别/灭绝三动作）
- [x] 1.3 溯源去标识化：正文不含私有仓库名/路径，仅聚合数字（4.5 个月/307 首/¥95/67%）

## 2. Mechanical gates

- [x] 2.1 `node scripts/gen-skill-docs.mjs` 重生成索引（63 skills）
- [x] 2.2 `npm run lint:skill-description` 0 error（description 765 chars ≤1024）
- [x] 2.3 `node scripts/lint-skill-deidentification.mjs --staged` 0 新增违规
- [x] 2.4 SKILL.md < 500 行（57 行）

## 3. Review & archive

- [x] 3.1 PR #312 Part R 审查（FAIL→修复正文语言→重审）
- [x] 3.2 归档本变更（记录性归档：实现先于沉淀，见 proposal 尾注）
- [x] 3.3 delta spec 并入主 specs/evolution-review/spec.md（full 重审 Major 修复：补 Purpose + THEN 配对；同轮修 RELEASE-NOTES 版本号与 design.md 边界如实表述）
