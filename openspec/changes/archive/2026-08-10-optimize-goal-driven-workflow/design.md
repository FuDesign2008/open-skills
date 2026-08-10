## Context

Solution pack **1+2**: English + platform-agnostic rewrite of `goal-driven-workflow`, plus thin refs to `design-approval-gate` / `completion-evidence-discipline`, Red Flag / Common Mistakes dedup, and optional `commands/goal-run.md`. Builds on clarifying touchpoint cleanup already on PR #270.

## Goals / Non-Goals

**Goals:**
- English instructional SKILL + reference; Chinese only in triggers.
- Intent-first launch/preflight with `/goal`/`claude -p`/`CLAUDE.md`/hooks as examples.
- Thin gate refs; add `design-approval-gate` strong dep; keep long-run auto-does-not-bypass rule.
- Dedup mistakes table; add command shortcut; bump to 0.2.0.

**Non-Goals:**
- Rewriting the 7×24 handbook.
- Strong-depending `workflow-mode-lifecycle` (keep inline Mode Lifecycle, English + short).
- Changing solve/opsx hosts.

## Decisions

1. **Same PR #270 branch** by default — one reviewable stack with clarifying work.
2. **Intentional divergence**: high-impact long-run launch still pauses under auto; document at host gate; do not weaken `design-approval-gate` itself.
3. **reference.md fully English** including templates (labels like Template 1, Hard/Soft/Human).
4. **Common Mistakes**: keep only non-obvious rows; drop rows that duplicate stage Red Flags.
5. **AGENTS.md**: add `design-approval-gate` to goal-driven dependency cell when frontmatter changes.

## Risks / Trade-offs

- [Large diff / review load] → Mitigation: single capability `goal-run`; checklist tasks; verify with Han-count + grep for AskUserQuestion-style hardcodes.
- [Confusion: auto escape vs long-run pause] → Mitigation: explicit host sentence + scenario in spec.
- [openspec archive ADDED-already-exists] → Mitigation: sync main spec carefully; manual archive if needed.

## Migration Plan

1. tasks.md → implement SKILL/reference/command/AGENTS/version.
2. Sync main `goal-run` spec from delta.
3. Validate; archive; push #270.
4. Rollback: revert commit(s).

## Open Questions

None for 1+2 pack — user selected.
