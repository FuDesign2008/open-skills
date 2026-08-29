# intake-deep-interview Specification

## Purpose
TBD - created by archiving change 2026-08-29-goal-driven-deep-intake. Update Purpose after archive.

## Requirements

### Requirement: 深谈入库访谈（雾为界）

The skill SHALL define a deep intake interview for unattended long-run hosts, run while the human is present: (1) destination — one short success picture; (2) decision tickets resolved one question per turn, composing `clarifying-question-discipline`; (3) approach comparison — 2–5 approaches in one table, human picks (lean path with no fog: 1 approach + risk note); (4) freeze into the host contract; (5) bounded pre-launch self-review — checklist level, one fix-and-recheck cycle, a remaining blocking doubt returns to the human before launch. Depth is fog-bounded per `decision-fog-discipline` — never a fixed question count; an explicit human skip records assumptions and proceeds.

#### Scenario: 雾为界的深度

- **WHEN** 入库任务清晰无雾
- **THEN** 访谈快速毕业（不硬凑问题数）；任务多雾则按决策树逐票多轮问清后才毕业

#### Scenario: 发射前自审拦截

- **WHEN** 冻结后自审发现阻塞性疑点（如预算缺失、约束自相矛盾）
- **THEN** 修复后复检一次；仍阻塞则趁人在场当面退回，不带着疑点发射

### Requirement: 运行期自答优先级

The skill SHALL define a priority order for mid-run decisions while the human is absent: (1) frozen contract answers it → follow; (2) investigable fact → investigate read-only, decide, record assumption; (3) reversible low-impact choice → conservative default, record; (4) blocking and unanswerable by 1–3, or evidence falsifying the frozen approach → clean stop at a safe point (no half-edits, budget respected) + ticket report (what, evidence, options with trade-offs), status per host vocabulary — never an improvised new direction.

#### Scenario: 事实不问人

- **WHEN** 运行中的疑问可通过只读调查在环境内回答
- **THEN** 系统调查后自答并入台账留痕，不因此停下等人

#### Scenario: 干净停止优于静默换向

- **WHEN** 冻结方向被证据证伪
- **THEN** 系统输出可见的停止与票报告；静默改向视为违规（可见的停止是纪律的成功，静默换向是失败）

### Requirement: 验收台账

The skill SHALL define a per-run decision/assumption ledger carried in the host's contract artifact (fields: id, decision/question, context, chosen answer, rationale + evidence, confidence, impact-if-wrong, status), surfaced at acceptance: unresolved tickets, low-confidence assumptions, and high-impact-if-wrong entries demand human judgment; the rest are spot-check listed; the human MAY overturn any entry; findings feed the next run's intake.

#### Scenario: 台账喂回下一轮 intake

- **WHEN** 人在验收中推翻某条台账决策
- **THEN** 该结论回流为下一轮深谈的输入，访谈质量跨轮复利

### Requirement: 纪律组合与引用边界

The skill composes `clarifying-question-discipline` + `decision-fog-discipline` via thin pointers (its own frontmatter dependencies) and MUST NOT be restated by hosts beyond the four integration touchpoints (intake pointer, contract fields, run-stage self-answer line, report/acceptance ledger line). It is `user-invocable: false`, reachable only via host frontmatter dependencies; attended hosts that pause at every gate by design do not declare it.

#### Scenario: attended host 不引入

- **WHEN** 某工作流在每个阶段出口都暂停等人（solve-workflow 型）
- **THEN** 它不声明本 skill——其质量机制来自在场交互本身；本 skill 仅服务「运行中无人可问」的 host
