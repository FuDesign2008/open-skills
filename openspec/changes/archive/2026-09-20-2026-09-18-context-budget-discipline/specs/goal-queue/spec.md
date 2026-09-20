# goal-queue Specification (DELTA)

## MODIFIED Requirements

### Requirement: 编排层薄引用引擎方法论

The skill body MUST thin-reference `goal-driven-workflow` for single-run methodology (acceptance layering, `/goal` condition design, sub-agent context management, launch companions, completion reporting) and MUST NOT restate that content. The frontmatter MUST declare the single-direction dependency and pass the prerequisite check at startup, aborting with install guidance when missing. The Delegate step's card supply MAY add exactly one line noting that the dispatched engine enforces its own context budget (phase-boundary resets and ledger handoff per the engine's context discipline); context-budget enforcement is unconditional — the queue MUST NOT add a card-level opt-in field for it and MUST NOT restate the engine's methodology.

#### Scenario: 正文不复制引擎方法

- **WHEN** 阅读编排 skill 的消费循环说明中关于单个任务如何执行的部分
- **THEN** 正文只保留占位映射（号+名）与队列特有编排，方法论细节以名称引用引擎阶段而非复制段落

#### Scenario: Delegate 供词仅一句话

- **WHEN** 一张卡被派发给任意引擎
- **THEN** 供词包含且仅包含一句上下文预算说明（引擎自执行阶段边界重置与台账交接），无方法论复制

#### Scenario: 不新增卡片字段

- **WHEN** 检查任务卡格式
- **THEN** 不存在上下文预算的卡片级 opt-in 字段——执行无条件，不随卡开关
