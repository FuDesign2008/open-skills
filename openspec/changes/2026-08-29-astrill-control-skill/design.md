## Context

The source skill was field-tested in a private workspace on 2026-08-28 (OpenVPN full-tunnel mode, on↔off round-trip). Its control core (GUI Toggle anchor via AppleScript System Events, dual probes, idempotency) is generic; its network-policy matrix (which platform needs VPN on vs off) is project-specific. The port must satisfy 铁律 2 (de-identification), 3 (English body + Chinese triggers), 7 (single-line quoted description ≤1024), and the `skill-naming` spec. The run executes unattended (user asleep, explicit authorization); interactive eval-viewer review and the statistical description-optimization loop are therefore deferred, following the teach-me change precedent.

## Goals / Non-Goals

**Goals:**

- A public, generic `astrill-control` skill whose operational knowledge (probe table, idempotency, boundaries, pitfall) survives the port intact.
- Full repo compliance: all three gates green (`lint:skill-description`, `lint:deid --staged`, index regen no-drift), `bash -n` clean.
- OpenSpec sediment with delta spec; AGENTS.md skill-table row.

**Non-Goals:**

- Porting or generalizing the project network-policy matrix (user decision: complete strip).
- Touching the oh-my-music workspace (its local variant stays as-is).
- A `commands/` entry (the skill is model-invocable via description; no shortcut command needed).

## Decisions

1. **Name `astrill-control`** — verb phrase without a role suffix, parallel to `git-commit` / `jira-read` in the `skill-naming` taxonomy (single-point action).
2. **Complete matrix strip (user-confirmed)** — the skill keeps only the control core. The generic context ("switch VPN state around network-sensitive steps") lives as one sentence in the description so the skill still triggers in orchestration scenarios, but no platform names or policy tables are ported.
3. **Script translation is display-only** — every logic line identical to the source; only comments, echo strings, and the usage line are translated. `$APP` → `${APP}` in one echo line is the sole normalization, matching the script's own documented pitfall rule (CJK-adjacent variable safety). Verified by diff + `bash -n` + reviewer subagent.
4. **Accessibility prerequisite generalized** — the source named a specific host app; the public version says "the app hosting the agent (terminal, IDE, or desktop app)" per the platform-neutrality rule (铁律 6).
5. **English body, Chinese triggers** (铁律 3); single-line double-quoted description with trigger block and Do-NOT-use boundary (铁律 7).
6. **Eval scope** — three scenario prompts + assertions in `evals/evals.json` encode the deep knowledge (preflight ordering, probe-based evidence, OpenWeb boundary). The statistical loop (trigger-rate optimization via `run_loop.py`) is deferred with a note in tasks.md; independent review is provided by a reviewer subagent (writer/reviewer separation) instead of the interactive viewer.
