## Why

Waves 1–2 closed clarifying, completion evidence, dual-axis review, red-loop, domain glossary, and test-first gaps. Remaining high-value backlog items are (S2) no shared design-approval hard gate with explicit auto/hotfix escapes, (S4) no reusable feature-branch closeout menu (opsx prose only; merge-discipline only covers merge), and (M6) no written User- vs Model-invoked layering for `user-invocable`. Closing them without re-depending on Superpowers/Matt keeps closeout and pre-impl discipline consistent across hosts.

## What Changes

- Add shared skill `design-approval-gate` (S2): no production/behavior implementation until design/solution is approved; named escape hatches for auto mode, Jira `--auto`, and lean hotfix with required 留痕.
- Add shared skill `feature-branch-closeout` (S4): after verification green (or explicit pending), present closeout menu (PR / merge / keep / continue; optional worktree cleanup); selecting merge MUST load `merge-discipline`; keep/continue MUST NOT trigger coverage gate.
- Document **M6** invocation layering in `AGENTS.md` (no new skill): orchestration vs discipline vs explicit cross-cutting exceptions.
- Thin pointers / dependencies on PDCA hosts as applicable.
- **Naming constraint**: MUST NOT use Superpowers/Matt colliding names (`brainstorming`, `finishing-a-development-branch`, etc.).

## Capabilities

### New Capabilities

- `design-approval-gate`: pre-implementation design/solution approval hard gate + escape matrix; English body + Chinese triggers.
- `feature-branch-closeout`: post-verify branch closeout menu and merge delegation; English body + Chinese triggers.

### Modified Capabilities

- `merge-discipline`: clarify composition with feature-branch-closeout (closeout owns menu; merge path only enters Parts A–D).
- (M6 is AGENTS convention only — no OpenSpec capability required unless we later extract a skill.)

## Impact

- New: `skills/design-approval-gate/`, `skills/feature-branch-closeout/`
- Edit: four PDCA hosts (thin refs), `merge-discipline` (composition sentence), `AGENTS.md` (M6 table + skill rows), skills index
- Does not swallow merge-discipline; does not force HARD-GATE on auto without escape
