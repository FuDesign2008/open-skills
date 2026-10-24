## MODIFIED Requirements

### Requirement: explain-clearly SHALL open HTML and point at its path

After writing HTML, the agent MUST open that local file in the browser and MUST tell the user to view it, including the file path. The bundled shell is a reference for a page. Its page is a title, one sentence under the title, and the visual for that shape. The written page MUST be in the user's language and MUST write text as text. The written page MUST contain no script except one inline script whose only effect is the previous-step and next-step player, and only when the subject is time-ordered and is not a role-handoff flow. If the browser cannot be opened, the path MUST still be given. The chat for HTML MUST NOT repeat the full explanation.

When the caller fixes the form to HTML and supplies an evidence-page path, the written page MUST keep the title, the one sentence, and the visual, and MUST add one link to that path after the visual. The link MUST NOT replace the visual. A call that does not supply an evidence-page path MUST NOT add that link.

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

#### Scenario: Fixed review page adds one evidence link

- **WHEN** the caller fixes the form to HTML and supplies an evidence-page path
- **THEN** the page still has its title, one sentence, and visual, and one link to that path sits after the visual

#### Scenario: Ordinary HTML has no evidence link

- **WHEN** the caller does not supply an evidence-page path
- **THEN** the page has no evidence link
