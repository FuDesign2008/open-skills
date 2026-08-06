## 1. Skill 实现

- [x] 1.1 创建 `skills/goal-driven-run/SKILL.md`（frontmatter + 五环节编排 + /goal 对接 + Red Flags）
- [x] 1.2 创建 `skills/goal-driven-run/reference.md`（模板 1-5 + /goal 官方命令速查 + 条件 4 部分 + 可靠性三件套）
- [x] 1.3 创建 `docs/7x24-agent-reliability-handbook.md`（分层可靠性方法论 §0-§7 + Goal-Driven 长跑模式 §8 + 5 模板）

## 2. 工程注册

- [x] 2.1 `skills-index.md` 重新生成（52→53 skills，含 goal-driven-run）
- [x] 2.2 `AGENTS.md` Skill 清单表补一行（类别：工作流；依赖：clarifying-question-discipline、completion-evidence-discipline）
- [x] 2.3 description lint 通过（53 skills，0 error，goal-driven-run 825 ≤ 1024）
- [x] 2.4 frontmatter 合法 + Node 版本对齐（.nvmrc=22 / v22.22.0）

## 3. OpenSpec 规范工件

- [x] 3.1 `proposal.md`（Why / What Changes / Capabilities: goal-run / Impact）
- [x] 3.2 `specs/goal-run/spec.md`（9 项 ADDED Requirements，每项含 SHALL + Scenario）
- [x] 3.3 `design.md`（6 项技术决策 + 风险缓解 + 迁移/回滚）

## 4. 验证

- [x] 4.1 `openspec validate goal-driven-run-skill` 通过
- [x] 4.2 逐项核对 `goal-run` spec 的 9 项 REQUIREMENTS 与 skill 实际行为一致
- [x] 4.3 工程验证：skills-index 幂等（重新生成无 diff）+ frontmatter 检查

## 5. 归档

- [x] 5.1 用户确认后执行 OpenSpec 归档（main specs 更新 + 移入 archive/）
- [x] 5.2 归档后核对 git diff（main specs 更新 + archive 目录移动）
