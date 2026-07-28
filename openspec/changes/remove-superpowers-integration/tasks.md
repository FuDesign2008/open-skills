## 1. OpenSpec / docs

- [x] 1.1 proposal / design / delta specs 已齐（本 change）
- [x] 1.2 写 tasks 并开始执行

## 2. Host workflows — remove Superpowers + env discovery

- [x] 2.1 `opsx-solve-workflow/SKILL.md`：去三件套 Superpowers、扫描步骤、渐进增强表、各阶段点名、env 节与依赖
- [x] 2.2 `opsx-jira-fix-workflow/SKILL.md`：同上（定位、扫描、§6.3、依赖、常见错误指针）
- [x] 2.3 `solve-workflow/SKILL.md`：去 env 节/映射/依赖/🔌 增强句/`brainstorming` 路径句；同步 reference 依赖说明
- [x] 2.4 `jira-fix-workflow/SKILL.md`：去 env 节/映射/依赖/`brainstorming`；reference 去掉 `enhanced_capabilities`

## 3. Shared skill + catalog

- [x] 3.1 删除 `skills/env-capability-discovery/`
- [x] 3.2 `clarifying-question-discipline`：举例去掉 brainstorming 绑定
- [x] 3.3 更新 `AGENTS.md` 技能依赖表

## 4. Verify

- [x] 4.1 `rg` 零命中：宿主中的 `env-capability-discovery`、`Superpowers`
- [x] 4.2 `openspec validate remove-superpowers-integration`
- [x] 4.3 生成 skills-index（41 skills）
