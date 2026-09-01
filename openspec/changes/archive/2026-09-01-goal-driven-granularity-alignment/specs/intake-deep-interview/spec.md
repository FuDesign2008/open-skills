# intake-deep-interview Delta: presence tiers + impact-gated self-answer

## MODIFIED Requirements

### Requirement: 深谈入库访谈（雾为界）

The skill SHALL define a deep intake interview for unattended long-run hosts, run while the human is present: (1) destination — one short success picture; (2) decision tickets resolved one question per turn, composing `clarifying-question-discipline`; (3) approach comparison — 2–5 approaches in one table, human picks (lean path with no fog: 1 approach + risk note); (4) freeze into the host contract; (5) bounded pre-launch self-review — checklist level, one fix-and-recheck cycle, a remaining blocking doubt returns to the human before launch. Depth is fog-bounded per `decision-fog-discipline` — never a fixed question count; an explicit human skip records assumptions and proceeds. The interview SHALL apply **presence tiers**: when the human is present (the default), open decisions are resolved as per-decision questions until fog graduates — self-answers are reserved for explicitly low-impact items, and the freeze step re-reviews every self-answered item's impact-if-wrong, escalating any high-impact item to a question while the human can still answer it; when the human has declared absence or is structurally absent (batch child runs, scheduled pulls, card-inherited intake), the once-confirm + full-ledger mode applies unchanged. The host contract SHALL carry a **Decisions-I-made-for-you** section listing self-answered decisions with their impact tiers, presented at the approval event.

#### Scenario: 雾为界的深度

- **WHEN** 入库任务清晰无雾
- **THEN** 访谈快速毕业（不硬凑问题数）；任务多雾则按决策树逐票多轮问清后才毕业

#### Scenario: 发射前自审拦截

- **WHEN** 冻结后自审发现阻塞性疑点（如预算缺失、约束自相矛盾）
- **THEN** 修复后复检一次；仍阻塞则趁人在场当面退回，不带着疑点发射

#### Scenario: 在场逐决策提问

- **WHEN** 人在场（默认档）且访谈中存在影响面高或方向性的开放决策
- **THEN** 系统将其升格为一次一问的 intake 提问（含推荐答案），不由自答冻结；仅低影响项（命名、可逆小选择等）走保守默认并入账

#### Scenario: 缺席档保持不变

- **WHEN** 用户声明离开或属于结构性缺席（队列子运行/定时拉起）
- **THEN** 访谈按现行一次确认 + 全账本模式执行，行为与引入在场两档之前逐字一致

#### Scenario: 自答影响分级复核

- **WHEN** 冻结前存在若干自答项
- **THEN** 系统逐项复核 impact-if-wrong，高影响项升格为提问；留存的自答项连同影响分级写入 Decisions-I-made-for-you 段并在批准事件展示

### Requirement: 运行期自答优先级

The skill SHALL define a priority order for mid-run decisions while the human is absent: (1) frozen contract answers it → follow; (2) investigable fact → investigate read-only, decide, record assumption; (3) reversible choice whose impact-if-wrong is explicitly **low** → conservative default, record; a decision whose impact-if-wrong is high MUST NOT take the conservative-default rung — it escalates at the next human touchpoint (a present intake, a queue discovery boundary) or, absent one, produces a clean stop; (4) blocking and unanswerable by 1–3, or evidence falsifying the frozen approach → clean stop at a safe point (no half-edits, budget respected) + ticket report (what, evidence, options with trade-offs), status per host vocabulary — never an improvised new direction.

#### Scenario: 事实不问人

- **WHEN** 运行中的疑问可通过只读调查在环境内回答
- **THEN** 系统调查后自答并入台账留痕，不因此停下等人

#### Scenario: 干净停止优于静默换向

- **WHEN** 冻结方向被证据证伪
- **THEN** 系统输出可见的停止与票报告；静默改向视为违规（可见的停止是纪律的成功，静默换向是失败）

#### Scenario: 高影响决策不走保守默认

- **WHEN** 运行中出现 impact-if-wrong 高的决策且冻结契约与调查事实均无法闭合
- **THEN** 系统跳过保守默认档：有下一次人触点（如队列完成边界的重扫/发现）则升格为该触点的提问，否则干净停止出票（含选项与权衡），绝不静默默认放行
