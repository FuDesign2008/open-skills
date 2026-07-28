## ADDED Requirements

### Requirement: Each clarifying question SHALL include a recommended answer

When `clarifying-question-discipline` requires asking the user one question, the agent MUST include a **recommended answer** or preferred option (with brief rationale) alongside the question, so the user can accept quickly or override. MUST NOT ask a bare open question with no suggested resolution when a reasonable default exists.

#### Scenario: Single-choice question carries a recommendation

- **WHEN** the agent asks a structured single-choice clarifying question
- **THEN** the message includes a recommended option (or stated default) plus the full option list

### Requirement: Fact self-check versus decision ask-human SHALL be distinguished

Before asking the user, the agent MUST self-check facts that can be verified from the repo or conversation without user input, and MUST reserve user questions for decisions, preferences, or unavailable context. MUST NOT ask the user for facts the agent can read from files already in scope.

#### Scenario: Readable fact is not asked

- **WHEN** the needed fact is available in an already-referenced file or prior user message
- **THEN** the agent verifies it itself and does not consume the one-question slot asking the user to restate it
