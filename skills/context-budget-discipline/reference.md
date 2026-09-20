# Context Budget Discipline — Reference

## Threshold Table

| Signal | Default guidance |
|---|---|
| Reset evaluation fraction | **~60–70%** of the context window (measured or projected) |
| Hard ceiling behavior | Never rely on it; treat platform refusal / truncation as a threshold miss, recover per § Recovery |
| Projection basis | Largest prior turn's total input (input + cached re-read) plus the next phase's expected additions |
| Short runs | A run whose projected total stays under the threshold performs no forced resets |

Hosts MAY override `{threshold-fraction}` (for example a tighter fraction for evidence-heavy phases); the default stands when unspecified.

## Ledger Entry Template

One entry per reset, appended to the ledger file at `{ledger-path}`:

```markdown
## Ledger — <phase> — <timestamp>

- **Frozen decisions**: <pointer to the host's frozen-decisions artifact or section; do not restate>
- **Done so far**: <one bullet per completed unit, each with an evidence pointer (file:line, command, artifact path)>
- **Artifacts**: <paths written so far (reports, specs, branches, change dirs)>
- **Current phase**: <phase name / stage number>
- **Next concrete step**: <one actionable sentence>
- **Open tickets / misses**: <unresolved tickets; any threshold-miss notes>
```

Completeness contract: an entry is complete when a fresh session could proceed using only the ledger plus the referenced artifacts — nothing load-bearing lives only in the old transcript.

## Phase → Boundary Map Template

Filled at the host's planning/execution stage; one row per phase:

| Phase (host stage) | Reset action at entry | Notes |
|---|---|---|
| analysis | evaluate (fresh session from ledger preferred) | heavy read phase; enters with clean context |
| implement | evaluate; mid-phase check at `{threshold-fraction}` | ledger before mid-phase reset |
| verify | evaluate (fresh session preferred) | verify needs evidence pointers, not history |
| report | evaluate | report drafts from ledger + artifacts |

## Recovery (Missed Threshold)

When the threshold is crossed mid-phase and an immediate reset is unsafe:

1. Record a miss note in the ledger (`Open tickets / misses`: `<phase> crossed threshold at <approx fraction>; recovering at next boundary`).
2. At the next safe point (phase entry, completed sub-unit, or artifact checkpoint), write the ledger entry and reset.
3. Two consecutive misses in the same phase = stop-and-reset now: split the current unit, write the ledger, reopen compact.

## Anti-Examples (de-identified)

- ❌ Compacting only when the platform refuses further turns — the whole window was re-billed for the entire run.
- ❌ Resuming a session by pasting the previous transcript — replay is the cost being avoided; use the ledger.
- ❌ A sub-agent returning a 40k-token transcript dump into the main loop — re-request the 1–2k summary.
