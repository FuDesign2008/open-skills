## ADDED Requirements

### Requirement: merge-discipline description SHALL be English-primary with Chinese triggers

Frontmatter `description` for `merge-discipline` MUST use English for the routing summary (what / when / Do NOT use) and MUST include Chinese trigger phrases (English equivalents MAY follow). It MUST NOT use a Chinese-primary narrative that interleaves English Part labels mid-sentence as the main routing prose.

#### Scenario: Description matches English-primary template

- **WHEN** an agent or installer reads `merge-discipline` frontmatter `description`
- **THEN** the what/when/Do-NOT prose is English-primary and Chinese triggers appear in the Triggers section of that string
