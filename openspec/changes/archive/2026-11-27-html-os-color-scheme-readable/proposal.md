## Why

HTML pages from `html-explain` and `explain-clearly` were light-palette only (or lacked tokenized dark overrides). Readers use OS dark mode often; those pages should stay readable without a manual theme switch or scripts.

## What Changes

- Reference shells (`page-shell.html`, `explanation-shell.html`) use `color-scheme: light dark`, CSS custom properties for author colors, and `@media (prefers-color-scheme: dark)` to switch tokens only.
- Thin skill/reference guidance: follow shell tokens when extending styles.
- Contract tests assert the dual color-scheme tokens and dark media query.
- Non-BREAKING; light defaults stay close to the existing palettes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `html-explain`: HTML pages remain readable under OS light and dark via shell CSS tokens.
- `explain-clearly`: HTML form pages remain readable under OS light and dark via shell CSS tokens.

## Impact

- `skills/html-explain/assets/page-shell.html`, `SKILL.md`, `reference.md` (version `1.1.0`)
- `skills/explain-clearly/assets/explanation-shell.html`, `SKILL.md`, `reference.md` (version `1.1.0`)
- `scripts/html-explain-contract.test.mjs`, `scripts/explain-clearly-contract.test.mjs`
- Spec deltas under this change; main specs updated on archive
