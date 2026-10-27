## Why

The queue's detach-run-accept promise ends with a pile of human-facing Markdown records (task cards, triage, progress, verification, packaged engine reports) that are slow to read, and completed cards can stop at a branch without an opened MR. A human returning to accept a batch must parse Markdown and may still need to run a delivery step. The queue already writes review/evidence HTML for done cards; extending that pattern to every human-facing record and automating the MR handoff lowers the human cost at the exact moment the queue hands work back.

## What Changes

- `.md` remains the canonical record; every human-facing queue record gets a generated, self-contained `.html` sibling: task cards, triage record, `progress.md`, `verification.md`, and each engine completion report packaged into the acceptance package. `config` and `approaches/*.md` stay Markdown-only; the existing review/evidence HTML pages keep their contract.
- A dependency-free renderer ships with the skill (`skills/goal-driven-queue/scripts/`, Node built-ins only). It renders the templates' Markdown subset to escaped, self-contained HTML with inline CSS, no external assets, and a footer naming the source path and generation time. `.md` links rewrite to their `.html` views. A direct-HTML fallback covers environments without Node.
- `verification.html` becomes the acceptance entry page, linking to progress, triage, each card, each executed card's engine report, and each done card's review and evidence pages. Views are generated at the Stage 1 approval handoff and Stage 3 package assembly, and re-rendered immediately before any open.
- Auto-open is gated by the recorded trigger: an attended Stage 3 handback (`Trigger: interactive`) auto-opens `verification.html` in the system default browser; an explicit view request opens the requested page regardless of the trigger; scheduled/unattended runs do not auto-open and print paths.
- Every executed card reaching `done` with a reviewable diff automatically commits, pushes its feature branch, and opens a PR/MR before the completion report is final. The completion report, progress document, verification document, and acceptance package record the MR URL. A done card with no reviewable diff records why no MR was opened. Merge, release, and protected-branch operations remain human-only.
- Contract tests under `scripts/` lock the new sentences; the skill version bumps `0.16.0` → `0.17.0`; `docs/generated/skills-index.md` regenerates; the change archives into `openspec/specs/goal-queue/spec.md`.
- Queue-side enforcement: the queue never edits a child engine's completion-report template. The card supply requires the child report to carry the MR URL; the queue's own progress/verification templates carry the field. An engine-template change would be a scope change (ticket + park).
- Path: Incremental (existing skill behavior contract plus a bounded renderer; not a new capability).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: human-facing queue records gain generated HTML views with interactive-only auto-open; done cards with a reviewable diff auto-submit an MR and record its URL; merge authority stays human.

## Impact

- Skill text: `skills/goal-driven-queue/SKILL.md`, `skills/goal-driven-queue/reference.md`.
- New renderer + tests: `skills/goal-driven-queue/scripts/`.
- Contract tests: `scripts/human-facing-html-contract.test.mjs`.
- Generated index: `docs/generated/skills-index.md`.
- OpenSpec: `openspec/changes/2026-10-26-human-facing-html-and-auto-open/` → `openspec/specs/goal-queue/spec.md`.
- No new runtime dependency; no new service; `.goal-driven/` artifacts remain local and are not committed.
