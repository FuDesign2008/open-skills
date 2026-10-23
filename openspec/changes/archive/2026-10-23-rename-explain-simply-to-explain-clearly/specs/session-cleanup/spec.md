# Spec Delta

## MODIFIED Requirements

### Requirement: session-cleanup SHALL delete disposable temp files after unused pages are closed

After unused session pages are closed, the agent MUST list the files it proposes to delete, grouped by class, and MUST wait for the user to confirm that list before deleting any file. After confirmation, the agent MUST delete temp files and directories that this session created and that are not the task's deliverable. Deliverables and pre-existing user files MUST remain. A file the user declines to delete MUST stay and MUST be reported as left in place.

#### Scenario: One-shot download is removed after confirmation

- **WHEN** this session created a large file only as a working input, the finished task no longer needs it, and the user confirms deletion
- **THEN** the agent deletes that file

#### Scenario: Delete waits for confirmation

- **WHEN** a disposable temp file is proposed for deletion and the user has not confirmed
- **THEN** the agent does not delete it

#### Scenario: Declined file stays

- **WHEN** the user declines deletion of a proposed file
- **THEN** the file stays and the report lists it as left in place

#### Scenario: Deliverable stays

- **WHEN** a file created this session is the result the user asked to keep
- **THEN** the agent does not delete it
