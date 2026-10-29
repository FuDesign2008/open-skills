# evolution-review Specification

## Purpose

Data-driven portfolio-level monthly selection review: judge works/experiments/product lines by platform-sourced outcome data (never self-report), fix two-period winners into default recipes, kill unvalidated items without sentiment (recording failure recipes), budget exploration with a 15~20% mutation quota that is both ceiling and floor, judge direction on a 3-month rolling window (single-month swings never change direction), and keep the portfolio diverse. Distinct from `learn-and-improve`, which owns single-task retrospectives — the two chain: portfolio selection first, single-item retrospective second.

## Requirements

### Requirement: The skill SHALL run portfolio selection on platform-sourced dual metrics, never self-report

The skill MUST require review inputs from platform settlements / analytics / reconciled numbers; items without data MUST be marked "unreconciled" and down-weighted in extinction review; the skill MUST NOT produce scale/kill recommendations from self-reported feelings.

#### Scenario: No-data item reaches verdict

- **WHEN** a portfolio item has no platform-sourced metrics
- **THEN** the skill marks it "unreconciled" and down-weights it in extinction review instead of judging on feelings

### Requirement: The skill SHALL use two-period confirmation before fixation and a 3-month rolling window for direction

Fixation requires two consecutive winning periods; direction judgment uses a 3-month rolling window; single-month swings MUST NOT trigger direction changes; the mutation quota (15~20%) is both ceiling and floor and unspent quota expires.

#### Scenario: Single-month breakout

- **WHEN** one item spikes in a single month
- **THEN** the verdict stays Observing until the rolling window confirms, the direction does not change, and exploration budget remains capped by the mutation quota

### Requirement: The skill SHALL record failure recipes at extinction and keep verdicts three-valued

Extinction MUST record the failed recipe (asset against repetition) and land as one of three concrete actions (unlist / archive / stop investing); verdicts are Fixed / Observing / Extinct; a diversity check prevents single-niche portfolios.

#### Scenario: Kill decision without data culture

- **WHEN** the user resists killing an unvalidated item
- **THEN** the skill attributes the resistance to sunk cost, records the failure recipe, and lands the kill as a concrete action with resources reallocated to validated lines

### Requirement: 演化复盘台账 SHALL 以单文件滚动更新

`evolution-review` MUST 把 3 个月滚动台账写入 `docs/reports/evolution/ledger.md`，每次复盘 MUST 原地更新该文件并重新派生 `ledger.html`。台账 MUST 以 Markdown 为唯一编辑入口。该路径 MUST NOT 被版本控制忽略。当仓库忽略 `evolution/` 目录时，宿主 MUST 以负向规则 `!docs/reports/evolution/` 排除本目录，且该规则位于既有忽略规则之后、`docs/reports/**/*.html` 之前。规则无法写入时 MUST 按基线「宿主 SHALL 抑制派生 HTML 进入变更集合」的降级分支说明并给出建议行。

#### Scenario: 首次复盘创建台账

- **WHEN** 第一次演化复盘完成，且共享渲染器可用
- **THEN** 创建 `docs/reports/evolution/ledger.md` 与 `ledger.html`

#### Scenario: 后续复盘更新同一文件

- **WHEN** 下一次复盘在同一仓库运行，且共享渲染器可用
- **THEN** 更新既有的 `ledger.md`，不创建新文件
- **AND** `ledger.html` 反映更新后的内容

#### Scenario: 台账真源不被忽略而派生页仍被忽略

- **WHEN** 检查 `docs/reports/evolution/ledger.md` 与 `ledger.html` 的忽略状态
- **THEN** `ledger.md` 未被忽略
- **AND** `ledger.html` 仍被忽略
