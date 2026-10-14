# figma-pixel-fidelity Specification

## Purpose

Behavioral contract for open-skills Figma pixel fidelity: two user-invocable skills (`figma-pixel-implement` and `figma-pixel-verify`) that split export-faithful implementation + design-spec contract from measured runtime alignment. PDCA hosts strong-depend on both; invoke under Figma-scope conditions; platform-agnostic tool intent.
## Requirements
### Requirement: figma-pixel-fidelity SHALL ship two user-invocable skills with split duties

open-skills MUST provide two installable skills: `figma-pixel-implement` (pixel-aligned implementation from Figma) and `figma-pixel-verify` (runtime alignment check). Implement MUST NOT claim pixel alignment is complete by itself. The same run MUST continue into `figma-pixel-verify`. The user-facing result is that skill’s overall PASS, or FAIL that names a measurement command that could not run. Verify MAY claim pass or fail only with a laid-out measurement from this turn, or an accepted-residual that records owner and reason. Both skill bodies MUST be English; frontmatter `description` MUST include Chinese trigger phrases and stay within the project description length limit.

#### Scenario: Implement continues into verify

- **WHEN** an agent finishes the implement steps for a Figma node
- **THEN** it MUST produce or update a durable living spec in the target repo (Inventory + Spec) and MUST load `figma-pixel-verify` in the same run before reporting pixel alignment

#### Scenario: Verify can run independently

- **WHEN** the user invokes alignment checking without a prior implement run in the same session
- **THEN** `figma-pixel-verify` MUST either consume an existing living spec on disk or persist a minimal spec for the named Figma node before measuring

### Requirement: figma-pixel-implement SHALL obtain Figma design context via a platform-agnostic channel

Before writing UI code for a Figma node, `figma-pixel-implement` MUST obtain structured design context through whatever Figma design-context / MCP (or equivalent) tools the current Agent exposes. If an Agent-native Figma→code guidance skill is present, the implement skill SHOULD load it for URL parsing / Code Connect / adaptation hygiene. Absence of any particular product skill id (including Cursor plugin `figma-design-to-code`) MUST NOT by itself abort implement when design-context tools are available. If Figma design-context tools are unavailable, the skill MUST stop and instruct the user how to enable them using platform-agnostic intent (MUST NOT hardcode a single stdio install snippet as the only path; MUST NOT require a Cursor-only skill name on Claude Code, OpenCode, or other Agents).

#### Scenario: MCP unavailable aborts implement

- **WHEN** Figma design-context tools are not available in the session
- **THEN** the agent MUST NOT invent UI from a screenshot alone and MUST tell the user to connect Figma MCP (or equivalent) before continuing

#### Scenario: Missing Cursor design-to-code skill does not block other Agents

- **WHEN** the Agent has Figma design-context MCP tools but no skill named `figma-design-to-code`
- **THEN** `figma-pixel-implement` MUST proceed with MCP design-context + this skill’s fidelity rules rather than aborting for a missing Cursor-specific skill id

#### Scenario: Large frames are decomposed completely

- **WHEN** design-context output is truncated or the frame is too large
- **THEN** the agent MUST use metadata/outline tools to map visible child sections and fetch design context for each major child
- **AND** implement MUST treat any unfetched visible section as incomplete — MUST NOT mark implement complete from a sampled subset

### Requirement: figma-pixel-implement SHALL enforce export-faithful assets and ban mask recolor pipelines

For icons and images taken from Figma, implement MUST download or otherwise commit exported asset bytes into the project (or wire to an approved dynamic source). The skill MUST forbid hand-authored SVG/path placeholders, CSS `mask` (+ background fill) used to recolor exported glyphs, and rewriting export fills to `currentColor` solely to theme-follow when that changes the designed appearance. Dark/multi-theme needs MUST prefer a second exported asset set over mask-based theming.

#### Scenario: Mask-based icon rendering is forbidden

- **WHEN** implementing an icon that was exported from Figma
- **THEN** the agent MUST render it via an image (or export-preserving SVG component) with explicit sizes and MUST NOT use CSS `mask` + `currentColor` as the delivery path

#### Scenario: Theme convenience does not override fidelity

- **WHEN** the project wants icons to follow dark theme colors but only a light-frame export exists
- **THEN** the agent MUST either use a design-provided dark export or record an explicit pending item—MUST NOT invent a mask recolor pipeline to “make it theme”

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

### Requirement: figma-pixel-implement SHALL treat the Figma node as visual source of truth

Numeric and type values in the spec table MUST come from the structured design payload for the named node. When a walkthrough, QA note, or comment conflicts with the current Figma node, implement MUST keep the Figma value in `expected` and record the conflict as a residual or note — MUST NOT silently override the file to match the note.

#### Scenario: QA font-weight conflicts with the node

- **WHEN** a walkthrough says title `font-weight: 400` and the Figma text style on the named node is Medium 500
- **THEN** the spec table `expected` is 500 and the conflict is recorded; implement does not change expected to 400 to match the walkthrough

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

