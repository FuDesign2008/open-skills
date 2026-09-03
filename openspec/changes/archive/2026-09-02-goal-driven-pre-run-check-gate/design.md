## Context

Standalone `goal-driven-workflow` today: manual mode pauses at stages 1, 2, 3, the Stage 4 high-impact gate, and stage 5. Auto mode advances 1→2→3→4→5 except the high-impact gate. Stage 4 approval and starting the harness are the same pause. Queue children already skip re-asking frozen stage 1.

This change is a skill-text + `goal-run` contract change (markdown only). Frozen approach: explicit state machine Design-checked → Armed → Launch on standalone invocations.

## Goals / Non-Goals

**Goals:**

- Standalone: stages 1–3 human-confirmed + Stage 4 launch approval → Armed; explicit launch instruction → Launch; no re-ask of 1–4 after Launch.
- Incomplete Design-checked refuses Launch.
- Standalone auto no longer skips 1–3.
- Queue-child: does not enter Design-checked → Armed → Launch; card-recorded approval is 留痕; no second Armed wait.
- No 「下班」 trigger words.

**Non-Goals:**

- Changing `goal-driven-batch` or other workflows.
- Extracting a shared discipline.
- Auto-starting the run after Design-checked.
- Merge of the implementing PR.

## Decisions

1. **Detect standalone vs queue child** — Queue child **only when this turn's user/orchestrator dispatch message already supplied a frozen task card as stage 1 input**. Conversation history or on-disk `.goal-driven/` cards do **not** count. MUST NOT scan `.goal-driven/queues/`. MUST NOT require a `queue-child` flag the caller did not send. All other invocations are standalone.

2. **Where the state machine lives — exhaustive rewrite list (grep-closed after implement)** — Every hit of these shapes in `skills/goal-driven-workflow/` MUST be rewritten or justified as harness-only:
   - SKILL.md intro: `advance without confirmation (except the high-impact launch gate)`
   - Invocation: skip-ahead to stage 2 (keep skip-ahead; add Template 1 + one confirm)
   - Stage overview row 4: `auto-advance when clean` — split standalone (wait for Launch) vs queue-child
   - Stage overview note: `Auto mode advances 1→2→3→4→5`
   - Stage-exit policy line: `auto` = named escapes (standalone: does not skip 1–3 or Launch)
   - Unattended intake paragraph: card supply / self-answer — bind to queue-child predicate only
   - Stage 4 opener (high-impact pause bundled with start); `Output Template 4 and start the run`
   - Mode Lifecycle (manual/auto bullets)
   - `reference.md` Template 4: split `Approval` (→ Armed) and `Launch instruction` (→ execute); delete single-event `must approve before start`
   - `reference.md` missing-dependency notice: `long-run high-impact still pauses under auto`
   Post-implement grep MUST be zero for: `advance without confirmation` / `auto-advance when clean` / `Auto mode advances 1→2→3→4→5` / `may proceed after prior stage` / `must approve before start`. Leave `/goal` + auto mode = unattended long run (harness write-permission cheat-sheet).

3. **Launch instruction vocabulary** — Closed examples only: 「开跑」 / "launch" / "start the run" / 「开始长跑」 (and obvious same-phrase translations). NOT Launch: 「自动模式」 / 「自动跑」 / "auto mode"; bare 「好的」 / "ok" / 「继续」 / "confirm". No intent-first matching. Not added to frontmatter `description` triggers.

4. **Low-impact standalone** — Still requires launch approval to Arm. Same-delta MODIFIED: `Goal-run SHALL strong-depend on design-approval-gate`, `goal-run 阶段出口策略映射`, `长跑前置需求对齐` (self-answer only when queue-child predicate holds).

5. **Armed UX** — Announce Armed in prose; wait. Do not present a bundled “confirm = fire” control.

6. **Auto mode meaning** — Standalone auto: still pauses at 1–3 confirmation and Stage 4 launch approval; does not auto-Launch. Queue-child does not enter this state machine; card approval is 留痕; no second Armed; the standalone high-impact pause is not inserted on a child (consumption already is the launch). Stage 5 always ends at human acceptance.

7. **Skip-ahead** — If input already has a concrete verifiable goal + acceptance criteria, still emit Template 1 (freeze or stage-1-N/A) and take one confirmation; that counts as stage 1 complete for Design-checked.

8. **Proxy vs Launch** — `Stage-exit policy: ai-proxy` may complete Design-checked (intake + contract approval). Launch is human-only.

9. **Skill version** — Bump `goal-driven-workflow` frontmatter to `0.7.0` (standalone auto breaking). Root `package.json` version stays CI-owned.

## Risks / Trade-offs

- [Standalone auto users must now confirm 1–3; low-impact manual no longer auto-fires after stage 3] → **BREAKING**, accepted; list every old sentence in Decision 2.
- [Agents treat 自动跑 as Launch] → Spec scenario “Auto-mode words are not Launch”.
- [On-disk `.goal-driven/` cards classify standalone as queue child] → Predicate forbids disk scan.
- [Skip-ahead never completes stage 1] → Template 1 + one confirm counts.
- [Sibling specs revive “ordinary needs no gate” / auto skips 1–3] → Same-delta MODIFIED of `design-approval-gate` strong-depend and `阶段出口策略映射`.

## Migration Plan

- Edit the two skill files; archive this change into `openspec/specs/goal-run`.
- Rollback: revert the skill + spec commit.
- No runtime data migration.

## Open Questions

- None blocking. Launch matching is the closed example list in Decision 3 (not intent-first).

## Review record (stage 4)

**Reversibility:** two-way door (markdown skill + spec; revert by commit).

**Standards axis:** Pass — thin pointers to existing disciplines; no shared-discipline extract; English body / Chinese triggers preserved.

**Spec axis:** Pass — proposal + delta spec cover standalone vs queue child, auto 1–3, refuse-early-launch, no 下班 words.

**code-design-review:** N/A (skill markdown, no application source).

**Core:** effectiveness pass (root cause is Mode Lifecycle + bundled Stage 4 pause); side-effects mitigated (queue-child carve-out); feasibility pass (two files); spec compliance pass.

**Strategic (light, two-way):** failure mode “queue child waits Armed” mitigated; cost small; cognitive fit = named states vs burying two sentences.

**Overall:** Pass with conditions (`sr-20260902-stage4-pre-run-gate-r3`, proxy-made). Implementation MUST: (1) treat Decision 2 rewrite list as SoT — grep five-tuple is a sample, rewrite the whole paragraph including high-impact-only leftovers; (2) queue-child = this turn's message inlined the frozen-decisions block (not a path, not history, not disk).
