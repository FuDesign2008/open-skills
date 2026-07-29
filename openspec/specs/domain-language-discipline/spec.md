# domain-language-discipline Specification

## Purpose
Project domain glossary (CONTEXT.md) discipline, orthogonal to OpenSpec.

## Requirements
### Requirement: domain-language-discipline SHALL maintain a project glossary orthogonal to OpenSpec

`domain-language-discipline` MUST treat `CONTEXT.md` (or mapped multi-context files via an optional root `CONTEXT-MAP.md`) as a **pure domain glossary**: ubiquitous language and term boundaries only. It MUST NOT store implementation details, API shapes, task lists, or OpenSpec delta requirements in `CONTEXT.md`. OpenSpec (`openspec/`) remains the behavioral-contract source of truth; the glossary MUST NOT replace proposal/specs/design/tasks.

#### Scenario: Glossary excludes implementation

- **WHEN** an agent resolves a domain term under this skill
- **THEN** it updates `CONTEXT.md` with the canonical term and meaning only, and does not write code paths, schemas, or OpenSpec requirement text into that file

#### Scenario: OpenSpec remains authoritative for behavior

- **WHEN** a behavior change is needed
- **THEN** the agent records it in OpenSpec artifacts (or host workflow sinks), not by treating `CONTEXT.md` as a spec substitute

### Requirement: domain-language-discipline SHALL challenge fuzzy terms and update lazily

When this skill is loaded (or a host points agents to it), the agent MUST challenge user or session language that conflicts with or overloads terms in the existing glossary, propose a precise canonical term when language is vague, and update `CONTEXT.md` as soon as a term is resolved (lazy file creation: create `CONTEXT.md` only when the first term is recorded). ADR creation, if offered, MUST be sparse and only for hard-to-reverse, surprising, trade-off decisions—not for routine glossary edits.

#### Scenario: Conflict with glossary is surfaced

- **WHEN** the user uses a term that conflicts with an existing `CONTEXT.md` definition
- **THEN** the agent calls out the conflict and asks which meaning is canonical before proceeding as if both were fine

#### Scenario: Lazy create

- **WHEN** no `CONTEXT.md` exists and the first domain term is resolved
- **THEN** the agent creates `CONTEXT.md` (and does not require a pre-existing file)

### Requirement: domain-language-discipline skill identity SHALL avoid external name collisions

The skill directory and frontmatter `name` MUST be `domain-language-discipline` (not `domain-modeling` or other Matt/Superpowers colliding names). Body MUST be English; description MUST include Chinese triggers.

#### Scenario: Installable name is collision-free

- **WHEN** the skill is published in open-skills
- **THEN** its `name` is `domain-language-discipline` and does not reuse `domain-modeling`
