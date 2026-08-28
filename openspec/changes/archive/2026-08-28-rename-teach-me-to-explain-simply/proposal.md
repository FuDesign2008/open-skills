# Proposal: rename teach-me to explain-simply

## Why

The `teach-me` skill id is named in the user's voice ("teach me X"), collides with the third-party `teach` skill (hands-on tutorials — the boundary is invisible in the names and needed a dedicated AGENTS.md note), and carries zero function information, leaving routing entirely to the description. The rename to `explain-simply` fixes all three: agent-action voice, semantic separation from `teach`, and a name that encodes the skill's design philosophy — 深入浅出 (deep-in, simple-out): the promise to explain simply presupposes deep understanding. That philosophy's sources deserve an explicit, honestly-attributed home in the skill body.

## What Changes

- **BREAKING** hard rename `teach-me` → `explain-simply` (no alias, per `openspec/specs/skill-naming/spec.md`): skill directory + frontmatter `name` + body title + id references in `reference.md`
- Capability rename: `openspec/specs/teach-me/` → `openspec/specs/explain-simply/` (all 5 requirements ported under the new id)
- SKILL.md gains a **Design root** section recording the philosophy sources with honest attribution:
  - The circulating aphorism "If you can't explain it simply, you don't understand it well enough" — labeled *attributed to Einstein/Feynman, no verified source* (Wikiquote marks the attribution unsubstantiated)
  - The documented Feynman version — Goodstein, *Feynman's Lost Lecture* (1996, p. 52): asked to prepare a freshman lecture on why spin-½ particles obey Fermi–Dirac statistics, Feynman returned days later conceding "I couldn't do it. I couldn't reduce it to the freshman level. That means we really don't understand it."
  - One-line statement: the rational track (deep) is the precondition of the intuitive track (simple)
- Description re-lead framing "simply" as Feynman-style (deep understanding in, accessible explanation out), preserving ≤1024 chars and all Chinese triggers
- Update active in-repo references: `AGENTS.md` (skill table + `teach` boundary note), `docs/concept-explanation-dual-track.md`, `docs/README.md`; regenerate `docs/generated/skills-index.md`
- Archive history under `openspec/changes/archive/` intentionally keeps the old id (rename hard-cut exempts archive)

## Capabilities

### New Capabilities

- `explain-simply`: dual-track technical concept explanation under the renamed skill id — the five teach-me requirements ported unchanged in behavior (dual-track answers, authentic evidence, constraint-preserving analogies, honest visual aids, tutorial-request routing boundary)

### Modified Capabilities

- `teach-me`: all 5 requirements REMOVED — the capability is retired by the rename (hard cut per `openspec/specs/skill-naming/spec.md`; archive history exempt from the zero-residue rule)

## Impact

- Files: `skills/teach-me/` → `skills/explain-simply/` (SKILL.md + reference.md), `openspec/specs/teach-me/` → `openspec/specs/explain-simply/`, `AGENTS.md`, `docs/concept-explanation-dual-track.md`, `docs/README.md`, `docs/generated/skills-index.md` (script-regenerated)
- No code or dependency changes; `teach-me` is a leaf skill (no frontmatter dependents to sync)
- Global installs: consumers update via `npx skills update`; the repo install script's manifest-based prune removes stale `teach-me` copies
- External references to the id `teach-me` break by design (hard cut, no alias)
