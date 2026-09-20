# Proposal: context-budget-discipline

## Why

Production incident (2026-09-18, unattended overnight `goal-driven-queue` run, 8 cards / 5 hours): the run billed 220.57M tokens on the strong model, **99% of it `cache.read`** — every turn re-sent the full session history. Per-card engine sessions ran 60–204 turns with context growing 144K → 321K, unrestrained. Post-mortem found three structural gaps:

1. `jira-fix-workflow` and `opsx-jira-fix-workflow` — the engines queue cards actually dispatch to — carry **zero** context-management discipline (a card's whole lifecycle runs as one continuous session).
2. `goal-driven-workflow` stage 3 names the techniques (sub-agent architecture / compaction / structured note-taking) but only as planning-time vocabulary: no measurable threshold, no phase-boundary mapping, no handoff artifact.
3. The existing compaction wording is reactive ("summarize-and-reopen near the window limit") — by the time it fires, the full window has been paid for many turns over.

Token volume is a property of session structure, not model choice; no model swap fixes it. The fix must be structural: phase-boundary session resets, a proactive compaction threshold, and a disk-ledger handoff so a fresh session resumes without replaying history.

## What Changes

- **NEW** shared discipline skill `context-budget-discipline` (`user-invocable: false`, analysis-core pattern): phased session mapping, proactive compaction threshold (~60–70% of the window, platform-agnostic intent wording), atomic write-ledger-then-reset handoff, bounded sub-agent summary contracts (~1–2k tokens).
- **Wired into 5 engine hosts** via frontmatter strong dependency + one-line hooks as sub-steps inside existing integer stages: `goal-driven-workflow`, `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`.
- `goal-driven-workflow` stage 3 upgraded: the context plan MUST name a threshold fraction, a phase→reset-boundary map, and a ledger path; threshold checks ride the stage-4 budget-milestone cadence.
- `goal-driven-queue` Delegate step gains exactly one supply sentence (no methodology restatement, **no new card field** — enforcement is unconditional).

## Impact

| Artifacts | Change |
|---|---|
| `specs/context-budget-discipline/spec.md` | ADDED (new capability) |
| `specs/goal-run/spec.md` | MODIFIED: 「sub-agent 分工与上下文管理」 threshold-quantified + thin-ref |
| `specs/workflow-contract-sync/spec.md` | ADDED: solve-family hosts enforce context budget via the discipline |
| `specs/goal-queue/spec.md` | MODIFIED: 「编排层薄引用引擎方法论」 one-line card-supply note |
| `skills/context-budget-discipline/` | NEW skill (SKILL.md + reference.md) |
| 5 engine `SKILL.md`s + their `reference.md` missing-notice lists | wiring + version bumps |
| `skills/goal-driven-queue/SKILL.md` | one supply sentence + version bump |

Untouched: active change `2026-08-06-jira-read-attachment-download`, `skills/jira-read/`, `jira-fix-workflow` / `opsx-jira-fix-workflow` spec files (their contract lands via workflow-contract-sync).
