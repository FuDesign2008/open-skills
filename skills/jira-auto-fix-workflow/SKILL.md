---
name: jira-auto-fix-workflow
version: "2.0.0"
user-invocable: true
description: Jira Bug 全自动修复工作流，无需人工确认。当用户说"jira-auto-fix [URL]"或需要自动修复单个 Jira bug 时触发。支持多项目 workspace，自动选择最佳方案，自动 commit 和 push，自动生成分析报告。适用于常见、重复性 bug，不适用于 P0 高优先级或涉及架构变更的 bug。与 jira-fix 的区别：jira-fix 需要人工确认，jira-auto-fix 全自动执行。使用 mcp-atlassian API，支持状态持久化和 Jira 状态自动回写。
---

# Jira Bug 自动修复工作流 - 执行规则

> 本文档定义完全自动化的 Jira Bug 修复流程，最小化人工干预

## 触发词定义

**主要触发词**：`jira-auto-fix [Jira URL] [project1,project2,...]`

**项目指定规则**（可选）：
- 单项目：`jira-auto-fix https://jira.../PROJ-123 backend`
- 多项目：`jira-auto-fix https://jira.../PROJ-123 backend,frontend`
- 自动识别：`jira-auto-fix https://jira.../PROJ-123`（无项目参数时自动扫描 workspace）

**与半自动模式对比**：

| 特性 | jira-fix | jira-auto-fix |
|------|----------|---------------|
| 用户确认 | 阶段4、5、7需确认 | 全自动，无需确认 |
| 方案选择 | 用户选择 | AI自动选择最佳实践 |
| Git提交 | 生成命令，用户执行 | 自动commit和push |
| 报告生成 | 无 | 自动生成分析报告 |
| 多项目 | 手动处理 | 自动识别或指定 |

**保存位置**：`.jira-fix/{JIRA-ID}/00-branch.md`

## 状态持久化（中断恢复）

### 触发词
- `jira-auto-fix {URL} --resume` - 从断点恢复
- 启动时自动检测：如有未完成状态，自动恢复（不询问用户）

### 状态目录
（与 jira-fix-workflow 相同）

### state.json 结构
（与 jira-fix-workflow 相同，新增 "auto_mode": true 字段）

### 恢复逻辑
1. `--resume` 或检测到已有 state.json 时：
   - 自动读取 state.json
   - 读取已完成阶段的输出文件
   - 从 current_phase 自动继续（不询问用户）
2. 正常启动但 state.json 已存在时：
   - 自动恢复（不询问，与半自动模式的区别）

### 各阶段输出规则
（与 jira-fix-workflow 相同）

### 清理
（与 jira-fix-workflow 相同）

## 适用场景

**适合使用 auto-fix**：
- 常见的、重复性 bug 类型
- 有清晰复现步骤
- 影响范围明确
- 改动风险可控

**不适合使用 auto-fix**：
- P0 高优先级 bug（需人工审核）
- 涉及架构变更
- 需要数据迁移
- 影响多个核心模块

## 安全机制

1. 修改前自动创建安全点（git stash）
2. 改动阈值检测（>10个文件或>500行改动时警告）
3. Linter 错误自动阻断
4. 自动回滚机制
5. 详细操作日志

---

## 阶段0：前置检查（自动）

> 在创建 Git 分支之前，自动验证关键依赖。任一检查失败则终止流程。

### 自动执行步骤

1. **mcp-atlassian 连通性检查**：
   调用 `jira_get_issue`(issue_key="{JIRA-ID}", fields="summary") 仅获取标题
   - ✅ 成功：记录 Issue 标题，继续流程
   - ❌ 失败：**立即终止**，输出错误信息：

```
❌ mcp-atlassian 连接失败，自动修复流程终止

请检查：
1. opencode.json 中是否配置了 mcp-atlassian
2. JIRA_PERSONAL_TOKEN 是否有效
3. JIRA_URL 是否正确（当前：https://jira.mail.netease.com）
4. 网络是否可达
```

2. **Git 环境检查**：
   - 是否在 Git 仓库中（不在则终止）
   - 工作区状态（自动 stash 处理）

### 输出格式

```
## 阶段0完成：前置检查通过

**Jira ID**: YNOTR-12167
**Issue 标题**: [标题]（已确认存在）
**mcp-atlassian**: ✅ 已连接
**Git 仓库**: ✅

---
自动进入阶段1：创建 Git 修复分支
```

---

