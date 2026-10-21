# session-cleanup Specification

## Purpose

End-of-conversation resource closeout. Inventory what this session created, preserve unique uncommitted content, stop background services this session started, close browser pages this session opened and no longer needs, delete disposable temp files, and report leftovers. Merge, the branch closeout menu, worktree removal, and retrospective stay with their owning skills.

## Requirements

### Requirement: session-cleanup SHALL run before the agent ends a conversation that left resources behind

`session-cleanup` MUST run before the agent says the conversation is finished when this session created temp files, started background services, or opened browser pages. It MUST also run when the user asks to clean temp files, stop background services, close unused pages, or close out the session. Trigger phrases include 「清理临时文件」「关闭后台服务」「关闭网页」「清理不用的网页」「会话收尾」「结束前清理」「会话清理」 and "session cleanup", "clean temp files", "stop background services", "close unused pages".

#### Scenario: Explicit cleanup request

- **WHEN** the user asks to clean temp files, stop background services, or close unused pages
- **THEN** the agent completes the inventory and the later actions in this spec before claiming the session is clean

#### Scenario: Exit with leftovers

- **WHEN** the agent is about to end a conversation in which it created a temp file, started a background service, or opened a browser page
- **THEN** it runs this skill before the closing message

### Requirement: session-cleanup SHALL inventory and classify before any stop, close, or delete

Before stopping a process, closing a page, or deleting a path, the agent MUST list the candidates and classify each as unique uncommitted content, a session-started background service, a session-opened browser page, a disposable temp file, or pre-existing user state. A path, process, or page whose origin is unclear MUST be classified as unique uncommitted content.

#### Scenario: Unknown file is kept

- **WHEN** an untracked path is present and the session record does not show that the agent created it
- **THEN** the agent does not delete it and includes it in the leftover report

### Requirement: session-cleanup SHALL read integration state from git

When deciding whether working-tree content is already on the integration branch, the agent MUST compare against the integration ref. The working-tree file and any copy loaded into the conversation context MUST NOT count as proof that the content is on the integration branch.

#### Scenario: Context copy is ahead of the branch

- **WHEN** the conversation context and the working tree both contain a section, and the integration ref's copy of that file does not
- **THEN** the agent classifies that section as unique uncommitted content

### Requirement: session-cleanup SHALL preserve unique content before discard

The agent MUST NOT discard, reset, or delete unique uncommitted content unless the user explicitly confirms that discard. A preserve copy MUST sit outside every path this same run will delete. When the diff of a path against the integration ref is empty, restoring that path loses nothing and does not require a discard confirmation.

#### Scenario: Non-empty diff blocks discard

- **WHEN** the diff of a path against the integration ref is non-empty and the user has not confirmed discard
- **THEN** the agent does not run a command that drops those changes

#### Scenario: Empty diff needs no discard confirmation

- **WHEN** the diff of a path against the integration ref is empty
- **THEN** discarding or restoring that path needs no separate discard confirmation

#### Scenario: Preserve copy survives the delete pass

- **WHEN** the agent copies unique content aside before deleting temps
- **THEN** that copy's path is not in the delete set

### Requirement: session-cleanup SHALL stop background services this session started

After unique content is preserved, the agent MUST stop background processes and services that this session started for a task that is now finished, then confirm each one is no longer running. A service the user asked to keep MUST stay up and appear in the leftover report with a stop method. The agent MUST NOT stop a process this session did not start.

A liveness check MUST identify the target process itself. A match whose only evidence is search text that also appears in the checker's own command line MUST NOT count as the target still running. The agent stops the recorded process id. The bound port only checks that same process. A different process now bound to the port stays running. The browser that holds the pages stays running. Unused pages are closed in the page step, and that browser process is not stopped.

#### Scenario: Finished server is stopped

- **WHEN** this session started a server for a task that is now finished and the user did not ask to keep it
- **THEN** the agent stops that recorded process id and confirms that process id is gone

#### Scenario: Checker does not count itself

