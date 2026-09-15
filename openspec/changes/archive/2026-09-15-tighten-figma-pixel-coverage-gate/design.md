## Context

Walkthrough QA on a Figma-implemented Agent SPA still failed after `figma-pixel-implement` / `figma-pixel-verify` were used: sampled default-state spec tables, Overall PASS with unmeasured residuals, opt-in-only dark theme, no hover inventory, and hosts that load verify but do not fail when the report is missing. This change tightens the fidelity contract; it does not patch any product UI.

## Goals / Non-Goals

**Goals:**

- Screen × state inventory before the spec table; large frames fetch every visible child section.
- Theme in scope when the file has modes or the project has a theme switch.
- Spec rows carry `state`, `mode`, and measurement basis.
- Verify: unmeasured / MISSING-style / unaccepted DRIFT on critical rows ⇒ Overall FAIL.
- Hosts: missing verify report after a Figma implement blocks the verification stage.
- Figma node is visual SoT vs conflicting QA notes; behavior items labeled out-of-scope.

**Non-Goals:**

- Implementing walkthrough bugs in product repos.
- A walkthrough-spreadsheet importer skill.
- Making pixel verify execute window-drag / auto-follow scroll as PASS.
- Inventing hover/dark values absent from the design.

## Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Theme trigger | Design modes **or** project theme switch, not only user saying “dark” | Matches “best Figma fidelity”; values still come from the file |
| Hover | Only documented variants, measured after state switch | Avoids invented states; still catches walkthrough hover misses when the file has them |
| Unmeasured rows | Overall FAIL | Closes the 2026-08-13 sampled-PASS failure mode |
| Host hook | One extra fail-closed sentence | Thin citation; methodology stays in the two skills |
| solve-workflow spec | None | No capability file; covered by `figma-pixel-fidelity` host list + skill edit |
| Skill versions | 1.1.0 → 1.2.0 | Behavior contract expansion, not a breaking install change |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Large frames hit MCP rate limits | Pause and report incomplete sections; do not sample-and-PASS |
| Token cost of full inventories | Inventory is the verify input; cheaper than a second design QA cycle |
| Agents skip verify under time pressure | Host verification stage fail-closed without the report |

## Migration Plan

- Edit skills + evals + four host one-liners in this change.
- Regenerated `docs/generated/skills-index.md`.
- Already-installed global skill copies pick up the contract on next `node scripts/install-skills.mjs` (or equivalent) — not automatic.
