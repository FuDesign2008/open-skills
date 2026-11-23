# Proposal

## Why

The role contract and agent files live under `.claude/agents/` in the repo, but activation today only checks the project copy. Contributors who clone open-skills want the same role catalog globally in Claude Code without folding roles into the `npx skills add` surface. Skill install already uses manifest-attributed copy+prune; roles need the same safety model for `~/.claude/agents/`.

## What Changes

- **Activation**: Role dispatch is enabled when `.claude/agents/_contract.md` exists in the project **or** `~/.claude/agents/_contract.md` exists; project wins when both are present; neither → legacy host behavior (no role dispatch).
- **Install**: New `scripts/install-roles.mjs` copies from `<repoRoot>/.claude/agents/` → `~/.claude/agents/` (never symlink). Manifest `~/.claude/agents/.open-skills-roles-manifest.json` attributes claims; prune only removes stale claimed files; foreign agents untouched.
- **Skill install hook**: `scripts/install-skills.mjs` runs role install after a successful skill install by default; `--no-roles` skips. Role install is **not** part of `npx skills add`.
- **Hosts**: Four PDCA hosts update presence-check wording to the project OR user-global rule with precedence.
- **Docs**: `docs/SKILL_DISTRIBUTION.md` and `docs/INSTALL.md` document roles vs skills install surfaces.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `agent-role-separation`: opt-in presence spans project and user-global contract; repo scripts MAY install role package to Claude Code user agents dir; MUST NOT use `npx skills add`; optional install/prune requirement for manifest-safe sync.
- `install-skills`: default post-install invokes role install; `--no-roles` opt-out (implementation spec may follow in tasks; behavior recorded in design).

## Impact

- `openspec/specs/agent-role-separation/spec.md` (after archive)
- `scripts/install-roles.mjs` (new), `scripts/install-skills.mjs`, shared helpers if extracted
- `.claude/agents/` (source of truth; unchanged install exclusion from skills CLI)
- Four PDCA host `SKILL.md` files (presence text)
- `docs/SKILL_DISTRIBUTION.md`, `docs/INSTALL.md`, `AGENTS.md` (release step optional mention)
- Tests with temp dirs (no writes to real `~/.claude/agents/` in unit tests)

## Non-Goals

- Installing roles via `npx skills add` or Cursor/OpenCode global agent dirs (Claude Code `~/.claude/agents/` only for this change)
- Symlink-based sync
- Deleting or overwriting foreign agent definitions not claimed by this repo's manifest