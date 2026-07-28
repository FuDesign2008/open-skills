---
name: jira-fix-workflow
version: "3.18.0"
user-invocable: true
description: 当用户说「修复这个 bug [URL]」「帮我修复 [URL]」「jira-fix [URL]」「自动修复 [URL]」「强制修复 [URL]」「继续修复」「从上次继续」时触发。适用于从 Jira 链接出发、对单个 bug 进行端到端修复的场景。
dependencies:
  - solution-review
  - code-design-review
  - hybrid-debug
  - runtime-evidence-debug
  - browser-debug-toolkit
  - node-version-discipline
  - workflow-mode-lifecycle
  - clarifying-question-discipline
  - known-issue-research
  - analysis-core
  - env-capability-discovery
  - ensure-tests
  - merge-discipline
  - pdca-review-orchestration
  - jira-status-writeback
---

# Jira Bug 修复工作流

> 端到端 Jira Bug 修复流程，阶段 1～6 只读不写。默认手动模式，阶段间需用户确认。
>
> **前提**：mcp-atlassian 已配置且 PAT 有效；Git 环境正常。
> **格式参考**：输出模板、state 目录、commit 格式、出口话术见 [reference.md](reference.md)。

## 触发词与模式

| 说法示例 | 模式 | 说明 |
|---------|------|------|
| 「修复这个 bug [URL]」「帮我修复 [URL]」`jira-fix [URL]` | 👤 手动 | 默认，方案/计划/提交需用户确认 |
| 「自动修复 [URL]」「修复 [URL] 自动模式」`jira-fix [URL] --auto` | 🤖 自动 | 全流程自动执行，无需确认 |
| 「强制修复 [URL]」「跳过分级修复 [URL]」`jira-fix [URL] --force` | 🤖 自动 | 跳过难度分级，强制自动执行 |
| 「继续修复 [URL]」「再次修复 [URL]」`jira-fix [URL] --retry` | 👤 手动 | 跳过阶段0/1，从**阶段3**重新分析 |
| 「从上次继续」「恢复修复 [URL]」`jira-fix [URL] --resume` | 当前模式 | 从断点恢复 |

**模式识别**：含「自动」「--auto」→ 自动；含「强制」「跳过分级」→ 跳过分级（自动）；含「继续修复」「再次修复」「--retry」→ 阶段3重入；含「从上次继续」「恢复」「--resume」→ 断点恢复；其余手动。

## 强依赖与前置检查

强依赖见 frontmatter `dependencies`（15 个）。阶段 0 通过后、阶段 1 前扫描可用 skill；任一缺失 → 结构化提示并**立即中止**（格式见 `solve-workflow/reference.md`）。**不降级**。

## 模式生命周期

核心规则由 `workflow-mode-lifecycle` 承载。「全流程完成」= 正常完成阶段 0–10（含任一阶段最终终止）；失败/极难/用户停止/审查超限后介入终止 → 恢复手动。重进自动须**显式触发**；「继续修复」「再改一下」等隐式延续**不**重激活自动。

**特有差异**：阶段 9 完成 / 阶段 10 合并完成 / 极难终止（自动）→ 恢复手动；阶段 8 未达标回退保持当前模式（自动 ≤2 次）；`--retry` → 重置手动；`--resume` → 沿用断点模式。

## ⚡ 快速参考（执行前必读）

| 阶段 | Edit/Write | Bash | 👤 手动停止点 | 🤖 自动停止点 | 必须输出 |
|------|-----------|------|-------------|-------------|---------|
| 0 前置 | ❌ | ❌ | 失败终止；成功→1 | 失败/P0 终止；成功继续 | 检查摘要 |
| 1 读 Jira | ❌ | ❌ | →2 | →2 | Jira 摘要 |
| 2 理解对齐 | ❌ | ❌ | ⛔ 等确认→3 | 跳过→3 | 复述＋歧义 |
| 3 分析 | ❌ | ❌ | 存在性失败停；完→4 后⏸️→5 | 存在性失败停；完继续 | 根因＋难度 |
| 4 难度 | ❌ | ❌ | 极难⛔ A/B；非极难不单独停 | 极难⛔ 终止；否则继续 | 难度等级 |
| 5 方案审查 | ❌ | ❌ | ⛔ 选方案；⛔ 审查后 | 审查超3轮⛔ | 方案表＋审查 |
| 6 计划 | ❌ | ❌ | ⛔ 等确认 | 困难/高风险⛔ | 修改清单 |
| 7 执行 | ✅ | ✅ | ⛔ 等审查；多工程分支先确认 | 困难⛔ 等审查 | 执行报告 |
| 8 验证 | ❌ | ✅ 测 | ⛔ 等确认 | 通过→9；未达标回退≤2 | 验证结果 |
| 9 提交 | ❌ | ✅ git/CLI | ⛔ 确认后 push+PR | 自动 push+PR | 完成报告＋URL |
| 10 合并 | ❌ | ✅ 合并/可选覆盖率 | ⛔ 确认后合并 | ⛔ 同左，须确认 | 合并／清理／Jira |

