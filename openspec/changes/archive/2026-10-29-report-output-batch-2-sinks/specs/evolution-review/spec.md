## ADDED Requirements

### Requirement: 演化复盘台账 SHALL 以单文件滚动更新

`evolution-review` MUST 把 3 个月滚动台账写入 `docs/reports/evolution/ledger.md`，每次复盘 MUST 原地更新该文件并重新派生 `ledger.html`。台账 MUST 以 Markdown 为唯一编辑入口。该路径 MUST NOT 被版本控制忽略；仓库的 `**/evolution/` 忽略规则 MUST 以负向规则 `!docs/reports/evolution/` 排除本目录，该规则位于仓库既有的 `**/evolution/` 之后、`docs/reports/**/*.html` 之前。规则无法写入时 MUST 按基线「宿主 SHALL 抑制派生 HTML 进入变更集合」的降级分支说明并给出建议行。

#### Scenario: 首次复盘创建台账

- **WHEN** 第一次演化复盘完成
- **THEN** 创建 `docs/reports/evolution/ledger.md` 与 `ledger.html`

#### Scenario: 后续复盘更新同一文件

- **WHEN** 下一次复盘在同一仓库运行
- **THEN** 更新既有的 `ledger.md`，不创建新文件
- **AND** `ledger.html` 反映更新后的内容

#### Scenario: 台账真源不被忽略而派生页仍被忽略

- **WHEN** 检查 `docs/reports/evolution/ledger.md` 与 `ledger.html` 的忽略状态
- **THEN** `ledger.md` 未被忽略
- **AND** `ledger.html` 仍被忽略
