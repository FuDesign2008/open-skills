## Why

A battle-tested macOS SMS verification-code reading method (Messages `chat.db` direct SQLite read, freshness-gated, with a three-class sync-failure diagnostic tree) currently lives as a project-local skill in another workspace (oh-my-music). The capability is generic — any automation flow that hits a phone-verification step (login, e-sign, identity confirmation) benefits from replacing the human who reads the code aloud — so it belongs in this public library. Porting requires rewriting per house rules: English body with Chinese triggers, de-identification (the source carries a project-specific e-sign platform name, a project codename, and release-flow case narrative), and a single-line quoted description.

## What Changes

- Add `skills/sms-code-reader/SKILL.md` — English body, single-file shape: mechanism intro, prerequisites (Full Disk Access + Text Message Forwarding + same-network), pre-flight checks (permission probe + sync health), core read queries with the mandatory 0-240 s freshness gate, trigger→wait→poll rhythm with human fallback, known-failure-modes table, and all three ⭐ deep-dives (Mac-side sync stall diagnosis + Messages restart recovery / iPhone low-battery power-mode suspension / iPhone-Mac same-network infrastructure dependency), plus the privacy boundary.
- Add `skills/sms-code-reader/evals/evals.json` — four scenario prompts (fresh-code read, stale-code + infrastructure-first triage, Mac-side stall recovery, iCloud rollback immediate-use) with assertions, structured after the astrill-control port precedent.
- Regenerate `docs/generated/skills-index.md` (sms-code-reader row present).

## Capabilities

### New Capabilities

- `sms-code-reader`: freshness-gated macOS SMS verification-code reading contract — read codes from the Messages `chat.db` via the documented queries; accept only in-window codes; pace reads around the iPhone→Mac sync delay; triage sync failures infrastructure-first (same network, battery) before software probes; diagnose Mac-side stalls via `chat.db-wal` mtime freeze and recover via Messages restart; counter iCloud rollbacks by immediate use and re-trigger; fall back to a human reading the code when all reads fail.

### Modified Capabilities

- (none)

## Impact

- Skills: `skills/sms-code-reader/` (new)
- Docs: `docs/generated/skills-index.md` (regenerated)
- No runtime code; no existing skill modified
- Out of scope: the oh-my-music project-local variant (stays there unchanged; its release-flow case narrative and project identifiers are not ported); the AGENTS.md skill-table row (outside this run's frozen touch list — the table defers to the generated index for names/versions/triggers, so no stale contract is left); the interactive skill-creator eval loop and statistical description optimization (deferred per the unattended-run precedent, same as the astrill-control port)
