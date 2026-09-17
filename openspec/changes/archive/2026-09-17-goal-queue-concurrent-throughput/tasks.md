## 1. 参考文件与模板（reference.md）

- [x] 1.1 队列配置模板新增两字段：`Concurrency`（并发度，入队期确定，缺席照用）与 `Isolation`（隔离强度，并发 ≥2 即 worktree 强制）；给出未记录时退 1 的默认说明
- [x] 1.2 Task Card 模板新增 `Modules:` 字段（由 Constraints 抽取并规范化为可比较的路径/模块列表，供非重叠准入判据读取；标注为 factual，消费入口实证）
- [x] 1.3 Progress Document 最小字段表新增 `Effective concurrency`（有效并发度，与声明值并列，用于暴露 slot 空转或平台降级）
- [x] 1.4 Defaults 段补齐三口径 caps（max-tasks / max-concurrent / wall-clock）与其默认值来源，并写明 `sum(estimates)` 降级为参考、不得表述为墙钟上界
- [x] 1.5 Isolate 相关说明更新为分强度：并发 1 = branch-or-worktree（现状），并发 ≥2 = 每并发 child 一 worktree

## 2. SKILL.md 契约实现

- [x] 2.1 frontmatter `description` 更新（加入并发消费 / 摊销 / 验收压缩的路由信息与中文触发词，字符数 ≤950 软目标）；`dependencies` 增加 `git-worktree-discipline`
- [x] 2.2 Prerequisite Skill Check 段增加 `git-worktree-discipline` 的**条件前置检查**（解析并发度 ≥2 且缺失即中止并给安装指引；并发 1 缺失不阻断）
- [x] 2.3 Stage 1 新增并发度与隔离强度票：并发度推荐默认 3；选 ≥2 即接受 worktree 强制；拒绝 worktree 则并发封顶 1；两者记入队列配置
- [x] 2.4 Stage 1 该票补**后果走查披露**（按 `intake-interview-discipline` §A 走查本工程实际配置，最低含多仓 sibling 路径断裂、每 child 一 worktree 磁盘成本、人审冲突预演而非逐张合并）
- [x] 2.5 Stage 1 入队输出新增 `Modules:` 抽取步骤（从 Constraints 规范化，供派发判据使用）
- [x] 2.6 Stage 2 消费循环由「逐卡串行」改为 **slot 派发**：空闲 slot 采纳消费序中的下一张**模块集不重叠**的卡；无可采纳卡时 slot 空转不报错不死锁；完成边界补位并重算杠杆
- [x] 2.7 Stage 2 明确重叠卡等待语义（保持 `pending`，不得为占满 slot 而采纳重叠卡）
- [x] 2.8 Stage 2 Isolate 步骤改为分强度：并发 ≥2 每卡一 worktree；并发 1 保持 branch-or-worktree
- [x] 2.9 Stage 2 记账改为**派发器单写者**：child 只回报不写共享文件；并发完成逐条记录不丢条目；记录有效并发度与声明值的差距
- [x] 2.10 Stage 2 摊销：同模块后续卡以探查记录（Approach Record 形状）种子化复用，factual 证伪则不种子化
- [x] 2.11 Stage 2 三口径 caps：任一触顶停止派发但**不中断在飞卡**；进度文档记录是哪个口径触顶
- [x] 2.12 Stage 2 新增**平台降级路径**说明：无法并发 N 卡时退到平台支持的最高值并在进度文档明示，不静默假装已并发；不硬编码平台并发工具
- [x] 2.13 Stage 3 验收改为**冲突预演**：在临时 worktree 内 rebase 到最新 main 预演冲突；**不推送、不 force-push、不改写已发布分支**；只呈报真冲突与建议合并序；合并权仍在人
- [x] 2.14 Red Flags **反转**：删除「Running two children concurrently」，改为「超过已解析并发度」与「让两个 child 共享一个 worktree」；保留「单卡失败不取消其余」的失败隔离语义
- [x] 2.15 按仓规精简核查：并发语义保持正典唯一（准入判据与 slot 机制在 `goal-queue-concurrency`、三口径在 `队列级预算`、消费序在 `持久 backlog 载体`）；不复制 discipline 方法论、不写版本标记、不堆砌反例