## 阶段1：创建 Git 修复分支（自动）

### 原则
- 自动识别和选择基础分支
- 自动处理未提交修改（stash）
- 自动处理分支冲突
- 支持单项目和多项目 workspace

### 多项目支持

**项目识别策略**（按优先级）：
1. 用户通过触发词明确指定项目列表
2. AI 自动扫描 workspace 下的 Git 仓库（存在 .git 目录）
3. 根据 Jira 信息和项目名称智能匹配（可选）

**自动扫描规则**：
- 扫描范围：workspace 根目录的一级和二级子目录
- 识别标准：存在 `.git` 目录
- 自动过滤：排除 `node_modules`、`.cursor`、`dist`、`build`、`.git` 等
- 确认提示：列出识别的项目，等待 3 秒自动继续（或用户中断）

**多项目执行流程**：
1. 识别或接收项目列表
2. 验证每个项目是否为有效 Git 仓库
3. 对每个项目依次执行：
   - 检查 Git 状态
   - 自动 stash 未提交修改
   - 识别基础分支
   - 创建/切换到修复分支 `fuyg-jira-fix-[JIRA-ID]`
4. 汇总所有项目的分支创建状态

### 自动执行步骤
1. 检查 Git 状态，自动 stash 未提交修改
2. 自动识别基础分支（优先 release/x.x.x）
3. 自动提取 Jira ID 并创建分支
4. 分支已存在时自动切换

### 命名规范

前缀 `fuyg-jira-fix-` + Jira ID（原样保留大小写）

### 自动错误处理

**未提交修改**：自动执行 `git stash save "Auto-stash before jira-auto-fix"`

**分支已存在**：自动执行 `git checkout fuyg-jira-fix-[JIRA-ID]`

**无法识别基础分支**：默认使用当前分支，记录警告到日志

**不在 Git 仓库**：报错并终止，提示用户检查目录

### 输出格式

**单项目场景**：
```
## 阶段1完成：Git分支已自动创建

**Jira ID**: YNOTR-12167
**项目**: backend
**基础分支**: release/8.2.30
**修复分支**: fuyg-jira-fix-YNOTR-12167
**状态**: 已自动切换到修复分支

---
自动进入阶段2：读取Jira信息
```

**多项目场景**：
```
## 阶段1完成：Git分支已自动创建（多项目）

**Jira ID**: YNOTR-12167
**涉及项目**: 2个

| 项目 | 基础分支 | 修复分支 | 状态 |
|------|---------|---------|------|
| backend | release/8.2.30 | fuyg-jira-fix-YNOTR-12167 | ✅ 已创建并切换 |
| frontend | release/8.2.30 | fuyg-jira-fix-YNOTR-12167 | ✅ 已创建并切换 |

---
自动进入阶段2：读取Jira信息
```

---

## 阶段2：读取 Jira 信息（自动）

### 原则
- 优先使用本地缓存（快速）
- 本地不存在时自动下载
- 复用 `jira-read` skill 的统一逻辑

### 执行步骤
1. 调用 `jira-read {JIRA-ID} --live`（直接从 API 获取最新数据）
2. jira-read 自动处理：
   - --live 模式：直接调用 mcp-atlassian API 获取最新数据并更新缓存
   - 降级：API 不可用时读取本地缓存
   - 再降级：API 和本地均不可用时，报错终止并提示检查配置
3. 获取结构化 Jira 信息
4. 验证必需字段完整性
5. 将阶段 2 输出保存到 `.jira-fix/{JIRA-ID}/01-jira-info.md`
6. 更新 state.json

### 提取信息清单

**必需**：Jira ID、标题、优先级（P0-P4）、状态

**详细**：问题描述、复现步骤、期望结果、实际结果、附件链接、评论历史

### 输出格式

```
## 阶段2完成：Jira信息已读取

**Jira ID**: YNOTR-12167
**标题**: [标题]
**优先级**: P1
**状态**: 待处理
**数据来源**: 本地缓存 / 自动下载

**问题描述**: [描述]
**复现步骤**: 1. ... 2. ...
**期望结果**: [期望]
**实际结果**: [实际]

**评论摘要**: 共 X 条评论
> 最新评论 - [用户] ([时间]): [内容摘要]...

---
自动进入阶段3：分析问题
```

**保存位置**：`.jira-fix/{JIRA-ID}/01-jira-info.md`

---

## 阶段3：分析问题（自动）

