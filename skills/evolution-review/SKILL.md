---
name: evolution-review
version: "1.0.0"
user-invocable: true
description: "Data-driven selection review for any portfolio of works/products/experiments: judge items by outcome data, fix winners into reusable standards (gene fixation), kill losers without sentiment (extinction), budget exploration with a mutation quota, and use a rolling 3-month window so single months never dictate direction. Distilled from a real 4.5-month AI-music business (307 releases, ¥95 total revenue) where it ran as an evolution mechanism. Use when 做月度/季度作品复盘、决定加码或砍掉哪些作品/实验/产品线、清理积压库存、防止先验或沉没成本锁死方向、把「自我感觉」换成「数据说话」. Triggers — 「月度复盘」「数据复盘」「自然选择复盘」「进化复盘」「加码还是止损」「砍库存」「淘汰评审」「该砍哪个」 / evolution review, natural selection review, monthly data review, kill criteria, mutation quota. Do NOT use for 个人绩效自评 or 单任务复盘（learn-and-improve owns single-task retrospectives）."
---

# Evolution Review（数据驱动的自然选择复盘）

> 把一个作品/实验/产品组合的月度复盘，从「自我感觉 + 沉没成本不舍得」改造成「数据说话 + 定向灭绝 + 受控变异」的 **自然选择机制**。源自一个真实运营 4.5 个月的 AI 音乐副业（307 首上架、累计 ¥95 收入）中验证过的进化机制 v1.0——业务失败了，机制活了下来。

## Why this skill exists

- **先验锁死**：创作者/团队对自己偏好的方向投入越来越多的资源，数据不好也继续（沉没成本 + 自我感觉）
- **假复盘**：大多数复盘产出「感觉 A 方向好」式的模糊结论，无淘汰、无预算再分配，下月照旧
- **无灭绝的复盘 = 无选择的进化**：没有淘汰的复盘只是日记；没有固定（沉淀配方）的复盘只是情绪
- **单月情绪化反应**：一次爆款或一次失败就改方向，被单月噪声牵着走

## 核心机制（六步）

| 步骤 | 动作 | 关键纪律 |
|------|------|------|
| ① 盘点 | 组合内全部条目（作品/实验/产品线）× 双指标（收益类+触达类） | 数据必须来自平台结算或埋点，不自报 |
| ② 固定 | 胜出条目的共性沉淀为「配方/DNA 报告」，成为下期默认配方 | 双实例验证才沉淀；单实例只登记不沉淀 |
| ③ 灭绝 | 无收入/无增长验证的条目执行灭绝（下架/归档/停止投入） | 记录失败配方避免重复；灭绝前查「未对账混淆」 |
| ④ 变异配额 | 每期拿出 15~20% 资源做新假设实验（突变配额） | 突变有配额上限——防止方向漂移 |
| ⑤ 滚动窗口 | 判断用 3 个月滚动数据，单月波动不触发方向改变 | 单月爆款/单月惨败都不改方向，滚动窗口说话 |
| ⑥ 多样性盘点 | 每期盘一次「组合多样性」：是否全部押注单一方向 | 单一化=环境突变时全灭；保留 2-3 个生态位 |

## Iron Rules

1. **数据说话，不自报**：复盘输入必须是平台结算单/埋点/对账数据，不是「我觉得」；无数据的条目记「未对账」，灭绝评审时降权
2. **双实例验证才沉淀**：单月爆发不沉淀为规则，连续两期验证才固化为默认配方
3. **单实例结论不沉淀**：当天立规当天撤回（「翻烧饼」）是机制失败信号，回到滚动窗口
4. **灭绝不带情绪**：砍掉无验证条目时记录「淘汰配方」而非惋惜——失败记录是防止重复的资产
5. **先验=假设非结论**：所有「我一直以为」在数据面前只是假设；边界实测优先于先验否决
6. **突变配额既是上限也是下限**：>20% = 方向漂移，<15% = 进化停滞；到期未用完的配额作废（防「攒着」逃避实验）

## 复盘台账模板

| 条目 | 收益指标 | 触达指标 | 判定 | 动作 | 配方沉淀 |
|------|------|------|------|------|------|
| 作品/实验/产品线 A | ¥ / 转化 | 播放/曝光/安装 | 固定 / 观察期 / 灭绝 | 加码 / 挂机 / 下架归档 | 胜出共性（连续两期） |
| … | … | … | … | … | … |

- 判定三值：**固定**（连续两期胜出→默认配方）/ **观察期**（单期信号，等滚动窗口）/ **灭绝**（滚动窗口内无验证）
- 每期台账滚动保留 3 个月窗口，作为下一期的对比基线

## 实战溯源（机制来源，非必读）

本 skill 的机制在以下真实场景验证过完整一轮：AI 音乐副业 4.5 个月、307 首上架、双指标选择（汽水收入×收藏）、词牌吟唱线被固定为唯一稳定配方（67% 收入占比）、纯音乐线灭绝（¥0.17/月）、买收藏运营灭绝（ROI 54%/31%）、8 月起执行滚动窗口 + 预测-实测对账闭环。

**证据链**：`oh-my-music/research/music-ecology/evolution-mechanism.md`（机制 v1.0 十二条）、`oh-my-music/feedback/DECISION_RULES.md`（纪律 v0.4）、`oh-my-music/feedback/revenue/`（月度对账）。

## 与其他 skill 的关系

- 单任务/单项目的复盘（Keep-Problem-Try）→ `learn-and-improve`
- 本 skill 管**组合层**的月度选择：加码谁、砍谁、预算给谁——两者可串联（先组合选择，后单点复盘）

