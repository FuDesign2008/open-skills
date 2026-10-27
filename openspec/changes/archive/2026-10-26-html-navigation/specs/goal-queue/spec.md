# goal-queue Specification (DELTA)

## ADDED Requirements

### Requirement: Human-facing HTML views SHALL carry cross-navigation

Every generated human-facing HTML view SHALL carry a navigation block linking to the entry page (`verification.html`) and the other covered views. Links SHALL be relative, SHALL resolve to existing files, and SHALL mark a missing target as unavailable. The block SHALL need no script and SHALL work offline.

#### Scenario: Any view can jump to any other view

- **WHEN** a reader opens a covered HTML view (card, triage, progress, verification, report, review, or evidence)
- **THEN** the view shows a navigation block whose links reach the entry page and the other covered views

#### Scenario: Missing targets are marked

- **WHEN** a navigation target does not exist
- **THEN** the block shows that label as unavailable instead of an active link

#### Scenario: Navigation is offline and script-free

- **WHEN** the HTML file is opened from disk without network access
- **THEN** the navigation links work and the page contains no navigation script
