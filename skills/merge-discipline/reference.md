# Merge Discipline — Reference

## 合并前检查清单（门控 + tip 钉死）

> 完整规范见本 skill 的 `SKILL.md`（Part A archive 门控 + Part B rebase + Part C 覆盖率 + Part D tip 钉死）。本清单为合并前自检快查表；引用工作流勿复制正文，只留一句指针。

**OpenSpec archive 关联门控（Part A，最先）**：
- [ ] 是否判定关联？（diff 含 active `openspec/changes/<name>/` 或会话绑定名仍在 `openspec list`）→ Part A
- [ ] 关联且仍 active 时是否已阻断合并并要求同 tip archive？（不得隐式跳过直接 merge）→ Part A
- [ ] 无关联时是否放行 Part B？→ Part A

**rebase 预检（Part B）**：
- [ ] 是否检测目标分支领先量？→ Part B
- [ ] 是否检测冲突？→ Part B
- [ ] 需 rebase 时是否报告并等用户确认（不自动）？rebase + push 后是否结束本轮、不管 CI？→ Part B

**覆盖率门控（Part C）**：

- [ ] 合并意图已确认？（分支收尾决策选定合并 / 用户直接合并指令 / AI 即将调用合并命令）
- [ ] 是否已解析工程 `coverage-gate` 偏好？（`AGENTS.md` → `CLAUDE.md`；未声明 ≡ `ask`）
- [ ] 若为 `ask`：是否已询问用户「本合并跑 / 跳过」？（不得默认开跑）
- [ ] 若决定 **运行**：test-coverage-analyzer 是否可用？→ 不可用则环境缺漏留痕，等用户决策
- [ ] 若决定 **运行**：门控脚本是否已执行？结果如何？→ 达标继续 Part D；不达标/崩溃/无报告/无测试 → 暂停等用户
- [ ] 若决定 **跳过**（`never` 或用户显式跳过）：留痕是否已写？（不算隐式漏跑）
- [ ] 隐式漏跑仅针对「应跑未跑」

**合并 tip 钉死（Part D）**：

- [ ] merge 是否钉死合入 revision？（`gh`：`--match-head-commit` 或平台等价；裸 merge 禁止）→ Part D step 1
- [ ] 刚 push 后的「Pipeline succeeded」是否核对过 sha？→ Part D step 2
- [ ] 合入后祖先校验是否 OK？（MISSING 则开补齐 MR，不得宣称收尾）→ Part D step 3
