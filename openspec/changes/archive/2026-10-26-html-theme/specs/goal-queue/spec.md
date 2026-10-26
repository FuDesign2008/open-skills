# goal-queue Specification (DELTA)

## ADDED Requirements

### Requirement: Human-facing HTML views SHALL follow the system light/dark preference

Human-facing HTML views SHALL provide a light palette and a dark palette and SHALL select the palette automatically with `prefers-color-scheme`, without requiring a script. Print SHALL use the light palette.

#### Scenario: A dark system preference selects the dark palette

- **WHEN** the operating system is in dark mode
- **THEN** the view opens with the dark palette

#### Scenario: A light system preference selects the light palette

- **WHEN** the operating system is in light mode
- **THEN** the view opens with the light palette

#### Scenario: Printing uses the light palette

- **WHEN** the view is printed
- **THEN** the light palette is used and the navigation and table of contents are hidden

#### Scenario: No script is required

- **WHEN** the view is opened from disk
- **THEN** the theme follows the system preference without any script
