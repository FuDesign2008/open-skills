## ADDED Requirements

### Requirement: Tech-review-doc SHALL honor host auto mode without weakening §1

When invoked under `write-workflow` auto mode, `tech-review-doc` MUST still enforce the §1 background-and-goals hard gate (no file write and no Steps 2–5 until explicit user approval). After §1 approval, it MAY run Steps 2–5 continuously without additional per-step user confirmation when the host is in auto mode. Manual or standalone invocation keeps interactive confirmation at §1 as today.

#### Scenario: Auto host cannot skip §1 file-write gate

- **WHEN** write-workflow is in auto mode and §1 is not yet approved
- **THEN** tech-review-doc does not create or overwrite the review document file

#### Scenario: Continuous generation after §1 under auto host

- **WHEN** write-workflow is in auto mode and the user has explicitly approved §1
- **THEN** tech-review-doc may generate diagrams, remaining sections, and write the file without pausing for confirmation between Steps 2–5
