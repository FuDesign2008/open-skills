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

A concept answer MUST include a one-sentence definition, why the mechanism exists starting from what happens without it, a concrete shape grounded in evidence, and the design implication that follows. An everyday analogy and a one-line memory anchor MUST appear only as an auxiliary section. The answer MUST be in the user's language.

#### Scenario: Concept question leads with the rational track

- **WHEN** the user asks what a mechanism is
- **THEN** the answer contains all four rational steps, and the analogy is an auxiliary section

### Requirement: explain-clearly evidence SHALL be authentic

File, line, and API evidence MUST come from files actually read in the session. When the concept has no footprint in the current codebase, the concrete-shape step MUST use a canonical public example labeled as such. When no canonical public example is available, the step MUST ground in the definition and why-it-exists and MUST label the absence of a concrete example. Invented paths, line numbers, or APIs are a hard failure.

#### Scenario: No codebase footprint

- **WHEN** the asked concept does not appear in the current codebase
- **THEN** the concrete-shape step uses a labeled public example instead of fabricated project evidence

#### Scenario: No canonical example available

- **WHEN** the concept has no codebase footprint and no canonical public example serves it
- **THEN** the concrete-shape step grounds in the definition and why-it-exists and labels the absence of a concrete example

### Requirement: explain-clearly analogies SHALL preserve key constraints

The auxiliary analogy MAY simplify but MUST NOT contradict the rational track's defining constraints. A vivid analogy that violates a key constraint MUST be adjusted or replaced before delivery.

#### Scenario: Constraint-violating analogy is adjusted

- **WHEN** a candidate analogy drops or contradicts one of the mechanism's defining constraints
- **THEN** the analogy is adjusted or replaced so every key constraint survives the mapping

### Requirement: explain-clearly SHALL draw a visual only when the concept has a shape

When the concept has a comparison, a multi-item mapping, or a topology or flow, the HTML and Markdown forms MUST include a visual of the real relationships. Plain text MUST stay prose. A concept with no such shape MUST NOT get a forced visual. A visual MUST NOT invent relationships.

#### Scenario: Topology gets a figure

- **WHEN** the user asks how several processes pass messages and the form is HTML
- **THEN** the page includes a figure of those real relationships

#### Scenario: Simple concept stays lean

- **WHEN** the concept has no comparison, mapping, or flow
- **THEN** the answer omits a visual

### Requirement: explain-clearly SHALL write file forms in the workspace

HTML, Markdown, and plain text MUST be new files under the workspace-root directory `.explain-clearly/`. A later explanation MUST NOT overwrite an existing file. The current-session form MUST NOT create a file. The skill MUST NOT edit the workspace gitignore.

#### Scenario: HTML is a new file

- **WHEN** the user accepts HTML
- **THEN** a new file appears under `.explain-clearly/` and no existing explanation file is overwritten

#### Scenario: Current session creates no file

- **WHEN** the user chooses the current session
- **THEN** no explanation file is written

### Requirement: explain-clearly SHALL open HTML and point at its path

After writing HTML, the agent MUST open that local file in the browser and MUST tell the user to view it, including the file path. The bundled shell is a reference for structure. The written page MUST follow that structure, MUST be in the user's language, MUST contain no script, and MUST write text as text. If the browser cannot be opened, the path MUST still be given. The chat for HTML MUST NOT repeat the full explanation.

#### Scenario: HTML opens and the chat points at the path

- **WHEN** an HTML explanation has been written and a browser can open local files
- **THEN** the browser shows that file and the chat gives its path without the full explanation

#### Scenario: Open failure still gives the path

- **WHEN** the environment cannot open a browser
- **THEN** the chat still gives the file path

#### Scenario: HTML follows the reference in the user's language

- **WHEN** the user asks in Chinese and the form is HTML
- **THEN** the written page uses Chinese for its headings and prose, and the bundled shell is only the structural reference

### Requirement: explain-clearly SHALL deliver Markdown and plain text as files

Markdown MUST include a visual when the concept has a shape. Plain text MUST be prose only. For both forms, the chat MUST give the file path and MUST NOT repeat the full explanation.

#### Scenario: Plain text has no figure

- **WHEN** the user chooses plain text for a topology question
- **THEN** the file is prose only and the chat gives its path

### Requirement: explain-clearly SHALL not claim hands-on tutorial requests

Tutorial or onboarding requests MUST route to a teaching skill. explain-clearly MUST NOT claim them. Article rewriting and design-doc rewriting MUST route to those skills instead.

#### Scenario: Tutorial request not claimed

- **WHEN** the user asks for a hands-on walkthrough of using a tool
- **THEN** explain-clearly is not used

### Requirement: explain-clearly package SHALL match repo skill rules

The directory and frontmatter `name` MUST be `explain-clearly`. `user-invocable` MUST be true. The description MUST be one double-quoted line of at most 1024 characters and MUST include Chinese concept triggers plus the tutorial, article, and design-doc boundaries. The body MUST be English and MUST NOT name a platform-specific opener. The bundled HTML shell is a reference layout, its example text is English, and it MUST contain no script.

#### Scenario: Description stays a single routing line

- **WHEN** the skill file is checked
- **THEN** the description is one double-quoted line within 1024 characters and names the Chinese concept triggers

### Requirement: explain-clearly SHALL lead a role-handoff flow with a diagram

When the subject is a flow of roles handing work onward, an HTML or Markdown explanation MUST lead with a diagram. The diagram MUST distinguish the roles, MUST show order, and MUST show what is handed off. A comparison table MUST NOT satisfy this requirement. Caption prose MAY sit with the diagram. A subject that is not a role-handoff flow MUST keep the existing visual rule, including no forced diagram when the concept has no shape.

#### Scenario: Role handoff leads with a diagram

- **WHEN** the explanation is how several roles hand work onward and the form is HTML
- **THEN** the page leads with a diagram of those roles, their order, and what is handed off

#### Scenario: A comparison table does not replace the diagram

- **WHEN** the subject is a role-handoff flow and the page also compares options
- **THEN** a comparison table is not the only visual, and the flow diagram is still present

#### Scenario: A shapeless concept stays without a diagram

- **WHEN** the concept has no comparison, mapping, topology, or role-handoff flow
- **THEN** the explanation does not add a diagram

