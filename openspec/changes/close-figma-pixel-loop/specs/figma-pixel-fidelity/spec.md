# Delta Spec: figma-pixel-fidelity

## MODIFIED Requirements

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

Skill bodies MUST describe intents (obtain design context, export assets, measure laid-out frames, persist and update the living artifact) and MUST NOT require a single named MCP/CLI as the only implementation. Host workflows `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At host startup prerequisite check, a missing either skill MUST abort (no silent degrade). Hosts MUST load `figma-pixel-implement` during execution when the task includes a Figma URL/node or pixel-restore / design-faithful UI intent; implement is incomplete without a durable inventory+spec path. When this run implemented from Figma, hosts MUST load `figma-pixel-verify` during verification and MUST treat a missing Verify section (or named Spec source sibling) as a failed verification stage. The verification stage MUST pass only when that report’s overall status is PASS (accepted residuals included), its channel is `storybook`, `isolated-harness`, `preview`, `full-app`, or `layout-probe`, and `scripts/check-figma-verify-report.mjs` from `figma-pixel-verify` exits 0 on that file. A report that compares source literals, or that leaves pixel rows for a person, MUST NOT pass the stage. Any other result MUST fail the stage and return to the implement stage for another fix/re-measure loop inside the run. A spec-gap FAIL MUST NOT pass verification—the host re-enters implement to complete the table. Hosts MUST also load verify when the user/plan requires alignment checking without a same-run implement. Pure non-UI work MUST still pass the install-time prerequisite check but MUST NOT be forced to run implement/verify loops. Host prose MUST stay thin and MUST NOT duplicate Figma skill methodology.

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

### Requirement: figma-pixel-fidelity SHALL ship two user-invocable skills with split duties

open-skills MUST provide two installable skills: `figma-pixel-implement` (pixel-aligned implementation from Figma) and `figma-pixel-verify` (runtime alignment check). Implement MUST NOT claim pixel alignment is complete by itself. The same run MUST continue into `figma-pixel-verify`. The user-facing result is that skill’s overall PASS, or FAIL that names a measurement command that could not run. Verify MAY claim pass or fail only with a laid-out measurement from this turn, or an accepted-residual that records owner and reason. Both skill bodies MUST be English; frontmatter `description` MUST include Chinese trigger phrases and stay within the project description length limit.

#### Scenario: Implement continues into verify

- **WHEN** an agent finishes the implement steps for a Figma node
- **THEN** it MUST produce or update a durable living spec in the target repo (Inventory + Spec) and MUST load `figma-pixel-verify` in the same run before reporting pixel alignment

#### Scenario: Verify can run independently

- **WHEN** the user invokes alignment checking without a prior implement run in the same session
- **THEN** `figma-pixel-verify` MUST either consume an existing living spec on disk or persist a minimal spec for the named Figma node before measuring

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

When the model can inspect images, verify MUST capture running-UI vs Figma screenshots and use them to flag gross or composition mismatches (wrong block, fragment-cut appearance, stacking). When a JS-eval channel or a layout probe can run, Overall PASS MUST still require numeric measurement of critical visual rows. Vision-only comparison MUST NOT produce Overall PASS if either channel can run.

#### Scenario: Vision flags fragment-cut but numeric still required

- **WHEN** a document channel or a layout probe can run and a screenshot shows a logo stacked from multiple fragments
- **THEN** verify records a non-PASS for that asset and still measures numeric rows; it MUST NOT skip numeric checks because the screenshot already looks wrong

#### Scenario: Vision-only cannot PASS when a measurement channel exists

- **WHEN** a JS-eval channel or a layout probe can run and the agent only compared screenshots
- **THEN** overall is not PASS

## ADDED Requirements

### Requirement: figma-pixel-implement SHALL bind a control whose laid-out box matches the node

When a design node publishes an explicit width and height, implement MUST place a control that still has that box after the layout pass a probe reads. Implement MUST prefer an existing project component whose laid-out size matches. When every stock platform control lays out to a different size, implement MUST build a custom control and assign track, thumb, and label frames in that layout pass. The spec row MUST record `primitive` as `project-component`, `custom-layout`, or `platform-control`. `platform-control` is valid only when a layout probe of a stock instance matches the spec box. When the design payload is a flattened instance (outer box only), implement MUST still bind that outer box with `custom-layout` or a matching project component. Inner sizes MUST come from a structured child fetch or an existing spec row that cites a design node, and MUST NOT be taken from a stock control's intrinsic size.

#### Scenario: Stock control size differs from the node

- **WHEN** the node publishes an explicit size and a stock platform control lays out to a different size
- **THEN** implement uses `custom-layout`, assigns the spec frames in the layout pass, and records `primitive` as `custom-layout`

#### Scenario: Flattened instance keeps the outer box

- **WHEN** design context returns only an outer box for a control
- **THEN** the spec outer size is that box, and the control is not replaced by a stock control whose intrinsic size differs