### 原则
- 只读分析，不修改代码
- 深度分析，追问"为什么"至少 3 次
- 结构化输出，中文描述

### 分析维度

**1. 问题现象**：Jira 信息、复现步骤、期望 vs 实际结果

**2. 代码定位**：使用 Grep/Glob/SemanticSearch 组合搜索关键代码

**3. 根因分析**：
- 数据流分析：用户操作→组件→函数→状态→渲染
- 调用链分析：追踪完整函数调用链
- 区分直接原因和根本原因

**4. 影响范围**：功能影响、平台影响（Web/Mobile）、用户影响、技术影响、连带影响

### 输出格式

```
## 阶段3：分析完成

### 1. 问题现象
**Jira ID**: [ID]
**标题**: [标题]
**复现步骤**: 1. ... 2. ...
**期望结果**: [期望]
**实际结果**: [实际]

### 2. 相关代码定位
**核心文件**:
- `path/file.js:行号` - [说明]

**关键函数/类**:
- `functionName()` - [作用]

### 3. 根因分析
**数据流**: [流程]
**调用链**: [调用关系]
**直接原因**: [直接导致问题的逻辑]
**根本原因**: [为什么会有这样的逻辑]

### 4. 影响范围
**受影响模块**: [列表]
**平台**: Web端/Mobile端
**潜在连带影响**: [列表]

### 5. 风险点
- [风险1]
- [风险2]

---
自动进入阶段4：评估方案
```

**保存位置**：`.jira-fix/{JIRA-ID}/02-analysis.md`

---

## 阶段4：评估方案（自动选择）

### 原则
- 自动生成 2-3 个方案
- 根据最佳实践策略自动选择
- 记录选择理由

### 自动选择策略

优先级顺序：
1. 更彻底解决问题（而非临时修复）
2. 符合代码规范和最佳实践
3. 改善代码质量（重构优于补丁）
4. 在复杂度相近时，选择改动较少的

自动选择逻辑：
```
if (所有方案风险>中) {
  报错终止，建议使用 jira-fix 半自动模式
} else {
  选择推荐度最高的方案
  if (多个方案推荐度相同) {
    选择复杂度最低的
  }
}
```

### 每个方案必须包含
1. 核心思路（1-2 句话）
2. 需要修改的文件/模块
3. 实施步骤（简要）
4. 优点（至少 2 个）
5. 缺点（至少 1 个）
6. 复杂度（低/中/高）
7. 风险等级（低/中/高）
8. 适用场景

### 输出格式

```
## 阶段4：方案已自动选择

| 方案 | 核心思路 | 优点 | 缺点 | 复杂度 | 风险 | 推荐度 |
|------|---------|------|------|--------|------|--------|
| 方案1 | [思路] | [列举] | [列举] | 低/中/高 | 低/中/高 | ⭐⭐⭐⭐⭐ |
| 方案2 | [思路] | [列举] | [列举] | 低/中/高 | 低/中/高 | ⭐⭐⭐⭐ |

**AI自动选择**：方案1 - [方案名称]

**选择理由**：
1. 从根本上解决问题，避免后续类似 bug
2. 符合代码最佳实践
3. 改善了代码可维护性

---
自动进入阶段5：制定计划
```

**保存位置**：`.jira-fix/{JIRA-ID}/03-solution-options.md`

---

## 阶段5：制定计划（自动确认）

### 原则
- 详细具体，每步明确
- 考虑依赖关系和执行顺序
- 包含测试场景
- 可选使用 Mermaid 图表

### 计划必须包含 8 个部分

1. 问题根因回顾（阶段 3）
2. 选定方案回顾（阶段 4）
3. 架构设计（可选 Mermaid 图）
4. 文件修改清单（表格：文件、内容、类型）
5. 修改顺序（考虑依赖）
6. 测试场景（Web 端/Mobile 端/兼容性）
7. 影响范围（服务层/Web/Mobile/风险等级）
8. 回滚方案

### 自动确认

计划创建后自动确认，无需等待用户输入。自动创建 TODOs 并立即进入阶段 6。

**保存位置**：`.jira-fix/{JIRA-ID}/04-plan.md`

---

## 阶段6：执行计划（自动执行+生成报告）

### 原则
- 严格按计划自动执行
- 实时更新 TODO 状态
- 执行完成后自动生成报告
- Linter 错误自动阻断

### 自动执行流程

