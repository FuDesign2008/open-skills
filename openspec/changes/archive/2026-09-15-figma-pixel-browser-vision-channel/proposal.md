## Why

`figma-pixel-verify` already asks the Agent to open a preview, switch hover/theme, screenshot, and read computed style, but it does not say to **load a capable browser skill** or **install the quality channel when that install is possible**. A vision-capable Chromium with real pointer hover + screenshot + in-page evaluate is how fidelity measurement actually works. Copying a third-party TaskSpace API into `figma-*` would still be wrong; skipping an installable quality channel for a weaker MCP would also be wrong.

## What Changes

- **Verify quality gate:** On macOS, when the `ego-browser` skill (or its install script) is available, verify **MUST** install/onboard the `ego-browser` CLI before measuring, then load that skill for open / pointer state / screenshot / evaluate. Do **not** skip to a weaker channel while that install is possible. `ego-browser` is **not** a frontmatter dependency.
- **Degrade, don’t abort:** If the OS is not macOS, the skill/install path is absent, or install is blocked, continue with another JS-eval channel and record which channel was used.
- **Vision** (when the model can inspect images) is supporting evidence for composition defects. It does **not** replace numeric PASS when a JS-eval channel exists.
- Do **not** copy a third-party browser API into `figma-*`. Hosts stay thin. `figma-pixel-implement` unchanged.
- `figma-pixel-verify` 1.4.0 → 1.5.0; evals for quality-channel use, install-when-possible, and vision-not-PASS.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `figma-pixel-fidelity`: install-when-possible quality browser channel for verify; vision supports composition checks; numeric SoT unchanged.

## Impact

- Skills: `skills/figma-pixel-verify/{SKILL.md,reference.md,evals/evals.json}`.
- Specs: `openspec/specs/figma-pixel-fidelity`.
- Docs: `docs/generated/skills-index.md`.
- Hosts: no methodology copy.