### Requirement: figma-pixel-implement SHALL produce a design-spec table mapped to project tokens

Implement MUST build a design-spec table (element × property × Figma exact value × repo token/class × source component) using structured Figma data (variables/defs and metadata as applicable). The table MUST live in the target-repo living artifact (Spec section). Each row MUST include `state` (visual state from the inventory), `mode` when theme is in scope, and **measurement basis** (which parent or sibling the number is relative to — for example gap from header bottom, not only the node’s own padding). Screenshot output MUST be treated as visual reference only—MUST NOT be the sole source of numeric values. Unbound one-off values SHOULD be flagged; hardcoded literals MUST NOT be preferred when a project token exists.

#### Scenario: Spec table accompanies implementation

- **WHEN** implement completes a component or screen slice
- **THEN** a design-spec table covering the changed visual properties MUST be on disk in the living artifact for `figma-pixel-verify`

#### Scenario: Spacing rows name the basis

- **WHEN** a walkthrough or design specifies distance from a named sibling (for example title to 顶部模块)
- **THEN** the spec row records that sibling as `basis` and the Figma-derived expected value for that relationship

### Requirement: figma-pixel-verify SHALL measure the running UI against the spec

`figma-pixel-verify` MUST compare the live rendered UI to the design-spec table using numbers read after a layout pass: computed style and box metrics when a document channel exists, or frames printed by a layout probe that mounted the control in the shipping parent when the surface has no computed-style API. A command that lays out the control with no parent is not a measurement. Copying a source literal that was written to match `expected` is not a measurement. Overall PASS MUST also require `scripts/check-figma-verify-report.mjs` from `figma-pixel-verify` to exit 0 on the living artifact. Pass/fail reporting MUST classify rows (at least distinguishing match, wrong token/drift, hardcoded literal, wrong variant/state, and missing element). Geometric comparisons MUST apply an explicit tolerance (e.g. about ±1px for box/spacing); colors, weights, and radii MUST compare exactly unless the skill documents a different rule. On a non-pass row the agent MUST fix the running UI and remeasure in the same run. The loop MUST continue until overall PASS or the measurement command cannot be executed, with a safety cap of about eight iterations. Hitting the cap MUST yield overall FAIL with residuals. When a measured box matches a platform control's intrinsic size and not the spec, the next iteration MUST switch that control to a custom layout that assigns the spec frames in the layout pass. Overall PASS additionally requires the unmeasured-critical-row rule (`figma-pixel-verify SHALL fail overall when critical inventory rows are unmeasured`).

#### Scenario: Numeric pass detects spacing drift

- **WHEN** the spec requires an 8px gap and the running UI measures 12px
- **THEN** verify MUST report a non-pass row with the measured delta and MUST NOT mark overall alignment as passed

#### Scenario: Layout probe measures a non-document surface

- **WHEN** the surface has no computed-style API and a command mounts the control in the shipping parent, runs layout, and prints frames
- **THEN** verify records those printed frames as actual and MUST NOT treat a source-literal compare or a lone-view layout as the measurement

#### Scenario: No executable probe fails closed

- **WHEN** neither a document channel nor a layout-probe command can run
- **THEN** overall status is not PASS, the report names the missing command, and the pixel rows stay unmeasured

### Requirement: figma-pixel-verify SHALL resolve the measurement surface through a channel ladder and declare the channel used

Verify MUST resolve the runnable surface in a fixed preference order for document UIs: (1) a component-workbench story from the living artifact's Stories subsection or a detected Storybook-style workbench; (2) a lightweight isolated harness that stubs host/engine dependencies while keeping real tokens and styles; (3) the in-product preview route; (4) a full app/browser launch as the heaviest last resort. When the surface has no computed-style API, or every document rung is unavailable, verify MUST use `layout-probe`: a command this run executes that mounts the control inside the shipping parent (the container the screen uses), runs one layout pass, and prints the control's width, height, and child frames. A command that lays out the control with no parent MUST NOT be treated as a measurement. A broken or absent workbench MUST fall the ladder down with the fallback recorded. Verify MUST declare the chosen channel (`Channel: storybook | isolated-harness | preview | full-app | layout-probe`) in the report. Source-literal comparison MUST NOT be declared as a channel. When a quality browser install still needs GUI onboarding, verify MUST record that and continue with the next reachable channel in the same turn. When the project declares a host engine older than the workbench browser, the report MAY note that difference. The note MUST NOT withhold geometric PASS and MUST NOT create a human step. Rows that depend on that engine's syntax MUST be measured with a runtime or parser at that floor, or they stay unmeasured and overall is not PASS. When no workbench exists at all, verify MUST make one advisory adoption suggestion (systematic, observable, agent-testable, enables component tests) and continue measuring through the next rung — the suggestion MUST NOT block or abort verify. Isolation MUST NOT be treated as simulation: a story or harness is a real render of the real component with real tokens; the ladder orders integration completeness × cost, not real-vs-fake.

