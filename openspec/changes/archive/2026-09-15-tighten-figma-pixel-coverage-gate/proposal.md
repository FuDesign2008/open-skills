## Why

`figma-pixel-implement` / `figma-pixel-verify` currently allow a sampled default-state spec plus Overall PASS while unmeasured rows sit in residuals. Hosts only *load* verify when Figma work is in scope; they do not fail verification when the report is missing. Product UI walkthroughs then still fail on spacing, hover, dark theme, and measurement basis — after agents claimed Figma fidelity skills were used.

## What Changes

- **Implement** must build a **screen × state inventory** from the design (visible child sections of large frames; component variants / prototype states that exist on the canvas) **before** the design-spec table. Theme scope is in by default when the Figma file has multiple modes **or** the project has a theme switch (`data-theme` / tokens / `prefers-color-scheme`) — not only when the user says “dark mode”. Spec rows gain `state`, `mode`, and **measurement basis** (which parent/sibling the number is relative to). Visual source of truth is the Figma node; conflicting QA notes are recorded, not used to override the file. Behavior-only items (window drag, auto-follow scroll) are listed as `out-of-scope: behavior` and MUST NOT be claimed as pixel PASS.
- **Verify** treats that inventory + spec table as the only input. A critical row that is unmeasured, `MISSING-style`, or unaccepted `DRIFT` makes Overall **FAIL**. `accepted-residual` is only for explicit frozen deviations with an owner/reason. Visual variants (hover, etc.) are measured after switching the running UI into that state.
- **Hosts** (`solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`): when this run implemented from Figma, a `figma-pixel-verify` report is **required** to pass the verification stage. Thin pointer only — no methodology restated.
- Skill versions 1.1.0 → 1.2.0; host versions PATCH. Evals added for the new gates.
- Not **BREAKING** for install/prereq (skills remain strong deps). It **is** a stricter pass/fail contract: previous “PASS with unmeasured residuals” is no longer valid.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `figma-pixel-fidelity`: inventory, default theme-in-scope, measurement basis, unmeasured-is-FAIL, Figma as visual SoT, behavior out-of-scope labeling, host verify-report gate.
- `opsx-solve-workflow`: stage-7 Figma verify report required after Figma implement (missing report blocks pass).
- `jira-fix-workflow`: same host verify-report gate.
- `opsx-jira-fix-workflow`: same host verify-report gate.

`solve-workflow` has no dedicated OpenSpec capability; its one-liner follows `figma-pixel-fidelity` host rules.

## Impact

- Skills: `skills/figma-pixel-implement/{SKILL.md,reference.md,evals/evals.json}`, `skills/figma-pixel-verify/{SKILL.md,reference.md,evals/evals.json}`.
- Hosts: four PDCA `SKILL.md` (and `solve-workflow/reference.md` if the Figma bullet is mirrored).
- Specs: `openspec/specs/figma-pixel-fidelity` plus the three host capabilities above.
- Docs: `docs/generated/skills-index.md` via `gen-skill-docs.mjs`.
- Product apps (e.g. Agent SPA) are **not** changed in this change.
