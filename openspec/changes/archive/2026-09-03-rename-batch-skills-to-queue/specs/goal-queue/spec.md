## MODIFIED Requirements

### Requirement: Jira 列表入队捷径

When `goal-driven-queue` is invoked by `jira-fix-queue` or `opsx-jira-fix-queue`, or when the enqueue input is a list of Jira IDs/URLs with Engine already frozen to `jira-fix-workflow` or `opsx-jira-fix-workflow`, the system SHALL use a list-enqueue shortcut: parse distinct issues into **one card per issue**; ask **one** interaction-budget ticket for the whole list and write the same `Stage-exit policy` on every new card; skip the mandatory engine ticket (Engine frozen by the caller); set each Goal Condition to that issue's Jira link and freeze "run the named engine as `queue-child`, remaining product/tech fog deferred to the child per Stage-exit policy"; open with a batch three-part base (issue table); close with **one** approval event covering all new cards. Approval MUST NOT start consumption. Cards MUST NOT share a branch or one OpenSpec change.

#### Scenario: 三票列表只入队不开跑

- **WHEN** 用户说「批量修复 PROJ-101、PROJ-102、PROJ-103」且 `jira-fix-queue` 将列表交给 `goal-driven-queue`
- **THEN** 系统写入三张 `Engine: jira-fix-workflow` 卡片，整批一张交互预算票与一次批准，不调用 `jira-fix-workflow`、不启动队列消费

#### Scenario: opsx 壳冻结引擎

- **WHEN** 调用方是 `opsx-jira-fix-queue`
- **THEN** 每张新卡 Engine 为 `opsx-jira-fix-workflow`，不再询问引擎必问票

### Requirement: Jira 批量触发壳

`jira-fix-queue` and `opsx-jira-fix-queue` SHALL remain user-invocable trigger skills whose only duties are: split Jira IDs/URLs, declare `goal-driven-queue` as a frontmatter dependency (abort if missing), and invoke that skill's Jira list-enqueue shortcut with Engine frozen (`jira-fix-workflow` / `opsx-jira-fix-workflow` respectively). They MUST NOT loop the single-issue engines, MUST NOT write `.jira-fix/` progress files, MUST NOT start queue consumption, and MUST NOT merge.

#### Scenario: 壳缺依赖即中止

- **WHEN** `jira-fix-queue` 启动且 `goal-driven-queue` 不可用
- **THEN** 立即中止并给出安装命令，不降级为自行循环 `jira-fix-workflow`

#### Scenario: 加载壳不消费

- **WHEN** `opsx-jira-fix-queue` 被加载但用户未给出 Jira 列表与入队意图
- **THEN** 不启动队列消费
