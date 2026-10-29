## ADDED Requirements

### Requirement: 调研报告族 SHALL 落盘到按次分目录并记录分层

完整流程 MUST 把报告族写入 `docs/reports/research/<YYYY-MM-DD>-<topic>/`，其中 `<topic>` 为小写 kebab-case 主题 slug；同一天对同一主题**再次运行**完整流程时 MUST 追加 `-2`、`-3` 等序号并写入新目录；同一次运行内的重写仍写回本次目录。`main.md` MUST 存在。`main.md` MUST 在代码围栏之外用**恰好一行**、以 `Layers:` 开头的记录本次实际产出的分层（逗号分隔；未产出任何可选分层时 MUST 写 `Layers: none`）；每个被记录的层名 MUST 对应一个已写出的文件：

| Layer name | File |
|---|---|
| `summary` | `summary.md` |
| `evidence` | `evidence.md` |
| `memo` | `memo.md` |
| `area:<name>` | `areas/<name>.md`（`<name>` 仅允许小写字母、数字与连字符） |
| `agenda` | `agenda.md` |

未被记录的层 MUST NOT 被要求存在。每个写出的 Markdown 文件 MUST 按 `report-output-discipline` 派生同名 HTML。

#### Scenario: 主文档与分层记录

- **WHEN** 完整调研流程结束，且共享渲染器可用
- **THEN** `docs/reports/research/<YYYY-MM-DD>-<topic>/main.md` 存在且含 `Layers:` 行
- **AND** 同目录存在 `main.html`

#### Scenario: 记录的分层各有文件与派生页

- **WHEN** `main.md` 的 `Layers:` 行记录 `summary,evidence,memo`，且共享渲染器可用
- **THEN** `summary.md`、`evidence.md`、`memo.md` 均存在
- **AND** 三者各有一个同名 `.html`

#### Scenario: 同日同题再次运行写入新目录

- **WHEN** 同一天对同一主题再次运行完整流程
- **THEN** 新报告写入带 `-2` 后缀的新目录
- **AND** 上一次运行的目录内容不变

#### Scenario: 未记录的分层不要求存在

- **WHEN** `Layers:` 行未记录 `agenda`
- **THEN** `agenda.md` 的缺失不构成违约

#### Scenario: 精简路径不落盘报告族

- **WHEN** 调用方使用精简路径回答单个问题
- **THEN** 不创建 `docs/reports/research/` 目录

## MODIFIED Requirements

### Requirement: The report family SHALL be layered with distinct layers carrying distinct depth

On the full report path, the skill MUST guide a layered report family: an architecture or decision main document, detail documents per area, an evidence compendium, a summary layer, a one-page decision memo, and a review agenda that separates decisions needing approval, confirmations, and must-test items. On a given run, the produced subset MUST be recorded on the `Layers:` line of `main.md`, and layers not recorded are out of scope for that run. Document-pipeline mechanics live in reference material. The lean path MUST NOT require this family.

#### Scenario: Review agenda drives the review meeting

- **WHEN** the review meeting runs from the report family
- **THEN** its agenda separates decision items, confirmation items, and must-test items