#### Scenario: Story preferred over full app launch

- **WHEN** the living artifact lists a workbench story for the component and the full app is also launchable
- **THEN** verify measures through the story first and MUST NOT default to the heavier app launch

#### Scenario: No workbench suggests and continues

- **WHEN** the project has no component workbench and the component is reachable via the in-product preview route
- **THEN** verify makes one advisory adoption suggestion, records `Channel: preview`, and completes the measurement without blocking

#### Scenario: Broken workbench falls the ladder down

- **WHEN** the detected workbench fails to build or serve
- **THEN** verify records the fallback and continues with the next rung instead of aborting

#### Scenario: Engine floor does not create a human step

- **WHEN** geometric rows PASS under a workbench channel and the project declares a host engine older than the workbench browser
- **THEN** the report may note the engine difference, geometric PASS stands, and the report MUST NOT ask a person to finish those rows

#### Scenario: Lone-view probe is not a measurement

- **WHEN** the layout command lays out the control with no shipping parent
- **THEN** the row is unmeasured and `check-figma-verify-report.mjs` exits non-zero

#### Scenario: Non-document surface uses a layout probe

- **WHEN** the UI is a native view tree with an explicit size and no computed-style API
- **THEN** verify records `Channel: layout-probe` and fills actual from the command that printed laid-out frames

#### Scenario: Pending GUI onboarding does not stall the loop

- **WHEN** a quality browser install still needs GUI onboarding and another JS-eval or layout-probe channel can run
- **THEN** verify records the pending onboarding and measures through that other channel in the same turn

### Requirement: figma-pixel-fidelity skills SHALL stay platform-agnostic and strong-depend from PDCA hosts

