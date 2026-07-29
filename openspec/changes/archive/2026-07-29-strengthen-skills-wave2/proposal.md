## Why

Wave 1 closed clarifying / completion-evidence / dual-axis review / red-loop gaps. Remaining high-value gaps from the Superpowers ∪ Matt backlog are (M4) no project-local domain glossary orthogonal to OpenSpec, and (S3) no test-first Iron Law—`ensure-tests` only covers post-implementation scaffolding and coverage. Closing them with collision-free shared disciplines keeps agent reliability gains without re-depending on external skill repos.

## What Changes

- Add shared skill `domain-language-discipline` (M4): lazy `CONTEXT.md` glossary (no implementation details); challenge fuzzy/conflicting terms in-session; orthogonal to OpenSpec artifacts.
- Add shared skill `test-first-discipline` (S3): no production/behavior code without a failing test observed first; explicit exceptions; delete-and-restart if code was written first.
- Clarify `ensure-tests` boundary: post-hoc coverage / scaffolding only; MUST NOT be treated as satisfying test-first for behavior changes.
- Thin pointers / dependencies on PDCA hosts (`solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`) and optional `learn-and-improve` carrier row for glossary.
- **Naming constraint**: new skill `name`s MUST NOT collide with Superpowers or Matt skill names (`tdd`, `test-driven-development`, `domain-modeling`, etc.).

## Capabilities

### New Capabilities

- `domain-language-discipline`: project domain glossary (`CONTEXT.md`) maintenance and session challenge rules; English body + Chinese triggers.
- `test-first-discipline`: failing-test-first Iron Law for behavior-changing work; English body + Chinese triggers.

### Modified Capabilities

- `ensure-tests`: document coexistence with test-first—ensure-tests remains post-implementation coverage/scaffold; behavior changes MUST NOT claim TDD compliance via ensure-tests alone.

## Impact

- New: `skills/domain-language-discipline/`, `skills/test-first-discipline/`
- Edit: `ensure-tests`, four PDCA hosts (thin deps/pointers), optional `learn-and-improve` / `AGENTS.md` table rows, skills index
- Does **not** reintroduce Superpowers/Matt as dependencies; does **not** replace OpenSpec with CONTEXT.md
