## ADDED Requirements

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
