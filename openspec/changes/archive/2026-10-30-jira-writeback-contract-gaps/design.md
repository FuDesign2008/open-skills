## Context

两个缺口都来自同一个归档变更（`fix-jira-comment-fidelity`）：它新增了回读保真与 REST 回退，但只把契约写进了 `jira-status-writeback` 的 spec，且没有检查回退脚本的运行时依赖。

- `scripts/update-comment-wiki.mjs` 第 27 行 `import { resolveJiraToken } from '../../jira-read/scripts/resolve-jira-token.mjs'`。按 `--skill jira-status-writeback` 单装时该文件不存在，回退路径以 `ERR_MODULE_NOT_FOUND` 崩溃；而 skill 文本与 spec 都承诺回退可用。
- `jira-wiki-markup/SKILL.md` 的「Markup fidelity across write channels」一节描述了对**任意** Wiki 字段写入的回读与回退规则，但该 skill 的 spec 四条需求都未覆盖它。任一同类指令在审查时会被判定为「无契约支撑」。

事实校正（本轮审查发现）：宿主在运行时确实依赖 `jira-read`。`jira-fix-workflow` 的 spec 明确要求「Before any live Jira call, the host MUST run the `jira-read` credential resolution chain」，其 SKILL.md 直接调用 `jira-read {JIRA-ID} --live`；`AGENTS.md` 的依赖列也已列出 `jira-read`。但它的 frontmatter 没有声明——这是既有漂移，本变更顺手修复。`opsx-jira-fix-workflow` 的 spec 允许 MCP-only（`jira-read --live` 或 mcp-atlassian 二者其一），因此不对它新增硬依赖。

## Goals / Non-Goals

**Goals**

- 「承诺的能力」与「实际可运行的能力」一致：缺失依赖在加载检查时可见，而不是在回退时崩溃。
- wiki 保真纪律有 spec 覆盖，且不引入 `jira-wiki-markup → jira-status-writeback` 的反向强依赖（会与现有 `jira-status-writeback → jira-wiki-markup` 形成环）。
- 修复 `jira-fix-workflow` frontmatter 与既有 spec/AGENTS.md 的依赖漂移。

**Non-Goals**

- 不改变回退脚本的端点、凭证解析顺序或保真比对算法。
- 不给 `opsx-jira-fix-workflow` 新增 `jira-read` 硬依赖：其 spec 支持 MCP-only 配置，新增硬依赖会让这类用户在启动时被拦截，超出本变更要修的缺口。

## Decisions

### D1：`jira-read` 声明为硬依赖，而不是把凭证解析器复制进来

**选择**：`jira-status-writeback` 的 frontmatter `dependencies` 增加 `jira-read`，前置检查两者；`jira-fix-workflow` 同步补 `jira-read`（与其 spec 和 `AGENTS.md` 既有声明对齐）。

**备选**：

1. **复制**一份 `resolve-jira-token.mjs` 到 writeback 的 `scripts/` —— 凭证链出现两处真源，未来任一处改动都会让两条路径漂移。
2. **主通道优先、仅在回退时显式失败**：不声明依赖，把静态 import 改成受控动态 import，回退不可用时打印「请安装 jira-read」并非零退出。这不是静默降级，且能让主通道保真的 MCP-only 环境继续完成写回。
3. **保持静态 import + 声明硬依赖**（本选择）。

**理由**：仓库约定「skill 承诺的能力若依赖另一 skill，就必须在 frontmatter 声明并在缺失时中止」。备选 2 让能力声明继续依赖散文，`npx skills add --skill jira-status-writeback` 不会拉起 `jira-read`，平台加载器也无法提前提示。选择 3 把「回退可用」变成可核验事实，且单装场景从「写到一半崩溃」变成「加载时明确告知缺什么、怎么装」。

**已知代价**（有意接受）：

