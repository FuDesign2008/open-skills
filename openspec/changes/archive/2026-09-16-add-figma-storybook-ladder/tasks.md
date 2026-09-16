## 1. figma-pixel-implement（v1.4.0 → 1.5.0）

- [x] 1.1 SKILL.md：version 1.5.0；description 增 workbench 交付物措辞（949 字符，≤950 软目标）
- [x] 1.2 SKILL.md：完成边界 +「有工作台时 story 覆盖属 implement 完成」；Workflow 4 +`context` 轴；新增 Workflow 9「Stories & component tests」；Hand off +Stories；Pitfalls +2
- [x] 1.3 reference.md：模板 intro 改五段（+可选 Stories）；Inventory 模板 +`context` 列；新增 Stories 小节模板；新增「Stories & component tests」方法节（含「隔离 ≠ 模拟」）；hand-off checklist +2 项
- [x] 1.4 evals/evals.json：+3 条（id 14 workbench-exists-stories-cover-inventory / 15 no-test-infra-advisory / 16 no-workbench-adoption-suggestion）

## 2. figma-pixel-verify（v1.5.0 → 1.6.0）

- [x] 2.1 SKILL.md：version 1.6.0；description 增通道阶梯措辞；Inputs「Runnable UI」改四级偏好序；Workflow 1 Preflight 通道解析（Stories 小节 → 检测 → advisory 建议 → 损坏下落）；Workflow 3 声明式入口计入到达状态；Workflow 6 Report +`Channel` 声明 + 平台地板提示；Pitfalls +2
- [x] 2.2 reference.md：新增「Measurement channel ladder」节（四级表 + 下落规则 + 建议措辞 + 通道声明模板行）；报告模板 +`Channel`/`Platform floor` 行
- [x] 2.3 evals/evals.json：+3 条（id 13 prefer-story-over-app-launch / 14 no-workbench-suggest-and-continue / 15 channel-declaration-and-platform-floor）

## 3. Verification

- [x] 3.1 `npm run lint:skill-description` → 0 error(s), 0 warning(s)（64 skills）
- [x] 3.2 `npm run lint:deid -- --staged` → 无新增内部标识符
- [x] 3.3 两份 evals.json JSON.parse 通过（implement 16 条 id 1–16、verify 15 条 id 1–15，均连续）
- [x] 3.4 `node scripts/gen-skill-docs.mjs` 重生成 + `git diff --exit-code docs/generated/skills-index.md` → INDEX-CONSISTENT
- [x] 3.5 `npm test`（node --test，Node v22.22.0 对齐 .nvmrc=22）→ fail 0
- [x] 3.6 删除侧 diff 核对（全部删除行对应预期改动）+ 结构抽检（implement Workflow 编号 1–11、verify Preflight 长段完整）
- [x] 3.7 `openspec validate add-figma-storybook-ladder` 通过（阶段 7 执行）
