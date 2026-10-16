## Why

修复类工作流的验证证据存在「UI 截图留痕断链」：`runtime-verification-discipline` 已有「打开 UI 的检查须留存非空截图文件」条款（SKILL.md「An opened UI keeps a screenshot file」段），`completion-evidence-discipline` 也有对应的证据形态条款——但两者都是**被动条件条款**（触发条件 = 检查已经打开了 UI）。整个规则栈没有任何一处回答前置问题：「修复涉及 UI 行为时，验证阶段**是否必须**打开 UI」；`sufficiency check` 也未给出「验证面是否含 UI 行为」的可核验判定信号。结果：执行方走纯非 UI 检查路径（类型检查/单测/spec 校验全绿即收束）时，`opened UI` 条件恒为假，截图条款从不触发。三个真实修复案例（云端 Web 应用 CSS 弹层修复、文档序列化修复、输入法编辑器修复——环境各受限）共同点即此：修复后验证全走非 UI 路径，截图要求从未被触发。

## What Changes

- `runtime-verification-discipline` 规则层新增一条**前置强制**：验证开始前须判定验证面是否包含 UI 行为。判定输入只有两条命令输出：路径后缀，以及视图标记。变更集合是跟踪 diff 加上未跟踪且未被 ignore 的路径；跟踪 diff 的 base 依次取能解析的 `origin/HEAD`、`main`、`master`，都没有才用 `git diff HEAD`。目标、任务卡、修复描述的措辞不是判定输入。任一命中时，AI 可驱动环境内至少运行一次打开 UI 的检查并留存截图。仍打不开时先做 A/B/C 分类：A 类本轮接线；C 类以及尚未就绪的 B 类在验证报告以 limitation 留痕（受限原因 + 受阻层 + 后续动作）。
- `reference.md` 同步新增该条款的判定信号示例与留痕模板，供 host 薄引用后查例。
- 不改动 `completion-evidence-discipline`（其被动证据形态条款语义正确，与新前置条款互补分层：前置强制归环境/充分性轴，证据新鲜度与证据形态归它）。
- 不改动 4 个 host 工作流（薄引用原则：规则层单点修改经薄引用句自动传播到所有 host）。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `runtime-verification-discipline`: 新增一条 requirement——「验证面含 UI 行为的验证须包含打开 UI 的检查（可核验信号判定），环境受限时以显式 limitation 留痕」。

## Impact

- 受影响 skill：`skills/runtime-verification-discipline/SKILL.md`（新增小节）、`skills/runtime-verification-discipline/reference.md`（判定信号示例 + 留痕模板）。
- 下游传播：4 个 host（solve / opsx-solve / jira-fix / opsx-jira-fix）经既有薄引用句在验证阶段生效，文本零改动。
- 版本号不手改（release.yml 自动 bump）。
