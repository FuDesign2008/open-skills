# merge-squash-prompt Design

## Context

merge-discipline v1.5.0 Part D owns merge execution (tip pinning, pipeline-sha verification, ancestor check) but has no merge-strategy decision point. GitLab's "Squash commits when merge request is accepted" checkbox and GitHub's squash merge method are never surfaced; strategy is left to platform defaults. The repo rule (AGENTS.md Git 工作流) says "prefer Create a merge commit, avoid Squash and merge" unconditionally — it cannot express a per-MR judgment from actual commit quality. User requirement: at merge time, remind and let the user choose squash or not, with a recommendation derived from the MR's commit history.

## Goals / Non-Goals

**Goals**
- A mandatory squash decision step in Part D, between Part R pass and the merge command.
- Dynamic recommendation from commit quality (atomic → no-squash; trivial accumulation → squash; continuing-development branch → lean no-squash).
- Platform-neutral contract (gh / glab commands as illustrations, intent-level rule); tip pinning unchanged.
- Harmonized AGENTS.md wording (default stays merge-commit; squash is a permitted, guided exception).

**Non-Goals**
- No `squash-gate:` preference mechanism (coverage-gate-style config) — YAGNI for a single yes/no prompt; rejected in solution comparison.
- No commit rewriting before merge (no interactive rebase / autosquash) — the step only picks the platform merge method.
- No changes to referencing workflows — they delegate merge execution to merge-discipline and inherit.

## Decisions

1. **Decision step lives in Part D (not a new Part, not closeout menu).** Part D already owns "everything between review pass and the merge command"; a sixth Part would renumber the A→B→C→R→D contract referenced across five workflows. Alternative (feature-branch-closeout menu) rejected: direct "merge MR" commands bypass closeout — exactly the path this change must cover.
2. **Placement: after tip-pin computation, before merge execution.** The commit listing (`gh pr view --json commits` / `glab mr commit list`) reads the same tip that will be pinned, so the recommendation describes exactly what merges. Alternative (before Part R) rejected: a rebase in Part B or fix commits from Part R fail would change the commit list, staling an earlier recommendation.
3. **Recommendation semantics are a decision table, not free-form judgment.** Three rules (atomic → no-squash / trivial accumulation → squash / continuing-development → lean no-squash) keep AI runs reproducible; the user may always override. Alternative (AI free-form assessment) rejected: inconsistent recommendations across runs erode trust.
4. **Mandatory ask, no auto-select — including auto-mode host workflows.** jira-fix/opsx auto runs pause at this question by design; the pause is sub-step of the merge flow (per merge-discipline mode lifecycle), not a mode reversion. Alternative (auto-accept recommendation in auto mode) rejected: the user explicitly asked for a reminder + choice at merge time; auto-accepting would void the feature.
5. **AGENTS.md harmonized to "default merge-commit, squash as guided exception"** rather than rewritten to neutral. Preserves the historical rationale (squash cuts the commit graph; same-branch continued development conflicts) while pointing to merge-discipline Part D as the decision owner. Alternative (deleting the repo rule) rejected: it carries real incident-derived reasoning.
6. **Version 1.5.0 → 1.6.0** (behavior addition, backward compatible), description gains a short squash-decision mention (stays ≤1024 single-line quoted, Chinese triggers preserved — 铁律 7/3).

## Risks / Trade-offs

- [Every protected-branch merge gains one more mandatory pause] → Intended behavior per requirement; recommendation + one-word confirm keeps it cheap. jira-fix auto-mode runs now pause here — recorded as a known behavior change in this change's proposal.
- [Commit-quality classification is heuristic; borderline histories get debatable recommendations] → Recommendation is advisory; user override is an explicit scenario in the delta spec.
- [GitLab "squash" checkbox semantics vs CLI flag drift across glab versions] → Commands are illustrative, not normative; the rule states intent and defers to the platform CLI's current flags (same pattern as existing Part D `--sha` note).
- [AGENTS.md rewording could drift from spec semantics over time] → The AGENTS.md line points to merge-discipline Part D as the single decision owner instead of restating the table.

## Migration Plan

1. Edit `skills/merge-discipline/SKILL.md` Part D (+version, +description mention), `reference.md` checklist item, `AGENTS.md` wording.
2. Regenerate `docs/generated/skills-index.md` (pre-commit hook or manual `node scripts/gen-skill-docs.mjs`).
3. Rollback: single `git revert` of the change commit; no data or config migration.

## Open Questions

(none — semantics confirmed with the user in stage 1: recommendation derived from the MR's commit situation.)
