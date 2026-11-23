# Design

## Context

See proposal.md — Why. Behavior is fixed in `specs/macos-permission-align/spec.md` after archive. Field-tested on macOS 27.x (2026-11-23); pane titles and pre-grant rules may differ on other releases.

Constraints: English skill body, Chinese triggers, one-line double-quoted description, de-identified examples, no `TCC.db` inventory, no Astrill overlap.

## Goals / Non-Goals

**Goals:**

- Fixed stage order: clarify → Unified Logging baseline → register target + helpers → System Settings grants → triple evidence → rollback documentation.
- Separate bundle identity for nested helper `.app` bundles.
- Honest **pending** for OS-limited services; **verified** only when fresh evidence agrees.
- Safety: System Settings only, user consent for grants and screen-affecting reads, documented `tccutil reset` rollback.

**Non-Goals:**

- Windows, Linux, MDM/PPPC profile authoring as the primary path, SIP-off or `TCC.db` writes.
- Astrill/VPN control (`astrill-control` owns that boundary).
- A standalone permission scanner script; judgment and user consent stay in the skill.

## Decisions

### Skill text plus reference and evals

Procedure lives in `skills/macos-permission-align/SKILL.md`. Pane URLs, log filters, verification recipes, and rollback examples live in `reference.md`. `evals/evals.json` holds prompt cases for trigger and boundary checks.

Alternative: shell tool that reads `TCC.db`. Rejected — unsupported and non-portable on current macOS.

### Baseline from Unified Logging `new entry:`

Open privacy panes so `SecurityPrivacyExtension` logs state; query `new entry:` filtered by bundle id. No `tccutil list`.

Alternative: static checkbox screenshots. Rejected — stale and not authoritative.

### Triple evidence gate

Layer A (fresh log), B (app API when present), C (minimal probe). Pending never counts as pass.

### Grant path is System Settings only

Toggles and **+** with exact `.app` paths for helpers. User agrees to the grant plan first.

### Rollback before destructive steps

Document per-bundle `tccutil reset All`; uninstall only after user confirms data loss.

### Description is the trigger surface

`user-invocable: true`. Chinese triggers plus English equivalents; Do NOT use boundaries for non-macOS, Astrill/VPN, and unsupported TCC shortcuts.

## Risks / Trade-offs

- [Agent claims granted from toggle UI alone] → Spec requires triple evidence; log `none` blocks pass.
- [Helper missing because only main app was added] → Separate bundle requirement and **+** path rule.
- [User surprised by foregrounded Settings] → Ask-before screen-restore rule.
- [Strict parity impossible for Automation/Media] → Pending with reason, not false pass.
- [Internal ids in examples] → `npm run lint:deid` on new skill files.
- [Confusion with astrill-control] → Out-of-scope requirement and description boundary.

## Migration Plan

Add skill, reference, evals, index row, and OpenSpec spec. Rollback is reverting that commit. No runtime migration.

## Open Questions

None for this change; OS panel quirks stay in skill Known limits and reference pitfalls.