# Design — fix-verify-evidence-ui-screenshot

## Context

修复类 PDCA 工作流的验证证据存在「UI 截图留痕断链」。规则栈现状：

| 环节 | 文件:行 | 现状 |
|------|--------|------|
| 被动截图条款 | `skills/runtime-verification-discipline/SKILL.md`「An opened UI keeps a screenshot file」段 | 只规定「已经打开 UI 后」证据形态（留存非空截图），不强制 UI 打开行为本身 |
| 充分性检查 | 同文件「Sufficiency check」段 | 要求验证覆盖变更的确切行为，但无「验证面包含 UI 行为」的可核验判定信号 |
| 被动证据条款 | `skills/completion-evidence-discipline/SKILL.md`「When the check opened a UI」句 | 同为被动（条件 = 已打开 UI） |
| host 薄引用 | `skills/solve-workflow/SKILL.md`「Verification execution follows...」句、`skills/opsx-solve-workflow/SKILL.md` 同段、`skills/jira-fix-workflow/SKILL.md` 验证段内句、`skills/opsx-jira-fix-workflow/SKILL.md` 同段 | 仅薄引用，无 UI 证据判定入口（薄引用原则下这是正确设计，改规则层单点即可传播） |

断链机制：所有截图条款为被动条件条款（条件 = 检查已经打开了 UI），上游不存在强制入口回答「验证面含 UI 行为时是否必须打开 UI」，且充分性检查无「验证面含 UI 行为」的可核验判定信号。执行方走纯非 UI 检查路径（类型检查/单测/规格校验全绿即收束）时，`opened UI` 条件恒为假，截图条款从不触发。三个真实修复案例（云端 Web 应用弹层修复、文档序列化修复、输入法编辑器修复）共同点即此。

## Goals / Non-Goals

**Goals**

- 在规则层（runtime-verification-discipline）补齐前置强制：验证面含 UI 行为 → 验证须含打开 UI 的检查并留截图；环境受限 → 显式 limitation 留痕，不静默跳过。
- 判定输入可核验（铁律 10）：路径后缀与 diff 内闭合视图标签，均由一条 git diff 命令证实。目标、任务卡、修复描述的措辞不是判定输入。
- 经既有薄引用句传播到全部 4 个 host，host 文本零改动。

**Non-Goals**

- 不改 completion-evidence-discipline（其被动证据形态条款衔接新前置条款即可，正交分层保持）。
- 不改 4 个 host 工作流文本（薄引用原则）。
- 不触碰 Figma 对齐验证域（figma-pixel-verify 已有「openable channel 须留截图」条款，域不同，不合并——YAGNI）。
- 不新增 skill，不新建 capability。

## Decisions

### D1: 单点修规则层，host 与姊妹 discipline 零改动

**选择**：文本改动集中在 `runtime-verification-discipline` 的 SKILL.md + reference.md；completion-evidence-discipline 与 4 个 host 不改。

**理由**：根因在规则层缺少前置强制入口，host 薄引用句已正确指向规则层。单点修改经薄引用句传播到所有 host，维护点最少。

**被拒替代**：
- 同步改 completion-evidence-discipline → 与其既有被动条款语义重复，破坏两 discipline 的正交分层设计，双源漂移风险；
- 4 host 各加 UI 证据条目 → 违反薄引用原则（integration guide 明确禁止把规则正文复制进 host），4 处维护点；
- 只改 host 清单 → 未命中根因。

### D2: 判定信号双通道设计（铁律 10）

**选择**：两类命令输出，任一命中即判定验证面含 UI 行为：

1. **路径后缀信号**：diff 路径以 `.html`/`.css`/`.scss`/`.less`/`.vue`/`.svelte`/`.tsx`/`.jsx` 结尾——`git diff --name-only` 可证实；
2. **视图标记信号**：同一 diff 的增删行匹配一条闭合的、大小写敏感的标签正则——`git diff -U0 | grep -E` 可证实。

两次命令使用同一次 diff：`origin/HEAD` 可解析时为 `git diff --merge-base origin/HEAD`，否则为 `git diff HEAD`。

**理由**：铁律 10 要求判定输入能被一条命令或一次 grep 证实。路径后缀盖住视图文件。视图标记盖住后缀之外、diff 里真有视图标签的改动。只改数值的 `.ts`/`.js` 逻辑，即使任务卡写了「弹层定位」，也不命中。

**被拒替代**：
- 把「描述是否以渲染/布局/交互为验证对象」当作信号 → 读到文字只能证明文字在，分类本身不能被命令或 grep 证实，违反铁律 10；放弃。
- 把 `.ts`/`.js` 全量纳入路径信号 → 会误伤纯逻辑修复（如数据序列化），制造截图义务噪音；放弃。

### D3: 误判方向偏保守（宁可多触发）

多触发代价（判定含 UI 行为但实际非 UI 行为）= 多留一次截图/留痕，代价小；漏判代价 = 静默跳过 UI 证据（本次根因）。信号集合取保守覆盖（覆盖面宁大勿小）。

### D4: 环境受限留痕三要素

验证报告 limitation 条目三要素：受限原因 + 受阻层 + 后续明确验证动作。三要素让留痕可执行（后续轮次可依此补验），不只是声明「做不了」。

### D5: 版本号不手改

release.yml 在 push main 时自动 bump `package.json` 版本；skill frontmatter `version` 历史惯例不手改，本次沿用。

## Risks / Trade-offs

- [风险] 传播依赖执行方在验证阶段真正加载 discipline 正文 → [缓解] 4 个 host 的薄引用句已指向该 skill，遵循即读；reference.md 新增判定信号示例与留痕模板供查例。
- [风险] 视图标记正则误伤含同类标签文本的非界面改动 → [缓解] 标签表是闭合集合且大小写敏感；多触发只多一次打开 UI 或留痕。只改数值、描述里写了渲染的 `.ts`/`.js` 不命中，这是铁律 10 的边界，不靠阅读描述补洞。
- [风险] 「模拟 UI 同样计为打开 UI」被读成「无截图能力的检查也须截图」→ [缓解] 条款明写非 UI 检查照常免截图、不得伪造截图，与既有条款衔接。

## Migration Plan

纯文档/skill 文本改动，无迁移。回滚 = revert 提交。

## Open Questions

无（任务卡已冻结方向候选 a/b/c，本设计选 a；b/c 被薄引用原则排除）。
