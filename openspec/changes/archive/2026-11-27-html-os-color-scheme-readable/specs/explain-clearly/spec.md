## ADDED Requirements

### Requirement: HTML form pages MUST remain readable under OS light and dark

When the form is HTML, explain-clearly pages MUST set `color-scheme: light dark` and MUST express author colors through CSS custom properties that switch under `prefers-color-scheme`. Component styles (including body, table, and pre) MUST use those tokens so the page stays readable when the OS prefers dark or light. The bundled shell MUST contain no script.

#### Scenario: Dark OS preference keeps HTML contrast readable

- **WHEN** the form is HTML, the operating system prefers dark, and the page follows the explanation-shell tokens
- **THEN** body, surface, and text colors (including pre backgrounds) remain readable with adequate contrast via the dark token overrides
