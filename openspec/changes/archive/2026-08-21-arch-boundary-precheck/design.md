# Design: arch-boundary-precheck

## Context

Incident `docs/architecture-boundary-decision-priority.md` (2026-08-20): the explore-solutions stage of an opsx-solve run picked a cross-process solution on short-term-cost grounds; the review stage passed it; real-device verification crashed at startup (circular dependency pulled into the main-process bundle graph). Neither defense line asks "which process/layer initializes the called capability" — the fact is absent from both checklists, so it can only surface at runtime.

Current state (read this change, first-hand):

- `code-design-review` Layer B triggers on "adds modules, changes dependency direction, crosses module boundaries, or alters public contracts" — process/layer boundary crossing is not a named trigger; dimension 12 (dependency direction) checks arrow direction toward stability, not runtime ownership.
- Four hosts restate their own explore-solutions stage: `solve-workflow` (Stage 3), `opsx-solve-workflow` (Stage 3), `jira-fix-workflow` (Stage 4, per its own numbering), `opsx-jira-fix-workflow` (Stage 4). None carries a boundary precheck; auto-mode selection priorities (thorough > best-practice > code quality > smallest change) let short-term-cost reasons ride under "code quality / smallest change".
- `solution-review` dimension 8 already requires long-term maintenance cost in cost-vs-value, plus the structural-alternative blocking rule — no change needed there.

## Goals / Non-Goals

**Goals:**

- Make "capability runtime ownership" a checkable fact at both defense lines: solution selection (precheck before short-term cost) and review (Layer B sub-items + blocking).
- Single source of truth: full verification methodology lives once in `code-design-review` Layer B; hosts keep only a decision-order rule with inlined item names (~2 lines each).
- Cover all four solve-family hosts uniformly.

**Non-Goals:**

- No changes to `solution-review` (already covers long-term cost + structural blocking).
- No new skill, no frontmatter `dependencies` changes, no description/trigger-word changes.
- No project-specific (Electron/app-name) vocabulary in skill bodies — generic "process / layer" wording only.

## Decisions

1. **SoT in `code-design-review` Layer B dimension 12, not a new shared skill.** The boundary check is ~10 lines of methodology; a new skill (option C) adds lifecycle cost (description lint, dependency checks, install surface) disproportionate to content, conflicting with YAGNI. Layer B already owns dependency-direction review; runtime ownership is the same concern at process/layer granularity.
2. **Hosts get a decision-order rule, not a methodology copy.** Each host's explore-solutions stage gains ~2 lines: for cross-process/cross-layer candidates, answer the three named checks (initialization location → boundary legality incl. dependency-tree spread and bundler pre-scan → ownership classification) BEFORE weighing short-term costs; verdict surfaces with the comparison table; methodology per `code-design-review` Layer B (dependency-direction dimension). This matches the repo's thin-reference pattern (`analysis-core`, `staged-review-flow`) and keeps the four hosts drift-resistant.
3. **Hosts reference the dimension by NAME ("dependency direction dimension"), not number.** Repo rule: cross-skill references use names; renumbering in `code-design-review` must not silently dangle host pointers.
4. **Blocking criterion mirrors the existing architectural gate.** Runtime-ownership violation = blocking unless explicitly accepted as Prudent-Deliberate debt with a repayment plan — same shape as the existing "superior feasible architecture" blocking rule, so the review vocabulary stays uniform.
5. **Layer B trigger list gains "crosses process or layer boundaries".** A small diff that introduces a cross-boundary call must not take the quick path — mirroring the incident, where the diff was small but the boundary was decisive.
6. **Delta specs land in existing capabilities** (`code-design-review`, `workflow-contract-sync`) as ADDED requirements — new concerns, no existing requirement behavior changes; `workflow-contract-sync` already carries solve-family stage contracts.

## Risks / Trade-offs

- [Host pointers dangle if Layer B restructures] → Hosts reference "dependency direction dimension" by name; stage-7 verification greps both sides.
- [Auto-mode selection skips the precheck] → The rule is written as a MUST decision-order constraint at the same level as the existing auto-select priority line, in all four hosts including both auto-select priority lines (`solve-workflow` Stage 3, `jira-fix-workflow` Stage 4).
- [Token growth in code-design-review] → Sub-items fold into dimension 12's existing entry (SKILL.md one compact addition + reference.md how-to-apply); no new top-level sections.
- [Over-triggering on same-layer solutions] → Precheck trigger is scoped to cross-process/cross-layer candidates; single-layer solutions are exempt.

## Migration Plan

Markdown-only change; no migration. Rollback = revert the five-file diff. Version bumps (MINOR) on the four skills; `docs/generated/skills-index.md` regenerated by pre-commit (or manually via `node scripts/gen-skill-docs.mjs`).

## Open Questions

None.
