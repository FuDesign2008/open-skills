# ai-counterpart Delta: policy semantics + stop-point forecast

## MODIFIED Requirements

### Requirement: 宿主接线契约

The skill SHALL be `user-invocable: false`, reachable only via host frontmatter `dependencies` (abort with install guidance when missing — no silent downgrade), activated per-run by the host contract's / task card's `Stage-exit policy: counterpart` (set by the interaction-budget ticket; a legacy `Counterpart: on` line reads as `counterpart`). Hosts wire it with thin pointers at their enumerated checkpoints and MUST NOT restate the charter or protocol prose. With any other policy value or none, host behavior is identical to today.

#### Scenario: 未选择零变化

- **WHEN** 运行未选择 counterpart（policy 为 manual-pause / auto-escape / 缺省）
- **THEN** 全部宿主行为与无此能力时逐字一致

#### Scenario: 缺失依赖即中止

- **WHEN** 宿主启动前置检查发现本 skill 缺失且卡片 policy 为 counterpart
- **THEN** 宿主中止并给出安装指引，不静默降级为无人质询模式

### Requirement: PDCA 宿主出口接线

The skill's integration guide SHALL define the seat-filling rules for PDCA hosts (`solve-workflow` / `opsx-solve-workflow`): when such a host runs as a queue child with `Stage-exit policy: counterpart` (child auto mode), each manual stop point (the stage exits) becomes a counterpart checkpoint under the same charter — fresh context, artifact-only inputs (that stage's output), evidence-tagged verdict, ledger-marked `counterpart-made`. At the pre-execution approval point, the counterpart's bounded pre-authorization replaces the bare auto-mode escape of `design-approval-gate` (strictly stronger: charter bounds + ledger entry + human overturn instead of a 留痕-only pass-through). Merge decisions, irreversible actions, and protected-branch operations stay human-only — a hit parks the item with a ticket. PDCA hosts starting as queue children SHALL also open with a **stop-point forecast**: every manual exit of that workflow, each marked covered-by-frozen-decisions or will-form-a-new-ticket, so the interaction budget's owner knows the interaction count before analysis begins. Hosts integrate via one thin pointer section plus the frontmatter dependency; they MUST NOT restate the charter or protocol.

#### Scenario: 出口坐席升级裸逃生

- **WHEN** solve-workflow 以 Stage-exit policy: counterpart 到达实现前批准点
- **THEN** 对手方按章程给有界预授权（而非仅留痕直通），决策入账本可推翻；不可逆/合并/受保护项仍出票留真人

#### Scenario: 薄指针接线

- **WHEN** 阅读 solve-workflow / opsx-solve-workflow 的 Unattended counterpart exits 段
- **THEN** 该段只含指针与触发条件（Stage-exit policy: counterpart → 出口按章程坐席），不复述章程或协议正文

#### Scenario: 停点预告先行

- **WHEN** solve-workflow / opsx-solve-workflow 作为队列子运行启动（问题+冻结决策随卡供应）
- **THEN** 进入分析前输出停点预告表（各手动出口 × 已被冻结决策覆盖 / 将形成新决策票），交互次数与归属在分析前可知
