## Why

Post-merge of the v2.0.0 BREAKING release, the deprecated `perf-workflow` / `frontend-perf` copies survived in global skill dirs — `npx skills add` only copies (never removes) and `npx skills update` only re-reads project skills; the upstream CLI has no sync-delete semantics (same family as vercel-labs/skills#1352). Stale copies keep their old trigger words, so after any BREAKING skill deletion users' triggers can route to deprecated versions until someone remembers to `rm -rf` manually. User approved the manifest-attribution prune (option A).

## What Changes

- `scripts/install-skills.mjs` gains post-install prune on **full installs only** (`--skill '*'`): before pruning, compute repo skill names (top-level `skills/` dirs with SKILL.md); read the previous claim from `.open-skills-manifest.json` at the primary global root (`~/.agents/skills`); stale = old claim − new set; remove those dirs from every existing global root (`~/.agents/skills`, `~/.claude/skills`, `~/.cursor/skills`); then overwrite the manifest with the new claim
- Foreign-skill safety: only directories a previous full install of this script claimed can ever be pruned — skills from other sources are never in the manifest and thus never in the stale list
- Partial installs (`--skill <name>`) and `--no-prune` skip both pruning and manifest overwrite (a partial claim would mass-misjudge the uninstalled remainder as stale)
- Prune runs only after a successful `skills add` — a failed install never touches global state
- New exported pure functions (`repoSkillNames`, `readManifest`, `writeManifest`, `staleList`, `pruneStale`) for testability; `--help` documents the prune contract
- AGENTS.md release-flow step 3 updated in place (prune sentence replaces the stale root-cause wording)
- **Non-goals**: pruning any directory not manifest-claimed; upstream fix (issue to vercel-labs/skills can be filed separately); touching `skills update` behavior

## Capabilities

### Modified Capabilities

- (no formal spec capability for scripts/ — this change is the traceability record; install-script behavior is documented in AGENTS.md and `--help`)

## Impact

- Modified: `scripts/install-skills.mjs` (+~100 lines), `AGENTS.md` (one sentence)
- Behavior: next full install after a BREAKING removal self-heals global dirs; first-ever run creates the manifest and prunes nothing
- Risk: deleting a user-modified claimed skill dir (accepted — the dir is a copy this script installed; user forks of installed skills should live under different names); malformed manifest is treated as empty claim (no prune, rebuild on next full install)
