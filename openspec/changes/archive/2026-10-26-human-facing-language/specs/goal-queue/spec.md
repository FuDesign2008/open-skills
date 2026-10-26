# goal-queue Specification (DELTA)

## ADDED Requirements

### Requirement: Human-facing queue records SHALL use the human's language

The queue SHALL write every human-facing record — task cards, the triage record, the progress document, the verification document, completion reports, and their HTML views — in the language the human used in the conversation. `SKILL.md`, agent-only reference/spec files, and code identifiers SHALL remain English. The dispatcher SHALL localize entry-page labels and HTML footers to the human's language.

#### Scenario: A Chinese conversation produces Chinese records

- **WHEN** the human writes in Chinese
- **THEN** the task card, triage record, progress document, verification document, completion report, and HTML views are written in Chinese

#### Scenario: The skill body stays English

- **WHEN** the human-facing records are Chinese
- **THEN** `SKILL.md`, agent-only reference/spec files, and code identifiers remain English

#### Scenario: Entry-page labels and footers are localized

- **WHEN** the human-facing records are Chinese
- **THEN** the entry-page labels and HTML footers are Chinese
