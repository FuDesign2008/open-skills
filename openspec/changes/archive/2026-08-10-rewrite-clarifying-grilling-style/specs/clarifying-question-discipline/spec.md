## ADDED Requirements

### Requirement: Clarifying questions SHALL walk a decision tree by dependencies

When gathering clarification, the agent MUST treat open issues as a **decision tree**: ask about one decision at a time in dependency order so earlier answers reshape later questions. MUST NOT treat purpose → constraints → success criteria as a rigid flat checklist that ignores dependencies. When several independent roots are open, the agent MAY use purpose → constraints → success criteria as the tie-break order among roots.

#### Scenario: Dependent decision waits on prior answer

- **WHEN** decision B depends on the outcome of decision A and both are unresolved
- **THEN** the agent asks about A first (one question), waits for the answer, then asks about B using that answer

#### Scenario: Tie-break among independent roots

- **WHEN** multiple independent decision roots are open with no dependency between them
- **THEN** the agent picks the next question preferring purpose, then constraints, then success criteria

### Requirement: Agent SHALL explore context before burning clarifying-question slots

Before the first clarifying question of a clarification stretch (and when stuck), the agent MUST skim relevant project context (files, docs, recent commits as applicable) and MUST flag multi-subsystem scope for decomposition before refining details of a project that needs to be split. MUST NOT spend early question slots on facts or structure discoverable from the environment.

#### Scenario: Readable context checked first

- **WHEN** clarification is needed and relevant repo context has not been inspected
- **THEN** the agent explores that context before asking the user a clarifying question about facts or structure present there

#### Scenario: Multi-subsystem scope is decomposed early

- **WHEN** the user request clearly spans multiple independent subsystems
- **THEN** the agent helps decompose scope (pieces, relations, order) before deep clarifying rounds on a single overloaded project

### Requirement: Shared-understanding gate before acting on clarified work

After clarification, the agent MUST NOT act on the clarified plan, design, or implementation path until the user confirms shared understanding, or explicitly skips further clarification (in which case assumed defaults for remaining unknowns MUST be recorded). This gate complements — and does not replace — host-level design-approval or execution gates.

#### Scenario: Hold action until confirm

- **WHEN** clarifying questions have resolved the critical unknowns but the user has not confirmed shared understanding and has not asked to proceed
- **THEN** the agent asks for confirmation (or the next single clarifying question) and MUST NOT start implementing the clarified work in that turn

#### Scenario: User skips further clarification

- **WHEN** the user explicitly asks to skip further clarification and proceed
- **THEN** the agent MAY leave clarification, records assumed defaults for remaining unknowns, and proceeds per the host workflow

### Requirement: Open-ended clarifying questions SHALL be allowed when options fake certainty

Structured single-select with a recommended answer remains the preferred shape, but the agent MUST use an open-ended question when forcing fixed options would fake certainty or omit a real decision branch. Platform-agnostic rules still apply (intent description; no hardcoded platform tool).

#### Scenario: Open-ended when options are inadequate

- **WHEN** the critical unknown cannot be honestly reduced to a small option set without hiding a real alternative
- **THEN** the agent asks one open-ended clarifying question (still one per message; include a recommended direction when a default is knowable)

## MODIFIED Requirements

### Requirement: Each clarifying question SHALL include a recommended answer

When `clarifying-question-discipline` requires asking the user one question, the agent MUST include a **recommended answer** or preferred option (with brief rationale) alongside the question when a reasonable default exists, so the user can accept quickly or override. MUST NOT ask a bare open question with no suggested resolution when a reasonable default exists. When the question is legitimately open-ended and no default is knowable, the agent MUST state that no recommendation is offered and why.

#### Scenario: Single-choice question carries a recommendation

- **WHEN** the agent asks a structured single-choice clarifying question
- **THEN** the message includes a recommended option (or stated default) plus the full option list

#### Scenario: No default for open-ended

- **WHEN** the agent asks an open-ended clarifying question and no reasonable default exists
- **THEN** the message states that no recommendation is offered and gives a brief reason
