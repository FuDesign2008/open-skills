# Design

## Context

See proposal.md for why. `explain-simply` is a chat-only dual-track skill. `session-cleanup` shows a classified list, then deletes disposable temp files without a second confirmation. Renames in this repo are hard cuts. Skill bodies stay English. A description is one double-quoted line used for routing. The HTML shell is an asset of the skill, not a runtime service.

## Goals / Non-Goals

**Goals:**

- One skill id, `explain-clearly`, with a fixed HTML shell and a contract test that locks the shell reference.
- File deletion in `session-cleanup` waits for an explicit confirmation of the classified delete list.

**Non-Goals:**

- No compatibility alias for `explain-simply`.
- No change to closing session pages or stopping session services.
- No edit to a consumer workspace's gitignore.
- No multi-round trigger benchmark. The contract test locks phrases and the shell.

## Decisions

- Hard rename, new capability plus removal of the old one. An alias would violate `openspec/specs/skill-naming/spec.md`. Alternative: keep the old id and only change behavior. Rejected because the name would still say "simply".
- HTML layout lives in `skills/explain-clearly/assets/explanation-shell.html`. The agent copies it and fills text. Alternative: invent a page on every run. Rejected because the layout would drift.
- Each explanation is a new file named from the topic plus a local timestamp, so a repeat does not overwrite. Alternative: one stable filename. Rejected because the previous page would disappear.
- Opening the file is described as an intent ("open this local HTML file"). The chat always includes the path. Alternative: name a platform opener. Rejected because the skill runs on more than one agent.
- The shell has no script, and filled text is inserted as text. Alternative: allow inline script for interactivity. Rejected because a local explanation page does not need it.
- `session-cleanup` confirms only the delete list. Page close and service stop stay immediate after the inventory is shown, matching the chosen scope. The report requirement is unchanged: a declined file stays, so a clean closeout is still withheld while a disposable file remains.
- Contract tests read skill files as text, following `scripts/session-cleanup-contract.test.mjs`. They do not launch a browser.

## Risks / Trade-offs

- [Shell and body drift] → The contract test asserts the skill names the shell and the shell contains no script.
- [Description exceeds 1024 characters] → The description stays a routing line; method stays in the body. Lint checks the length.
- [Installed copies keep the old id until reinstall] → Rollback is reverting this change. Reinstall picks up the new id. No alias in the repo.
- [The opened HTML page is closed at session cleanup] → Accepted. The file remains unless the user confirms deletion. A page stays only when the user asks to keep it.
- [`.explain-clearly/` shows up as untracked] → The skill does not change gitignore. Cleanup classifies the files and does not delete a deliverable.

## Migration Plan

1. Add failing contract tests.
2. Move the skill directory, write the body, the shell, and the delete confirmation.
3. Update active references and regenerate the skills index.
4. Validate, then archive so `openspec/specs/` matches.
5. Rollback is `git revert` of the merge. Archive history is not rewritten.

## Open Questions

None.
