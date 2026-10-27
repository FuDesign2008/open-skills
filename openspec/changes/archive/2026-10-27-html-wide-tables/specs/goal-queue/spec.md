# goal-queue Specification (DELTA)

## ADDED Requirements

### Requirement: Wide tables SHALL render as labeled record cards

A table with seven or more columns SHALL render as labeled record cards instead of table columns. Each source row SHALL become one record; each header cell SHALL label its value in the same record. The value SHALL keep inline rendering (links, code spans). A table with fewer columns SHALL render as a table inside a horizontal scroll container, so a long value cannot overflow the section card. Print SHALL keep tables inside the page width.

#### Scenario: A nine-column overview table renders as a record card

- **WHEN** a progress document whose overview table has nine columns is rendered
- **THEN** each row becomes one record card with the header cells as field labels and the row values beside them, and no horizontal scrolling is required to read the record

#### Scenario: A narrow table stays a table and cannot burst out of the card

- **WHEN** a document contains a three-column table with a long value
- **THEN** the table renders inside a horizontal scroll container with readable minimum column widths

#### Scenario: Values keep their inline rendering

- **WHEN** a record field or table cell contains a link, a file path, or a URL
- **THEN** the value keeps the same link and code rendering as before

#### Scenario: Print keeps tables inside the page

- **WHEN** a page with a table is printed
- **THEN** the table is not clipped by a scroll container and column widths shrink to the page width
