## ADDED Requirements

### Requirement: Standalone human-view of review or evidence HTML SHALL follow system-browser-open-discipline

When a standalone run has written `review.html` / `evidence.html` and the agent opens either path for a present human to view (interactive handback or an explicit view request), the open MUST follow `system-browser-open-discipline`. Printing paths only on a scheduled or unattended handback remains allowed. Queue-child runs that do not write HTML are out of scope for this open rule.

#### Scenario: Standalone interactive handback opens review or evidence in the system browser

- **WHEN** a standalone stage-5 handback is interactive and the agent opens the review or evidence HTML for the human
- **THEN** the open follows `system-browser-open-discipline`

#### Scenario: Explicit view request on standalone pages

- **WHEN** the human asks to open the standalone review or evidence HTML
- **THEN** the agent opens that path following `system-browser-open-discipline`

### Requirement: goal-driven-workflow SHALL strong-depend on system-browser-open-discipline

`goal-driven-workflow` MUST declare `system-browser-open-discipline` in frontmatter `dependencies`, verify it at the prerequisite skill check (abort with install guidance when missing), and thin-reference it at human-view open steps for generated HTML. The host MUST NOT paste the discipline's Iron Law into the workflow body.

#### Scenario: Missing dependency aborts workflow startup

- **WHEN** `system-browser-open-discipline` is absent from available skills at workflow startup
- **THEN** the workflow aborts with install guidance and does not silently omit browser-open discipline
