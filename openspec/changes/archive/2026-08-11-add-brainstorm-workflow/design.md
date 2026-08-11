## Context

Stage-1/2 agreed: add a thin host `brainstorm-workflow` that fuses Superpowers `brainstorming` (design dialogue) with in-repo `solve-workflow` Make-a-Plan (hard handoff). Precedent: `write-workflow` external strong deps (`humanizer*`) with install tables and no vendoring. Constraint: do not teach the four PDCA hosts to scan optional Superpowers enhancements (`workflow-contract-sync`).

## Goals / Non-Goals

**Goals:**

- Ship an installable, user-invocable host with Chinese+English triggers.
- Fail closed if `brainstorming` or `solve-workflow` is missing.
- Override brainstorming defaults: ask design path (recommend `docs/design/...`); never end at `writing-plans`.
- Hard-enter solve「制定计划」with approved design as input; skip solve 1–4 for that handoff.
- Document complementarity: not a stricter supersets of solve’s analysis front half.

**Non-Goals:**

- Vendoring or forking `brainstorming` into this repo.
- Replacing `solve-workflow` / `opsx-solve-workflow` for bugs.
- Stacking `clarifying-question-discipline` / `design-approval-gate` as extra strong deps (brainstorming already covers one-question + HARD-GATE).
- Implementing full PDCA execute/verify inside this host.
- Changing the four PDCA hosts’ Superpowers policy.

## Decisions

1. **Thin host over thick rewrite** — Delegate design to `brainstorming`; host owns gate, path prompt, terminal override, handoff, triggers, Do-NOT-use. *Alt:* thick host (rejected — duplicate maintenance).

2. **External strong dep pattern from write-workflow** — Frontmatter lists `brainstorming` + `solve-workflow`; install hint table distinguishes external vs in-repo. *Alt:* soft/optional dep (rejected — user required strong dep).

3. **Hard handoff, not soft prompt** — Load solve at Make a Plan with design path + summary. *Alt:* soft handoff (rejected in clarify).

4. **Path: ask each time, recommend docs/design/** — Overrides `docs/superpowers/specs/` without hardcoding only one path. *Alt:* always Superpowers path (rejected).

5. **Minimal in-repo deps** — Only `brainstorming` + `solve-workflow` in frontmatter. Mode lifecycle optional in body as light convention (manual default; 「自动」advances design→handoff) without requiring `workflow-mode-lifecycle` as strong dep unless we later thicken. *Decision for v1:* document manual/auto in host body mirroring write/solve triggers, but do **not** add `workflow-mode-lifecycle` as strong dep (YAGNI for thin host). Auto mode: after design approval + path write + user spec review, proceed into solve Make a Plan without extra host pause; solve’s own stage-5 exit still applies.

6. **Command + AGENTS + skills-index** — Same registration pattern as `solve` / `goal-run`.

7. **Authoring** — Use skill-creator structure: SKILL.md <500 lines, optional reference.md for output templates / install table.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Users expect “stronger than solve” | Description + Do-NOT-use + body positioning: complementary, not superseding analysis-core |
| Handoff loses solve stages 1–4 context | Require design path + short summary (goal, chosen approach, constraints) as Make-a-Plan inputs |
| brainstorming still tells agent to call writing-plans | Host MUST state override wins after design approval |
| External install friction | Explicit install URLs/commands in reference; abort copy like write-workflow |
| Naming confusion with `brainstorming` | Keep `-workflow` suffix; never create `skills/brainstorming/` |

## Migration Plan

- Additive only; no migration of existing skills.
- Rollback: delete `skills/brainstorm-workflow/`, `commands/brainstorm.md`, revert AGENTS row, regenerate index.

## Open Questions

- None blocking for v1. Optional later: add `workflow-mode-lifecycle` strong dep if mode stickiness appears in practice.
