# Spec Delta

## ADDED Requirements

### Requirement: explain-clearly SHALL lead a time-ordered mechanism with steps

When the subject happens step by step in time and is not a role-handoff flow, the explanation MUST lead with those steps. HTML MUST show one step at a time, MUST open on the first step, MUST provide previous and next controls, and MUST NOT autoplay. Markdown, plain text, and the current session MUST show the same steps as a numbered sequence and MUST NOT add those controls. A static diagram or a comparison table MUST NOT replace this sequence. The sentence a picture cannot show MUST sit next to that step. Code that proves a step MUST sit on that step.

#### Scenario: HTML opens on the first step

- **WHEN** the subject happens step by step in time and the form is HTML
- **THEN** the page leads with one step at a time, opens on the first step, and does not autoplay

#### Scenario: Other forms use numbered steps

- **WHEN** the subject happens step by step in time and the form is Markdown, plain text, or the current session
- **THEN** the explanation leads with the same steps as a numbered sequence and has no previous or next controls

#### Scenario: A static diagram does not replace the steps

- **WHEN** the subject happens step by step in time and the page also includes a diagram
- **THEN** the numbered or stepped sequence is still present and still leads

#### Scenario: A role-handoff flow keeps its diagram

- **WHEN** the subject is a role-handoff flow
- **THEN** the role-handoff diagram rule applies and this step sequence is not required in its place

## MODIFIED Requirements

### Requirement: explain-clearly SHALL keep the rational track primary

A concept answer MUST name the subject in one sentence. It MUST then give the causally relevant account in the shape the subject requires. It MUST NOT add four prose sections that restate that account. Evidence MUST sit next to the step or part it proves. A design implication MUST appear only when the user is choosing an action. An analogy MUST NOT invert a defining constraint, and MUST be omitted when the picture already shows that relation. The answer MUST be in the user's language.

#### Scenario: Concept question leads with the rational track

- **WHEN** the user asks what a mechanism is
- **THEN** the answer names the subject in one sentence and gives the relevant causes, and does not add four prose sections

### Requirement: explain-clearly SHALL draw a visual only when the concept has a shape

When the concept has a comparison, a multi-item mapping, or a topology or flow, and it is not a time-ordered mechanism and not a role-handoff flow, the HTML and Markdown forms MUST lead with one static diagram of the real relationships. The sentence the picture cannot show MUST sit next to that diagram. Plain text MUST stay prose. A concept with no such shape MUST NOT get a forced visual. A visual MUST NOT invent relationships. A time-ordered mechanism follows the step-sequence rule instead of this static diagram.

#### Scenario: Topology gets a figure

- **WHEN** the user asks how several processes pass messages, the subject is not time-ordered, and the form is HTML
- **THEN** the page leads with a figure of those real relationships, with the sentence the picture cannot show next to it

#### Scenario: Simple concept stays lean

- **WHEN** the concept has no comparison, mapping, or flow
- **THEN** the answer omits a visual

### Requirement: explain-clearly SHALL open HTML and point at its path

After writing HTML, the agent MUST open that local file in the browser and MUST tell the user to view it, including the file path. The bundled shell is a reference for a page. Its example sections are not a required outline. The written page MUST be in the user's language and MUST write text as text. The written page MUST contain no script except one inline script whose only effect is the previous-step and next-step player, and only when the subject is time-ordered. If the browser cannot be opened, the path MUST still be given. The chat for HTML MUST NOT repeat the full explanation.

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

- **WHEN** a time-ordered HTML page includes a script
- **THEN** that script only operates the previous and next step controls

### Requirement: explain-clearly SHALL deliver Markdown and plain text as files

Markdown MUST include a leading visual when the concept has a shape and is not time-ordered. When the subject is time-ordered, Markdown MUST lead with the numbered steps. Plain text MUST be prose only, and when the subject is time-ordered those numbered steps are prose and lead. For both forms, the chat MUST give the file path and MUST NOT repeat the full explanation.

#### Scenario: Plain text has no figure

- **WHEN** the user chooses plain text for a topology question that is not time-ordered
- **THEN** the file is prose only and the chat gives its path

#### Scenario: Time-ordered plain text leads with numbered steps

- **WHEN** the user chooses plain text for a mechanism that happens step by step in time
- **THEN** the file leads with those steps as numbered prose, and the chat gives its path

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
