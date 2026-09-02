## Why

This repository currently advertises two install tracks: generic `npx` skills and a “full-capability” track (Claude/Cursor plugins, OpenCode clone+symlinks, repo-root slash `commands/`). Users who only need SKILL.md still have to parse a dual install story, and contributors maintain plugin metadata whose only remaining job is CI versioning. Product direction is now **generic skills only**.

## What Changes

- **BREAKING:** Stop shipping Claude Marketplace plugin metadata, Cursor plugin metadata, OpenCode full-capability install (`.opencode/`), and repo-root `commands/*.md`. External install is `npx skills` / `scripts/install-skills.mjs` only.
- **BREAKING:** GitHub Release version source moves from `.claude-plugin/plugin.json` to root `package.json`. `release.yml` bumps that field; trigger paths no longer include `commands/` / `.opencode/` / `.cursor-plugin/`.
- Docs (`README*`, `docs/INSTALL.md`, `docs/README.md`, `AGENTS.md`) describe a single generic install path. Contributor OpenSpec skills (`.claude/skills/openspec-*`) and `.claude/commands/opsx/` stay.
- Live OpenSpec requirements that **SHALL/MUST** provide slash-command files are removed. Skill invocation remains trigger-word / skill-name based.
- Delete user-facing full-capability docs that exist only for the dropped track (`docs/CURSOR_MARKETPLACE_PUBLISH.md`, OpenCode install/impl docs that travel with `.opencode/`).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `write-workflow`: remove the requirement that the repository provide `commands/write.md`.
- `brainstorm-workflow`: remove the requirement that the repository provide `commands/brainstorm.md`; keep catalog registration (`AGENTS.md` table + skills-index).
- `goal-run`: remove the “when `commands/goal-run.md` is added” command-file requirement.
- `skill-naming`: leftover-id search after a rename no longer requires a `commands/` tree.
- `merge-discipline`: Part R surface tables drop plugin / OpenCode plugin paths that will no longer exist.

## Impact

- Deleted trees: `.claude-plugin/`, `.cursor-plugin/`, `.opencode/`, `commands/`.
- CI: `.github/workflows/release.yml`.
- Docs: README pair, `docs/INSTALL.md`, `docs/README.md`, `AGENTS.md`; delete Cursor marketplace publish guide.
- Skills: `merge-discipline` surface table; `solve-workflow/reference.md` missing-skill install notice.
- Users who installed via `/plugin install`, `/plugin-add`, or OpenCode raw clone must switch to `npx skills` / `install-skills.mjs`. Old git tags still contain plugin files; this change does not unpublish third-party marketplaces.
