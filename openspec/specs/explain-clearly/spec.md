# explain-clearly Specification

## Purpose

Explains a technical concept clearly in a form the user chooses. The accurate model comes first, and an analogy is only support. HTML is the default form.
## Requirements
### Requirement: explain-clearly SHALL ask for a delivery form when none was named

When the user asks a concept question and has not named a delivery form, explain-clearly MUST ask once and MUST recommend HTML. The choices MUST be the current session, HTML, Markdown, and plain text. A form the user already named MUST be used without asking again.

#### Scenario: Unspecified form recommends HTML

- **WHEN** the user asks what a mechanism is and names no delivery form
- **THEN** the agent asks once and recommends HTML

#### Scenario: Named form skips the question

- **WHEN** the user asks for the explanation as Markdown
- **THEN** the agent writes Markdown and does not ask for a form

### Requirement: explain-clearly SHALL keep the rational track primary

A concept answer MUST name the subject in one sentence. It MUST then give the causally relevant account in the shape the subject requires. It MUST NOT add four prose sections that restate that account. Evidence MUST sit next to the step or part it proves. A design implication MUST appear only when the user is choosing an action. An analogy MUST NOT invert a defining constraint, and MUST be omitted when the picture already shows that relation. The answer MUST be in the user's language.

#### Scenario: Concept question leads with the rational track

- **WHEN** the user asks what a mechanism is
- **THEN** the answer names the subject in one sentence and gives the relevant causes in the shape the subject requires

### Requirement: explain-clearly evidence SHALL be authentic

File, line, and API evidence MUST come from files actually read in the session. When the concept has no footprint in the current codebase, the explanation MUST use a canonical public example labeled as such, next to the step or part it proves. When no canonical public example is available, the explanation MUST say that no concrete example is available. Invented paths, line numbers, or APIs are a hard failure.

#### Scenario: No codebase footprint

- **WHEN** the asked concept does not appear in the current codebase
- **THEN** the explanation uses a labeled public example next to the part it proves, instead of fabricated project evidence

#### Scenario: No canonical example available

- **WHEN** the concept has no codebase footprint and no canonical public example serves it
- **THEN** the explanation says that no concrete example is available

### Requirement: explain-clearly analogies SHALL preserve key constraints

The auxiliary analogy MAY simplify but MUST NOT contradict the rational track's defining constraints. A vivid analogy that violates a key constraint MUST be adjusted or replaced before delivery.

#### Scenario: Constraint-violating analogy is adjusted

- **WHEN** a candidate analogy drops or contradicts one of the mechanism's defining constraints
- **THEN** the analogy is adjusted or replaced so every key constraint survives the mapping

### Requirement: explain-clearly SHALL lead a time-ordered mechanism with steps

When the subject happens step by step in time and is not a role-handoff flow, the explanation MUST lead with those steps. HTML MUST show one step at a time, MUST open on the first step, MUST provide previous and next controls, and MUST NOT autoplay. Markdown, plain text, and the current session MUST show the same steps as a numbered sequence and MUST NOT add those controls. A static diagram or a comparison table MUST NOT replace this sequence. The sentence a picture cannot show MUST sit next to that step. Code that proves a step MUST sit on that step.

#### Scenario: HTML opens on the first step

- **WHEN** the subject happens step by step in time, is not a role-handoff flow, and the form is HTML
- **THEN** the page leads with one step at a time, opens on the first step, and does not autoplay

#### Scenario: Other forms use numbered steps

- **WHEN** the subject happens step by step in time, is not a role-handoff flow, and the form is Markdown, plain text, or the current session
- **THEN** the explanation leads with the same steps as a numbered sequence and has no previous or next controls

#### Scenario: A static diagram does not replace the steps

- **WHEN** the subject happens step by step in time, is not a role-handoff flow, and the page also includes a diagram
- **THEN** the numbered or stepped sequence is still present and still leads

#### Scenario: A role-handoff flow keeps its diagram

- **WHEN** the subject is a role-handoff flow
- **THEN** the role-handoff diagram rule applies and this step sequence is not required in its place

### Requirement: explain-clearly SHALL draw a visual only when the concept has a shape

When the concept has a comparison or a multi-item mapping, and it is not a time-ordered mechanism and not a role-handoff flow, the HTML and Markdown forms MUST lead with one table, one row per item. When the concept has a topology or flow, and it is not time-ordered and not a role-handoff flow, the HTML and Markdown forms MUST lead with one static diagram of the real relationships. The sentence the picture cannot show MUST sit next to that table or diagram. Plain text MUST stay prose. A concept with no such shape MUST NOT get a forced visual. A visual MUST NOT invent relationships. A time-ordered mechanism that is not a role-handoff flow follows the step-sequence rule instead of this table or diagram.

#### Scenario: Topology gets a figure

- **WHEN** the user asks how several processes pass messages, the subject is not time-ordered, and the form is HTML
- **THEN** the page leads with a figure of those real relationships, with the sentence the picture cannot show next to it

#### Scenario: Simple concept stays lean

- **WHEN** the concept has no comparison, mapping, or flow
- **THEN** the answer omits a visual

