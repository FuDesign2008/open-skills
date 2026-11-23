# Proposal

## Why

When a new macOS app should behave like an existing one, Privacy & Security grants often need to match—but Apple provides no supported API to inventory TCC state, and toggle-on UIs still leave features blocked. No skill in this repo covers a safe, evidence-based align path from a reference app to a target app on current macOS. Field testing on macOS 27.x (2026-11-23) showed Unified Logging `new entry:` lines and System Settings grants as the workable combination; direct `TCC.db` reads and `tccutil list` do not.

## What Changes

- Add user-invocable `macos-permission-align` (`skills/macos-permission-align/SKILL.md`): English body, Chinese triggers in the description, platform-agnostic intents for clarification and reporting; grant and verify steps are macOS-only.
- The skill clarifies reference and target apps, builds a reference baseline from fresh Unified Logging, registers the target and nested helper bundles, grants via System Settings where the OS allows, verifies with triple evidence, marks non-pregrantable services as pending, and documents rollback.
- It does not use `TCC.db` or `tccutil list` for inventory, disable SIP, write TCC databases, or claim a service is granted without fresh evidence. Astrill/VPN control stays with `astrill-control`.
- Add `skills/macos-permission-align/reference.md` and `skills/macos-permission-align/evals/evals.json`.
- Regenerate `docs/generated/skills-index.md` and add the skill to the category table in `AGENTS.md`.

## Capabilities

### New Capabilities

- `macos-permission-align`: Align macOS Privacy & Security grants from a reference app to a target app using a Unified Logging baseline, per-bundle helper identity, System Settings grants, triple verification, honest pending, safety boundaries, rollback, and repo skill package rules.

### Modified Capabilities

(none — existing requirement text is unchanged)

## Impact

- New files: `skills/macos-permission-align/SKILL.md`, `skills/macos-permission-align/reference.md`, `skills/macos-permission-align/evals/evals.json`.
- Generated: `docs/generated/skills-index.md`.
- Doc row: `AGENTS.md` skill table.
- New spec: `openspec/specs/macos-permission-align/spec.md` (after archive).
- No requirement edits under `astrill-control/` or other existing capabilities.
- Examples use de-identified bundle ids and paths only.