## 3. 评测覆盖（evals/evals.json）

- [x] 3.1 非重叠准入：空闲 slot 采纳下一张不重叠卡；重叠卡等待而非强占
- [x] 3.2 无可采纳卡时 slot 空转不报错不死锁；完成边界补位
- [x] 3.3 入队并发票：推荐默认 3；选 ≥2 即接受 worktree；拒绝 worktree 则并发封顶 1
- [x] 3.4 后果走查披露：入队票按本工程实际配置给出后果（多仓路径断裂 / 磁盘成本 / 冲突预演），不只写「接受 worktree」
- [x] 3.5 缺席照用已记录并发度与隔离强度；未记录且缺席则退 1，不静默假定并发
- [x] 3.6 条件前置检查：并发 ≥2 而缺 `git-worktree-discipline` 即中止；并发 1 缺失不阻断
- [x] 3.7 三口径 caps 分别触顶；并发触顶不中断在飞卡；`sum(estimates)` 仅作参考
- [x] 3.8 单写者记账：child 不写共享文件；并发完成两条都进进度文档；有效并发度可见
- [x] 3.9 摊销：首卡产出探查记录；后续同模块卡种子化复用；记录证伪则不种子化
- [x] 3.10 冲突预演：临时 worktree 内预演；**不推送不改写已发布分支**；只呈报真冲突；不自行合并
- [x] 3.11 平台降级：无法并发 N 时退到支持值并在进度文档明示；不硬编码平台并发工具
- [x] 3.12 并发 1 时行为与引入前逐字一致（存量队列与无 `Modules:` 字段的卡）

## 4. 验证

- [x] 4.1 `openspec validate goal-queue-concurrent-throughput --strict` 退出码 0
- [x] 4.2 `npm run lint:skill-description` 通过（≤950 软目标、四要素齐备）
- [x] 4.3 `npm run lint:deid` 对本次新增内容零命中
- [x] 4.4 `npm test`（`node --test`）通过
- [x] 4.5 `node scripts/gen-skill-docs.mjs` 幂等（重复生成无新增差异）
- [x] 4.6 双语与编号残留清扫（模式按本次改动调整，含中英文）
- [x] 4.7 SKILL.md 散布表格逐表核对（Path Overview / 消费循环 / 工具约束等）
- [x] 4.8 逐条 delta 需求与实现行为交叉核对（新增能力 7 条 / 修改能力 1 RENAMED + 9 MODIFIED，共 63 个 Scenario）
- [x] 4.9 若整文件重写则删除侧 diff 逐行核对；RENAMED 后确认旧需求名零残留
- [x] 4.10 Node 版本对齐后跑上述命令，并在验证报告披露版本
- [x] 4.11 反陈旧核对：`branch isolation` 措辞与 `串行` 表述在正文/spec 中零残留（对应 N2 与 RENAMED）

## 5. 归档与交付

- [ ] 5.1 归档前更新 `openspec/specs/goal-queue/spec.md` 的 **Purpose 段**（去掉 "serial consumption"，改为并发消费），并轻改 `子任务引擎可选调度` 句末的 `branch isolation` 措辞（N1/N2）
- [ ] 5.2 `openspec archive goal-queue-concurrent-throughput -y` 合并 delta 到主 specs（goal-queue 更新 + goal-queue-concurrency 新建）并归档
- [ ] 5.3 归档后核对 diff：主 specs 更新与 archive 移动均落在工作区变更中；新建能力 spec 的 Purpose 补写实
- [ ] 5.4 `delivery-discipline`：提交并更新 PR #319（A+B 同一 PR，已留痕偏离「PR 仅含本次变更 commits」）
- [ ] 5.5 `feature-branch-closeout` 呈现收尾菜单
- [ ] 5.6 `learn-and-improve` 回顾：本次沉淀候选逐项判定（未过 ≥2 验证门者不写共享载体）
