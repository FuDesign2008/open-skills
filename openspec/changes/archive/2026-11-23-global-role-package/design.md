# Design

## Context

`agent-role-separation` currently treats the role contract as repository-only and forbids any install surface. `install-skills.mjs` already copies skills globally with `.open-skills-manifest.json` attribution. Repo `.claude/agents/` holds `_contract.md` and role agent files; hosts gate dispatch on project `_contract.md` only.

## Goals / Non-Goals

**Goals:**

- User-global `_contract.md` enables role dispatch when the project has no contract.
- Project `_contract.md` overrides user-global when both exist.
- Copy-based sync from repo `.claude/agents/` to `~/.claude/agents/` with manifest + prune matching install-skills safety.
- Default skill install also refreshes roles; `--no-roles` and standalone `install-roles.mjs` for CI/docs.
- Host SKILL.md presence checks document the two-path rule.

**Non-Goals:**

- `npx skills add` distributing agents
- Symlinks
- Pruning or overwriting agents not claimed by `.open-skills-roles-manifest.json`
- Non–Claude Code agent roots in v1

## Decisions

1. **Install target**: `~/.claude/agents/` only (Claude Code user-global).
2. **Sync**: `fs.copyFile` / recursive copy; source of truth remains repo `.claude/agents/`.
3. **Manifest**: `~/.claude/agents/.open-skills-roles-manifest.json` lists relative paths this repo last installed (files + dirs as needed). Stale = previous claim − current repo tree under `.claude/agents/`. Remove only stale claimed paths; skip if `--no-prune`.
4. **`scripts/install-roles.mjs` API**:
   - Args: `[repoRoot]` (default `process.cwd()`), `--no-prune`, `--help`
   - Steps: enumerate repo `.claude/agents/`; copy missing/changed into `~/.claude/agents/`; update manifest; optional prune stale claimed only
   - Export pure helpers (`repoRolePaths`, `readRolesManifest`, `writeRolesManifest`, `staleRolePaths`, `pruneStaleRoles`) for tests
5. **`scripts/install-skills.mjs`**: parse `--no-roles`; after successful `npx skills add` (full or partial per existing rules), call role install (spawn or shared import) unless `--no-roles`. Skill failures must not run role install.
6. **Host wording** (four PDCA hosts): replace "project provides a role contract (default `.claude/agents/_contract.md`)" with presence at project `.claude/agents/_contract.md` OR user `~/.claude/agents/_contract.md`, project wins; if neither, host-owned checks only.
7. **Docs**: `SKILL_DISTRIBUTION.md` — roles are repo scripts only, not skills CLI; `INSTALL.md` — `node scripts/install-roles.mjs` and `--no-roles` on skill install.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| User edits a claimed global agent file | Next install overwrites copy from repo (same as skills); manifest limits prune to claimed paths only |
| Partial role tree in repo | Full sync from repo enumeration; partial install flags only if we add later (default: full tree) |
| Tests touch real home | All install tests use `tmpdir` + env override for agents root |

## Testing

- Unit tests for manifest read/write, stale list, prune skips foreign files, `--no-prune` behavior
- Integration test: temp repo `.claude/agents/` + temp target dir; no dependency on real `~/.claude/agents/`