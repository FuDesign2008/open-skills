## Why

open-skills has a strong PDCA host (`solve-workflow`) for analyze→fix→verify, and Superpowers `brainstorming` for collaborative design dialogue, but no first-class bridge: users either skip design quality or lose solve's plan discipline after a design chat. We need a thin, installable host that fuses both without vendoring Superpowers or weakening the four-PDCA-host ban on optional enhancement scanning.

## What Changes

- Add `brainstorm-workflow` (`user-invocable: true`): thin orchestration host.
- Strong dependencies: external `brainstorming` (Superpowers; not vendored) + in-repo `solve-workflow`.
- Startup prerequisite check: missing either dependency aborts with install hints (no silent degrade).
- Core flow: delegate design dialogue to `brainstorming`; before writing the design doc, ask for save path (recommended default `docs/design/YYYY-MM-DD-<topic>-design.md`); do **not** invoke `writing-plans`.
- After user-approved written spec: **hard handoff** into `solve-workflow` stage「制定计划」(Make a Plan), skipping solve stages 1–4, with the approved design path + summary as plan inputs.
- Positioning / Do-NOT-use: design-oriented entry; bug root-cause work stays on `solve-workflow` / `opsx-solve-workflow`.
- Add `commands/brainstorm.md`; register in `AGENTS.md` skill table; regenerate `docs/generated/skills-index.md`.
- Author via `/skill-creator` conventions (English body, Chinese triggers, description ≤1024).

## Capabilities

### New Capabilities

- `brainstorm-workflow`: Thin design-to-plan host — prerequisite gate for `brainstorming` + `solve-workflow`, delegated brainstorming design flow with path prompt override, hard handoff to solve Make-a-Plan, and explicit scope boundaries vs full PDCA / bug analysis.

### Modified Capabilities

<!-- none: four PDCA hosts keep their no-optional-Superpowers contract; this is a new host -->

## Impact

- New: `skills/brainstorm-workflow/SKILL.md` (+ optional `reference.md`), `commands/brainstorm.md`
- Update: `AGENTS.md` (skill list row), `docs/generated/skills-index.md` (generated)
- External runtime dep: Superpowers `brainstorming` (install from that ecosystem; not shipped in this repo)
- In-repo dep: `solve-workflow` (and transitively its own deps when plan/execute continues)
- Does **not** modify `solve-workflow` / `opsx-*` / `jira-fix-*` bodies to scan Superpowers
