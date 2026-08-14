# Design: add-ai-env-verification

## Context

本工程 4 个 PDCA host（solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow）的验证环节，当前是「AI 能跑 Bash 测试就跑、否则把步骤列给用户自行执行」的粗糙二分。该契约订立时还没有「AI 驱动环境验证」的目标，缺少 attempt-first、环境分层、提供者解析三个概念，导致非平凡验证（UI、真机、Electron、端到端）默认流向人工。

本设计建立一个纪律 skill `runtime-verification-discipline` 作为唯一权威契约（SoT），4 个 host 经 frontmatter `dependencies` 强引用并在验证环节薄引用。设计决策经 `solution-review` 九维度审查（双向门，标准深度）通过；`code-design-review` 因纯 Markdown 方案判 N/A。

## Goals / Non-Goals

**Goals:**
- 让所有工作流的验证默认由 AI 在环境中亲自执行，减少人工验证劳动。
- 真实环境优先、模拟环境兜底，但选层须满足确定性与安全约束。
- 验证能力可插拔：工程自带脚本/skill 优先，本工程能力 skill 兜底。
- 交还人仅在真硬边界，且必须分类并给出理由。
- 单一权威契约（SoT）+ host 薄引用，符合本仓共享纪律 skill 架构。

**Non-Goals:**
- 新建 Electron / iOS 真机驱动能力 skill（后续迭代）。
- 在任何能力 skill 中复写通道选择 / 驱动 recipe（能力层职责，纪律层不碰）。
- 为 `solve-workflow` 补建 spec（其无既有 spec，本次仅改 SKILL.md；如需另立项）。
- 把纪律写成验证方法论大全（契约只管「该不该、在哪层、谁验、够不够」，「怎么验」委派能力 skill）。

## Decisions

### D1: 规则层纪律 skill，而非能力层 skill
新 skill 是纪律（contract），不是能力（capability）。能力层（web）已被 `browser-debug-toolkit` 占用；mobile/electron 能力空白应由聚焦的小 skill 后续补，而非一个什么都管的「验证 skill」。规则层定「该在哪层验、够不够、谁验」，能力 recipe 委派给能力 skill。**备选**：纪律+能力一体（方案三）——违 YAGNI 且混淆两层，已拒。

### D2: `-discipline` 角色 + `user-invocable: false` + host 强依赖
按 AGENTS.md 角色命名，本 skill 是硬纪律：host 经 `dependencies` 强引用、缺失即中止、不可静默降级，与 `completion-evidence-discipline` 等同类。用户不直接触发，经 host 到达。

### D3: 新 skill 零 frontmatter 依赖
它按名弱引用能力 skill（browser-debug-toolkit 等）作默认提供者，但不声明为 `dependencies`——否则能力依赖会传染给所有 host（host 启动前置检查会要求能力 skill 也在）。

### D4: 环境分层相对生产目标
真实/模拟是相对概念：Web→真浏览器为真实；Electron→该 app 为真实、纯浏览器为模拟；移动→物理真机为真实、模拟器为模拟。

### D5: 选层规则 = 置信度 vs 成本，带确定性 + 安全限定（Q1 调研）
标准框架是置信度/成本权衡（Kent C. Dodds Testing Trophy），非「越真越好」。规则：取「AI 能零人工驱动、且对该断言足够确定 + 足够安全」的最高保真层；写操作或易 flaky 检查走「模拟先验 → 真实确认 → 如实标注」，只读高确定检查才可真实一步到底。**备选**：「能自动就真实优先」——被真实环境副作用与 flakiness 证据否定。

### D6: 提供者解析 = 约定优于配置（Q3 调研）
「工程自带 → 本工程能力 → 交还」正是主流工具「项目覆盖共享默认」的发现模式（jest/playwright 自动发现 config，eslint extends preset，cosmiconfig 向上搜索）。精化：工程自带验证须为**规范的可发现约定**（约定位置的 verify 脚本/skill，AI 自动探测），非临时约定。

### D7: 失败 A/B/C 分类，C 含「无法判定结果」（Q2 调研）
A 没接线（当场接）/ B 缺一次性环境（给命令由用户定）/ C 真硬边界（交还须给理由）。C 含三类：无法行动（物理设备/captcha/生物识别）、无法判定结果（主观 UX/探索式）、真实世界副作用。调研确认「需人类主观判断」是独立硬边界，故 C 显式纳入。

### D8: 充分性判据入契约（Q4 调研）
「越贴近真实使用越可信」。验证充分 ⇔ 以软件真实被使用的方式覆盖改动的确切行为，作为核对义务第 1 条。

### D9: 诚实分层标注 = 从属条款非门禁
报告如实标注所用层；低于生产目标层标「模拟已验，真实建议人补冒烟」。不拦 AI 在可达层验证，只防「模拟验完」被误读为「真实已确认」。

### D10: 与 completion-evidence-discipline 正交互注
新鲜度轴（这轮跑过没）× 环境/执行者轴（在哪层验、谁验）。一条 pass claim 需两轴都过。两 skill 正文互相标注边界。

### D11: host 集成 = 薄引用，按各 host 现状差异化编辑
solve/opsx-solve 替换「AI cannot execute」二分原文；opsx-jira-fix 替换「manual-verification items」措辞；jira-fix 新增引用（原本隐式）。host 正文只留「加载 + 适用条件」，不复述纪律方法论（本仓薄引用强制约定）。

## Risks / Trade-offs

- **FM1 AI 在真实环境做破坏性动作** → D5 安全限定 + D7 真实副作用属 C 类交还人，拦住。
- **FM2 AI 把 C 谎报为 A/B 逃避交还** → D7 须给理由 + D9 标注 + completion-evidence-discipline 新鲜度组合约束。
- **FM3 旧装用户部分更新致 host 启动中止** → 安装脚本 `--skill '*'` 整包安装；中止时给安装命令。
- **FM4 提供者解析仅约定层面或致应用不一致**（非阻塞）→ reference.md 承载具体解析示例；Stage 6/7 验证其充分性。
- **权衡**：选层规则比「真实优先」复杂，但换来的是不在真实环境产生副作用、不被 flakiness 困扰——值得。

## Open Questions

- 工程自带验证的「规范可发现约定」的精确落位（约定路径 / 命名），在 Stage 5 计划与 reference.md 中定稿。
- Electron / iOS 能力 skill 的立项时机（后续单独评估）。
