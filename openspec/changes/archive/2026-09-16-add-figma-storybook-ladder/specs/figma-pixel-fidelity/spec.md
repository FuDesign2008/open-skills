# figma-pixel-fidelity Delta

## MODIFIED Requirements

### Requirement: figma-pixel-implement SHALL inventory screens and visual states before the spec table

Before building the design-spec table, implement MUST record a screen × state inventory sourced from the design (frame/section names, component variant names, prototype reactions that map to visual states). Visual states present on the canvas (default, hover, pressed, disabled, selected, or equivalently named variants) MUST appear as inventory entries. Prototype or product behaviors that are not computed-style properties (window drag, auto-follow scroll, mouse-wheel paging) MUST still be listed and labeled `out-of-scope: behavior`. The agent MUST NOT invent hover or other states that the design does not document. When the component's host container can vary (resizable width, narrow squeeze), implement MUST add a `context` axis to the inventory: the product width floor, preset checkpoints, and squeeze pressure become inventory rows or an optional `context` column.

#### Scenario: Inventory precedes spec rows

- **WHEN** implement starts from a Figma node that includes a default frame and a Hover variant on a chip
- **THEN** the inventory lists at least default and hover for that chip before any design-spec table rows are written

#### Scenario: Undocumented hover is not invented

- **WHEN** the design has no Hover/Pressed variant and no prototype reaction for a control
- **THEN** implement records `no-variant-in-design` for that control and MUST NOT invent hover colors or sizes

#### Scenario: Behavior items are labeled not pixel-claimed

- **WHEN** the design or product includes auto-follow scroll or window-drag that cannot be expressed as a computed-style row
- **THEN** the inventory lists the item as `out-of-scope: behavior` and implement MUST NOT claim pixel alignment for it

#### Scenario: Resizable host adds a context axis

- **WHEN** the component lives in a host container whose width can change (resizable panel or draggable iframe width)
- **THEN** the inventory records the width floor plus preset checkpoints and one narrower squeeze checkpoint as context entries, instead of a single fixed width

### Requirement: figma-pixel-implement SHALL persist a living spec in the target repo

Implement MUST write Inventory and Spec sections to a durable path in the **target** codebase. Prefer an existing project Figma/design-spec directory; otherwise `docs/figma/<safe-frame-name>.md`. Default layout is one file with Inventory, Spec, Assets, an optional **Stories** subsection (present when the target project has a component workbench), and an empty Verify section. As each visible child section is implemented, implement MUST append matching inventory/spec rows. A session-only table MUST NOT count as complete. Hand-off MUST include the file path.

#### Scenario: Session note is not complete

- **WHEN** implement has code and a chat-only spec table but no target-repo file path
- **THEN** implement is incomplete and MUST NOT claim ready for verify

#### Scenario: Rows append per visible section

- **WHEN** a large frame has Welcome and Composer sections and Welcome is implemented first
- **THEN** the living artifact already contains Welcome inventory/spec rows before Composer is finished

#### Scenario: Stories subsection present when a workbench exists

- **WHEN** the target project has a component workbench and implement finishes the in-scope components
- **THEN** the living artifact contains a Stories subsection mapping story → covered inventory rows → entry before the handoff names the path

## ADDED Requirements

### Requirement: figma-pixel-implement SHALL deliver workbench stories and component tests when a component workbench exists

When the target project has Storybook or a similar component workbench (existing story setup, workbench config, or scripts), implement MUST write stories covering every in-scope Inventory row (state × context), each exposing its state through a declarative entry (test id, knob, or auto-action), following the project's existing story conventions, and MUST record a Stories subsection on the living artifact mapping story → covered inventory rows → entry. Story coverage is part of implement completeness when a workbench exists. Implement MUST write component tests locking key Spec values (geometry, color, token mapping) when the project has a test setup; when it does not, implement MUST record the suggestion instead of scaffolding a test stack (advisory, not blocking). When no component workbench exists, implement MUST record a one-time adoption suggestion (isolated, observable, agent-testable surface) and MUST hand off normally — workbench absence MUST NOT block the handoff, and measurement falls back to the verify channel ladder.

#### Scenario: Stories cover the inventory before implement completes

- **WHEN** the project has a component workbench and the Inventory carries default/hover states with 320/720 context checkpoints
- **THEN** implement MUST NOT declare implement complete until stories cover those rows with declarative entries and the Stories subsection maps them

#### Scenario: Missing test infra is advisory

- **WHEN** the project has no test setup and the user asks to lock acceptance values into tests
- **THEN** implement records the suggestion in the living artifact and MUST NOT scaffold a whole test stack as a blocker

#### Scenario: No workbench suggests adoption without blocking

- **WHEN** the target project has no Storybook or similar component workbench
- **THEN** implement records a one-time adoption suggestion, completes the handoff with the living artifact path, and measurement falls back to the verify channel ladder

### Requirement: figma-pixel-verify SHALL resolve the measurement surface through a channel ladder and declare the channel used

Verify MUST resolve the runnable surface in a fixed preference order: (1) a component-workbench story from the living artifact's Stories subsection or a detected Storybook-style workbench; (2) a lightweight isolated harness that stubs host/engine dependencies while keeping real tokens and styles; (3) the in-product preview route; (4) a full app/browser launch as the heaviest last resort. A broken or absent workbench MUST fall the ladder down with the fallback recorded. Verify MUST declare the chosen channel (`Channel: storybook | isolated-harness | preview | full-app`) in the report. When the project declares or shows a host/platform floor (an engine older than the workbench browser), verify MUST note that the real host remains the final authority — workbench PASS MUST NOT be reported as platform-floor proof. When no workbench exists at all, verify MUST make one advisory adoption suggestion (systematic, observable, agent-testable, enables component tests) and continue measuring through the next rung — the suggestion MUST NOT block or abort verify. Isolation MUST NOT be treated as simulation: a story or harness is a real render of the real component with real tokens; the ladder orders integration completeness × cost, not real-vs-fake.

#### Scenario: Story preferred over full app launch

- **WHEN** the living artifact lists a workbench story for the component and the full app is also launchable
- **THEN** verify measures through the story first and MUST NOT default to the heavier app launch

#### Scenario: No workbench suggests and continues

- **WHEN** the project has no component workbench and the component is reachable via the in-product preview route
- **THEN** verify makes one advisory adoption suggestion, records `Channel: preview`, and completes the measurement without blocking

#### Scenario: Broken workbench falls the ladder down

- **WHEN** the detected workbench fails to build or serve
- **THEN** verify records the fallback and continues with the next rung instead of aborting

#### Scenario: Workbench PASS is not platform-floor proof

- **WHEN** all critical rows PASS under the workbench channel and the project declares a host engine older than the workbench browser
- **THEN** the report carries a platform-floor note naming the real host as the final authority and MUST NOT claim overall platform-level PASS beyond the workbench channel
