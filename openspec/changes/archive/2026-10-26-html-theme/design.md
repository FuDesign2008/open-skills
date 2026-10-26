## Context

The renderer's CSS used a single palette. The pages are opened during the day and at night, and the operating system already exposes a light/dark preference.

## Goals / Non-Goals

**Goals:**

- Light and dark palettes for every view.
- Automatic selection via `prefers-color-scheme`; no script.
- A light print palette.
- Consistent contrast for text, borders, status pills, KPIs, and code.

**Non-Goals:**

- A manual theme switch or a stored preference.
- Per-user theming.
- Backfilling old pages.

## Decisions

- Define the palette in CSS variables at `:root`; override the variables inside `@media (prefers-color-scheme: dark)`.
- Use `color-scheme: light dark` so native controls and scrollbars follow the same preference.
- Keep the layout identical in both palettes; only the variables change.
- In `@media print`, force a white background and dark text, and hide the navigation and table of contents.
- No script: the browser selects the palette at load and follows system changes live.

## Risks / Trade-offs

- [A custom palette is too low-contrast in one mode] → The palette is defined once in variables; adjust the variable values, not each rule.
- [A print style inherits dark text on a dark background] → The print block forces white/dark values explicitly.

## Migration Plan

No backfill. New and regenerated pages carry both palettes. Rollback is reverting the CSS.

## Open Questions

None.
