# Delta: explain-simply

New capability created by renaming the `teach-me` skill to `explain-simply` (hard cut per `openspec/specs/skill-naming/spec.md`). All five requirements are ported from `openspec/specs/teach-me/spec.md` with the skill id swapped; behavior is unchanged.

## ADDED Requirements

### Requirement: explain-simply SHALL answer concept questions on two tracks

When the user asks a concept/mechanism question (「X 是什么」「为什么需要 X」「A 和 B 能不能通信」, "what is X", "how does X work"), explain-simply MUST deliver both tracks in one answer: a rational track (one-sentence definition; why it exists starting from "what happens without it"; concrete shape grounded in evidence; key design implication) and an intuitive track (everyday analogy; one-line memory anchor), rendered in the user's language.

#### Scenario: Concept question receives both tracks

- **WHEN** the user asks 「IPC 是什么」 or "what is the event loop"
- **THEN** the answer contains all four rational steps and both intuitive elements

### Requirement: explain-simply evidence SHALL be authentic

File/line/API evidence MUST come from files actually read in the session. When the concept has no footprint in the current codebase, the concrete-shape step MUST use a canonical public example labeled as such. Invented paths, line numbers, or APIs are a hard failure.

#### Scenario: No codebase footprint

- **WHEN** the asked concept does not appear in the current codebase
- **THEN** the concrete-shape step uses a labeled public example instead of fabricated project evidence

### Requirement: explain-simply analogies SHALL preserve key constraints

The everyday analogy MAY simplify but MUST NOT contradict the rational track's defining constraints. A vivid analogy that violates a key constraint is adjusted or replaced before delivery.

#### Scenario: Constraint-violating analogy is adjusted

- **WHEN** a candidate analogy drops or contradicts one of the mechanism's defining constraints
- **THEN** the analogy is adjusted (or replaced) so every key constraint survives the mapping

### Requirement: explain-simply SHALL use visual aids when they clarify

explain-simply MUST include a visual element (markdown table or text diagram — Mermaid when the environment renders it) in the answer when the concept involves a comparison, a multi-item mapping, or a topology/flow that prose handles poorly; visuals MUST depict real relationships (no invented arrows or rows) and obey the same fidelity criterion as analogies. Visuals are optional when they would not clarify; the answer MUST NOT force a visual for simple concepts.

#### Scenario: Topology concept gets a diagram

- **WHEN** the user asks about a multi-process communication topology or a layered data flow
- **THEN** the answer includes a small text diagram (or Mermaid block) showing the real relationships among the components

#### Scenario: Simple concept stays lean

- **WHEN** the concept has no comparison, mapping, or topology to show (e.g. a one-line definition question)
- **THEN** the answer omits visuals without failing the skill

### Requirement: explain-simply SHALL not claim hands-on tutorial requests

Tutorial/onboarding requests ("教我怎么用 X", "walk me through setting up X") MUST route to teaching/onboarding-oriented skills (e.g. the `teach` skill); explain-simply MUST NOT trigger for them.

#### Scenario: Tutorial request not claimed

- **WHEN** the user asks for a hands-on walkthrough of using a tool
- **THEN** explain-simply is not used; the request routes to a tutorial-appropriate skill