阶段 7：先建分支；构建/lint/tsc 前调用 `node-version-discipline`。阶段 10 Part C 按偏好/询问决定是否跑覆盖率 analyzer。

自动/手动阶段差异见 [reference.md](reference.md)「模式差异速查」。

## 通用原则

- **先调查再发言**：无代码证据不做判断
- **主动提问**：`clarifying-question-discipline`（一次一问）
- **Jira 状态边界**：研发只流转到「已修复」；关闭/验证通过由 QA

## 环境能力探索

方法论见 `env-capability-discovery`。阶段 0 后扫描一次，结果写入 state.json `enhanced_capabilities`；后续直接引用。强依赖不走环境探索。

**本工作流映射差分**（相对 solve 类）：🔍/🌐→阶段3；💡→5；📝→6；⚡🧪🔧→7；✅→8；**📋 代码审查→9**；**🌿 分支管理→1（工作区隔离）**。命中则在对应阶段调用；未命中静默跳过。

## 路径选择

阶段 4 分级后选择；可升级不可降级。

| 路径 | 适用 | 要求 |
|------|------|------|
| 精简 | 🟢 容易 | 方案可 1 个+风险；计划可合并；阶段 8/9 不可跳 |
| 标准 | 🟡 中等 | 阶段 1–10 标准执行 |
| 完整 | 🟠 困难 / 🔴 极难选 B | 全阶段；优先 brainstorming；阶段 7 后暂停审查 |

手动升级需用户确认。

## 状态持久化（中断恢复）

**恢复**：有 state.json 时，🤖 从 `current_phase` 续；👤 询问是否恢复。**清理**：完成时 `current_phase: "completed"`。目录与 schema 见 [reference.md](reference.md)「状态目录与 state.json」。

**`--retry`（阶段3重入）**：跳过 0/1；读已有 `01-jira-info.md`；一次问清「上次修了什么 / 新现象」；写入 `02-analysis.md`「本次迭代背景」；重置 state（`current_phase: 3`，`completed_phases: [0,1]`，清空 grade/option/review_*）；分支加 `-v2`/`-v3`…；根因仍不清时优先🔬打点调试。

---

## 阶段0：前置检查

任一失败则中断。

1. 识别模式（含 `--force` / `--resume`），写入 state.json
2. `jira_get_issue`（标题/优先级）连通检查；失败终止
3. **P0 拦截**（仅自动）：P0 → 终止，改手动
4. Git：🤖 不净→stash；👤 不净→提示处理

输出见 [reference.md](reference.md)「阶段0」。成功后直接进阶段1。

---

## 阶段1：读取 Jira 信息

调用 `jira-read {JIRA-ID} --live`（降级缓存 → 再降级手动/终止）。保存 `01-jira-info.md`。提取：ID、标题、优先级、状态、描述、复现、期望/实际、附件、评论。输出见 reference「阶段 1」。工具：✅ mcp / jira-read；❌ Edit/Write/Bash。直接进阶段2。

---

## 阶段2：理解对齐

基于阶段1 复述理解、暴露歧义；**禁止读代码**。🤖 跳过→3。👤 必须确认后→3。

输出：问题复述（无技术判断）／关键要素／歧义（一次一问）／Scope 拆解（若适用，仍禁探代码）。格式见 reference「阶段 2」；保存 `02-alignment.md`。

---

## 阶段3：分析问题

加载 `analysis-core` §§1–3。映射：`{next-stage}`=阶段4「难度分级」；`{root-cause step}`=根因分析；`{impact-assessment step}`=影响范围；`{upstream-eval step}`=上游依赖修复评估。

**本工作流差异**：① 行业通病评估为**门控**；② 🚫 无可行解→报告+**停止不进阶段5**+写 Jira 评论（模板见 reference）；③ 存在性 ❌→停+Jira 评论+等用户；④ 产物 `02-analysis.md`（含难度预判）。

👤 连续执行阶段4，分级追加到输出末，再⏸️确认→5。🤖 →阶段4。

---

## 阶段4：难度分级 + 模式决策网关

### 🔴 极难（满足任一）

根因未知｜架构变更｜数据迁移｜API 协议变更｜预估文件>10 或行数>500｜跨仓库/跨服务

### 其余等级

文件≤3 且根因清晰→🟢；4–10 且基本清晰→🟡；≤10 且较清晰但改动多→🟠

### 模式 × 等级

| 等级 | 🤖 | 👤 |
|------|-----|-----|
| 🟢/🟡 | 正常执行 | 可提示切换自动，继续手动 |
| 🟠 | 阶段7后暂停审查 | 正常手动 |
| 🔴 | **终止**+标记报告 | 风险提示，选 A/B |

