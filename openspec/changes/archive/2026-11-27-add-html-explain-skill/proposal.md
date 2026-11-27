# Proposal

## Why

Users often ask for a quick, visual HTML explanation of an MR/PR/diff or local change ("用 HTML 解释这个 MR", "看不懂这个改动"). Today that intent either lands on a long chat dump or on `explain-clearly`, which is built for concept/mechanism shape — not for "what this change did". There is no lightweight, user-invocable entry that gathers change evidence, writes a fixed five-section HTML page, opens it in the system browser, and returns only the path in chat.

## What Changes

- Add `html-explain`: a lightweight user-invocable skill whose **default** path is evidence → five-section HTML → open via `system-browser-open-discipline` → chat path only.
- **Escalation only** when the subject is mainly a concept/mechanism/protocol shape (not "what this change did"): optionally load `explain-clearly` with form fixed to HTML; `html-explain` still owns the system-browser open and chat closeout.
- Strong dependency: `system-browser-open-discipline` only (abort if missing). Do **not** list `explain-clearly` in frontmatter `dependencies`.
- OpenSpec change artifacts + contract test + AGENTS.md table row + skills-index regen.

## Capabilities

### New Capabilities

- `html-explain`: Lightweight HTML explain entry for MR/PR/diff/local change; optional escalation to `explain-clearly` (HTML form) for concept/mechanism subjects; human-view open via `system-browser-open-discipline`.

### Modified Capabilities

- None (AGENTS.md index row and generated skills index are documentation surface, not OpenSpec capability deltas).

## Impact

- New: `skills/html-explain/` (`SKILL.md`, `reference.md`, `assets/page-shell.html`, `evals/evals.json`).
- New: `scripts/html-explain-contract.test.mjs`.
- Docs: `AGENTS.md` skill-table row after `explain-clearly`; `docs/generated/skills-index.md` via `gen-skill-docs.mjs`.
- OpenSpec: this change → later archive into `openspec/specs/html-explain/`.
