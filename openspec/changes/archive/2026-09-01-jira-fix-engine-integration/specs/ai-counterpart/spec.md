# ai-counterpart Delta: jira-fix joins the PDCA host list

## MODIFIED Requirements

### Requirement: PDCA 宿主出口接线

The skill's integration guide SHALL define the seat-filling rules for PDCA hosts (`solve-workflow` / `opsx-solve-workflow` / `jira-fix-workflow`): when such a host runs as a queue child with `Stage-exit policy: counterpart` (child auto mode), each manual stop point (the stage exits) becomes a counterpart checkpoint under the same charter — fresh context, artifact-only inputs (that stage's output), evidence-tagged verdict, ledger-marked `counterpart-made`. At the pre-execution approval point, the counterpart's bounded pre-authorization replaces the bare auto-mode escape of `design-approval-gate` (strictly stronger: charter bounds + ledger entry + human overturn instead of a 留痕-only pass-through). Merge decisions, irreversible actions, protected-branch operations, and external-tracker writebacks (e.g. Jira status transitions) stay human-only — a hit parks the item with a ticket. PDCA hosts starting as queue children SHALL also open with a **stop-point forecast**: every manual exit of that workflow, each marked covered-by-frozen-decisions or will-form-a-new-ticket, so the interaction budget's owner knows the interaction count before analysis begins. Hosts integrate via one thin pointer section plus the frontmatter dependency; they MUST NOT restate the charter or protocol.

#### Scenario: 出口坐席升级裸逃生

- **WHEN** solve-workflow 以 Stage-exit policy: counterpart 到达实现前批准点
- **THEN** 对手方按章程给有界预授权（而非仅留痕直通），决策入账本可推翻；不可逆/合并/受保护项仍出票留真人

#### Scenario: 薄指针接线

- **WHEN** 阅读 solve-workflow / opsx-solve-workflow / jira-fix-workflow 的无人值守对手方出口段
- **THEN** 该段只含指针与触发条件（Stage-exit policy: counterpart → 出口按章程坐席），不复述章程或协议正文

#### Scenario: 停点预告先行

- **WHEN** solve-workflow / opsx-solve-workflow / jira-fix-workflow 作为队列子运行启动（问题+冻结决策随卡供应）
- **THEN** 进入分析前输出停点预告表（各手动出口 × 已被冻结决策覆盖 / 将形成新决策票），交互次数与归属在分析前可知

#### Scenario: Jira 回写不代理

- **WHEN** jira-fix 子运行到达原 stage 10 位置（队列派发下已短路为待办）
- **THEN** 对手方不行使合并与 Jira 回写（外部系统副作用属保留清单），两者作为待办留人；对手方仅可就「PR 内容是否满足冻结验收」给出标签裁决