1. 前置检查（自动）
2. 按计划顺序修改代码（自动）
3. 每次修改后检查 Linter（自动）
4. 生成问题分析与解决报告（自动）

### 多项目代码修改

**执行原则**：
- 根据修改文件路径自动定位到对应项目
- 在正确的项目目录中执行代码修改
- 每个项目独立检查 Linter

**路径识别**：
- 相对路径：从计划文件中提取文件路径
- 项目匹配：根据路径前缀匹配到对应项目
- 示例：`backend/src/api.js` → backend 项目

**操作记录**：
- 记录每个项目的修改文件列表
- 记录每个项目的代码改动统计（+/- 行数）
- 为阶段 7 的分项目提交做准备

### TODO 管理

使用 `TodoWrite` 创建和更新任务状态（pending/in_progress/completed）

### 代码质量要求

1. 函数职责单一
2. 命名清晰（函数用动词，变量用名词）
3. 避免概念混淆
4. 向后兼容

### 代码质量检查

1. **Linter 检查**：修改后用 `ReadLints` 检查，新引入的错误必须修复
2. **TypeScript 检查**（自动）：如果项目存在 `tsconfig.json`，自动调用 `typescript-check` skill
   - 检测条件：`[ -f "tsconfig.json" ]`
   - 新引入的类型错误必须修复，否则阻断流程

### 报告生成规则

执行完成后，自动生成报告文件：`reports/[JIRA-ID]-analysis.md`

报告必须包含：

```markdown
# [JIRA-ID] 问题分析与解决报告

## 基本信息
- Jira ID: [ID]
- 标题: [标题]
- 优先级: [P级别]
- 修复时间: [时间戳]
- 修复分支: fuyg-jira-fix-[JIRA-ID]

## 问题分析

### 问题现象
[从阶段3提取]

### 复现步骤
1. [步骤]
2. [步骤]

### 根因分析
**直接原因**: [描述]
**根本原因**: [描述]
**调用链**: [流程]

## 解决方案

### 方案评估
[从阶段4提取方案对比]

### 选定方案
**方案**: [方案名称]
**选择理由**: [AI自动选择的理由]

### 实施计划
[从阶段5提取计划]

## 实施过程

### 修改文件清单
| 文件 | 改动 | 说明 |
|------|------|------|
| [文件1] | +X/-Y | [说明] |

### 关键改动
[展示核心代码改动，使用代码引用格式]

### 遇到的问题
[如果有Linter错误、编译错误等]

## 影响范围

### 功能影响
- [列表]

### 平台影响
- Web端: [说明]
- Mobile端: [说明]

## 测试建议

### 功能测试
- [ ] 场景1
- [ ] 场景2

### 回归测试
- [ ] 相关功能验证

## 总结

本次修复[简要总结]，建议[后续建议]。
```

### 报告创建流程

1. 收集阶段 3-6 的所有信息
2. 创建 reports 目录（如不存在）
3. 生成完整报告文件
4. 输出报告路径

**保存位置**：`.jira-fix/{JIRA-ID}/05-execution.md`

---

## 阶段7：Git 提交代码（自动）

### 原则
- 调用 `git-commit` SKILL（execute=true，自动模式）自动执行提交
- 自动生成 commit message
- 自动执行 git add、commit、push
- 报告文件一起提交

### 执行步骤

1. **收集提交信息**：
   - Jira ID: [从阶段2获取]
   - 问题描述: [从阶段3获取]
   - 根本原因: [从阶段3获取]
   - 修复方案: [从阶段5获取]
   - 修改文件: [从阶段6获取]
   - 报告路径: reports/[JIRA-ID]-analysis.md
   - 分支名称: fuyg-jira-fix-[JIRA-ID]

2. **调用 git-commit SKILL（自动模式，execute=true）**：
   ```
   调用 git-commit SKILL（自动模式，execute=true），传递以下信息：
   - type: "fix"（根据实际情况确定）
   - scope: [根据修改模块确定，如 ai-summary、share、auth、api、ui、core]
   - subject: [从Jira标题或问题描述中提取，不超过50字符]
   - jira_id: [JIRA-ID]
   - problem_description: [问题描述和根本原因]
   - root_cause: [根本原因]
   - solution: [修复方案摘要]
   - modified_files: [修改文件列表]
   - report_path: reports/[JIRA-ID]-analysis.md
   - branch: fuyg-jira-fix-[JIRA-ID]
   ```

3. **自动执行并输出结果**

