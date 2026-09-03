## MODIFIED Requirements

### Requirement: 宿主接线契约

The skill SHALL be `user-invocable: false`, reachable only via host frontmatter `dependencies` (abort with install guidance when missing — no silent downgrade), activated per-run by the host contract's / task card's `Stage-exit policy: ai-proxy`. The policy value MAY be set by a queue interaction-budget ticket **or** by an independent thin freeze into this-run contract (legacy `Counterpart: on` line reads as `proxy`). Hosts wire it with thin pointers at their enumerated checkpoints and MUST NOT restate the charter or protocol prose. With any other policy value or none, host behavior is identical to today.

#### Scenario: 未选择零变化

- **WHEN** 运行未选择 proxy（policy 为 manual / auto / 缺省）
- **THEN** 全部宿主行为与无此能力时逐字一致

#### Scenario: 缺失依赖即中止

- **WHEN** 宿主启动前置检查发现本 skill 缺失且本次 run 的 Stage-exit policy 为 ai-proxy（任务卡或独立薄冻结合同）
- **THEN** 宿主中止并给出安装指引，不静默降级为无人质询模式

### Requirement: PDCA 宿主出口接线

The skill's integration guide SHALL define the seat-filling rules for PDCA hosts (`solve-workflow` / `opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`): when such a host's this-run contract or task card records `Stage-exit policy: ai-proxy` (auto carrier), each manual stop point (the stage exits) becomes a proxy checkpoint under the same charter — fresh context, artifact-only inputs (that stage's output), evidence-tagged verdict, ledger-marked `proxy-made`. Queue-child dispatch is sufficient but **not required**. At the pre-execution approval point, the proxy's bounded pre-authorization replaces the bare auto-mode escape of `design-approval-gate` (strictly stronger: charter bounds + ledger entry + human overturn instead of a 留痕-only pass-through). Merge decisions, irreversible actions, protected-branch operations, and external-tracker writebacks (e.g. Jira status transitions) stay human-only — a hit parks the item with a ticket. PDCA hosts starting with a frozen this-run contract (queue child with problem+frozen decisions supplied, **or** independent thin freeze completed) SHALL also open with a **stop-point forecast**: every manual exit of that workflow, each marked covered-by-frozen-decisions or will-form-a-new-ticket. Hosts integrate via one thin pointer section plus the frontmatter dependency; they MUST NOT restate the charter or protocol. Jira / opsx-jira **PR-open** and **archive+PR-open** terminals remain bound to an explicit `queue-child` flag and MUST NOT activate merely because policy is ai-proxy.

#### Scenario: 出口坐席升级裸逃生

- **WHEN** solve-workflow 以 Stage-exit policy: ai-proxy 到达实现前批准点
- **THEN** 代理按章程给有界预授权（而非仅留痕直通），决策入账本可推翻；不可逆/合并/受保护项仍出票留真人

#### Scenario: 薄指针接线

- **WHEN** 阅读 solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow 的无人值守代理出口段
- **THEN** 该段只含指针与触发条件（Stage-exit policy: ai-proxy → 出口按章程坐席），不复述章程或协议正文

#### Scenario: 停点预告先行

- **WHEN** solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow 作为队列子运行启动（问题+冻结决策随卡供应）
- **THEN** 进入分析前输出停点预告表（各手动出口 × 已被冻结决策覆盖 / 将形成新决策票），交互次数与归属在分析前可知

#### Scenario: 独立运行停点预告

- **WHEN** 上述 PDCA 宿主独立唤起且薄冻结已把 Stage-exit policy 写成 ai-proxy
- **THEN** 占位开始前同样输出停点预告表

#### Scenario: Jira 回写不代理

- **WHEN** jira-fix 子运行到达原 stage 10 位置（队列派发下已短路为待办）
- **THEN** 代理不行使合并与 Jira 回写（外部系统副作用属保留清单），两者作为待办留人；代理仅可就「PR 内容是否满足冻结验收」给出标签裁决

#### Scenario: 独立 ai-proxy 不带 Jira 队列终点

- **WHEN** jira-fix-workflow 或 opsx-jira-fix-workflow 被独立唤起且 Stage-exit policy 为 ai-proxy、调用方未给显式 queue-child 标志
- **THEN** 停点由代理占位，但 PR-open / archive+PR-open 队列终点不启用；独立路径的收尾仍按该技能非队列契约

## ADDED Requirements

### Requirement: 独立 opt-in 薄冻结

PDCA hosts that list ai-proxy triggers in frontmatter `description` SHALL treat those triggers (and mid-run 「切换 ai-proxy」 / "switch to ai-proxy") as a request to enter the overlay path, not as occupancy. Occupancy MUST NOT begin until a **thin freeze** has written this-run contract fields: destination (one short success picture), constraints (including reserved-list items remaining human-only), and `Stage-exit policy: ai-proxy`. The contract MAY live in the conversation output (no extra file required). After the freeze is confirmed, each manual stop point becomes a proxy checkpoint per the PDCA host-exit rules. A present human who explicitly opted in and completed the freeze MAY have the proxy occupy subsequent checkpoints (presence tier 1 does not veto that explicit grant). Implicit continuation phrases MUST NOT start freeze or occupancy.

#### Scenario: 口头触发不占位

- **WHEN** 用户对独立 solve-workflow 说「ai-proxy 模式」且尚未完成本次薄冻结
- **THEN** 宿主进入薄冻结（输出目的地/约束/policy），不立即把阶段出口交给代理

#### Scenario: 冻结后占位

- **WHEN** 薄冻结已写入 Stage-exit policy: ai-proxy 且用户确认该合同
- **THEN** 各手动停点按章程由代理占位（auto 载体）；合并/不可逆/受保护分支仍出票留人

#### Scenario: 无触发词宿主 inert

- **WHEN** write-workflow 被唤起且用户说「ai-proxy 模式」
- **THEN** 不启动薄冻结、不占位；模式仍仅按该宿主已有的自动/手动规则
