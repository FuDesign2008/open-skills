## Why

`figma-pixel-implement` already requires an inventory + spec table, but the contract allows a **session note**. `figma-pixel-verify` consumes that table, then writes a **separate chat report**, and on missing spec it **silently rebuilds** instead of returning to implement. Hosts only fail when the verify *report* is missing—they do not require a durable handshake path. The implement↔verify loop the user wants (document while implementing, write measurements back, spec-gap improves implement) is therefore incomplete.

## What Changes

- **Implement** writes a **durable living artifact** in the **target repo** (prefer an existing Figma doc directory; else `docs/figma/<frame>.md`). Default one file with Inventory / Spec / Verify sections. Append rows as each visible section is implemented. No path ⇒ implement incomplete. `expected` stays Figma SoT.
- **Verify** reads that path. Writes actual / verdict / coverage into the Verify section (or a Spec source sibling). That section **is** the measured report hosts require. Does **not** overwrite `expected`. After this-run implement, missing file or missing critical spec rows ⇒ FAIL and **re-enter implement** (no silent rebuild claiming handoff complete). Standalone verify may build a minimal spec but **must persist it first**. Code DRIFT still fixes the UI (≤3) and updates measured columns. Verify does **not** edit `figma-pixel-implement` skill prose.
- **Hosts** (`solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`): thin intent only—durable path required to complete implement; missing Verify section = missing report; spec-gap FAIL does not pass verification (re-enter implement). No path templates copied into hosts. No third `figma-pixel-*` skill.
- Skill versions 1.2.0 → 1.3.0; host versions PATCH. Evals added for durable path, write-back, spec-gap return, standalone persist.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `figma-pixel-fidelity`: living artifact path, incremental append, verify write-back, spec-gap returns to implement, standalone persist-first, host path/Verify-section gate.
- `opsx-solve-workflow`: durable spec path + Verify section required; spec-gap re-enters implement.
- `jira-fix-workflow`: same host handshake.
- `opsx-jira-fix-workflow`: same host handshake.

`solve-workflow` has no dedicated OpenSpec capability; its one-liner follows `figma-pixel-fidelity` host rules.

## Impact

- Skills: `skills/figma-pixel-implement/{SKILL.md,reference.md,evals/evals.json}`, `skills/figma-pixel-verify/{SKILL.md,reference.md,evals/evals.json}`.
- Hosts: four PDCA `SKILL.md` plus `solve-workflow/reference.md`.
- Specs: `openspec/specs/figma-pixel-fidelity` plus the three host capabilities above.
- Docs: `docs/generated/skills-index.md` via `gen-skill-docs.mjs`.
- Product apps are **not** changed in this change (agents write the living file in the target repo at implement time).
