# Tasks: arch-boundary-precheck

## 1. Single source of truth — code-design-review Layer B

- [x] 1.1 `skills/code-design-review/SKILL.md`: extend the Layer B intro trigger list with "crosses process or layer boundaries" (boundary-crossing solutions take the full path)
- [x] 1.2 `skills/code-design-review/SKILL.md`: extend dimension 12 (Dependency direction) with the runtime-ownership checkable items — (1) capability runtime initialization location, (2) boundary legality incl. cross-layer import dependency-tree spread and the bundler static pre-scan fact (dynamic `require`/`import` does not bypass circular dependencies), (3) ownership classification (system vs data/product capability vs calling-layer positioning); compact English prose, no internal identifiers
- [x] 1.3 `skills/code-design-review/SKILL.md`: add the Layer B blocking bullet — called capability has no runtime in the caller's process/layer, or a cross-layer import pulls an unrelated dependency tree into the caller, without explicit Prudent-Deliberate debt acceptance; short-term cost advantages (reuse / single-repo / no cross-team) do not downgrade it
- [x] 1.4 `skills/code-design-review/reference.md`: extend §12 (Dependency direction) How-to-apply with the three-check procedure and the bundler pre-scan note; generic wording only
- [x] 1.5 `skills/code-design-review/SKILL.md`: bump version MINOR (1.1.0 → 1.2.0)

## 2. Host thin references — explore-solutions stage (4 hosts)

- [x] 2.1 `skills/solve-workflow/SKILL.md` Stage 3: add ~2-line decision-order rule — cross-process/cross-layer candidates MUST pass the architecture-boundary precheck (initialization location → boundary legality → ownership classification) before short-term costs (change size / reuse / single-repo) are weighed; boundary verdict surfaces with the comparison table; methodology per `code-design-review` Layer B dependency-direction dimension (by name, no number); apply to both the manual solution list and the auto-mode selection priority line; bump version MINOR
- [x] 2.2 `skills/opsx-solve-workflow/SKILL.md` Stage 3: same decision-order rule as 2.1, adapted to its solution-elements list; bump version MINOR
- [x] 2.3 `skills/jira-fix-workflow/SKILL.md` Stage 5 (Explore solutions): same decision-order rule as 2.1, attached to its solution-table / auto-select priority line; bump version MINOR
- [x] 2.4 `skills/opsx-jira-fix-workflow/SKILL.md` Stage 4 (Explore solutions): same decision-order rule as 2.1; bump version MINOR

## 3. Index & consistency

- [x] 3.1 Regenerate `docs/generated/skills-index.md` via `node scripts/gen-skill-docs.mjs` (or confirm pre-commit did it) and include it in the change
- [x] 3.2 Consistency grep: the precheck wording present in all four hosts (name-based reference to "dependency direction dimension", no dimension numbers); no internal identifiers in any added line (run `node scripts/lint-skill-deidentification.mjs --staged`)
