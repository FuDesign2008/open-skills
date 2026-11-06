## Why

`jira-fix-workflow` 的执行、审查、测试此前都在同一上下文里串行完成：开发者自审、测试者自判，组织者既不区分角色，也无法证明「审查真的独立」「高级审查真的用了更强模型」。这削弱了验证结论的可信度，也让「高级审查」退化成一个可选的模型参数。

## What Changes

- 新增本仓工程级角色契约 `.claude/agents/`：`_contract.md`、`models.json`、`developer` / `code-reviewer` / `tester` 三个角色定义。
- 定义组织者与角色的唯一接口：任务单（目标、artifact、约束、验收标准、模型档位）↔ 结果单（Verdict、Confidence、Model tier、Findings、Evidence、Unresolved；审查角色另加 Standards / Spec 双轴）。
- 验收改为 fail-closed：缺字段、空 Evidence、`PASS` 携带非空 `Unresolved` 一律阻断。
- `Confidence` 仅作记录与升级触发，不作放行门禁；放行只看 `Verdict` 与 `Unresolved`。
- 模型档位由 `models.json` 配置，agent 定义写 `model: inherit`；组织者记录请求档位与宿主实际解析的模型，不做相等断言。
- `jira-fix-workflow` Stage 8 在工程提供角色契约时拆为 8a / 8b / 8c，否则行为不变。

## Capabilities

### New Capabilities

- `agent-role-separation`: 角色派发的契约、验收规则、档位解析与升级语义。

### Modified Capabilities

- `jira-fix-workflow`: Stage 8 在角色契约存在时按角色派发并汇总结果单；阶段权限表允许 tester 写测试文件。

## Impact

- **Skill**：`skills/jira-fix-workflow/SKILL.md`、`skills/jira-fix-workflow/reference.md`
- **工程级配置**：`.claude/agents/`（不分发）
- **文档**：`AGENTS.md` 结构图、`docs/SKILL_DISTRIBUTION.md` 分发分类
- **契约**：`openspec/specs/agent-role-separation/spec.md`
- **测试**：`npm test`（skill 契约测试）；角色行为通过真实 agent 派发验收
