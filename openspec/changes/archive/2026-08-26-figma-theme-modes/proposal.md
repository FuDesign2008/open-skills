# Proposal: figma-theme-modes

## Why

`figma-pixel-implement` / `figma-pixel-verify` (v1.0.x) model themes as a single requested frame/variant with anti-drift rules only (no ambient restyle; no invented mask recolor). Modern products routinely require the same surface in light/dark — and sometimes more themes. Today a "implement this with dark mode" request gets no systematic flow: no theme-structure detection, no per-mode spec values, no per-theme assets, and verify measures only the default theme once.

## What Changes

- `figma-pixel-implement` gains an explicit multi-theme scope: detect the design's theme structure (variable collections with multiple modes, or separate per-theme frames), record a theme inventory, add a `mode` dimension to the design-spec table (per-mode expected values), export design-provided assets per theme, and map theme-varying variables onto the project's theming mechanism (CSS custom properties / design tokens / `data-theme` / `prefers-color-scheme`).
- `figma-pixel-verify` gains per-theme measurement: identify the running UI's theme-switching mechanism, switch to each theme in scope, measure per-mode rows under each (separate verdicts per theme), and report per theme.
- Both skills keep their single-theme default behavior unchanged — multi-theme expansion runs only on explicit request; anti-drift rules stay intact.
- Capability: `figma-pixel-fidelity` (ADDED requirements). Skill versions bump 1.0.x → 1.1.0; descriptions add theme triggers.

## Impact

- Files: `skills/figma-pixel-implement/{SKILL.md,reference.md}`, `skills/figma-pixel-verify/{SKILL.md,reference.md}`, regenerated `docs/generated/skills-index.md`, this change's artifacts.
- Referencing PDCA hosts (solve / opsx-solve / jira-fix / opsx-jira-fix) are thin references — zero changes required.
- Non-goals: no separate theme skill, no change to single-theme default behavior, no platform-specific tool hardcoding (instructions stay intent-level; upstream channels verified to expose no mode parameter today, so per-mode values resolve via variable `valuesByMode` or mode-switched re-fetch).
