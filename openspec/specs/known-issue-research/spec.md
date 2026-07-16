# known-issue-research Specification

## Purpose
定义代码问题外部调研的共享契约：调研路由判断、已知问题快搜、行业通病评估由 `known-issue-research` skill 单点承载，统一委托 `effective-web-research` 的调研纪律，步骤编号参数化以适配各引用方工作流。

## Requirements

### Requirement: 共享 skill SHALL 单点定义调研路由三态判断

`known-issue-research` skill MUST 单点承载代码问题的调研路由判断：🟢 内部为主（根因疑似本仓库实现）、🔵 外部为主（具名第三方库/框架/API，或命中快搜触发条件）、🟣 Hybrid 先外后内（外部概念 + 内部应用对象）；判断不准时默认 🟢 内部为主。路由结论 MUST 只调整后续步骤侧重，不替换步骤本身。

#### Scenario: 路由决定快搜优先级

- **WHEN** 技术分析中问题已确认存在，待决定根因调查侧重
- **THEN** 按三态表判定路由；🔵/🟣 时已知问题快搜升为首要动作，🟢 时快搜为可选兜底

### Requirement: 共享 skill SHALL 单点定义已知问题快搜与行业通病评估

`known-issue-research` MUST 单点承载：① 已知问题快搜的触发条件（平台/原生组件静默失败、宿主环境嵌套且前端逻辑正确、代码层无嫌疑但运行时不生效）与结果处理表（找到已知案例→跳影响范围评估；找到上游已修复版本→转 `upstream-dependency-debug` 评估；部分明确→纳入根因分析；未找到→静默继续）；② 行业通病评估的触发条件（根因明确指向平台/语言/协议/标准硬限制）与结果处理表（无可行解→输出评估报告并暂停等用户决定；有绕过方案→列为候选；非通病→继续）。

#### Scenario: 平台静默失败先搜已知案例

- **WHEN** 问题涉及平台/原生组件且表现为静默失败（无报错、调用正确但行为无响应）
- **THEN** 在根因分析之前先执行已知问题快搜，而非先打点调试

#### Scenario: 行业通病无可行解时暂停

- **WHEN** 行业通病评估结论为「行业公认难题，目前无可行解」
- **THEN** 输出行业通病评估报告并暂停，等用户决定继续探索绕过方案或接受现状

### Requirement: WebSearch 执行 SHALL 委托 effective-web-research 纪律

`known-issue-research` 的所有 WebSearch 执行 MUST 应用 `effective-web-research` 的调研纪律（Step 0 分流 → 4 口诀：官方优先 / 查时效 / 非平凡双源印证 / 避内容农场；用户要严格调研时转严格模式），且 MUST 在 frontmatter `dependencies` 声明对 `effective-web-research` 的强依赖并做前置检查。引用方工作流 MUST NOT 再各自复制该委托说明全文。

#### Scenario: 委托说明单点存在

- **WHEN** 任一工作流执行已知问题快搜或行业通病评估的 WebSearch
- **THEN** 调研纪律说明只出现在 `known-issue-research` 正文中，各工作流不再逐字复制「Step 0 + 4 口诀」段落

### Requirement: 步骤编号 SHALL 参数化，引用方特有差异 SHALL 显式保留

`known-issue-research` 中的步骤编号与跳转目标（如「跳到影响范围评估」）MUST 以参数化方式书写（由引用方指定自身步骤编号），MUST NOT 硬编码某个工作流的编号。引用方的语义变体 MUST 显式保留在各自正文：jira-fix-workflow 的行业通病评估为门控（非可选）、🚫 结论追加「写 Jira 评论」动作、报告模板留在其 reference.md。

#### Scenario: 同一共享 skill 适配不同步骤编号

- **WHEN** solve-workflow（快搜结论跳步骤 4）与 opsx-solve-workflow（跳步骤 5）同时引用 `known-issue-research`
- **THEN** 两者各自传入自身步骤编号，共享 skill 正文不出现「步骤 4」「步骤 5」硬编码

#### Scenario: jira 门控变体不反向污染共享 skill

- **WHEN** jira-fix-workflow 执行行业通病评估且结论为 🚫
- **THEN** 按其自身正文停止流程并写 Jira 评论；共享 skill 的默认形态仍为「暂停等用户决定」
