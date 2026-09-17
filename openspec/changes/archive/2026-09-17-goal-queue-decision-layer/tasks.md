## 1. 参考文件与模板（reference.md）

- [x] 1.1 Task Card 模板新增三个字段行：`Certainty/Difficulty`（四信号 + 派生档 + 每项 `factual`/`preference`）、`Waits-on`（可选，依赖边）、`Reusable: yes | no`（默认 `no`）
- [x] 1.2 Progress Document 最小值表新增两行：triage 记录路径、杠杆重算导致的排序变更的事件注记（`reordering`）
- [x] 1.3 新增复用记录模板 `approaches/<signature>.md`：问题签名（症状类别而非一次性目标文本）、选定解法一行、所依据的验证、被证伪方向；写明存放于绑定队列目录内
- [x] 1.4 Defaults 段补齐：`Reusable` 默认 `no`；档位推导的「取最保守值」规则指向 design.md D1；杠杆并列时按档位再按 FIFO 的兜底说明；triage 与评估的默认行为在缺席档下的收敛（仅机械可证自动）

## 2. SKILL.md 契约实现

- [x] 2.1 frontmatter `description` 更新：加入 triage / 确定度评估 / 信息杠杆排序 / 解法复用四类能力的路由信息与中文触发词，字符数 ≤1024
- [x] 2.2 Stage 1 新增 batch triage 步骤，置于逐卡深谈**之前**：产出等价组 / 同根因簇 / 建议不做；机械可证结论（等价精确匹配、已被 done 卡覆盖）自动应用并**归档不删除**、记录 `superseded-by`
- [x] 2.3 Stage 1 新增确定度/难度评估：四信号（可逆性 / 既有证据 / 影响半径 / 依赖形态）标记 `factual`/`preference`，档位按 design.md D1 派生，禁止数值评分
- [x] 2.4 Stage 1 新增置信度门控：仅当四信号**全部 factual 且已核验**且档位为高确定/低成本时，引擎票与策略票预填评估推荐值；任一 preference 或核验失败则两票保持必问无默认
- [x] 2.5 Stage 1 新增批量批准事件：一次批准覆盖该批的合并/折叠/建议不做处置与各卡条件预算；未被显式处置的建议不做项保持原状态
- [x] 2.6 Stage 2 消费顺序改为「优先级 → 信息杠杆降序 → 确定度档 → FIFO」，并写明杠杆计数按 design.md D3 计算、每个完成边界重算、重排事件记入进度文档 Notes
- [x] 2.7 Stage 2 补齐 `Waits-on` 语义：目标未 done 不派发并保持 `waiting dependency`；成环则环上各卡搁置 `conflict pending confirmation`；目标以非 done 终态（skipped/归档/failed/搁置）结束则依赖卡同样搁置
- [x] 2.8 Stage 2 relationship pass 职责分离：等价与根因聚簇归入队 triage；派发时 pass 只负责 dependency、overlap-conflict、derived，并保留「已完成覆盖 → skipped (covered)」判定
- [x] 2.9 Stage 3 验收包纳入 triage 记录（合并/聚簇/建议淘汰/搁置逐项依据），并把 triage 决策与代理作出的决策汇入 needs-your-judgment
- [x] 2.10 AI-proxy 检查点补齐：新增 batch triage / 批量批准检查点；明写代理**不得**确认价值类淘汰（命中则出票并搁置），机械可证结论自动应用无需确认
- [x] 2.11 薄引用纪律落地：对 `evolution-review`（灭绝词表 + 记录淘汰配方）、`learn-and-improve`（载体决策树）、`solution-review`（可逆性 / CBAM / WSJF 词表）只作词汇引用，**不**加入 frontmatter `dependencies`；正文声明「词汇缺失只降低推荐丰富度，不降级任何门禁」
- [x] 2.12 Red Flags 段逐条核对与新语义一致：保留「不得并发两个子任务」「不得共享分支/OpenSpec change」；不得出现与「机械可证自动应用」「建议不做仍留人」相矛盾的红线表述
- [x] 2.13 按仓规精简核查：正文不复制 discipline 方法论、不写版本标记、不堆砌反例、表格不重复阶段详情

