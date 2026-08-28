## Why

A battle-tested macOS Astrill VPN control method (menu-bar GUI Toggle anchor + dual-probe verification, idempotent on/off) currently lives as a project-local skill in another workspace (oh-my-music). The capability is generic — any workflow that must switch VPN state around network-sensitive steps (one platform reachable only via proxy, another failing behind it) benefits from it — so it belongs in this public library. Porting requires rewriting per house rules: English body with Chinese triggers, de-identification (the source carries a project-specific cross-platform network-policy matrix and sibling-skill references), and a single-line quoted description.

## What Changes

- Add `skills/astrill-control/SKILL.md` — English body: bundled-script usage, state-machine & probes table, idempotency, one-time Accessibility prerequisite (host-app generic wording), known boundaries (OpenVPN vs OpenWeb, teardown latency, Toggle-not-quit, menu-drift re-probe, the `${var}` bash pitfall).
- Add `skills/astrill-control/scripts/astrill.sh` — ported with logic lines identical to the field-tested source; comments and output strings translated to English; `$APP` normalized to `${APP}` per the pitfall rule.
- Add `skills/astrill-control/evals/evals.json` — three scenario prompts (direct-connection preflight, connect request, OpenWeb probe mismatch) with assertions.
- Add an AGENTS.md skill-table row (category 工具, no dependencies).
- Regenerate `docs/generated/skills-index.md`.

## Capabilities

### New Capabilities

- `astrill-control`: idempotent macOS Astrill VPN control contract — status/on/off via the bundled script; state judged by dual probes (tunnel process + exit IP) plus GUI menu text; Accessibility prerequisite surfaced; OpenWeb boundary behavior documented.

### Modified Capabilities

- (none)

## Impact

- Skills: `skills/astrill-control/` (new)
- Docs: `docs/generated/skills-index.md` (regenerated), `AGENTS.md` (skill-table row)
- No runtime code; no existing skill modified
- Out of scope: the oh-my-music project-local variant (stays there unchanged; its cross-platform network-policy matrix is project knowledge and is not ported); the full skill-creator statistical trigger-optimization loop (deferred to a later iteration if under-triggering is observed — same deferral as the teach-me change)
