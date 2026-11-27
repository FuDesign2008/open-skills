## ADDED Requirements

### Requirement: Skill is user-invocable with system-browser strong dependency

`html-explain` MUST set `user-invocable: true` and MUST declare `system-browser-open-discipline` in frontmatter `dependencies`. It MUST NOT list `explain-clearly` in frontmatter `dependencies`. When the dependency is missing, the agent MUST abort and MUST NOT open an IDE-integrated preview as a substitute.

#### Scenario: Direct trigger for an MR HTML explain

- **WHEN** the user invokes `/html-explain`, 「用 HTML 解释」, 「HTML 解释这个 MR」, 「解释这个合并请求」, or 「看不懂这个改动」 about an MR/PR/diff/local change
- **THEN** the agent runs `html-explain` (not a chat-only dump and not `explain-clearly` by default)

#### Scenario: Missing system-browser dependency aborts

- **WHEN** `system-browser-open-discipline` is absent from the environment
- **THEN** the agent aborts with install guidance and does not claim the HTML was shown in a browser

### Requirement: Default path writes a five-section lightweight HTML page

For MR/PR/diff/local-change subjects, the agent MUST gather evidence, write a new HTML file under `.html-explain/` named `<topic-slug>-<local-YYYYMMDD-HHmm>.html`, and structure the page with a title, one-sentence summary, and exactly five content sections. The agent MUST NOT edit the workspace gitignore for this directory.

#### Scenario: Five-section page for a merge request

- **WHEN** the user asks for an HTML explanation of a merge request or diff
- **THEN** the agent writes a new `.html-explain/*.html` file with five sections covering what changed, why it matters, key files/areas, risks or follow-ups, and how to verify — plus a title and one-liner

#### Scenario: Chat returns path only

- **WHEN** the HTML file has been written and opened (or open was skipped with path printed)
- **THEN** the chat reply gives the file path and does not paste the full explanation body

### Requirement: Human-view open uses system-browser-open-discipline

After writing the HTML (or after an escalated HTML page is ready), the agent MUST load and follow `system-browser-open-discipline` to open the file for human view. This skill owns that open and the chat closeout even when escalation produced the page.

#### Scenario: Open via system browser discipline

- **WHEN** a new explain HTML file is ready for the human
- **THEN** the agent opens it via `system-browser-open-discipline` (system default browser), not Simple Browser or in-editor preview

### Requirement: Escalation to explain-clearly is optional and shape-gated

The agent MUST stay on the lightweight five-section path when the ask is primarily "what this change did". The agent MAY optionally load `explain-clearly` with form fixed to HTML ONLY when the subject is mainly a concept, mechanism, or protocol shape. After escalation, `html-explain` MUST still own system-browser open and chat path closeout.

#### Scenario: Concept subject escalates

- **WHEN** the user's ask is mainly "what is X / how does X work" about a mechanism or protocol (even if an MR is mentioned as context)
- **THEN** the agent MAY load `explain-clearly` with form fixed to HTML, then open and close out via this skill

#### Scenario: Change-subject stays on the lightweight path

- **WHEN** the user wants to understand what an MR/PR/diff/local change did
- **THEN** the agent stays on the five-section lightweight path and does not load `explain-clearly`

### Requirement: Skill text stays deid-safe with public placeholders

Skill body, reference, assets, and evals MUST use generic placeholders (for example `example.com`, `my-project`) and MUST NOT embed internal company names, internal domains, or internal Jira IDs.

#### Scenario: Sample MR URL uses example.com

- **WHEN** the skill documents a sample merge-request URL
- **THEN** it uses a public placeholder such as `https://example.com/group/project/-/merge_requests/123`
