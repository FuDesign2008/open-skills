## ADDED Requirements

### Requirement: Write-workflow SHALL use an eight-stage writing host skeleton

`write-workflow` MUST orchestrate eight stages in order: (1) clarify intent, (2) analyze sources, (3) explore writing approach, (4) review writing approach, (5) make outline, (6) execute via writer skill, (7) verify output, (8) retrospect. Document-type methodology MUST remain in writer skills (default `tech-review-doc`); the host MUST NOT inline the writer's full five-step body.

#### Scenario: Stage order is followed

- **WHEN** a user runs write-workflow for a technical review document
- **THEN** the agent progresses through the eight host stages (pausing per manual/auto rules) and delegates file generation to `tech-review-doc` in stage 6

### Requirement: Write-workflow SHALL support manual and auto modes via workflow-mode-lifecycle

`write-workflow` MUST declare `workflow-mode-lifecycle` as a strong dependency and follow its revert/re-entry rules. Triggers containing 「自动」 (e.g. 「自动写文档」「自动模式」) select auto mode; otherwise manual is default. **Host difference:** even in auto mode, the writer’s §1 (or equivalent) user-approval hard gate MUST still pause; auto mode MUST NOT skip that gate. After §1 approval, auto mode MAY continue generation and host verify/retrospect without further confirmation until completion, then revert to manual.

#### Scenario: Auto mode still pauses for §1 approval

- **WHEN** the user starts write-workflow in auto mode and the writer reaches §1 draft confirmation
- **THEN** the agent waits for explicit user approval before writing the review file or running later writer steps

#### Scenario: Auto mode continues after §1 approval

- **WHEN** the user has approved §1 under auto mode
- **THEN** the agent may complete diagrams, remaining sections, file write, and host verify without asking for confirmation at each host stage exit

### Requirement: Write-workflow stage 2 SHALL be writing-oriented source analysis

Stage 2 MUST read and inventory source materials (design doc required; PRD/OpenSpec when relevant), confirm source existence, and produce an information-gap list before drafting. It MUST NOT declare `analysis-core` or debug skills (`runtime-evidence-debug`, `hybrid-debug`, `browser-debug-toolkit`) as dependencies, and MUST NOT perform fix-oriented instrumentation.

#### Scenario: Missing design doc stops analysis

- **WHEN** the required design document path is missing or unreadable
- **THEN** stage 2 reports the gap and does not proceed to explore/execute writing until resolved

#### Scenario: No analysis-core dependency

- **WHEN** an agent inspects write-workflow frontmatter dependencies
- **THEN** `analysis-core` is not listed

### Requirement: Write-workflow SHALL provide Path Selection and Quick Reference

The host MUST declare Full / Incremental / Lean paths that adjust writing depth (diagram count, §4 detail, optional sections)—not code-PDCA scope. It MUST include a Quick Reference table of stages, tool permissions, manual stop points, and required outputs. Output templates for host stages MUST live in `reference.md` and be pointed to from SKILL.md.

#### Scenario: Lean path still keeps verify

- **WHEN** the user selects or the host assigns the Lean path
- **THEN** stages 7 (verify) and the §1 approval gate are still required; optional diagrams/sections may be skipped per writer rules

### Requirement: Prerequisite dependencies include mode lifecycle

`write-workflow` frontmatter dependencies MUST include at least `clarifying-question-discipline`, `tech-review-doc`, and `workflow-mode-lifecycle`. Missing any MUST abort with an install hint.

#### Scenario: Missing workflow-mode-lifecycle aborts

- **WHEN** `workflow-mode-lifecycle` is not available
- **THEN** write-workflow aborts at startup and does not silently run without mode rules
