## 1. Role contract

- [x] 1.1 新增 `.claude/agents/_contract.md`：三层职责、任务单/结果单、验收规则、档位、升级、测试路径
- [x] 1.2 新增 `.claude/agents/models.json`：tiers 与 testPaths 可配置
- [x] 1.3 新增 `developer.md` / `code-reviewer.md` / `tester.md`

## 2. Acceptance rules

- [x] 2.1 fail-closed：缺字段、空 Evidence、`PASS` 携带非空 `Unresolved` 均阻断
- [x] 2.2 审查角色 findings 标注 `[Standards]` / `[Spec]` 轴，不合并排名
- [x] 2.3 `Confidence` 仅记录，不作门禁
- [x] 2.4 升级：同一 agent、同一流程、escalated 档；两卡独立，任一 FAIL 即失败

## 3. Host integration

- [x] 3.1 `jira-fix-workflow` Stage 8 拆 8a / 8b / 8c，存在性守卫
- [x] 3.2 阶段权限表允许 tester 写测试文件
- [x] 3.3 `reference.md` Stage 8 模板增加角色结果单汇总

## 4. Documentation

- [x] 4.1 `AGENTS.md` 结构图收录 `.claude/agents/`
- [x] 4.2 `docs/SKILL_DISTRIBUTION.md` 说明为何不分发

## 5. Verification

- [x] 5.1 `npm test` 通过
- [x] 5.2 `npm run lint:skill-description` 通过
- [x] 5.3 `npm run lint:deid` 通过
- [x] 5.4 真实 agent 派发验收：结果单格式、缺陷发现、只读约束、两档模型、tester 职责
- [x] 5.5 `openspec validate --strict --all` 通过
