# Tasks: goal-queue priority vocabulary & mid-run enqueue

## 1. Skill body updates

- [x] 1.1 `skills/goal-driven-batch/SKILL.md`: Stage 1 enqueue freeze step records the human-chosen priority (default `P1` when unstated), pointing at the reference.md vocabulary
- [x] 1.2 `skills/goal-driven-batch/SKILL.md`: Stage 2 post-completion re-check extended to re-scan the backlog directory — admit well-formed cards carrying budget clause + approval record into priority order (no preemption); malformed/unapproved stay `pending` with a progress note; admitted cards count against the remaining task cap; discovery logged in progress-doc notes
- [x] 1.3 `skills/goal-driven-batch/SKILL.md`: add one red-flag entry (running a mid-run discovered card without an approval record)
- [x] 1.4 `skills/goal-driven-batch/reference.md`: Task Card `Priority` field semantics — P0 (urgent, highest) / P1 (normal, default) / P2 (background, lowest), FIFO by `Created` within a level
- [x] 1.5 `skills/goal-driven-batch/reference.md`: Defaults section — mid-run discovery note convention (`awaiting approval (added mid-run)` / discovery entries in progress notes)
- [x] 1.6 Bump `skills/goal-driven-batch/SKILL.md` version to `0.4.0`

## 2. Verification

- [x] 2.1 Regenerate the skills index (`node scripts/gen-skill-docs.mjs`) and confirm the goal-driven-batch row updated
- [x] 2.2 Run de-identification lint on staged files (`node scripts/lint-skill-deidentification.mjs --staged`)
- [x] 2.3 YAML frontmatter parse check on the edited SKILL.md (description unchanged, single-line quoted)
- [x] 2.4 Contract consistency grep: priority vocabulary and guard wording consistent across SKILL.md / reference.md / delta spec (no divergent terms)

## 3. OpenSpec sedimentation

- [x] 3.1 `openspec validate` the change, fix any findings
- [x] 3.2 After verification passes, archive the change (sync delta into `openspec/specs/goal-queue/spec.md`)
