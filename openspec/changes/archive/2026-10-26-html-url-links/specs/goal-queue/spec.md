# goal-queue Specification (DELTA)

## ADDED Requirements

### Requirement: Plain URLs in human-facing HTML views SHALL be links

Plain `http(s)` URLs in body text SHALL render as links. URLs inside code spans and Markdown links SHALL keep their own rendering. Trailing punctuation SHALL remain outside the link.

#### Scenario: A plain URL becomes a link

- **WHEN** body text contains a plain `http(s)` URL
- **THEN** the view renders it as a link to that URL

#### Scenario: A URL inside code stays plain

- **WHEN** a URL appears inside an inline code span
- **THEN** it stays plain code and is not wrapped in a link

#### Scenario: A Markdown link keeps its target

- **WHEN** the source already contains a Markdown link
- **THEN** the renderer keeps that link and does not create a second one
