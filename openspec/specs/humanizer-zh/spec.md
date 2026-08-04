# humanizer-zh Specification

## Purpose
Chinese AI-writing-pattern removal writer skill (MIT upstream Humanizer-zh).

## Requirements
### Requirement: humanizer-zh skill removes Chinese AI writing patterns

The repository SHALL provide a `humanizer-zh` skill (`user-invocable: true`) as a Chinese-only skill (Chinese body permitted, like `article-writer`) adapted from op7418/Humanizer-zh under MIT with attribution. Frontmatter `description` MUST include Chinese triggers and remain a single-line quoted string ≤1024 chars. The skill MUST NOT hard-code platform-specific tools (e.g. AskUserQuestion) as required.

#### Scenario: User triggers Chinese humanize

- **WHEN** the user asks to 去 AI 痕迹 / 人性化改写 for Chinese text
- **THEN** the agent can route to `humanizer-zh`

### Requirement: humanizer-zh attributes upstream translation sources

The skill MUST attribute Humanizer-zh / blader/humanizer / Wikipedia Signs of AI writing (and stop-slop inspiration where applicable) via LICENSE and/or an attribution section.

#### Scenario: Attribution present

- **WHEN** an auditor inspects `skills/humanizer-zh/`
- **THEN** LICENSE or SKILL attribution naming upstream projects is present