4. **Jira 状态自动回写**：
   - 调用 `jira_get_transitions`(issue_key="{JIRA-ID}") 获取可用转换
   - 调用 `jira_transition_issue`(issue_key="{JIRA-ID}", transition="Code Review")
     - 优先匹配："Code Review" > "In Review" > "In Progress"
     - 无匹配时跳过，记录警告
   - 调用 `jira_add_comment`(issue_key="{JIRA-ID}", body=修复评论)

**修复评论模板**：
```
**AI 自动修复报告**

- **修复分支**: fuyg-jira-fix-{JIRA-ID}
- **Commit**: {commit_hash}
- **根因**: {root_cause_summary}
- **修复方案**: {solution_summary}
- **修改文件**: {file_list}
- **分析报告**: reports/{JIRA-ID}-analysis.md

请进行 Code Review。
```

**错误处理**：回写失败不阻断流程，仅输出警告并记录到报告。

### Commit Message 格式说明

`git-commit` SKILL 会按照以下格式生成 commit message：

```
<type>(<scope>): <subject> <Jira-ID>
```

**Type 类型**：fix、feat、refactor、perf、style、docs、test

**Scope 示例**：ai-summary、share、auth、api、ui、core

**Subject**：中文简要描述（不超过 50 字符）

**说明**：详细参数（问题描述、根本原因、修复方案、修改文件、报告路径）仍会收集并传递给 `git-commit` SKILL，但仅用于上下文分析，不会写入 commit message。单项目和多项目使用相同的格式（只有标题行）。

**注意**：不再区分单项目和多项目的 commit message 格式，统一使用标题行格式。

### 完成输出

**单项目场景**：
```
## 阶段7完成：代码已自动提交并推送

**分支**: fuyg-jira-fix-[JIRA-ID]
**项目**: backend
**Commit**: [commit hash]
**推送状态**: 成功

**下一步**：
1. 在Jira中创建Pull Request
2. 通知相关人员进行Code Review
3. 测试验证

**Jira 回写**: ✅ 状态已自动更新为 Code Review / ⚠️ 回写跳过

**分析报告**: reports/[JIRA-ID]-analysis.md
```

**多项目场景**：
```
## 阶段7完成：代码已自动提交并推送（多项目）

**分支**: fuyg-jira-fix-[JIRA-ID]
**涉及项目**: 2个

| 项目 | Commit Hash | 推送状态 | 改动 |
|------|------------|---------|------|
| backend | a1b2c3d | ✅ 成功 | +45/-12 (3 files) |
| frontend | e4f5g6h | ✅ 成功 | +23/-8 (2 files) |

**下一步**：
1. 在Jira中为每个项目创建Pull Request
2. 通知相关人员进行Code Review
3. 测试验证（注意多项目联动测试）

**Jira 回写**: ✅ 状态已自动更新为 Code Review / ⚠️ 回写跳过

**分析报告**: backend/reports/[JIRA-ID]-analysis.md
```

**保存位置**：`.jira-fix/{JIRA-ID}/06-commit.md`

---

## 核心原则

### 1. 自动化原则
- 最小化人工干预
- 自动决策记录理由
- 失败时清晰报错

### 2. 安全原则
- 修改前自动备份
- 阈值检测
- 错误自动阻断
- 详细日志记录

### 3. 质量原则
- Linter 零容忍
- 选择最佳实践方案
- 生成完整报告
- 多端一致

## 自动化配置

### 环境要求
- mcp-atlassian 已配置且 PAT 有效
- Git 配置正确

### 改动阈值
- 警告阈值：修改 >10 个文件或 >500 行
- 阻断阈值：修改 >20 个文件或 >1000 行

## 输出要求

**语言**：中文

**格式**：Markdown 结构化

**报告**：必须生成 `reports/[JIRA-ID]-analysis.md`

**日志**：记录所有自动决策

## 总结

jira-auto-fix 实现完全自动化的 7 阶段修复流程：

**阶段 1-2**: 自动准备（分支+Jira）
**阶段 3**: 自动分析
**阶段 4**: 自动选择方案（最佳实践）
**阶段 5**: 自动制定计划
**阶段 6**: 自动执行+生成报告
**阶段 7**: 自动 commit+push

**关键特性**：
- 完全自动化（包括自动 push）
- 最佳实践导向
- 详细报告生成（`reports/[JIRA-ID]-analysis.md`）
- 安全机制保障
- mcp-atlassian API 数据获取 + Jira 状态回写