- 未装 `jira-read` 的既有安装在加载 writeback 时中止。对 `jira-fix-workflow` 用户这是修复（其 spec 本就要求该凭证链）；对 **MCP-only 的 `opsx-jira-fix-workflow` 用户**，原本主通道保真的写回可以成功，现在会中止——需补装 `jira-read` 才能恢复。选择 2 能避免这条代价，但代价是依赖不可声明、单装仍会走到崩溃路径；两害相权，取可核验的一侧。
- 中止发生在 writeback 加载时（合并之后），不是宿主启动时。合并已完成，因此按既有失败处理：告警并继续收尾，不回滚合并。
- 脚本的静态 import 保持原样；由于前置检查在 SOP 之前拦截，合规流程不会到达该 import。直接单独运行脚本不在支持范围内（会得到 `ERR_MODULE_NOT_FOUND`）。
- 相对路径 `../../jira-read/scripts/...` 假设两个 skill 安装在同一 skills 根下（CLI 的 `--skill` 安装即是如此）；跨根安装（全局 + 项目级混装）不在支持范围。

### D2：wiki 保真需求用「可用的直接 REST 通道」措辞，并定义可核验的可用性

**选择**：`jira-wiki-markup` 的新需求要求「回读校验 + 用可用的直接 REST 通道重试 + 无通道时如实报告失败」，不把 `jira-status-writeback` 写成强依赖。

**可用性判定（可核验）**：回退通道可用 = 提供该字段直写脚本的 skill 已安装，**且**脚本文件与其凭证解析器文件都存在（对 bundled comment 脚本即 `scripts/update-comment-wiki.mjs` 与 `jira-read/scripts/resolve-jira-token.mjs`）。只看到 skill 目录不算可用——脚本存在但解析器缺失时运行仍会崩溃。

**理由**：

- 若 `jira-wiki-markup` 声明 `jira-status-writeback` 为依赖，两个 skill 互为强依赖，前置检查会互相中止。
- 回退通道是**宿主环境能力**，不是 wiki 记号法的固有依赖；独立使用 `jira-wiki-markup`（例如只写 issue 描述）时可能根本没有 writeback skill。
- 具体指向（bundled comment 脚本）保留在 SKILL.md 作为可选指针，并明确该脚本只写 comment body：description 等其他 wiki 字段需要等价端点，不存在时按「无通道」处理并如实报告。这样契约不会再次超出脚本能力。

### D3：保真纪律在两处 spec 各自存在，措辞互相指认

`jira-status-writeback` 的既有需求覆盖「合并后修复评论」这一流程；`jira-wiki-markup` 的新需求覆盖「任意 Wiki 字段写入」。两者不重复描述实现细节，只有后者在正文中点明前者的存在，避免读者以为两套规则冲突。

### D4：版本递增

| Skill | 版本 | 理由 |
|-------|------|------|
| `jira-status-writeback` | 1.2.1 → 1.3.0 | 新增硬依赖，加载行为变化（缺失时中止），属 MINOR |
| `jira-wiki-markup` | 1.1.1 → 1.2.0 | 新增规范性需求（保真校验、可用性判定、失败上报） |
| `jira-fix-workflow` | 3.38.0 → 3.39.0 | frontmatter 补 `jira-read`，启动检查变严，属 MINOR |

## Risks / Trade-offs

| 风险 | 影响 | 缓解 |
|------|------|------|
| MCP-only 的 opsx 用户升级后写回中止 | 原本可成功的写回被跳过 | 中止信息给出全量安装命令；design 记录为有意取舍；一条命令即可恢复 |
| `jira-fix-workflow` 启动检查变严 | 未装 jira-read 的机器启动即中止 | 其 spec 本就要求 `jira-read` 凭证链，属修复既有违约；安装提示可直接执行 |
| 可用性判定依赖文件路径 | 契约引用了另一 skill 的内部文件布局 | 只把「脚本 + 解析器存在」作为最低可核验事实；布局变化由契约测试兜底 |
| 两处保真需求未来漂移 | 读者困惑 | 两条需求各自声明范围，`jira-wiki-markup` 正文指认 writeback 的对应需求 |
| 跨根安装时相对 import 失败 | 回退仍会崩 | 安装模型（同一 skills 根）下不发生；写入 Risks 并在契约测试中断言路径形状 |

## Migration

无数据迁移。安装侧：`install-skills.mjs --skill '*'` 已包含全部 skill，无需改动；单装用户按前置检查提示补装 `jira-read`。
