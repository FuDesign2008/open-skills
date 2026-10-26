# goal-queue Specification (DELTA)

## ADDED Requirements

### Requirement: File references in human-facing HTML views SHALL link to the source files

Inline code that names an existing file SHALL render as a link to that file; non-file code spans SHALL stay plain. The link SHALL resolve relative to the workspace root and SHALL be a local relative path.

#### Scenario: A real file path becomes a link

- **WHEN** inline code names an existing file
- **THEN** the view renders it as a link to that file

#### Scenario: A command or placeholder stays plain

- **WHEN** inline code is a command, a placeholder, or a non-file string
- **THEN** the view leaves it as plain code with no link

#### Scenario: The link resolves locally

- **WHEN** the reader clicks a file link
- **THEN** the browser opens the local source file through a relative path
