## ADDED Requirements

### Requirement: teach-me SHALL answer concept questions on two tracks

When the user asks a concept/mechanism question (「X 是什么」「为什么需要 X」「A 和 B 能不能通信」, "what is X", "how does X work"), teach-me MUST deliver both tracks in one answer: a rational track (one-sentence definition; why it exists starting from "what happens without it"; concrete shape grounded in evidence; key design implication) and an intuitive track (everyday analogy; one-line memory anchor), rendered in the user's language.

#### Scenario: Concept question receives both tracks

- **WHEN** the user asks 「IPC 是什么」 or "what is the event loop"
- **THEN** the answer contains all four rational steps and both intuitive elements

### Requirement: teach-me evidence SHALL be authentic

File/line/API evidence MUST come from files actually read in the session. When the concept has no footprint in the current codebase, the concrete-shape step MUST use a canonical public example labeled as such. Invented paths, line numbers, or APIs are a hard failure.

#### Scenario: No codebase footprint

- **WHEN** the asked concept does not appear in the current codebase
- **THEN** the concrete-shape step uses a labeled public example instead of fabricated project evidence

### Requirement: teach-me analogies SHALL preserve key constraints

The everyday analogy MAY simplify but MUST NOT contradict the rational track's defining constraints. A vivid analogy that violates a key constraint is adjusted or replaced before delivery.

#### Scenario: Constraint-violating analogy is adjusted

- **WHEN** a candidate analogy drops or contradicts one of the mechanism's defining constraints
- **THEN** the analogy is adjusted (or replaced) so every key constraint survives the mapping

### Requirement: teach-me SHALL not claim hands-on tutorial requests

Tutorial/onboarding requests ("教我怎么用 X", "walk me through setting up X") route to teaching/onboarding-oriented skills (e.g. the `teach` skill); teach-me does not trigger for them.

#### Scenario: Tutorial request not claimed

- **WHEN** the user asks for a hands-on walkthrough of using a tool
- **THEN** teach-me is not used; the request routes to a tutorial-appropriate skill
