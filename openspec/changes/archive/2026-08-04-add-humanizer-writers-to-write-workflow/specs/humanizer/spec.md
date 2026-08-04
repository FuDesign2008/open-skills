## ADDED Requirements

### Requirement: humanizer skill removes English AI writing patterns

The repository SHALL provide a `humanizer` skill (`user-invocable: true`) that detects and rewrites AI-writing patterns in primarily English text, adapted from upstream blader/humanizer under MIT with attribution. Skill body MUST be English. Frontmatter `description` MUST be a single-line quoted string (≤1024 chars) including Chinese and English triggers.

#### Scenario: User triggers English humanize

- **WHEN** the user asks to humanize or remove AI writing traces from English text
- **THEN** the agent can route to `humanizer` and follow its rewrite process

### Requirement: humanizer preserves facts and attributes upstream

Rewrites MUST NOT invent facts not present in the source (except fiction when clearly requested). The skill directory MUST include LICENSE (or equivalent notice) attributing upstream blader/humanizer and Wikipedia Signs of AI writing guidance.

#### Scenario: No new factual claims

- **WHEN** humanizing a factual paragraph
- **THEN** the rewrite does not add names, numbers, or citations absent from the source