- **WHEN** the liveness check's own command line contains the same search text as the target
- **THEN** the agent does not treat that match as the target still running

#### Scenario: Pre-existing process stays

- **WHEN** a background process was already running before this session
- **THEN** the agent does not stop it

#### Scenario: Reused port stays with its new process

- **WHEN** the port recorded for this session's process is now held by a different process id
- **THEN** the agent does not stop that other process

#### Scenario: Session browser stays running

- **WHEN** this session started the browser that shows the pages
- **THEN** the agent leaves that browser process running and closes only the unused session pages

### Requirement: session-cleanup SHALL close browser pages this session opened and no longer needs

After services are stopped, the agent MUST close browser pages this session opened for a finished task when the user did not ask to keep them, and MUST confirm each closed page is gone. Closing pages leaves the browser running. A page the user asked to keep MUST stay open and appear in the leftover report with a close method. A page that was already open before this session, that the user opened, or whose origin is unclear MUST stay open. Pages this session only visited on the way to a result are closed with the other unused session pages, and that close set does not include the pages that stay open.

#### Scenario: Unused page opened this session is closed

- **WHEN** this session opened a page only to finish a task and the user did not ask to keep it
- **THEN** the agent closes that page, confirms it is gone, and leaves the browser running

#### Scenario: User page stays open

- **WHEN** a page was already open before this session, the user opened it, or its origin is unclear
- **THEN** the agent leaves that page open and leaves the browser running

#### Scenario: Kept page is named

- **WHEN** the user asked to keep a page this session opened
- **THEN** the report names the page and a close method

### Requirement: session-cleanup SHALL delete disposable temp files after unused pages are closed

After unused session pages are closed, the agent MUST delete temp files and directories that this session created and that are not the task's deliverable. Deliverables and pre-existing user files MUST remain.

#### Scenario: One-shot download is removed

- **WHEN** this session created a large file only as a working input and the finished task no longer needs it
- **THEN** the agent deletes that file

#### Scenario: Deliverable stays

- **WHEN** a file created this session is the result the user asked to keep
- **THEN** the agent does not delete it

### Requirement: session-cleanup SHALL report leftovers before calling the session clean

The closing report MUST name each item left in place, why it stayed, and how to remove it. The agent MUST claim a clean resource closeout only after the inventory shows no remaining session-started service, no session-opened page the finished task no longer needs, and no remaining disposable temp file.

#### Scenario: Kept server is named

- **WHEN** a server stays because the user asked to keep it
- **THEN** the report names the service and a stop method

### Requirement: session-cleanup SHALL leave merge, branch closeout, worktree removal, and retrospective to their owners

The skill MUST NOT merge, present the feature-branch closeout menu, remove a worktree, or run a retrospective. When one of those is still open, the report MUST name the owning skill: `merge-discipline`, `feature-branch-closeout`, or `learn-and-improve`.

#### Scenario: Requested merge is only named

- **WHEN** the user asks this skill to merge a branch
- **THEN** the report names `merge-discipline` and the agent does not merge

#### Scenario: Unmerged branch is only named

- **WHEN** a feature branch from this session is still unmerged and the user did not ask to merge
- **THEN** the report names `feature-branch-closeout` and the agent does not merge

### Requirement: session-cleanup package SHALL match repo skill rules

The directory and frontmatter `name` MUST be `session-cleanup`. `user-invocable` MUST be true. The description MUST be one double-quoted line, include the Chinese trigger phrases in this spec, and state that merge, branch closeout, and retrospective belong to their owning skills. The body MUST be English, describe the outcome to achieve, and MUST NOT require a platform-specific tool. The body MUST NOT contain internal product names, hosts, ticket ids, or private paths from the source notes.

#### Scenario: Description carries Chinese triggers and the boundary

- **WHEN** the description is loaded for routing
- **THEN** it includes Chinese phrases for cleaning temp files, stopping background services, and closing unused pages, and it points merge, branch closeout, and retrospective at their owning skills
