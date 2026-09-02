## 1. Skill body — state machine

- [x] 1.1 Bump `skills/goal-driven-workflow/SKILL.md` frontmatter version to `0.7.0`
- [x] 1.2 Rewrite intro + Invocation skip-ahead: Template 1 + one confirm still required; auto does not skip 1–3 on standalone
- [x] 1.3 Split Stage overview row 4 and the note into standalone (wait for Launch) vs queue-child; rewrite the whole paragraph including high-impact-only leftovers
- [x] 1.4 Add the Design-checked → Armed → Launch state machine (queue-child predicate: this-turn inlined frozen-decisions block only)
- [x] 1.5 Bind Unattended intake / Stage-exit `auto` named-escapes: self-answer and card supply only when the predicate holds; standalone auto does not skip 1–3 or Launch

## 2. Skill body — Stage 4 and Mode Lifecycle

- [x] 2.1 Split Stage 4 launch approval (→ Armed) from execute (explicit Launch); closed launch list; auto/ok/continue are not Launch
- [x] 2.2 Rewrite Mode Lifecycle bullets so standalone auto still pauses at 1–3 and launch approval; does not auto-Launch
- [x] 2.3 Update `reference.md` Template 4 (Approval vs Launch instruction fields) and the missing-dependency notice
- [x] 2.4 Grep `skills/goal-driven-workflow/` for leftover `advance without confirmation` / `auto-advance when clean` / `Auto mode advances 1→2→3→4→5` / `may proceed after prior stage` / `must approve before start` — zero hits. Also rewrite remaining high-impact-only / `Output Template 4 and start the run` / Unattended intake leftovers from Decision 2 even if grep-five-tuple is already clean. Keep harness cheat-sheet `/goal` + auto mode line.

## 3. Verify

- [x] 3.1 Confirm description has no 「下班」 / 「准备下班」 trigger words; `npm run lint:skill-description` on the skill
- [x] 3.2 `openspec validate goal-driven-pre-run-check-gate`
