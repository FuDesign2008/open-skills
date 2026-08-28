# Delta: explain-simply

Research-driven refinements. Only requirement 2 changes behavior (explicit fallback when no canonical public example exists); the other three refinements are SKILL.md method prose with the behavioral contract unchanged.

## MODIFIED Requirements

### Requirement: explain-simply evidence SHALL be authentic

File/line/API evidence MUST come from files actually read in the session. When the concept has no footprint in the current codebase, the concrete-shape step MUST use a canonical public example labeled as such. When even a canonical public example is unavailable, the step MUST ground in the concept's definition and why-it-exists and MUST label the absence of a concrete example. Invented paths, line numbers, or APIs are a hard failure.

#### Scenario: No codebase footprint

- **WHEN** the asked concept does not appear in the current codebase
- **THEN** the concrete-shape step uses a labeled public example instead of fabricated project evidence

#### Scenario: No canonical example available

- **WHEN** the concept has no codebase footprint and no canonical public example serves it
- **THEN** the concrete-shape step grounds in the definition and why-it-exists and labels the absence of a concrete example, without inventing evidence
