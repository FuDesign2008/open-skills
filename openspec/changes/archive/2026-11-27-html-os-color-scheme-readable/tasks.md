## 1. Shells

- [x] 1.1 Update `skills/html-explain/assets/page-shell.html` with `color-scheme: light dark`, CSS tokens, and dark media overrides.
- [x] 1.2 Update `skills/explain-clearly/assets/explanation-shell.html` the same way; wire body/table/pre to tokens.

## 2. Thin guidance and versions

- [x] 2.1 Add token-follow sentences to both SKILL.md Write/HTML deliver steps; Color scheme notes in reference.md.
- [x] 2.2 Bump `html-explain` to `1.1.0` and `explain-clearly` to `1.1.0`.

## 3. Contracts and validation

- [x] 3.1 Extend contract tests for dual color-scheme, `--bg`, and `prefers-color-scheme: dark`.
- [x] 3.2 Run contract tests, `npm run lint:skill-description`, and `openspec validate html-os-color-scheme-readable --strict`.