分级写入 `04-grade.md` 与 state `grade`；声明路径。模板见 reference「阶段 4」。👤 非极难不单独停；极难选 B 话术见 reference。🤖 非极难→5。

---

## 阶段5：探索与审查方案

提供 2–3 方案（YAGNI）。🤖 自动选（彻底>规范>质量>改动少）→审查。👤 缺偏好时先一问，再对比表。

输出：清单→展开→**唯一**对比表（见 reference「阶段5 方案对比」）→ `03-options.md`。👤 对比表后停。

**审查**：加载 `pdca-review-orchestration`。映射：`{next-stage}`=阶段6；`{artifact-sink}`=`03-options.md`；`{extra-dimensions}`=无；`{batch-overcap-behavior}`=标记「审查未通过（超限）」并处理下一 issue。✅ Read；❌ Edit/Write/Bash。

---

## 阶段6：制定计划

须含：根因/方案回顾、架构（可选 Mermaid）、文件清单表、顺序、测试场景、影响范围、回滚。保存 `04-plan.md`。

| 场景 | 行为 |
|------|------|
| 🤖 普通 | 自动→7 |
| 🤖 🟠 或风险>中 | 暂停等确认 |
| 👤 普通 | 等确认 |
| 👤 极难选 B | 须二次确认「我已知晓风险，继续执行」 |

出口话术见 reference。

---

## 阶段7：执行计划

**分支**：命名与单/多工程流程见 [reference.md](reference.md)「阶段7 分支创建细节」；写入 `00-branch.md`。

严格按计划执行；`TodoWrite` / checkbox 完成一项勾一项。每处改动标 `// fix [JIRA-ID]`。质量：`node-version-discipline` → ReadLints → 有 tsconfig 则 `typescript-check`。🤖 多工程分仓改+各仓 lint，写 `reports/[JIRA-ID]-analysis.md`。

执行后：🤖 普通→8，🟠 暂停审查；👤 普通等确认→8，极难选B 暂停不自动提交。报告→`05-execution.md`。业务逻辑缺测时 `ensure-tests`（`mode=advisory`）。出口话术见 reference。

---

## 阶段8：检查验证

只输出结果，不改代码。对照 Jira 复现/期望、阶段6、测试、副作用、根因；调试闭环用 `analysis-core` §4。诚实标注见 `pdca-review-orchestration`。模板见 reference「阶段8」。

| 结论 | 后续 |
|------|------|
| ✅ | →9 |
| ❌ | 实现误→7；方案缺陷→5；根因不全→3 |

🤖 未达标自动回退≤2 次后暂停。👤 等「通过 / 返回修复 / 重选方案」。保存 `06-verification.md`。

---

## 阶段9：提交 PR/MR

1. 收集 Jira ID、根因、方案、文件、报告路径
2. `git-commit`（execute=true）：add/commit/push；message 格式见 reference「Commit message 格式」（须含 Jira ID）
3. 按 remote 建 PR/MR（`gh` / `glab`）；描述含根因、方案、文件、验证场景（功能/边界/回归各≥2）、Jira 链接

👤 展示计划后停，确认后 AI 执行。🤖 直接执行。完成输出见 reference「阶段 9」→`07-report.md`。

---

## 阶段10：Review 与合并

展示 PR/MR URL 后**立即停止**（话术见 reference）。**自动与手动均须用户确认后合并**。

用户确认后：

1. 加载 `merge-discipline`（Part A→B→C→D；清单见该 skill reference）
2. 合并（`gh pr merge --merge` / `glab mr merge`）→ 删远程修复分支 → 同步默认分支 → 删本地分支
3. 加载 `jira-status-writeback`（字段映射：分支、Commit、PR URL、根因、方案、文件、报告、验证场景）；失败不阻断

写入 `08-merge.md`；state `current_phase: "completed"`。

---

## 安全机制（自动模式）

改前 stash；警告：>10 文件或 >500 行；阻断：>20 文件或 >1000 行（需 `--force`）；Linter 错阻断；审查循环上限 3 轮；记录自动决策。

---

## 常见错误

> 只记非直觉陷阱。合并→`merge-discipline`；回写→`jira-status-writeback`；通病/上游→`known-issue-research` / `upstream-dependency-debug`。不复述正文。

| 错误 | 修正 |
|------|------|
| 👤 跳过阶段2 或阶段2读代码 | 先对齐；阶段2仅基于 Jira |
| 存在性不符仍继续 | 停+Jira 评论，等确认 |
| 🤖 极难仍执行 / 回退超2次不暂停 / 未确认就合并 | 走阶段4网关；超限暂停；合并须确认 |
| 缺 `// fix [JIRA-ID]` | 每处改动标注 |

---

## 批量修复

使用 `jira-fix-batch` skill。
