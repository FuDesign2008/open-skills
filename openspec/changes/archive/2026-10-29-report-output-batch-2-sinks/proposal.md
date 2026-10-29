## Why

第一批建立了报告格式契约、共享渲染器与产物注册表，但三个报告类 skill 仍只有输出模板、没有落盘路径：`essence-diagnosis` 的诊断报告、`competitive-research` 的报告族、`evolution-review` 的滚动台账默认只存在于对话里，用户无法归档、传阅或在 PR 中评审。它们在注册表中标记为 `sink 待定`，因此不在 HTML 派生义务范围内。

第二批为这三项定义落盘路径并接入既有契约，使注册表中的 `sink 待定` 清零。

## What Changes

- 定义统一落盘根 `docs/reports/` 下的稳定子目录（`diagnosis/`、`research/`、`evolution/`）：Markdown 真源入库，派生 HTML 不入库。既有接入项的路径不变。
- `essence-diagnosis`：`docs/reports/diagnosis/<YYYY-MM-DD>-<topic>.md`，派生同名 HTML。
- `competitive-research`：`docs/reports/research/<YYYY-MM-DD>-<topic>/`，`main.md` 必写并用 `Layers:` 行记录本次产出的分层；记录到的分层（`summary.md` / `evidence.md` / `memo.md` / `areas/<area>.md` / `agenda.md`）各写一个文件并各派生一份 HTML，未记录的层不要求存在。
- `evolution-review`：`docs/reports/evolution/ledger.md`，滚动更新同一文件，每次更新重新派生 `ledger.html`。
- 三个宿主声明 `report-output-discipline` 依赖、执行前置检查，并在写完后按纪律派生 HTML、回报两条路径。
- `.gitignore` 按「负向在前、HTML 忽略在后」的顺序追加：`!docs/reports/evolution/`、`docs/reports/**/*.html`，使台账真源可入库而派生 HTML 仍被忽略；注册表中三行由 `sink 待定` 改为 `接入`、产品名统一为「演化复盘台账」，并登记路径与抑制方式。
- 契约测试增加三条接入项断言与落盘根断言。

## Capabilities

### New Capabilities

- `essence-diagnosis`: 诊断报告落盘到 `docs/reports/diagnosis/` 并派生 HTML（该 skill 此前没有主 spec）。

### Modified Capabilities

- `report-output-format`: 「报告类产物 SHALL 以 Markdown 真源派生 HTML」的接入项从三项扩到六项，并新增「接入报告落盘根为 `docs/reports/`」的要求。
- `competitive-research`: 新增报告族落盘要求（一次调研一个目录，分层按需）。
- `evolution-review`: 新增滚动台账落盘要求（单文件原地更新 + 重新派生）。

## Impact

- **宿主 skill**：`essence-diagnosis`、`competitive-research`、`evolution-review` 增加落盘路径、派生步骤、抑制说明（演化台账另需负向规则）、依赖声明与前置检查
- **注册表**：`skills/report-output-discipline/reference.md` 三行改为 `接入`
- **版本控制**：`.gitignore` 增加 `docs/reports/**/*.html`
- **测试**：`scripts/report-output-format-contract.test.mjs` 增加三条接入项与落盘根断言
- **文档**：`AGENTS.md` 依赖列补 `report-output-discipline`；`docs/generated/skills-index.md` 由脚本重新生成
- **不涉及**：`perf-optimize-workflow` 的 `BENCHMARK.md` 已登记为 `dual`，本轮不重复处理；报告内容模板不变
