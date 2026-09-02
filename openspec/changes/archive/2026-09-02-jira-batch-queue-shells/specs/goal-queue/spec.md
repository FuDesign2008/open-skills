## ADDED Requirements

### Requirement: Jira 列表入队捷径

When `goal-driven-batch` is invoked by `jira-fix-batch` or `opsx-jira-fix-batch`, or when the enqueue input is a list of Jira IDs/URLs with Engine already frozen to `jira-fix-workflow` or `opsx-jira-fix-workflow`, the system SHALL use a list-enqueue shortcut: parse distinct issues into **one card per issue**; ask **one** interaction-budget ticket for the whole list and write the same `Stage-exit policy` on every new card; skip the mandatory engine ticket (Engine frozen by the caller); set each Goal Condition to that issue's Jira link and freeze "run the named engine as `queue-child`, remaining product/tech fog deferred to the child per Stage-exit policy"; open with a batch three-part base (issue table); close with **one** approval event covering all new cards. Approval MUST NOT start consumption. Cards MUST NOT share a branch or one OpenSpec change.

#### Scenario: 三票列表只入队不开跑

- **WHEN** 用户说「批量修复 PROJ-101、PROJ-102、PROJ-103」且 `jira-fix-batch` 将列表交给 `goal-driven-batch`
- **THEN** 系统写入三张 `Engine: jira-fix-workflow` 卡片，整批一张交互预算票与一次批准，不调用 `jira-fix-workflow`、不启动队列消费

#### Scenario: opsx 壳冻结引擎

- **WHEN** 调用方是 `opsx-jira-fix-batch`
- **THEN** 每张新卡 Engine 为 `opsx-jira-fix-workflow`，不再询问引擎必问票

### Requirement: Jira 批量触发壳

`jira-fix-batch` and `opsx-jira-fix-batch` SHALL remain user-invocable trigger skills whose only duties are: split Jira IDs/URLs, declare `goal-driven-batch` as a frontmatter dependency (abort if missing), and invoke that skill's Jira list-enqueue shortcut with Engine frozen (`jira-fix-workflow` / `opsx-jira-fix-workflow` respectively). They MUST NOT loop the single-issue engines, MUST NOT write `.jira-fix/` progress files, MUST NOT start queue consumption, and MUST NOT merge.

#### Scenario: 壳缺依赖即中止

- **WHEN** `jira-fix-batch` 启动且 `goal-driven-batch` 不可用
- **THEN** 立即中止并给出安装命令，不降级为自行循环 `jira-fix-workflow`

#### Scenario: 加载壳不消费

- **WHEN** `opsx-jira-fix-batch` 被加载但用户未给出 Jira 列表与入队意图
- **THEN** 不启动队列消费

### Requirement: derived 关系且禁止共用 change/分支

The Stage 2 relationship pass SHALL recognize **derived** (fixing A reveals B as follow-on or deeper root cause) in addition to duplicate/equivalent, dependency, and overlap-conflict. Derived SHALL be recorded in the progress document Notes. Duplicate/equivalent MUST mark the later card `skipped (covered)`. The system MUST NOT place two in-progress cards on one branch or one OpenSpec change. For `Engine: opsx-jira-fix-workflow` children, relationship-pass notes SHALL be included in the card supply so the child writes `## Related Issues` in that change's `design.md`.

#### Scenario: 衍生票不共用分支

- **WHEN** 关系检测认定 B 由已完成的 A 衍生且 B 仍需修复
- **THEN** B 保持独立卡片与独立分支，进度 Notes 记录 derived，不并入 A 的 change

#### Scenario: opsx 子运行写入 Related Issues

- **WHEN** `Engine: opsx-jira-fix-workflow` 的子运行收到队列关系判断
- **THEN** 该 change 的 `design.md` 含 `## Related Issues` 节记录判断

## MODIFIED Requirements

### Requirement: 串行消费与非阻塞失败

The system SHALL consume queued tasks strictly serially in priority order per the defined P0/P1/P2 vocabulary (FIFO within a level). Before execution, the system SHALL run a light relationship pass over pending cards (duplicate/equivalent, dependency waiting, overlap-conflict, **derived**) and re-evaluate remaining cards against the latest code state after each completion. At that same post-completion boundary the system SHALL also re-scan the backlog directory for newly added pending cards: a discovered card that is well-formed and carries both a budget clause and an approval record SHALL be admitted into priority order for the remainder of the run (never preempting the in-flight child task) and SHALL count against the remaining queue-level task cap; a discovered card that is malformed or lacks an approval record SHALL stay `pending` with a note in the progress document, and MUST NOT be executed. One task's failure MUST NOT block later tasks; failed tasks are marked and recorded with reason, then the loop continues.

#### Scenario: 失败不传染

- **WHEN** 任务 A 的长跑以预算耗尽终止且验收未达成
- **THEN** 系统将 A 标记为 failed 及原因，继续执行下一个 pending 任务 B

#### Scenario: 重复任务跳过

- **WHEN** 待执行任务 B 的症状与目标同已完成的任务 A 等价且 A 的产出已覆盖
- **THEN** 系统将 B 标记为 skipped (covered by duplicate)，注记指向 A 的报告

#### Scenario: 运行中追加完成后纳入

- **WHEN** 队列运行中（某子任务执行期间）一张新的合法卡片（含预算子句与审批留痕）被写入 `.goal-driven/`
- **THEN** 当前子任务不被打断；其后一次完成边界重扫目录时该卡片通过校验并按优先级插入后续消费顺序，发现事件记入进度文档 Notes

#### Scenario: 无审批留痕的新卡不执行

- **WHEN** 重扫发现一张缺少审批留痕（Approved 记录缺失）的新卡片
- **THEN** 系统将其保持 pending 并在进度文档注记「awaiting approval (added mid-run)」，绝不无人审批执行

#### Scenario: 迟到卡片计入任务配额

- **WHEN** 队列级任务数上限为 3 且运行中第 2 个任务完成后重扫纳入 1 张新卡片
- **THEN** 该卡片占用剩余任务配额（第 3 个派发名额），时间上限口径不变；配额触顶时新卡片与其它 pending 一样保留至下次运行
