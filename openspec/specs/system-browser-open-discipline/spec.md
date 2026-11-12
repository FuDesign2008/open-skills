# system-browser-open-discipline Specification

## Purpose

Cross-agent discipline for human-view opens of Markdown and HTML: open through the OS default handler so files land in the system default browser, while Agent self-read and edit stay on Read / editor paths. Owned by the user-invocable `system-browser-open-discipline` skill; thin-mounted by `goal-driven-queue` and `goal-driven-workflow`.

## Requirements

### Requirement: Human-view opens of Markdown and HTML SHALL use the system default browser

When an agent opens a `.md` or `.html` (including `.htm` / `.markdown` when those extensions are used) **for a human to view or preview**, it MUST open the file through the operating system's default handler for that path so the file lands in the **system default browser**. The agent MUST NOT use an IDE-integrated browser, Simple Browser, or in-editor Markdown preview as the human-view channel for these opens.

#### Scenario: Explicit browser-open request

- **WHEN** the user asks to open or view a `.md` or `.html` path in the browser (including 「用浏览器打开」「系统浏览器打开」「打开 markdown」「打开 html」 / "open in browser", "system browser open")
- **THEN** the agent opens that path via the OS default handler for human viewing

#### Scenario: Host handback opens the same way

- **WHEN** a host workflow reaches an interactive handback that opens a generated `.html` (or asks the human to view a `.md`) for acceptance or review
- **THEN** that open uses the system default browser channel defined by this capability

### Requirement: Agent self-read and edit stay out of the browser channel

Reading file contents for analysis, search, or diff, and opening a file for the human or agent to **edit**, MUST use the agent's Read / editor path. Those actions MUST NOT force a system-browser open.

#### Scenario: Analysis read does not launch a browser

- **WHEN** the agent needs the text of a `.md` or `.html` to reason about it
- **THEN** it reads the file with its normal read tools and does not open the system browser solely for that read

#### Scenario: Edit request stays in the editor

- **WHEN** the user asks to edit a `.md` or `.html`
- **THEN** the agent opens or keeps the file in the editor and does not treat the edit request as a human-view browser open

### Requirement: Open intent is platform-agnostic

The skill body MUST describe the intent ("open this path with the OS default application so it appears in the system default browser") and MUST NOT hard-require a named IDE tool or enumerate "platform X uses command A, platform Y uses command B" as the required procedure. When no OS open capability is available, the agent MUST print the absolute path and state that a browser open was not performed.

#### Scenario: Headless or no-opener environment

- **WHEN** the environment cannot invoke an OS default open
- **THEN** the agent prints the absolute path, records that browser open was skipped, and does not claim the page was shown

### Requirement: Skill is user-invocable and host-referencable

`system-browser-open-discipline` MUST set `user-invocable: true` so humans can trigger it directly. Hosts that perform human-view opens of `.md` / `.html` MAY declare it in frontmatter `dependencies` and MUST abort on missing dependency when they declare it. The skill MUST NOT silently degrade to an integrated preview when the dependency is present but the agent skips the open.

#### Scenario: Direct trigger works without a host

- **WHEN** the user invokes the skill by name or trigger phrase without a host workflow
- **THEN** the agent still applies the human-view browser-open rules to the named path(s)

### Requirement: Environment notes stay optional

Mentions of browser extensions (for example a Markdown rendering extension) or OS file-association setup MUST remain optional appendix guidance. The skill MUST NOT require installing extensions or changing system defaults as a gate for a successful open.

#### Scenario: Missing Markdown extension does not block open

- **WHEN** the agent opens a `.md` for human view and a Markdown browser extension is not installed
- **THEN** the open still proceeds through the system default browser; any extension tip is advisory only
