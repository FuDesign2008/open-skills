## 1. Role contract

- [x] 1.1 新增 `.claude/agents/_contract.md`：三层职责、任务单/结果单、验收规则、档位、升级、测试路径
- [x] 1.2 新增 `.claude/agents/models.json`：tiers 与 testPaths 可配置
- [x] 1.3 新增 `developer.md` / `code-reviewer.md` / `tester.md`

## 2. Acceptance rules

- [x] 2.1 fail-closed：缺字段、空 Evidence、`PASS` 携带非空 `Unresolved` 均阻断
- [x] 2.2 双轴：审查角色输出 Standards 与 Spec 两个判定，不合并排名
- [x] 2.3 升级闭合：escalated 通过可解除 low，永不解除 FAIL
- [x] 2.4 档位可核验：任务单传入、结果单回填、阶段报告记录实际 alias

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
- [ ] 5.5 `openspec validate --strict --all` 通过
