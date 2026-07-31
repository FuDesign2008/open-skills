## Why

`merge-discipline` Part R always runs full dual-axis `pr-code-review` before tip-pin merge, including docs / skill Markdown / OpenSpec / metadata-only PRs. That raises merge cost without a documented non-application-code path, while this repo’s product *is* Markdown skills—so a blind skip is unsafe. We need a unified rule: classify the PR surface, prefer a **light** Part R for non-application-code diffs, and honor a project preference analogous to `coverage-gate`.

## What Changes

- Add project preference `pr-review-gate:` (`always` | `never` | `ask` | `non-code-light`) resolved from `AGENTS.md` / `CLAUDE.md` (same scan order as coverage-gate).
- Define a deterministic **non-application-code surface** classifier on the PR three-dot diff.
- When preference and surface warrant it, Part R runs `pr-code-review` in **light** depth (still dual-axis pass/fail; no multi-perspective swarm required).
- Default for this skills repo: declare `pr-review-gate: non-code-light` in `AGENTS.md`.
- Unset preference continues today’s behavior (`always` full Part R) so other projects do not silently lighten.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `merge-discipline`: Part R resolves `pr-review-gate` preference; classifies PR surface; selects full vs light vs never/ask skip paths with 留痕.
- `pr-code-review`: expose a `depth=full|light` contract for Part R; light = Standards∥Spec on the tip without mandatory parallel multi-perspective dispatch; eligibility remains for closed/draft/trivial/automated.

## Impact

- Skills: `merge-discipline`, `pr-code-review`; optionally `AGENTS.md` preference line; OpenSpec specs for both capabilities.
- Hosts (`opsx-solve-workflow`, `jira-fix-workflow`, etc.): no prose copy—thin load of merge-discipline unchanged.
- No application runtime code.
