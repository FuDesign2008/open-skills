# context-budget-discipline Specification

## Purpose
TBD - created by archiving change 2026-09-18-context-budget-discipline. Update Purpose after archive.
## Requirements
### Requirement: 阶段边界 SHALL 映射为上下文重置评估点

A host running a long lifecycle (analysis → implement → verify → report, or the host's own stage names) MUST evaluate a context reset at every major phase boundary: open a fresh session seeded from the disk ledger, or compact in place via platform-agnostic summarize-and-reopen. A single continuous session MUST NOT span the whole lifecycle once projected context crosses the compaction threshold. The phase→action map is decided at the host's planning or execution stage — never improvised mid-run.

#### Scenario: 队列卡全生命周期单会话被禁止

- **WHEN** a queue-dispatched card runs its full lifecycle in one engine session and projected context crosses the threshold
- **THEN** each subsequent phase boundary evaluates a reset (fresh session from ledger, or in-place compaction); no unbounded single-session run

#### Scenario: 短任务不强制重置

- **WHEN** a card completes before crossing the threshold
- **THEN** no forced reset occurs at phase boundaries — no churn for runs that fit comfortably

### Requirement: compaction SHALL 在窗口阈值比例处主动触发

Reset/compaction MUST trigger when measured or projected context usage approaches a defined fraction of the context window (default guidance: ~60–70%), not only near the hard limit. Wording stays platform-agnostic intent ("summarize state to the ledger, then reopen a compact session"); the body MUST NOT hardcode platform-specific compaction commands. A threshold missed mid-phase is recovered at the next safe boundary with a recorded miss note.

#### Scenario: 实现阶段中途越过阈值

- **WHEN** measured or projected context crosses ~2/3 of the window during the implement phase
- **THEN** the run writes the ledger entry and compacts or reopens a compact session before continuing

#### Scenario: 正文无平台专属命令

- **WHEN** any reader greps the skill body for platform-specific compaction commands
- **THEN** none exist — only intent wording

### Requirement: 重置前 SHALL 原子写入磁盘台账

Before any reset or compaction the run MUST write a complete ledger entry (format in the skill's reference.md): frozen decisions, decisions-so-far with evidence pointers, artifact paths, current phase, next concrete step, open tickets. A resumed session reconstructs state from the ledger and referenced artifacts, never by replaying conversation history. Write-then-reset is atomic: no reset without a preceding complete ledger entry.

#### Scenario: 新会话中途续卡

- **WHEN** a card continues in a fresh session after a phase-boundary reset
- **THEN** state is rebuilt from the ledger and work proceeds without re-reading the prior transcript

#### Scenario: 无台账重置即违规

- **WHEN** a reset or compaction happens
- **THEN** a complete ledger entry exists beforehand; a reset without one is a violation to fix before proceeding

### Requirement: 子代理摘要 SHALL 受输出契约上限约束

Sub-agent output contracts cap condensed summaries at ~1–2k tokens; the main agent MUST NOT absorb sub-agent transcripts or raw detail dumps back into its own context.

#### Scenario: 超限子代理返回

- **WHEN** a sub-agent returns more than its summary contract
- **THEN** the main agent re-requests a condensed summary instead of ingesting the dump

### Requirement: 正文语言与触发词

Instructional body text MUST be written in English; the frontmatter description and trigger list MUST include Chinese triggers (e.g. 「上下文预算」「会话瘦身」). The description MUST stay routing-only within the repo's character limit and use a role phrase instead of enumerating host skills.

#### Scenario: 双语触发路由

- **WHEN** a Chinese-speaking user says 「上下文瘦身」
- **THEN** the phrase hits the Chinese trigger and routes the skill, while the body executes as English instructions

