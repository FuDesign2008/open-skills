# workflow-contract-sync Specification (Delta)

## ADDED Requirements

### Requirement: 工作流阶段编号 SHALL 为「阶段 0 门禁 + 业务阶段 1-based 顺序整数」

工作流 skill 的阶段编号 MUST 遵循：前置检查/门禁类阶段编号为「阶段 0」（若无门禁阶段则从 1 开始）；业务阶段从 1 开始连续整数，MUST NOT 使用小数插号（如 1.5、2.5、6.4）作为独立阶段编号。小数编号仅允许用于阶段**内部**的小节或子步骤（如「阶段 6 的 6.2.5 小节」「阶段 8 的 8.1/8.2 子步骤」）。

#### Scenario: jira-fix-workflow 理解对齐与难度分级获得整数阶段

- **WHEN** `jira-fix-workflow` 执行理解对齐或难度分级
- **THEN** 二者分别以「阶段 2」「阶段 4」编号出现，不再使用「阶段 1.5」「阶段 2.5」

#### Scenario: opsx-jira-fix-workflow 验证与归档获得整数阶段

- **WHEN** `opsx-jira-fix-workflow` 执行检查验证或提交与归档
- **THEN** 二者分别以「阶段 7」「阶段 8」编号出现；提交子步骤以「8.1/8.2」编号，不再使用「6.4」「7.1/7.2」
