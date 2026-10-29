## ADDED Requirements

### Requirement: 新增接入项 SHALL 落在 docs/reports 下

新增的三个接入项（诊断报告、竞品调研报告族、演化复盘台账）MUST 落在其所在仓库的 `docs/reports/` 稳定子目录：诊断报告用 `diagnosis/`，调研报告族用 `research/`，演化复盘台账用 `evolution/`。既有接入项（技术评审文档、人工测试指南、发布报告）的落盘路径不受本条约束。

这些产物的 Markdown 真源 MUST NOT 被版本控制忽略；派生 HTML 的抑制方式沿用基线「宿主 SHALL 抑制派生 HTML 进入变更集合」的要求，本条不另立规则。真源更新后 MUST 重新派生 HTML。

#### Scenario: 三份真源可入库

- **WHEN** 三个新增接入项写入各自的 `docs/reports/` 子目录
- **THEN** `git check-ignore` 对每份 Markdown 真源返回未被忽略

#### Scenario: 真源更新后重新派生

- **WHEN** 任一新增接入项的真源被修改并再次写入
- **THEN** 同名 HTML 被重新生成并反映修改后的内容

## MODIFIED Requirements

### Requirement: 报告类产物 SHALL 以 Markdown 真源派生 HTML

注册表中**类别为 `human`、接入状态为 `接入`、且未标注「既有契约」** 的产物 MUST 同时落盘 Markdown 真源与由其派生的 HTML。Markdown MUST 是唯一编辑入口；HTML MUST 由渲染器从真源生成。本条以注册表字段为唯一边界判据，不使用「交付级报告」等未定义措辞。

例外清单中的条目 MUST 登记为 `未接入`，本条对其不适用。

本轮接入项：技术评审文档、人工测试指南、发布报告、诊断报告、竞品调研报告族、演化复盘台账。

#### Scenario: 技术评审文档同时落盘两种格式

- **WHEN** `tech-review-doc` 成功写入 `tech-review-{topic}-{YYYY-MM-DD}.md` 且共享渲染器可用
- **THEN** 同目录存在同名 `.html` 派生文件

#### Scenario: 人工测试指南生成派生页

- **WHEN** `test-guide-from-code` 写入 `<feature>_manual_test_guide_<YYYY-MM-DD>.md` 且共享渲染器可用
- **THEN** 同目录存在同名 `.html` 派生文件

#### Scenario: 发布报告生成派生页

- **WHEN** `git-release-finish` 写入 `release-<VERSION>-report.md` 且共享渲染器可用
- **THEN** 同目录存在同名 `.html` 派生文件

#### Scenario: 诊断报告生成派生页

- **WHEN** `essence-diagnosis` 写入 `docs/reports/diagnosis/<YYYY-MM-DD>-<topic>.md` 且共享渲染器可用
- **THEN** 同目录存在同名 `.html` 派生文件

#### Scenario: 调研报告族记录的分层各派生一页

- **WHEN** `competitive-research` 在 `docs/reports/research/<YYYY-MM-DD>-<topic>/main.md` 的 `Layers:` 行记录了若干分层，且共享渲染器可用
- **THEN** 每个被记录的分层文件都存在，且各有一个同名 `.html` 派生文件

#### Scenario: 复盘台账更新后重新派生

- **WHEN** `evolution-review` 更新 `docs/reports/evolution/ledger.md` 且共享渲染器可用
- **THEN** 同目录的 `ledger.html` 被重新生成

#### Scenario: 渲染器不可用时只落盘真源

- **WHEN** 上述任一宿主写入 Markdown 真源，但渲染器无法解析或运行环境缺少 Node
- **THEN** 只落盘 Markdown 真源
- **AND** 宿主打印真源路径并说明降级原因
