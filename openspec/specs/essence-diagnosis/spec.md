# essence-diagnosis Specification

## Purpose
Diagnose a complex problem to its essence: evidence chain, logic chain, adversarial verification, and a persisted diagnosis report with a derived HTML view.

## Requirements

### Requirement: 诊断报告 SHALL 落盘到 docs/reports/diagnosis

`essence-diagnosis` MUST 把完整诊断报告写入 `docs/reports/diagnosis/<YYYY-MM-DD>-<topic>.md`，其中 `<topic>` 为小写 kebab-case 主题 slug；同名文件已存在时 MUST 追加 `-2`、`-3` 等序号，MUST NOT 覆盖；同一次运行内的重写 MUST 写回本次已创建的文件。它 MUST 按 `report-output-discipline` 派生同名 HTML、回报两条路径。报告 MUST 以 Markdown 为唯一编辑入口。

#### Scenario: 诊断完成后落盘

- **WHEN** 诊断流程产出 SOAP 报告、证据链与逻辑链
- **THEN** 报告写入 `docs/reports/diagnosis/<YYYY-MM-DD>-<topic>.md`
- **AND** 同目录存在同名 `.html`
- **AND** 对话中报告两条路径

#### Scenario: 同日同题不覆盖

- **WHEN** 同一天对同一主题再次运行诊断且目标文件已存在
- **THEN** 新报告写入带 `-2` 后缀的新文件
- **AND** 既有文件内容不变

#### Scenario: 渲染器不可用时降级

- **WHEN** 共享渲染器不可用
- **THEN** 只写入 Markdown 真源并说明原因
