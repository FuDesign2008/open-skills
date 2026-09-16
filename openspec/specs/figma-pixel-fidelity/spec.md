# figma-pixel-fidelity Specification

## Purpose

Behavioral contract for open-skills Figma pixel fidelity: two user-invocable skills (`figma-pixel-implement` and `figma-pixel-verify`) that split export-faithful implementation + design-spec contract from measured runtime alignment. PDCA hosts strong-depend on both; invoke under Figma-scope conditions; platform-agnostic tool intent.
## Requirements
### Requirement: figma-pixel-fidelity SHALL ship two user-invocable skills with split duties

open-skills MUST provide two installable skills: `figma-pixel-implement` (pixel-aligned implementation from Figma) and `figma-pixel-verify` (runtime alignment check). Implement MUST NOT claim pixel alignment is complete. Verify MAY claim pass or fail only with fresh measurement or explicitly labeled residual evidence. Both skill bodies MUST be English; frontmatter `description` MUST include Chinese trigger phrases and stay within the project description length limit.

#### Scenario: Implement refuses completion claim

- **WHEN** an agent finishes `figma-pixel-implement` for a Figma node
- **THEN** it MUST produce or update a durable living spec in the target repo (Inventory + Spec) and MUST NOT state that pixel alignment is verified complete without running `figma-pixel-verify` (or an equivalent measured check the user accepts)

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

`figma-pixel-verify` MUST compare the live rendered UI to the design-spec table using numeric reads from the running page (e.g. computed style and box metrics) when a JS-eval channel exists, plus optional side-by-side screenshot comparison. Pass/fail reporting MUST classify rows (at least distinguishing match, wrong token/drift, hardcoded literal, wrong variant/state, and missing element). Geometric comparisons MUST apply an explicit tolerance (e.g. about ±1px for box/spacing); colors, weights, and radii MUST compare exactly unless the skill documents a different rule. The loop MUST be bounded (about three fix/re-measure iterations unless the user raises the cap). Overall PASS additionally requires the unmeasured-critical-row rule (`figma-pixel-verify SHALL fail overall when critical inventory rows are unmeasured`).

#### Scenario: Numeric pass detects spacing drift

- **WHEN** the spec requires an 8px gap and the running UI measures 12px
- **THEN** verify MUST report a non-pass row with the measured delta and MUST NOT mark overall alignment as passed

#### Scenario: No eval channel degrades honestly

- **WHEN** no channel can evaluate JavaScript in the running app
- **THEN** verify MUST NOT claim a full numeric pass; it MUST record residuals for unmeasured properties and may use screenshot comparison only with that limitation stated

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

### Requirement: figma-pixel-fidelity skills SHALL stay platform-agnostic and strong-depend from PDCA hosts

Skill bodies MUST describe intents (obtain design context, export assets, measure computed styles, persist and update the living artifact) and MUST NOT require a single named MCP/CLI as the only implementation. Host workflows `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At host startup prerequisite check, a missing either skill MUST abort (no silent degrade). Hosts MUST load `figma-pixel-implement` during execution when the task includes a Figma URL/node or pixel-restore / design-faithful UI intent; implement is incomplete without a durable inventory+spec path. When this run implemented from Figma, hosts MUST load `figma-pixel-verify` during verification and MUST treat a missing Verify section (or named Spec source sibling) as a failed verification stage. A spec-gap FAIL MUST NOT pass verification—the host re-enters implement to complete the table. Hosts MUST also load verify when the user/plan requires alignment checking without a same-run implement. Pure non-UI work MUST still pass the install-time prerequisite check but MUST NOT be forced to run implement/verify loops. Host prose MUST stay thin and MUST NOT duplicate Figma skill methodology.

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

Verify MUST use the implement inventory plus design-spec table as the measurement set. When a JS-eval channel exists, each critical visual row (geometry, type, color, and documented visual states/themes in scope) MUST be measured after switching the running UI into that `state` / `mode`. Overall status MUST NOT be PASS if any critical row is unmeasured, `MISSING-style`, or unaccepted `DRIFT`. `accepted-residual` MAY be used only for an explicit frozen deviation that records owner and reason (for example a documented 18px vs 16px freeze). Listing unmeasured rows only under residuals MUST NOT produce Overall PASS.

#### Scenario: Sampled chrome cannot PASS a full-frame inventory

- **WHEN** the inventory includes welcome spacing relative to the header and verify only measured header padding
- **THEN** the welcome-spacing row is unmeasured and overall status is not PASS

#### Scenario: Hover is measured under hover

- **WHEN** the spec has a chip background row with `state=hover`
- **THEN** verify switches the running UI into hover (or the equivalent documented state) before reading computed style for that row

#### Scenario: Frozen icon size is accepted residual not PASS

- **WHEN** Figma specifies 16px toolbar icons and the project has an explicit freeze at 18px with a recorded owner
- **THEN** that row is `accepted-residual` and MUST NOT be reported as PASS against 16px

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

When the host is macOS and the `ego-browser` skill (or its install script) is available, `figma-pixel-verify` MUST make the `ego-browser` CLI ready before measuring: follow that skill’s install reference when the command is missing, wait for user GUI onboarding when required, then load the skill and use it for open preview, pointer/visual state, screenshot, and in-page JavaScript evaluate. Verify MUST NOT skip to a weaker channel while that install is possible. Verify MUST NOT copy that product’s TaskSpace/CLI API into `figma-*`. `ego-browser` MUST NOT be a frontmatter `dependencies` entry.

When the host is not macOS, the skill/install path is absent, or install is blocked, verify MUST continue with another JS-eval channel if one exists and MUST NOT abort solely because `ego-browser` is unavailable.

#### Scenario: Installable quality channel is installed before measure

- **WHEN** the host is macOS, the `ego-browser` skill/install path exists, `command -v ego-browser` fails, and another browser MCP is already connected
- **THEN** verify follows the `ego-browser` install/onboard path and confirms the CLI before measuring; it MUST NOT skip to the already-connected MCP while that install is possible

#### Scenario: Session browser skill is used for hover measurement

- **WHEN** a quality browser channel is ready that can hover a control and then evaluate computed style
- **THEN** verify uses that channel to put the control into hover before reading the hover row

#### Scenario: Non-installable host does not abort

- **WHEN** the host cannot install `ego-browser` (not macOS, or skill/install path absent, or install blocked) but another JS-eval channel exists
- **THEN** verify continues with that channel and MUST NOT abort

### Requirement: figma-pixel-verify SHALL treat vision screenshots as supporting evidence

When the model can inspect images, verify MUST capture running-UI vs Figma screenshots and use them to flag gross or composition mismatches (wrong block, fragment-cut appearance, stacking). When a JS-eval channel exists, Overall PASS MUST still require numeric measurement of critical visual rows. Vision-only comparison MUST NOT produce Overall PASS if JS-eval was available.

#### Scenario: Vision flags fragment-cut but numeric still required

- **WHEN** JS-eval is available and a screenshot shows a logo stacked from multiple fragments
- **THEN** verify records a non-PASS for that asset and still measures numeric rows; it MUST NOT skip numeric checks because the screenshot already looks wrong

#### Scenario: Vision-only cannot PASS when eval exists

- **WHEN** JS-eval is available and the agent only compared screenshots
- **THEN** overall is not PASS

