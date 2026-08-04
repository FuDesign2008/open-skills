# write-workflow Specification

## Purpose
Extensible document-writing host: dependency gate, route by document type, clarify, delegate to writer skills (default tech-review-doc).

## Requirements
### Requirement: Write-workflow is an invocable document-writing host

The repository SHALL provide a `write-workflow` skill with `user-invocable: true` that acts as an orchestration entry for document-writing tasks. It MUST NOT modify or depend on `solve-workflow` for its core flow.

#### Scenario: User triggers write workflow

- **WHEN** the user invokes write-workflow via a Chinese or English trigger listed in its description (e.g. 「写文档」「写技术评审」「write workflow」)
- **THEN** the agent loads `write-workflow` and follows its stage sequence rather than `solve-workflow`

### Requirement: Host performs prerequisite dependency check

`write-workflow` SHALL declare strong dependencies in frontmatter (at minimum `clarifying-question-discipline` and `tech-review-doc`). On startup it MUST abort with an install hint if any declared dependency is missing; silent degradation is forbidden.

#### Scenario: Missing strong dependency

- **WHEN** `tech-review-doc` or `clarifying-question-discipline` is not available in the agent environment
- **THEN** write-workflow prints a missing-dependency notice and aborts without producing a document

### Requirement: Host routes by document type with extension slots

`write-workflow` SHALL identify the target document type early (default for this change: technical review via `tech-review-doc`). The skill body MUST document an extension slot for future document skills (e.g. humanizer) without implementing those skills in this change.

#### Scenario: Default route to tech review

- **WHEN** the user asks to generate a technical review document from a design doc and does not name another writer
- **THEN** write-workflow delegates execution to `tech-review-doc`

#### Scenario: Future extension documented only

- **WHEN** an agent reads write-workflow for how to add a new writer skill
- **THEN** the skill describes the extension hook (declare dependency + route branch) and does not require humanizer or other writers to be installed

### Requirement: Host enforces clarifying-question discipline

Before and during delegated writing, `write-workflow` MUST follow `clarifying-question-discipline` (one critical question per turn until clear). It MUST NOT hard-code a platform-specific brainstorming tool or an external `brainstorming` skill name as a required dependency.

#### Scenario: Clarification before drafting §1

- **WHEN** background or goals for the review document are unclear
- **THEN** the host or delegated skill asks exactly one clarifying question at a time until §1 can be drafted for user approval

### Requirement: Command entry for write workflow

The repository SHALL provide `commands/write.md` with `disable-model-invocation: true` that instructs the agent to invoke `write-workflow` and follow it exactly.

#### Scenario: User runs /write

- **WHEN** the user invokes the write command entry
- **THEN** the agent starts `write-workflow`

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

### Requirement: Write-workflow strongly depends on both humanizer skills

`write-workflow` frontmatter `dependencies` MUST include `humanizer` and `humanizer-zh` in addition to existing dependencies. Missing either MUST abort startup with an install hint (no silent degrade). The repository MUST NOT ship `skills/humanizer/` or `skills/humanizer-zh/`. The missing-dependency notice MUST instruct installing from upstream URLs and require exact directory names:

- `npx skills add https://github.com/blader/humanizer.git` → directory / name `humanizer`
- `npx skills add https://github.com/op7418/Humanizer-zh.git` → directory / name `humanizer-zh`

The notice MUST NOT claim these skills are installable via `FuDesign2008/open-skills --skill humanizer` (or humanizer-zh).

#### Scenario: Missing humanizer-zh aborts write-workflow

- **WHEN** `humanizer-zh` is not installed
- **THEN** write-workflow prints a missing-dependency notice pointing at the Humanizer-zh upstream install command and directory-name requirement, and does not proceed

#### Scenario: open-skills does not vendor humanizer trees

- **WHEN** an auditor lists `skills/` in this repository
- **THEN** neither `humanizer` nor `humanizer-zh` skill directories are present

### Requirement: Write-workflow routes humanize requests by language

Stage 1 route table MUST list AI de-slop / humanize as shipped writers. For primarily Chinese source text, stage 6 MUST load `humanizer-zh`; for primarily English source text, stage 6 MUST load `humanizer`. Ambiguous language → ask one clarifying question (clarifying-question-discipline).

#### Scenario: Chinese text routes to humanizer-zh

- **WHEN** the user requests humanize on a Chinese document via write-workflow
- **THEN** stage 6 delegates to `humanizer-zh`

### Requirement: Humanizer writers use input confirmation instead of tech-review §1 gate

Host auto/manual hard-pause rules for `tech-review-doc` §1 MUST remain. For `humanizer` / `humanizer-zh`, the host MUST require a confirmed input (path or pasted text) before rewrite, and MUST NOT apply the tech-review §1 background-approval gate.

#### Scenario: Humanizer path does not require §1 business-goals approval

- **WHEN** write-workflow routes to humanizer or humanizer-zh
- **THEN** the agent does not block on tech-review §1 background confirmation

