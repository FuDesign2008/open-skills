# goal-queue Specification (DELTA)

## ADDED Requirements

### Requirement: Human-facing HTML views SHALL be designed reading documents

Human-facing HTML views SHALL be designed reading documents, not a line-by-line Markdown translation. Each view SHALL provide a document header with metadata chips, a section table of contents, section cards, and status pills. A verification view SHALL provide KPI tiles and a verdict card. A progress view SHALL provide a timeline for events and KPI tiles. A task-card view SHALL provide condition cards and field cards. The entry page SHALL provide a status KPI strip and a grid of link cards. The Markdown file SHALL remain canonical, and the HTML SHALL stay self-contained with no script or external asset.

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
