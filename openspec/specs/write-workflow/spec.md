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
