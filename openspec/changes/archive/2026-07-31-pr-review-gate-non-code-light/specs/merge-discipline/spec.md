## ADDED Requirements

### Requirement: Part R SHALL resolve pr-review-gate preference before review depth

Before loading `pr-code-review`, Part R MUST resolve `pr-review-gate:` from `AGENTS.md` then `CLAUDE.md` (first match wins). Allowed values: `always`, `never`, `ask`, `non-code-light`. If unset, Part R MUST treat the preference as `always` (full dual-axis review, today’s behavior).

#### Scenario: Unset preference means full review

- **WHEN** neither `AGENTS.md` nor `CLAUDE.md` declares `pr-review-gate:`
- **THEN** Part R runs full-depth `pr-code-review` (no light path solely from unset)

#### Scenario: never skips with 留痕

- **WHEN** preference is `never`
- **THEN** Part R writes project-preference skip 留痕 and proceeds to Part D without invoking `pr-code-review`

#### Scenario: ask requires user choice

- **WHEN** preference is `ask`
- **THEN** Part R asks whether to run full, light, or skip for this merge; MUST NOT auto-pick; skip requires user-explicit skip 留痕

### Requirement: Part R SHALL classify non-application-code surfaces

Part R MUST classify the open PR/MR three-dot diff as **non-application-code** when every changed path matches the allowlist and none match the denylist. Allowlist (illustrative, authoritative list lives in `merge-discipline` SKILL/reference): Markdown docs, `skills/**`, `openspec/**`, `AGENTS.md` / `CLAUDE.md`, plugin marketplace JSON metadata, generated skills index under `docs/generated/`. Denylist: application/runtime source extensions (e.g. `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.py`, `.go`, `.java`, `.rs`, `.swift`, `.kt`) outside the allowlisted skill/docs trees when those files are executable product code—not Markdown. A mixed diff (any denylisted path) MUST be classified as **application-code** and MUST NOT take the non-code-light path solely from surface classification.

#### Scenario: Skills-only PR is non-application-code

- **WHEN** the PR diff only changes files under `skills/**` and `openspec/**` and `docs/**` Markdown
- **THEN** the surface classifier reports non-application-code

#### Scenario: Mixed runtime source forces full surface

- **WHEN** the PR also changes a `.ts` application module outside allowlisted doc/skill trees
- **THEN** the surface is application-code

### Requirement: non-code-light preference SHALL use light review on non-application-code surfaces

When preference is `non-code-light` and the surface is non-application-code, Part R MUST invoke `pr-code-review` with `depth=light`, still applying dual-axis ≥80 Critical/Important clearance. When preference is `non-code-light` and the surface is application-code, Part R MUST use `depth=full`. When preference is `always`, Part R MUST use `depth=full` regardless of surface.

#### Scenario: non-code-light on docs/skills PR

- **WHEN** preference is `non-code-light` and surface is non-application-code
- **THEN** Part R runs `pr-code-review` at light depth, then proceeds to Part D on pass

#### Scenario: non-code-light on code PR

- **WHEN** preference is `non-code-light` and surface is application-code
- **THEN** Part R runs `pr-code-review` at full depth

## MODIFIED Requirements

### Requirement: Part R SHALL run pr-code-review before tip pinning

After Part C (coverage) resolves to continue, and before Part D (tip pinning), `merge-discipline` MUST apply the `pr-review-gate` preference and surface classifier above. Unless preference resolves to `never` (or `ask` with user skip 留痕), Part R MUST load strong dependency `pr-code-review` and run it at the selected depth against the open PR/MR about to be merged. Missing `pr-code-review` MUST abort with a per-skill install command when a run (full or light) is required. Execution order MUST remain A → B → C → R → D → merge.

#### Scenario: Order includes Part R when review runs

- **WHEN** a protected-branch merge is imminent, Parts A–C have passed, and preference requires a review run
- **THEN** Part R runs `pr-code-review` before any tip-pin merge command
