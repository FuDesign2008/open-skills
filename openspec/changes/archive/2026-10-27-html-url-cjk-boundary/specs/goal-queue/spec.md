# goal-queue Specification (DELTA)

## MODIFIED Requirements

### Requirement: Plain URLs in human-facing HTML views SHALL be links

Plain `http(s)` URLs in body text SHALL render as links. URLs inside code spans and Markdown links SHALL keep their own rendering. A URL SHALL end at whitespace, CJK punctuation, or fullwidth forms; trailing punctuation and any following text SHALL remain outside the link.

#### Scenario: A plain URL becomes a link

- **WHEN** body text contains a plain `http(s)` URL
- **THEN** the view renders it as a link to that URL

#### Scenario: A URL inside code stays plain

- **WHEN** a URL appears inside an inline code span
- **THEN** it stays plain code and is not wrapped in a link

#### Scenario: A Markdown link keeps its target

- **WHEN** the source already contains a Markdown link
- **THEN** the renderer keeps that link and does not create a second one

#### Scenario: A URL followed by CJK punctuation ends at the URL

- **WHEN** body text contains `https://example.com/pull/341；Node ...` with no space after the fullwidth semicolon
- **THEN** the link ends at `341` and the semicolon and following text stay outside the link

#### Scenario: Fullwidth brackets stay outside the link

- **WHEN** body text contains `（https://example.com/x）。`
- **THEN** the link is exactly `https://example.com/x`
