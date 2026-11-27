## ADDED Requirements

### Requirement: HTML pages MUST remain readable under OS light and dark

`html-explain` HTML pages MUST set `color-scheme: light dark` and MUST express author colors through CSS custom properties that switch under `prefers-color-scheme`. Component styles MUST use those tokens so body, surface, and text stay readable when the OS prefers dark or light. The reference shell MUST contain no script.

#### Scenario: Dark OS preference keeps contrast readable

- **WHEN** the operating system prefers dark and the page follows the reference shell tokens
- **THEN** body, surface, and text colors remain readable with adequate contrast via the dark token overrides
