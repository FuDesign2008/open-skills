## Context

An audit of how four PDCA hosts integrate `git-worktree-discipline` found the gate anchored "before the first non-trivial production edit" — after every host's first persistent doc writes (`opsx-*` artifacts, `jira-fix-workflow` runtime docs) — and `opsx-jira-fix-workflow`'s gate sentence misplaced inside §6.2.5, a subsection positioned after the production-edit loop. The accepted target baseline: the gate ask happens just before writing docs or code. Contract wording lives in four surfaces: `openspec/specs/git-worktree-discipline/spec.md`, `skills/git-worktree-discipline/SKILL.md`, `AGENTS.md`, and the four host SKILL.md files.

## Goals / Non-Goals

**Goals:**
- Gate resolves before the first non-trivial persistent write (docs or code) in any host run
- One consistent trigger wording across spec, skill, AGENTS.md, and all hosts
- Fix the `opsx-jira-fix-workflow` §6.2.5 misplacement (including the bundled design-approval sentence)

**Non-Goals:**
- No change to gate internals (`always`/`never`/`ask` semantics, escapes, 留痕 formats, cleanup ownership)
- No frontmatter description trigger changes; description stays ≤1024 single-line
- Batch orchestrators (`jira-fix-batch` / `opsx-jira-fix-batch`) not re-anchored — the gate fires inside each child run

## Decisions

1. **Single trigger "first non-trivial persistent write (docs or code)"** replacing "first non-trivial production edit". Alternative considered: dual anchors (ask before first doc write + keep a second gate before production edits) — rejected: writes the rule twice and can double-prompt.
2. **Per-host anchors at measured first-write points**: `solve-workflow` stage 6 head (stages 1–5 read-only; first write = production edits, point unchanged); `opsx-solve-workflow` stage 3 just before `proposal.md` creation (after the user's pick, so the ask has context); `jira-fix-workflow` stage 0 before the `state.json` write — alternative stage 1 head rejected because `state.json` would split from later runtime docs across trees and break `--resume`; `opsx-jira-fix-workflow` stage 1 before the `design.md` write.
3. **`design-approval-gate` stays at the execute-stage head**, split from the worktree gate: approval guards production implementation, not docs. In `opsx-jira-fix-workflow` its sentence moved from §6.2.5 to the stage 6 head; §6.2.5 keeps only test-first / test-suite-ensure.
4. **Host thin-reference phrase unified as "worktree gate + optional isolation"** on both sides (hosts and the skill's Integration guide). The old "Optionally follow" phrasing was dropped: loading and resolving the gate is mandatory; optionality lives in the gate outcome (`never` / decline / lean).

## Risks / Trade-offs

- Ask happens before analysis conclusions exist → Mitigation: the gate's suitability recommendation plus decline/lean/`never` escapes; explicitly accepted by the requester.
- Wording divergence across the four contract surfaces → Mitigation: residual greps (`Pre-exec`, `before non-trivial edits`, `非平凡生产编辑之前`) plus description lint and skills-index regen parity in verification.
- OpenSpec artifacts created inside an isolated workspace must still archive and merge coherently → Mitigation: desk-checked — artifacts land on the change branch, archive runs in the same workspace, closeout merge carries both code and spec updates.
- Retro-active sediment: the main spec already carries the new wording, so archive-time delta sync must be idempotent → Mitigation: verify sync is a no-op (or already-applied) during archiving and confirm the git diff shows only the archive move.

## Open Questions

None remaining. The `jira-fix-workflow` anchor choice (stage 0 vs stage 1) was resolved in favor of stage 0 (see Decision 2).
