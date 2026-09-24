## ADDED Requirements

### Requirement: 冲突块裁决 SHALL 优先机械判据（子集差分验证）

对每个冲突块，系统 MUST 在语义分析前先执行子集差分验证：计算 theirs 相对 ours 的独有行数（`theirs-only-lines`）。结果为 0（theirs ⊆ ours）时，系统 MUST 判定为高置信「取 ours」并记录机械判据证据；结果 > 0 时升级为并集合并或取 theirs 的进一步判断。机械判据产出的结论 MUST 记录判据本身（非仅记录结论），「取 ours」MUST 经过机械验证而非默认偷懒。机械判据不替代语义分析：无法机械判定时回落到既有置信度分层流程。

#### Scenario: theirs 为 ours 子集时高置信取 ours

- **WHEN** 冲突块差分验证 `theirs-only-lines = 0`（theirs 内容逐行包含于 ours，仅空白差异）
- **THEN** 系统判定 🟢 高置信取 ours，并记录「子集差分 = 0」作为判据

#### Scenario: 非子集时升级判断

- **WHEN** `theirs-only-lines > 0`
- **THEN** 系统进入并集合并或符号存在性检查的进一步判断，不直接取任一侧

### Requirement: 源码文件冲突 SHALL 执行符号存在性检查

对源码类冲突文件，系统 MUST 核查 theirs 的每个顶层符号（函数/类/导出）在 ours 中的存在性；若 ours 的方法签名已内建 theirs 所需参数，则判定 ours 为功能超集。两侧互为替代实现（三版本比对确认设计分歧而非内容丢失）时，系统 MUST 如实记录该判断而非默认取一侧。

#### Scenario: ours 为功能超集

- **WHEN** theirs 的全部顶层符号在 ours 中存在，且 ours 签名已覆盖 theirs 所需参数
- **THEN** 判定 ours 为功能超集，取 ours 并记录符号核查证据

#### Scenario: 替代实现被如实记录

- **WHEN** 三版本（base/ours/theirs）比对确认两侧为同一功能的替代实现（设计分歧）
- **THEN** 系统记录「替代实现」结论并按置信度流程请用户裁决或高置信择一，不静默丢弃另一侧的判断过程

### Requirement: 规格/文档并集合并 SHALL 按标题键双层去重

对规格（Requirement/Scenario 结构）与文档类冲突，系统 MUST 采用并集合并：按标题键双层去重（如 `## → ### Requirement: → #### Scenario:`），ours 全部保留，theirs 中标题不在 ours 的块整体追加，同名条目不重复。

#### Scenario: 两侧各有独有 Requirement

- **WHEN** 冲突的规格文件两侧各含对方没有的 Requirement
- **THEN** 合并结果包含双方全部 Requirement，标题重复的条目仅保留一份

### Requirement: 解析冲突块前 SHALL 探测 diff3 格式

解析文件内冲突块前，系统 MUST 先探测 diff3 格式（冲突块中的 `^\|{7,}` base 段，或读取 `git config merge.conflictStyle`）。当存在 base 段时，解析器 MUST 将冲突块识别为 ours / base / theirs 四段式（含 `|||||||` 分隔），MUST NOT 把 base 段误当成 ours——否则会得出「ours 是超集」的错误结论。

#### Scenario: diff3 风格下 base 段不被误判

- **WHEN** 仓库配置 `merge.conflictStyle=diff3`，冲突块含 `<<<<<<< HEAD` ours `||||||| base` base `=======` theirs `>>>>>>>` 四段
- **THEN** 解析结果正确区分 ours 与 base 段，子集差分验证基于真实 ours 内容执行
