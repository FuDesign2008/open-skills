## Context

The repo ships agent skills via `skills/*/SKILL.md` and `npx skills`. A second track (Claude/Cursor plugin JSON, OpenCode JS plugin + INSTALL clone flow, repo-root `commands/`) still exists for slash commands and marketplace install. Version CI reads `.claude-plugin/plugin.json`. Contributor OpenSpec lives under `.claude/` and is not a user install surface.

## Goals / Non-Goals

**Goals:**

- One public install story: generic SKILL.md via `npx` / `install-skills.mjs`.
- Delete user-facing full-capability trees and rewrite docs/CI so they cannot bit-rot back to a dual track.
- Keep `.claude/skills/openspec-*` and `.claude/commands/opsx/` for this repo’s own OpenSpec work.
- Preserve GitHub Release automation with a version SoT that does not depend on plugin JSON.

**Non-Goals:**

- Unpublishing historical Marketplace listings or old git tags that still contain plugin files.
- Moving or deleting oh-my-fangirl / hooks (already out of this repo).
- Renaming host skill ids (`solve-workflow`, etc.).
- Changing skill trigger words or PDCA behavior except install-notice copy.

## Decisions

1. **Hard delete, not deprecate-in-place.** Dual docs are the problem. Alternatives considered: keep plugin JSON as version-only stubs (rejected: still looks like a plugin project); docs-only deprecation (rejected: second PR and leftover install commands).

2. **Version SoT = root `package.json` `version`.** Seed with current plugin semver `2.18.0`. `private: true` stays. Alternative: a `VERSION` file (rejected: extra convention; CI already knows JSON).

3. **`release.yml` trigger = `skills/**` only** (plus `workflow_dispatch`). Plugin/command/OpenCode paths go away. Docs-only PRs still do not bump, matching today.

4. **Deid scanner may keep a `commands/` prefix.** Harmless if the directory is gone; still covers accidental re-adds. No need to change the linter contract.

5. **OpenSpec deltas, not archive rewrites.** Live specs that SHALL command files are updated; `openspec/changes/archive/` stays historical.

## Risks / Trade-offs

- [Marketplace still serves last plugin release] → README BREAKING note; humans may unpublish listings later (out of repo).
- [Release workflow reads missing plugin.json] → This PR must land `package.json` version + rewritten `release.yml` together so the first post-merge bump uses the new SoT.
- [Missed in-repo “全能力” / plugin install strings] → verification grep on live trees (`skills/`, `docs/` except fix-log, `AGENTS.md`, `README*`, `openspec/specs/`).
- [`.opencode/node_modules` local leftover] → only tracked files are `git rm`; local ignore stays.

## Migration Plan

1. Feature branch; OpenSpec change artifacts.
2. `git rm` the four user-facing trees; rewrite docs/CI/specs/skills notices in the same commit set.
3. After merge, first `skills/**` push on main bumps `package.json` and tags as today.
4. Rollback: revert the merge; plugin files return. Users who already switched to npx are unaffected.

## Open Questions

None for implementation. Unpublishing Claude/Cursor marketplace listings is a human follow-up, not a merge blocker.
