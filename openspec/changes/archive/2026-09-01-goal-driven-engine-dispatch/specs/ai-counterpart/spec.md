# ai-counterpart Delta: PDCA host exit wiring

## ADDED Requirements

### Requirement: PDCA 宿主出口接线

The skill's integration guide SHALL define the seat-filling rules for PDCA hosts (`solve-workflow` / `opsx-solve-workflow`): when such a host runs in auto mode with `counterpart: on`, each manual stop point (the stage exits) becomes a counterpart checkpoint under the same charter — fresh context, artifact-only inputs (that stage's output), evidence-tagged verdict, ledger-marked `counterpart-made`. At the pre-execution approval point, the counterpart's bounded pre-authorization replaces the bare auto-mode escape of `design-approval-gate` (strictly stronger: charter bounds + ledger entry + human overturn instead of a 留痕-only pass-through). Merge decisions, irreversible actions, and protected-branch operations stay human-only — a hit parks the item with a ticket. Hosts integrate via one thin pointer section plus the frontmatter dependency; they MUST NOT restate the charter or protocol.

#### Scenario: 出口坐席升级裸逃生

- **WHEN** solve-workflow 以 auto + counterpart: on 到达实现前批准点
- **THEN** 对手方按章程给有界预授权（而非仅留痕直通），决策入账本可推翻；不可逆/合并/受保护项仍出票留真人

#### Scenario: 薄指针接线

- **WHEN** 阅读 solve-workflow / opsx-solve-workflow 的 Unattended counterpart exits 段
- **THEN** 该段只含指针与触发条件（auto × counterpart: on → 出口按章程坐席），不复述章程或协议正文
