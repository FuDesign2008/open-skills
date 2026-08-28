# Delta: workflow-contract-sync

Layer rename synchronization: the two requirements referencing `code-design-review` Layer B move to Layer A (the architecture layer's new letter after importance reordering).

## MODIFIED Requirements

### Requirement: Workflow review stages SHALL defer architecture-weight gates to review skills

PDCA workflows that strongly depend on `solution-review` and `code-design-review` (solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow) MUST NOT embed outdated non-blocking guidance that allows deferring a superior architecture solely because near-term maintainability is acceptable. They MUST point agents to those skills for blocking/non-blocking criteria and, for code-affecting solutions, MUST require `code-design-review` Layer A (architecture layer) at the depth that skill defines.

#### Scenario: Workflow drops near-term architecture deferral prose

- **WHEN** a workflow's review-stage section lists non-blocking examples
- **THEN** it does not include "better architecture but near-term OK → non-blocking"; instead it states that architecture-weight and long-term maintainability gates live in `code-design-review` / `solution-review`

### Requirement: solve 家族探索方案阶段 SHALL 先做架构边界预检再权衡短期成本

`solve` 家族工作流（`solve-workflow` / `opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`）的探索方案阶段，当候选方案涉及跨进程或跨层调用时，MUST 在评估短期成本（改动量、复用已有实现、同仓/单仓改动、协作范围）之前先完成**架构边界预检**，决策顺序为：能力运行时初始化位置 → 边界合法性（跨层 import 是否把依赖树拉入调用方，含打包器静态预扫描使动态 `require`/`import` 无法绕过循环依赖）→ 能力归属分类（系统能力 vs 数据/产品能力，与调用方定位是否一致）→ 然后才评估短期成本。预检的核查项名称内联在各宿主正文（约两行），方法论单一来源为 `code-design-review` Layer A 依赖方向维度（薄引用，MUST NOT 复制其完整核查方法）；预检结论（各候选的边界判定）MUST 随方案对比表一同呈现，短期成本理由 MUST NOT 单独作为跨边界方案的推荐依据。纯仓内/单层方案不触发本预检。

#### Scenario: 跨进程方案先过边界预检再进对比表

- **WHEN** 探索方案阶段生成的一个候选方案需要主进程调用仅在服务子进程初始化的能力
- **THEN** 该宿主先回答能力初始化位置与边界合法性，边界判定随对比表呈现；「复用已有实现 + 同仓改动」不得先于该判定成为推荐理由

#### Scenario: 四宿主预检表述保持薄且一致

- **WHEN** 任一 solve 家族宿主的探索方案阶段被打开
- **THEN** 其正文只保留决策顺序规则与核查项名称内联（约两行），完整核查方法指向 `code-design-review` Layer A，不逐字复制
