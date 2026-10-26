# goal-queue Specification (DELTA)

## MODIFIED Requirements

### Requirement: Human-facing HTML views SHALL carry cross-navigation

Every generated human-facing HTML view SHALL carry a navigation block linking to the entry page (`verification.html`) and the other covered views. Links SHALL be relative, SHALL resolve to existing files, and SHALL mark a missing target as unavailable. The block SHALL mark the page being viewed as the current page and SHALL treat that page as available even before its file exists. The block SHALL need no script and SHALL work offline.

#### Scenario: Any view can jump to any other view

- **WHEN** a reader opens a covered HTML view (card, triage, progress, verification, report, review, or evidence)
- **THEN** the view shows a navigation block whose links reach the entry page and the other covered views

#### Scenario: Missing targets are marked

- **WHEN** a navigation target does not exist
- **THEN** the block shows that label as unavailable instead of an active link

#### Scenario: Navigation is offline and script-free

- **WHEN** the HTML file is opened from disk without network access
- **THEN** the navigation links work and the page contains no navigation script

#### Scenario: The current page is marked

- **WHEN** a view is rendered and its own path is in the navigation manifest
- **THEN** the block marks that entry as the current page, and still renders it as a link even when the file has not been written yet

### Requirement: Human-facing HTML views SHALL be designed reading documents

Human-facing HTML views SHALL be designed reading documents, not a line-by-line Markdown translation. Each view SHALL provide a document header with metadata chips for short values and labeled full-width rows for long values, a section table of contents, section cards, and status pills. Document titles SHALL render inline Markdown. A verification view SHALL provide KPI tiles and a verdict card. A progress view SHALL provide a timeline for events and KPI tiles. A task-card view SHALL provide condition cards and field cards. The entry page SHALL provide a status KPI strip and a grid of link cards. The Markdown file SHALL remain canonical, and the HTML SHALL stay self-contained with no script or external asset.

#### Scenario: A verification view is designed for scanning

- **WHEN** the verification document is rendered
- **THEN** the page shows a document header, metadata chips, a section table of contents, KPI tiles, section cards, and a verdict card

#### Scenario: A progress view shows a timeline

- **WHEN** the progress document is rendered
- **THEN** the page shows KPI tiles, section cards, and a timeline for the key events

#### Scenario: A task card uses condition and field cards

- **WHEN** the task card is rendered
- **THEN** the page shows metadata chips, numbered condition cards, and field cards for the card detail and acceptance summary

#### Scenario: The entry page is a dashboard

- **WHEN** the entry page is rendered
- **THEN** it shows a status KPI strip and a grid of link cards for the covered views

#### Scenario: The Markdown source remains canonical

- **WHEN** a designed HTML view is generated
- **THEN** the `.md` source is unchanged and remains the record agents edit

#### Scenario: Long metadata becomes a labeled row

- **WHEN** a header metadata value is long
- **THEN** the header shows a labeled full-width row instead of an oversized pill, while short values stay as chips

#### Scenario: A title with inline Markdown renders

- **WHEN** the document title contains a code span or emphasis
- **THEN** the header renders it inline instead of showing the literal markers
