## Why

The two-skill perf split (host + evidence discipline) costs a frontmatter contract, a mount-point table kept consistent on both sides, and a separate index row — while the discipline's second-consumer scenario never materialized (potential, not fact). User ruling: merge `perf-evidence-discipline` into `perf-optimize-workflow`, and integrate the result into the generic hosts the way `analysis-core` is integrated — thin references, so users entering solve-workflow / opsx-solve-workflow / jira-fix-workflow with a performance problem get routed to the paradigm without knowing its name.

## What Changes

- Merge the nine evidence disciplines into `perf-optimize-workflow/SKILL.md` as an in-file "Evidence validity disciplines" section; per-stage gates point to discipline numbers internally; frontmatter dependency on `perf-evidence-discipline` removed
- Move the discipline case archive into the host `reference.md` as Part 4; update the layered-architecture table (evidence gate becomes internal)
- Delete `skills/perf-evidence-discipline/` (hard cut); its trigger surface (「伪影排查」「口径校准」「设备画像」) inherited by the host description
- Thin routing edges (one informational line each, analysis-core-style integration; no frontmatter dependencies — non-perf runs must not abort): solve-workflow Stage 1, opsx-solve-workflow Stage 1, jira-fix-workflow Stage 1 — performance-domain problems route to `perf-optimize-workflow`
- AGENTS.md inventory rows updated; RELEASE-NOTES 2.0.0 entry updated in place (still unreleased on the open PR)
- **Non-goals**: knowledge-layer content refresh; touching known-issue-research §2.1 (already points at the host) or write-workflow's boundary line (already correct); historical eval workspaces and archived changes

## Capabilities

### Modified Capabilities

- `perf-optimize-workflow`: disciplines owned in-file (single skill carries paradigm + evidence gate + knowledge layer + case archive); description gains the three inherited triggers; generic hosts carry routing edges to it

### Removed Capabilities

- `perf-evidence-discipline`: superseded by the host's in-file section and reference Part 4

## Impact

- Deleted: `skills/perf-evidence-discipline/{SKILL.md,reference.md}`, `openspec/specs/perf-evidence-discipline/`
- Modified: `skills/perf-optimize-workflow/{SKILL.md,reference.md}`, `skills/solve-workflow/SKILL.md`, `skills/opsx-solve-workflow/SKILL.md`, `skills/jira-fix-workflow/SKILL.md`, `AGENTS.md`, `RELEASE-NOTES.md`, `docs/generated/skills-index.md` (regenerated)
- Behavior: same evidence gating (disciplines applied at the same four stages); routing from generic hosts is new; skill count 57 → 56
- Risks: content-move loss (mitigated: keyword mapping grep + deletion-side diff review); trigger regression for discipline phrases (mitigated: trigger inheritance into host description); loss of independent mountability for the disciplines (accepted by user ruling — single consumer today)