#### Scenario: Comparison uses a table

- **WHEN** the user asks how two channels differ, the subject is not time-ordered, and the form is HTML
- **THEN** the page leads with one table, one row per item

### Requirement: explain-clearly SHALL write file forms in the workspace

HTML, Markdown, and plain text MUST be new files under the workspace-root directory `.explain-clearly/`. A later explanation MUST NOT overwrite an existing file. The current-session form MUST NOT create a file. The skill MUST NOT edit the workspace gitignore.

#### Scenario: HTML is a new file

- **WHEN** the user accepts HTML
- **THEN** a new file appears under `.explain-clearly/` and no existing explanation file is overwritten

#### Scenario: Current session creates no file

- **WHEN** the user chooses the current session
- **THEN** no explanation file is written

### Requirement: explain-clearly SHALL open HTML and point at its path

After writing HTML, the agent MUST open that local file in the browser and MUST tell the user to view it, including the file path. The bundled shell is a reference for a page. Its page is a title, one sentence under the title, and the visual for that shape. The written page MUST be in the user's language and MUST write text as text. The written page MUST contain no script except one inline script whose only effect is the previous-step and next-step player, and only when the subject is time-ordered and is not a role-handoff flow. If the browser cannot be opened, the path MUST still be given. The chat for HTML MUST NOT repeat the full explanation.

#### Scenario: HTML opens and the chat points at the path

- **WHEN** an HTML explanation has been written and a browser can open local files
- **THEN** the browser shows that file and the chat gives its path without the full explanation

#### Scenario: Open failure still gives the path

- **WHEN** the environment cannot open a browser
- **THEN** the chat still gives the file path

#### Scenario: HTML follows the reference in the user's language

- **WHEN** the user asks in Chinese and the form is HTML
- **THEN** the written page uses Chinese for its headings and prose, and the bundled shell is only the structural reference

#### Scenario: A step-player script does nothing else

- **WHEN** a time-ordered HTML page that is not a role-handoff flow includes a script
- **THEN** that script only operates the previous and next step controls

### Requirement: explain-clearly SHALL deliver Markdown and plain text as files

Markdown MUST include a leading visual when the concept has a shape and is not time-ordered. When the subject is time-ordered and is not a role-handoff flow, Markdown MUST lead with the numbered steps. Plain text MUST be prose only, and when the subject is time-ordered and is not a role-handoff flow those numbered steps are prose and lead. For both forms, the chat MUST give the file path and MUST NOT repeat the full explanation.

#### Scenario: Plain text has no figure

- **WHEN** the user chooses plain text for a topology question that is not time-ordered
- **THEN** the file is prose only and the chat gives its path

#### Scenario: Time-ordered plain text leads with numbered steps

- **WHEN** the user chooses plain text for a mechanism that happens step by step in time and is not a role-handoff flow
- **THEN** the file leads with those steps as numbered prose, and the chat gives its path

### Requirement: explain-clearly SHALL not claim hands-on tutorial requests

Tutorial or onboarding requests MUST route to a teaching skill. explain-clearly MUST NOT claim them. Article rewriting and design-doc rewriting MUST route to those skills instead.

#### Scenario: Tutorial request not claimed

- **WHEN** the user asks for a hands-on walkthrough of using a tool
- **THEN** explain-clearly is not used

### Requirement: explain-clearly package SHALL match repo skill rules

The directory and frontmatter `name` MUST be `explain-clearly`. `user-invocable` MUST be true. The description MUST be one double-quoted line of at most 1024 characters and MUST include Chinese concept triggers, including 「容易看懂」, plus the tutorial, article, and design-doc boundaries. The body MUST be English and MUST NOT name a platform-specific opener. The bundled HTML shell is a reference layout, its example text is English, and it MUST contain no script.

#### Scenario: Description stays a single routing line

- **WHEN** the skill file is checked
- **THEN** the description is one double-quoted line within 1024 characters and names the Chinese concept triggers, including 「容易看懂」

### Requirement: explain-clearly SHALL lead a role-handoff flow with a diagram

When the subject is a flow of roles handing work onward, an HTML or Markdown explanation MUST lead with a diagram. The diagram MUST distinguish the roles, MUST show order, and MUST show what is handed off. A comparison table MUST NOT satisfy this requirement. Caption prose MAY sit with the diagram. A subject that is not a role-handoff flow follows the time-ordered step rule when it happens step by step in time, and otherwise keeps the shape rule, including no forced diagram when the concept has no shape.

#### Scenario: Role handoff leads with a diagram

- **WHEN** the explanation is how several roles hand work onward and the form is HTML
- **THEN** the page leads with a diagram of those roles, their order, and what is handed off

#### Scenario: A comparison table does not replace the diagram

- **WHEN** the subject is a role-handoff flow and the page also compares options
- **THEN** a comparison table is not the only visual, and the flow diagram is still present

#### Scenario: A shapeless concept stays without a diagram

- **WHEN** the concept has no comparison, mapping, topology, role-handoff flow, or time order
- **THEN** the explanation does not add a diagram
