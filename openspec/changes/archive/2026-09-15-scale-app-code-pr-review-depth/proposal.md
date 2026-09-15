## Why

Part R currently treats every application-code surface as `pr-code-review` `depth=full` (four parallel perspectives, including blame/history). That matches a quality-first merge gate but is size-blind: a three-line log change pays the same swarm tax as an auth refactor. Measured cost in the invoking user's 15-day token mix put independent multi-agent MR review at 19.7% of Vega, and wall-clock matches the upstream “depth not speed” design (~20 minutes). We need intelligent depth: still review application code, still keep the ≥80 Critical/Important gate, but choose `light` vs `full` from diff scale and risk — not from file extension alone. The main spec also still says unset `pr-review-gate` means `always`; the skill already says unset ≡ `auto`. This change aligns them and closes the always-full short-circuit on application-code.

## What Changes

- **`auto` / unset:** application-code no longer short-circuits to `full`. It continues through the size/risk ladder; `light` when no escalation hits.
- **`non-code-light`:** non-application-code stays `light`; application-code uses the same size/risk ladder instead of always `full`.
- **Force `full`:** existing signals (changed lines > 400 or files > 20; breaking keywords; Part R fail re-entry) plus a tunable sensitive-path / keyword table (auth, crypto, session, permission, payment) so a one-line high-risk change does not drop to `light`.
- **Unchanged:** `always` stays blanket `full`; `never` / `ask` unchanged; pass gate is still depth-invariant; standalone `pr-code-review` with no depth still defaults to `full`; review is never skipped solely because the diff is small.
- Align `openspec/specs/merge-discipline` with the skill: allowed values include `auto`; unset ≡ `auto`.
- Not **BREAKING** for callers that already pass `depth`. Behavior change for repos on `auto` / unset / `non-code-light`.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `merge-discipline`: Part R depth selection — unset/`auto`/`non-code-light` application-code uses size/risk ladder; high-risk forces `full`; spec allowed values include `auto`. Standalone `pr-code-review` default stays `full` (no capability change).

## Impact

- Skills: `skills/merge-discipline/{SKILL.md,reference.md,evals/evals.json}`; thin mentions in `skills/pr-code-review/` only if needed to keep the Part R contract accurate.
- Specs: `openspec/specs/merge-discipline` (and a no-op or one-line pointer in `pr-code-review` only if a requirement actually changes).
- Hosts (`jira-fix-workflow`, `opsx-jira-fix-workflow`, `opsx-solve-workflow`, `solve-workflow`, `feature-branch-closeout`) stay thin pointers to merge-discipline — no methodology copy.
- This repo’s `pr-review-gate: non-code-light` will start downscaling small application-code PRs; `always` remains the explicit “swarm every time” escape.