Skill bodies MUST describe intents (obtain design context, export assets, measure laid-out frames, persist and update the living artifact) and MUST NOT require a single named MCP/CLI as the only implementation. Host workflows `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At host startup prerequisite check, a missing either skill MUST abort (no silent degrade). Hosts MUST load `figma-pixel-implement` during execution when the task text contains `figma.com` or `node-id=`, or the user asks for pixel restore; those rows stay hard; a probe of visible text, a visibility flag, or a list length does not pass them; when that same text also contains `参考`, `match the existing`, or `same as`, verify adds the named control's interaction states; implement is incomplete without a durable inventory+spec path. When the task text contains `figma.com` or `node-id=`, or this run implemented from Figma, hosts MUST load `figma-pixel-verify` during verification and MUST treat a missing Verify section (or named Spec source sibling) as a failed verification stage. The verification stage MUST pass only when that report’s overall status is PASS (accepted residuals included), its channel is `storybook`, `isolated-harness`, `preview`, `full-app`, or `layout-probe`, and `scripts/check-figma-verify-report.mjs` from `figma-pixel-verify` exits 0 on that file. A report that compares source literals, or that leaves pixel rows for a person, MUST NOT pass the stage. Any other result MUST fail the stage and return to the implement stage for another fix/re-measure loop inside the run. A spec-gap FAIL MUST NOT pass verification—the host re-enters implement to complete the table. Hosts MUST also load verify when the user/plan requires alignment checking without a same-run implement. Pure non-UI work MUST still pass the install-time prerequisite check but MUST NOT be forced to run implement/verify loops. Host prose MUST stay thin and MUST NOT duplicate Figma skill methodology.

#### Scenario: Missing Figma pixel skill aborts host startup

- **WHEN** a listed PDCA host loads and `figma-pixel-implement` or `figma-pixel-verify` is not available
- **THEN** the host prints a missing-dependency notice and aborts before orchestration continues

#### Scenario: Figma UI work invokes implement then verify

- **WHEN** stage execution is implementing UI from a Figma node URL
- **THEN** the host loads `figma-pixel-implement` for export-faithful implement + living spec path, and later verification loads `figma-pixel-verify` for measured pass/fail

#### Scenario: Missing verify report blocks host verification pass

- **WHEN** this run implemented UI from Figma and the living artifact has no Verify section (and no Spec source sibling report)
- **THEN** the host MUST NOT mark the verification stage as passed

#### Scenario: Spec-gap FAIL does not pass host verification

- **WHEN** `figma-pixel-verify` reports FAIL because Spec is missing critical rows after this-run implement
- **THEN** the host MUST NOT mark verification as passed and MUST re-enter `figma-pixel-implement` for the table

#### Scenario: Source compare does not pass host verification

- **WHEN** the Verify section’s channel is a source-literal compare, or the report leaves pixel rows for a person
- **THEN** the host MUST NOT mark the verification stage as passed

#### Scenario: Non-UI bug still requires skills installed

- **WHEN** a user runs `solve-workflow` for a non-UI backend bug and both Figma pixel skills are installed
- **THEN** the workflow proceeds without running implement/verify loops, but if either skill is missing the prerequisite check still aborts

### Requirement: figma-pixel-fidelity SHALL document boundaries with adjacent skills

The skills MUST state that Figma design-context / MCP (plus any Agent-native Figma→code guidance when present) owns structured context retrieval; `design-approval-gate` owns pre-implementation solution approval; `figma-pixel-implement` owns export-faithful implementation + durable living spec; `figma-pixel-verify` owns post-implementation measured alignment and the Verify section. External “taste” / no-design frontend skills MUST NOT override Figma fidelity when a node URL is in scope. Skill prose MUST remain platform-agnostic and MUST NOT treat a single product’s skill id as universal.

#### Scenario: Approval gate remains distinct

- **WHEN** the user has not approved a solution in manual mode
- **THEN** `design-approval-gate` still applies to production edits; having Figma context MUST NOT by itself satisfy design approval

### Requirement: figma-pixel-implement SHALL put theme scope in by default when the design or project has themes

When the Figma file exposes multiple variable modes (for example light/dark) **or** the target project has a theme-switching mechanism (`data-theme` / design tokens / `prefers-color-scheme`), implement MUST treat multi-theme as in scope without waiting for an explicit “dark mode” user phrase: detect theme structure, record a theme inventory, provide per-mode expected values, export design-provided assets per theme, and map theme-varying variables onto the project’s theming mechanism instead of duplicated hard-coded literals. Per-mode values MUST resolve from the design (`valuesByMode`, mode-switched fetch, or per-theme frames). Implement MUST NOT invent the other theme’s values or recolor a single export. When neither the file nor the project has a second theme, implement stays design-faithful to the requested frame/variant without ambient restyle.

#### Scenario: Theme inventory recorded when the project has data-theme

- **WHEN** the user asks to implement a frame and the project already switches `data-theme` with light/dark tokens, and the Figma file has light/dark modes
- **THEN** implement records the mode inventory and builds spec rows carrying per-mode expected values even if the user did not say “dark mode”

#### Scenario: Per-theme values resolve through the design channel

- **WHEN** per-mode expected values are needed and the design channel exposes variable `valuesByMode` (or a switchable file/frame mode or per-theme frames)
- **THEN** implement resolves each mode's value from the design itself and MUST NOT invent the unexposed mode's values

#### Scenario: Per-theme assets use design exports

- **WHEN** theme is in scope and an asset differs between themes
- **THEN** implement exports each theme's asset from its mode/frame and MUST NOT derive the second theme's asset by recoloring a single export

#### Scenario: Theme-varying values map to the theming mechanism

- **WHEN** theme is in scope and the project has a theming mechanism (CSS custom properties / design tokens / `data-theme` / `prefers-color-scheme`)
- **THEN** implement maps theme-varying variables onto that mechanism instead of duplicating hard-coded per-theme literals

#### Scenario: Single-theme file and project stay single

- **WHEN** the Figma file has one mode and the project has no theme switch
- **THEN** implement stays design-faithful to the single requested frame/variant without ambient dark/light restyle or speculative multi-theme expansion

### Requirement: figma-pixel-verify SHALL measure each theme in scope separately

When the spec covers multiple themes, verify MUST identify the running UI's theme-switching mechanism, switch to each theme in scope, and measure per-mode rows under that theme — the same row under different themes is a separate verdict. The report MUST present results per theme, and overall pass requires every measured theme within tolerance. Single-theme specs measure the requested theme only.

#### Scenario: Dark-mode rows measured under dark theme

- **WHEN** the spec carries per-mode color rows and the running UI has a theme switch mechanism
- **THEN** verify switches to dark, measures the dark rows under dark, and reports them separately from the light rows

#### Scenario: Overall status reflects the worst theme

- **WHEN** light rows pass but dark rows drift beyond tolerance
- **THEN** the overall status is not PASS, with the drifting theme identified in the report

#### Scenario: Single-theme verify unchanged

- **WHEN** the spec has no theme dimension
- **THEN** verify measures the requested theme once and reports as before, without theme switching

### Requirement: figma-pixel-verify SHALL fail overall when critical inventory rows are unmeasured

Verify MUST use the implement inventory plus design-spec table as the measurement set. When a document channel or a layout probe can run, each critical visual row (geometry, type, color, and documented visual states/themes in scope) MUST be measured after switching the running UI into that `state` / `mode`. An actual value copied from the source literal that implements `expected`, without a laid-out read in the same turn, counts as unmeasured. Overall status MUST NOT be PASS if any critical row is unmeasured, `MISSING-style`, or unaccepted `DRIFT`. `accepted-residual` MAY be used only for an explicit frozen deviation that records owner and reason (for example a documented 18px vs 16px freeze). Listing unmeasured rows only under residuals MUST NOT produce Overall PASS.

#### Scenario: Sampled chrome cannot PASS a full-frame inventory

- **WHEN** the inventory includes welcome spacing relative to the header and verify only measured header padding
- **THEN** the welcome-spacing row is unmeasured and overall status is not PASS

#### Scenario: Hover is measured under hover

- **WHEN** the spec has a chip background row with `state=hover`
- **THEN** verify switches the running UI into hover (or the equivalent documented state) before reading computed style for that row

#### Scenario: Frozen icon size is accepted residual not PASS

- **WHEN** Figma specifies 16px toolbar icons and the project has an explicit freeze at 18px with a recorded owner
- **THEN** that row is `accepted-residual` and MUST NOT be reported as PASS against 16px

#### Scenario: Source literal is unmeasured

- **WHEN** a row’s actual width equals the constant written in source and no layout-command output from this turn is cited
- **THEN** that row is unmeasured and overall status is not PASS

### Requirement: figma-pixel-verify SHALL write measurements into the living artifact

Verify MUST read the implement path (`Spec source`). It MUST write actual, verdict, and coverage into the Verify section of that file, or into a sibling report the artifact names. Spec `expected` MUST NOT be overwritten by measured actuals. After a same-run implement, a missing file or missing critical Spec row MUST fail overall and return to `figma-pixel-implement` — MUST NOT silently invent rows and claim the implement handoff complete. Standalone verify (no implement this run) MAY build a minimal spec from Figma but MUST persist it to the same path convention before measuring. Bounded code fixes MUST update measured columns only. Verify MUST NOT edit `figma-pixel-implement` skill prose.

#### Scenario: Drift is written back without changing expected

- **WHEN** Spec expected gap is 8px and the UI measures 12px
- **THEN** Verify records actual 12 and verdict DRIFT and MUST NOT change Spec expected to 12

#### Scenario: Spec-gap after implement returns to implement

- **WHEN** this run implemented from Figma and a critical visual row is missing from Spec
- **THEN** overall is not PASS and the next step is `figma-pixel-implement` completing the table

#### Scenario: Standalone verify persists first

- **WHEN** the user asks for alignment checking with no implement artifact this session
- **THEN** verify persists a minimal inventory+spec to the living-artifact path before measuring

### Requirement: figma-pixel-implement SHALL record fill ownership and default to transparent

When a node's structured design payload has no readable fill or background, implement MUST record fill ownership as transparent / `none` and MUST NOT assign a solid background solely because a screenshot of surrounding pixels looks filled. A solid background MUST be materialized only when the node itself has a readable fill, or when a focused node read and screenshot evidence both corroborate that the node owns that fill.

#### Scenario: Screenshot-colored region is not a node fill

- **WHEN** a panel node has no readable fill and the screenshot shows color from a parent or sibling
- **THEN** implement records that panel as transparent / `none` and MUST NOT paint a solid background on that node to match the screenshot

#### Scenario: Explicit fill is implemented

- **WHEN** the node exposes a readable fill in the design payload
- **THEN** implement uses that fill (or its mapped token) as `expected` for the background row

### Requirement: figma-pixel-implement SHALL export the outer instance as one asset

For a visible icon, logo, or graphic treated as one visual unit, implement MUST export from the outermost meaningful instance or graphic frame as a single local file referenced by one image (or equivalent). Implement MUST NOT deliver that unit as stacked leaf-path fragments with absolute positioning. If the export channel only yields leaf fragments, implement MUST re-export the outer node as one image before claiming the asset done. Remote design URLs MUST NOT be the shipped source for visible assets.

#### Scenario: Multi-path logo ships as one file

- **WHEN** a logo instance is composed of several vector paths under one instance
- **THEN** the delivered code references one local export of that instance and MUST NOT stack per-path files to rebuild the logo

#### Scenario: Unexportable graphic is blocked

- **WHEN** a visible graphic cannot be downloaded from the design channel
- **THEN** implement marks that area blocked or pending and MUST NOT substitute a hand-drawn, library, or CSS-traced replacement

### Requirement: figma-pixel-implement SHALL reconstruct instance geometry

Implement MUST size and place each in-scope instance from that instance's container geometry and internal offsets. Implement MUST NOT drop an exported asset into a generic icon/button shell (including a 16×16, 20×20, or 24×24 wrapper) unless the Figma instance itself uses that wrapper.

#### Scenario: Odd-sized icon keeps its wrapper

- **WHEN** an icon instance wrapper is 18×22 in Figma
- **THEN** implement uses 18×22 (and the recorded offsets) and MUST NOT normalize it to 16×16 or 24×24

### Requirement: figma-pixel-implement SHALL record text-color provenance from the text node

For each in-scope visible text node, implement MUST record in Spec the node's own readable Figma color variable name when available, plus the raw value, and map `token` to that variable (or the project's equivalent). Implement MUST NOT replace a readable Figma text-color variable with a self-invented semantic alias as the delivered color. If no readable name exists, implement MUST record `raw-only` and use the raw value (or a generated variable that traces to the source node). State-specific text colors MUST be separate rows, not one shared generic text color.

#### Scenario: Readable variable is the CSS reference

- **WHEN** a title text node binds to a readable Figma variable whose resolved name maps to `--text-5`
- **THEN** Spec `token` / `source` records that variable and the delivered color uses that mapping, not a guessed alias such as `--text-strong`

#### Scenario: Raw-only when no name exists

- **WHEN** a text node has a raw color and no readable variable name
- **THEN** implement records `raw-only` for that row and MUST NOT invent a design-token name

### Requirement: figma-pixel-implement SHALL inventory readable annotations without overriding expected

Readable design annotations, comments, and adaptation notes in scope MUST appear as Inventory rows (visual state, adaptation, `blocked`, or `out-of-scope: behavior` as appropriate). Implement MUST NOT invent undocumented hover or theme values from those notes. When a note conflicts with the named Figma node's structured values, `expected` MUST stay on the node and the conflict MUST be recorded as a note or residual.

#### Scenario: Hover note with no variant is inventoried

- **WHEN** an annotation describes hover but the component has no Hover variant and no prototype reaction
- **THEN** inventory records the note (as `no-variant-in-design` or `blocked` as fits) and implement MUST NOT invent hover colors

#### Scenario: Annotation number does not replace the node

- **WHEN** an annotation says gap 12px and the named node's structured gap is 8px
- **THEN** Spec `expected` is 8 and the conflict is recorded; implement MUST NOT change expected to 12

### Requirement: figma-pixel-implement SHALL restore stacking and SVG aspect from the design

Visible overlap, clipping, and floating layers MUST follow the readable Figma instance hierarchy (parent/sibling order) rather than ad hoc `z-index` escalation. SVG assets MUST keep their natural aspect ratio unless a readable design note or instance setting requires deformation.

#### Scenario: Overlay stays a later sibling

- **WHEN** the expanded Figma state shows a dropdown as a later sibling overlay
- **THEN** implement places that overlay according to that hierarchy instead of nesting it under a convenience wrapper that breaks stacking

#### Scenario: SVG is not stretched to fill

- **WHEN** an exported SVG is 24×16 and the slot is 24×24
- **THEN** implement keeps the 24×16 aspect unless the design explicitly requires stretching

### Requirement: figma-pixel-implement SHALL persist an Assets subsection on the living artifact

The living artifact MUST include an Assets subsection (or equivalent table) listing each in-scope visible graphic: Figma node, local path, resolved format/scale, and that the delivered reference is that local file. Missing Assets rows for implemented visible graphics mean implement is incomplete.

#### Scenario: Icon path is on disk in the artifact

- **WHEN** implement exports a toolbar icon to the project
- **THEN** the living artifact Assets subsection records the node, local path, and format before implement is marked complete

### Requirement: figma-pixel-verify SHALL fail invented-fill, fragment-cut, generic-shell, and invented-text-alias defects

When measuring, verify MUST treat as non-PASS (DRIFT, HARDCODED, or an equivalent named verdict) a critical row whose running UI shows: a solid fill the Spec recorded as transparent/`none`; a graphic rebuilt from stacked leaf fragments; a generic wrapper size that does not match instance geometry; a text color delivered via a self-invented semantic alias when Spec recorded a Figma variable; or a visible graphic still on a remote design URL. Verify MUST NOT overwrite Spec `expected`. Verify MUST NOT edit `figma-pixel-implement` skill prose.

#### Scenario: Invented panel fill is not PASS

- **WHEN** Spec records panel background as transparent/`none` and the running UI has a solid fill on that node
- **THEN** that row is not PASS

#### Scenario: Fragment-stacked icon is not PASS

- **WHEN** Spec Assets lists one local export and the running markup stacks multiple leaf files for that icon
- **THEN** that asset row is not PASS

### Requirement: figma-pixel-verify SHALL install and use the quality browser channel when installable

When the host is macOS and the `ego-browser` skill (or its install script) is available, and the CLI is already usable or the install finishes in this turn without waiting on a person, `figma-pixel-verify` MUST use that CLI before other document channels. If install still needs GUI onboarding, verify MUST record that and continue with the next reachable JS-eval or layout-probe channel in the same turn. Verify MUST NOT copy that product’s TaskSpace/CLI API into `figma-*`. `ego-browser` MUST NOT be a frontmatter `dependencies` entry.

When the host is not macOS, the skill/install path is absent, or install is blocked, verify MUST continue with another channel if one exists (document or layout-probe) and MUST NOT abort solely because `ego-browser` is unavailable.

#### Scenario: Installable quality channel is used when install finishes this turn

- **WHEN** the host is macOS, the `ego-browser` skill/install path exists, `command -v ego-browser` fails, the install can finish without GUI onboarding, and another browser channel is already connected
- **THEN** verify finishes that install and uses the CLI before the other document channel

#### Scenario: Pending GUI onboarding continues on another channel

- **WHEN** install still needs GUI onboarding and a layout-probe or another JS-eval channel can run
- **THEN** verify records the pending onboarding and measures through that other channel in the same turn

#### Scenario: Session browser skill is used for hover measurement

- **WHEN** a quality browser channel is ready that can hover a control and then evaluate computed style
- **THEN** verify uses that channel to put the control into hover before reading the hover row

#### Scenario: Non-installable host does not abort

- **WHEN** the host cannot install `ego-browser` (not macOS, or skill/install path absent, or install blocked) but another JS-eval or layout-probe channel exists
- **THEN** verify continues with that channel and MUST NOT abort

### Requirement: figma-pixel-verify SHALL treat vision screenshots as supporting evidence

When the model can inspect images, verify MUST capture running-UI vs Figma screenshots and use them to flag gross or composition mismatches (wrong block, fragment-cut appearance, stacking). When a JS-eval channel or a layout probe can run, Overall PASS MUST still require numeric measurement of critical visual rows. Vision-only comparison MUST NOT produce Overall PASS if either channel can run. When the declared channel is `storybook`, `isolated-harness`, `preview`, or `full-app`, the Verify section MUST include `Screenshot:` set to a path of a running-UI image saved this run. `scripts/check-figma-verify-report.mjs` MUST exit non-zero unless that path resolves to an existing non-empty file whose extension is png, jpg, jpeg, or webp. When the channel is `layout-probe` and the command cannot open a UI, `Screenshot:` MUST be `not-openable` and the script MUST NOT require an image file. A screenshot file MUST NOT replace numeric measurement.

#### Scenario: Vision flags fragment-cut but numeric still required

- **WHEN** a document channel or a layout probe can run and a screenshot shows a logo stacked from multiple fragments
- **THEN** verify records a non-PASS for that asset and still measures numeric rows; it MUST NOT skip numeric checks because the screenshot already looks wrong

#### Scenario: Vision-only cannot PASS when a measurement channel exists

- **WHEN** a JS-eval channel or a layout probe can run and the agent only compared screenshots
- **THEN** overall is not PASS

#### Scenario: Openable channel without a saved image fails the checker

- **WHEN** the report declares `Channel: storybook` and `Screenshot:` is missing, empty, or points at a file that does not exist or has zero bytes
- **THEN** `check-figma-verify-report.mjs` exits non-zero

#### Scenario: Layout probe that cannot open a UI does not invent an image

- **WHEN** the report declares `Channel: layout-probe` and `Screenshot: not-openable`
- **THEN** the screenshot clause does not fail the checker, and numeric measurement is still required

### Requirement: figma-pixel-implement SHALL bind a control whose laid-out box matches the node

When a design node publishes an explicit width and height, implement MUST place a control that still has that box after the layout pass a probe reads. Implement MUST prefer an existing project component whose laid-out size matches. When every stock platform control lays out to a different size, implement MUST build a custom control and assign track, thumb, and label frames in that layout pass. The spec row MUST record `primitive` as `project-component`, `custom-layout`, or `platform-control`. `platform-control` is valid only when a layout probe of a stock instance matches the spec box. When the design payload is a flattened instance (outer box only), implement MUST still bind that outer box with `custom-layout` or a matching project component. Inner sizes MUST come from a structured child fetch or an existing spec row that cites a design node, and MUST NOT be taken from a stock control's intrinsic size.

#### Scenario: Stock control size differs from the node

- **WHEN** the node publishes an explicit size and a stock platform control lays out to a different size
- **THEN** implement uses `custom-layout`, assigns the spec frames in the layout pass, and records `primitive` as `custom-layout`

#### Scenario: Flattened instance keeps the outer box

- **WHEN** design context returns only an outer box for a control
- **THEN** the spec outer size is that box, and the control is not replaced by a stock control whose intrinsic size differs

### Requirement: figma-pixel-implement SHALL mechanically expand spec rows from the fetched node tree

For every fetched visible node, implement MUST mechanically derive spec rows — sampling "key values" MUST NOT stand in for coverage. Each node MUST yield rows for its position (x/y relative to its parent or section) and size; each text node MUST additionally yield its full typography set (font-size, weight, line-height, color, alignment) and its rendered line count when multi-line; each container MUST additionally yield padding, gap, radius, shadow, and the cumulative absolute coordinate chain (each child's offset from the frame origin). Sibling spacing MUST be recorded with `basis` naming the relationship, not only the node's own padding. A fetched node is either covered by spec rows or listed as `out-of-scope` with a reason; silent omission makes the spec incomplete.

#### Scenario: Full typography captured for a text node

- **WHEN** a design text node renders at a given font-size, weight, line-height, and color
- **THEN** the spec table MUST contain rows for all four properties — omitting line-height or weight is a spec gap, not a detail

#### Scenario: Absolute coordinate chain captured

- **WHEN** a container sits at a fixed y offset in the frame and holds two equal-height buttons with a gap
- **THEN** the spec MUST record the container's absolute offset and the sibling gap with basis, so an upstream line-height error is measurable as a coordinate cascade

#### Scenario: Sampling is a spec gap

- **WHEN** a fetched visible node has no spec row and no `out-of-scope` entry with a reason
- **THEN** the spec is incomplete and MUST be completed before handoff to verify

### Requirement: figma-pixel-implement SHALL export per-frame Figma reference images as durable artifacts

Implement MUST export a raster image of every in-scope frame from the design source and store it in the target repo, recording node id, local path, and export scale in the living artifact. These reference exports are the differential-sweep baseline for `figma-pixel-verify`; a missing reference export for an in-scope frame means implement is incomplete.

#### Scenario: Reference export accompanies the living artifact

- **WHEN** implement completes an in-scope frame
- **THEN** the living artifact records a reference-export entry (node id, local path, scale) for that frame and the file exists on disk

### Requirement: figma-pixel-verify SHALL reconcile the spec against the Figma source before measuring

Before any numeric measurement, verify MUST mechanically derive the expected-item list from the Figma source (fetched node-tree data and/or the reference exports) and reconcile it against the Spec table: every expected item MUST be either covered by a spec row or listed as `out-of-scope` with a reason. Gaps MUST be added as new spec rows (which then become rows to measure in this run) or explicitly marked `out-of-scope`. The reconciliation table (expected items / covered / added rows / out-of-scope) MUST be written into the Verify report. Measurement MUST NOT begin before reconciliation completes. When an in-scope frame lacks its reference export, overall is FAIL and control returns to `figma-pixel-implement`.

#### Scenario: Missing rows are added before measuring

- **WHEN** reconciliation finds a text node whose line-height has no spec row
- **THEN** verify adds the row (or marks it out-of-scope with a reason), records it in the reconciliation table, and measures it in this run

#### Scenario: Reconciliation is a gate

- **WHEN** the spec has never been reconciled against the Figma source
- **THEN** verify MUST NOT proceed to numeric measurement or report overall PASS

### Requirement: figma-pixel-verify SHALL run a pixel differential sweep against the reference exports

Verify MUST compare each reference export against this run's implementation screenshot as a same-box side-by-side (and, when the toolchain allows, a per-pixel difference artifact), inspect region by region, and convert every observed difference into either a new measured row or a recorded residual. Differences discovered outside the spec table are the legitimate product of this sweep. The sweep MUST save its artifacts (side-by-side and/or diff images) and cite their paths in the Verify report; for an openable channel without sweep artifacts, overall is not PASS.

#### Scenario: Sweep catches a difference no spec row predicted

- **WHEN** the side-by-side shows an element offset the spec table never recorded
- **THEN** verify adds a measured row for the offset (or records an accepted residual), resolves it, and cites the sweep artifact path in the report

### Requirement: figma-pixel-verify SHALL measure text-line ink geometry for multi-line text nodes

For every multi-line text node in scope, verify MUST measure — in addition to the box — the line count, each line's ink start position (the rendered left edge of its first visible character), the break content (which text ends each line), and any hanging indent or in-line offset, and record them as rows. A box-only reading MUST NOT count as coverage for a multi-line text node's alignment.

#### Scenario: Hanging indent is a measured row

- **WHEN** a two-line instruction renders its second line hanging-aligned to the first line's body text
- **THEN** verify records the second line's ink start offset as a row and compares it against the design value

#### Scenario: Line-break points are part of the evidence

- **WHEN** the design breaks a phrase across two lines at a specific point
- **THEN** verify records the rendered break content and flags a mismatch as a non-pass row

### Requirement: figma-pixel-verify SHALL obtain an independent re-check before reporting overall PASS

Before writing overall PASS, verify MUST obtain an independent re-check — via a fresh-context agent run, a different model, or a blind re-source check that re-derives the expected-item list from the Figma source without consulting the author's Spec table — and MUST record the method, the re-checker identity, and its artifact path in the Verify report. The independence requirement is about the checking context, not a specific tool. When no independent channel is available, verify MUST record the attempted methods and the unavailability reason; the report MUST NOT claim an independent check that did not run.

#### Scenario: Independent check recorded in the report

- **WHEN** verify prepares to report overall PASS
- **THEN** the Verify report contains an `Independent check:` line naming the method and its artifact path, or the recorded unavailability reason

#### Scenario: Same-context self-review is not an independent check

- **WHEN** the author re-reads its own Spec table in the same context and calls it a check
- **THEN** this does not satisfy the independence requirement

### Requirement: figma-pixel-verify SHALL add interaction rows from a named shipped control

When the task text contains `figma.com` or `node-id=` and also `参考`, `match the existing`, or `same as`, verify MUST read the named existing control's authored rules for hover, focus, focus-within, and open or expanded. Each property that differs from the resting rule MUST become a spec row with that `state` before numeric measurement. A resting-frame reading MUST NOT pass those rows. A probe that only checks text, visibility, or item count MUST NOT measure them.

#### Scenario: Focus rule on the named control becomes a row

- **WHEN** the task text contains a Figma URL and `参考`, and the named control's focus rule changes the border color
- **THEN** verify adds a focus-state border row and measures the new control in that state

#### Scenario: Resting frame does not cover the focus row

- **WHEN** the focus-state row exists and the only reading is the resting frame
- **THEN** that row is unmeasured and overall is not PASS

