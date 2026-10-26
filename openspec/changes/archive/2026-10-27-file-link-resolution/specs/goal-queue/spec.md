# goal-queue Specification (DELTA)

## MODIFIED Requirements

### Requirement: File references in human-facing HTML views SHALL link to the source files

Inline code that names an existing file or directory SHALL render as a link. Resolution SHALL be nearest-first across tiers: the record directory, the queue root, the workspace root, the batch directories, then the skill directory. A name that matches several distinct paths inside one tier, a glob, and a non-file code span SHALL stay plain. The link SHALL be a local relative path.

#### Scenario: A real file path becomes a link

- **WHEN** inline code names an existing file
- **THEN** the view renders it as a link to that file

#### Scenario: A command or placeholder stays plain

- **WHEN** inline code is a command, a placeholder, or a non-file string
- **THEN** the view leaves it as plain code with no link

#### Scenario: The link resolves locally

- **WHEN** the reader clicks a file link
- **THEN** the browser opens the local source file through a relative path

#### Scenario: A bare name links without an extension or a slash

- **WHEN** inline code names `config`, which exists in the queue root, or `scripts/`, which exists in the workspace root
- **THEN** the view links each to its existing file or directory

#### Scenario: A bare name resolves against the nearest tier

- **WHEN** inline code names `progress.md` and exactly one batch directory contains it
- **THEN** the view links it to that batch's file

#### Scenario: The skill directory backs sibling references

- **WHEN** inline code names `reference.md` and only the skill directory contains it
- **THEN** the view links it to the skill's `reference.md`

#### Scenario: An ambiguous name stays plain

- **WHEN** inline code names `progress.md` and two batch directories contain it
- **THEN** the view leaves it plain code with no link

#### Scenario: A glob stays plain

- **WHEN** inline code is a glob such as `approaches/*.md`
- **THEN** the view leaves it plain code with no link