## 3. 评测覆盖（evals/evals.json）

- [x] 3.1 新增用例：一批含两张等价卡 → 自动合并且被覆盖卡归档可回溯、triage 记录进验收包
- [x] 3.2 新增用例：三张同根因卡 → 折叠为一张且保留三张成员目标文本
- [x] 3.3 新增用例：建议不做属价值判断 → 只提建议并保持原状态，等待人在批准事件处置
- [x] 3.4 新增用例：无人值守（缺席 / ai-proxy）下 triage 产出价值类建议 → 不静默淘汰，仅机械可证结论被自动应用并写入进度文档注记
- [x] 3.5 新增用例：ai-proxy 缺席下 triage 出价值类结论 → 代理不出票批准，出票并搁置留人
- [x] 3.6 新增用例：档位由四信号派生且全 factual → 预填引擎票/策略票默认可覆盖；卡片记录信号与可覆盖事实
- [x] 3.7 新增用例：任一信号为 preference（如影响半径主观）→ 即使派生档为高确定，两票仍必问无默认
- [x] 3.8 新增用例：factual 信号被证伪 → 评估默认不生效，卡片在消费入口搁置
- [x] 3.9 新增用例：同级两张卡杠杆不同（A 决定其余三张是否还需做，B 只影响自身）→ A 先消费
- [x] 3.10 新增用例：`Waits-on` 成环 → 环上各卡搁置并记录该环，且不阻塞其它合法卡
- [x] 3.11 新增用例：`Waits-on` 目标以 skipped/归档 结束 → 依赖卡搁置待人工决定而非无限期等待
- [x] 3.12 新增用例：新卡签名命中复用记录 → 深谈种子化（已决票以「待确认」呈现），批准事件仍独立发生
- [x] 3.13 新增用例：复用记录 factual 项证伪 → 不种子化，退回完整深谈
- [x] 3.14 新增用例：存量卡（无新字段）→ 按原规则消费，行为与引入前逐字一致

## 4. 验证

- [x] 4.1 `openspec validate goal-queue-decision-layer --strict` 退出码 0
- [x] 4.2 `npm run lint:skill-description` 通过（description ≤1024 且四要素齐备）
- [x] 4.3 `npm run lint:deid` 对本次新增内容零命中（无内部标识符；存量 issue #267 除外，若全量扫描报存量则不视为本次失败并注明）
- [x] 4.4 `npm test`（`node --test`）通过
- [x] 4.5 `node scripts/gen-skill-docs.mjs` 后 `git diff --exit-code docs/generated/skills-index.md` 无差异（索引幂等）
- [x] 4.6 双语与编号残留清扫：`grep -rn -iE '阶段 ?1\.[12]|stage ?1\.[12]|0\.5|3\.6' skills/` 零命中
- [x] 4.7 SKILL.md 中散布的表格（Path Overview、消费循环、工具约束等）在本阶段内容变更后逐表人工核对
- [x] 4.8 逐条 delta 需求与实现行为交叉核对：goal-queue-triage 4 条 / goal-queue-reuse 3 条 / goal-queue 7 条（共 66 个 Scenario）逐项确认覆盖
- [x] 4.9 若某文件被整块重写：`git diff -U0 <file> | grep '^-' | grep -v '^---'` 逐行核对删除侧，确认无意外内容丢失
- [x] 4.10 Node 版本对齐（`node-version-discipline`）后再跑上述命令，并在验证报告披露版本

## 5. 归档与交付

- [x] 5.1 `openspec-sync-specs` 将三份 delta 合入主 `specs/`（goal-queue 更新 + goal-queue-triage / goal-queue-reuse 新建）
- [x] 5.2 `openspec-archive-change` 归档变更
- [x] 5.3 归档后核对 diff：主 specs 更新与 `openspec/changes/archive/` 移动均落在工作区变更中
- [ ] 5.4 `delivery-discipline`：需要交付时提交并创建 PR/MR
- [ ] 5.5 `feature-branch-closeout` 呈现收尾菜单（PR / 合并 / 保留 / 继续）
- [ ] 5.6 `learn-and-improve` 回顾：判断哪些经验值得沉淀及其载体（写入共享载体前须人显式请求）
