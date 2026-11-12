# Proposal

## Why

Agents often show `.md` / `.html` to humans via in-editor preview or an integrated Simple Browser. Humans expect the **system default browser** (so Markdown Reader and normal HTML rendering work). Queue hosts already say "system default browser" for `verification.html`, but there is no shared, user-invocable discipline other agents can load or trigger.

## What Changes

- Add `system-browser-open-discipline`: when opening `.md` / `.html` for a **human to view**, open via the OS default handler so the file lands in the system default browser; Agent self-read and edit stay on Read / editor.
- `user-invocable: true` so phrases like 「用浏览器打开」 work without a host; AGENTS.md gains a short iron-law pointer.
- Thin-mount: `goal-driven-queue` and `goal-driven-workflow` declare the dependency and point open-for-human steps at this skill (no restated methodology).
- Contract test + skills-index regen; optional Markdown Reader note stays appendix-only (not install automation).

## Capabilities

### New Capabilities

- `system-browser-open-discipline`: Cross-agent discipline for human-facing open of `.md` / `.html` through the system default browser, with clear boundaries against Read/edit and against IDE-integrated browsers.

### Modified Capabilities

- `goal-queue`: interactive / explicit view open MUST load and follow `system-browser-open-discipline` (thin reference; auto-open gate unchanged).
- `goal-run`: when a standalone run presents generated review/evidence HTML for human viewing, MUST load and follow the same discipline.

## Impact

- New: `skills/system-browser-open-discipline/SKILL.md`, optional short `reference.md`, `evals/evals.json`, `scripts/system-browser-open-discipline-contract.test.mjs`.
- Hosts: `skills/goal-driven-queue/SKILL.md`, `skills/goal-driven-workflow/SKILL.md` (dependencies + thin pointers).
- Docs: `AGENTS.md` (iron-law pointer, skill table, user-invocable exception list), `docs/generated/skills-index.md`.
- OpenSpec: this change → archive into `openspec/specs/system-browser-open-discipline/` plus delta into `goal-queue` / `goal-run`.
