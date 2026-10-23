# Proposal

## Why

`explain-simply` delivers a dual-track answer in chat and treats "explain simply" as the goal. The skill should explain clearly, under the name `explain-clearly`, and hand the user a chosen form — HTML by default — instead of only a chat message. Session cleanup still deletes disposable files after showing the list; file deletion needs an explicit confirmation.

## What Changes

- **BREAKING** hard rename `explain-simply` → `explain-clearly` (no alias): skill directory, frontmatter `name`, active references, and the OpenSpec capability.
- Ask once for a delivery form when the user has not named one: current session, HTML, Markdown, or plain text. Recommend HTML.
- Write HTML, Markdown, and plain text under the workspace directory `.explain-clearly/`, one new file per explanation. HTML fills a bundled shell, then the agent opens that local file in the browser and points the user at the path.
- Keep the rational track primary. Keep the analogy as an auxiliary section that must not invert the mechanism's constraints. Draw a figure only when the concept has a comparison, structure, or flow.
- `session-cleanup`: classify files proposed for deletion and wait for the user to confirm before deleting any of them. Closing pages and stopping services stay as they are.

## Capabilities

### New Capabilities

- `explain-clearly`: Clear concept explanation with a chosen delivery form, authentic evidence, an auxiliary analogy, and shape-based visuals. HTML uses a script-free shell in the skill.

### Modified Capabilities

- `explain-simply`: All requirements are removed. The capability is retired by the hard rename; behavior moves to `explain-clearly` and is not ported unchanged.
- `session-cleanup`: The delete requirement gains a confirmation gate before any file is deleted. Page close and service stop requirements do not change.

## Impact

- `skills/explain-simply/` becomes `skills/explain-clearly/` (`SKILL.md`, `reference.md`, `assets/explanation-shell.html`).
- `skills/session-cleanup/SKILL.md` delete section, plus `scripts/session-cleanup-contract.test.mjs` and a new `scripts/explain-clearly-contract.test.mjs`.
- Active mentions in `AGENTS.md`, `docs/README.md`, `docs/concept-explanation-dual-track.md`, and the generated skills index.
- Archive history under `openspec/changes/archive/` stays. The root package version is not edited by hand.
