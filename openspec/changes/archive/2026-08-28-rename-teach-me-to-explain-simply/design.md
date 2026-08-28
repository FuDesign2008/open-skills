# Design: rename teach-me to explain-simply

## Context

The `teach-me` skill (dual-track concept explanation) has an id named in the user's voice, collides with the third-party `teach` skill, and carries no function semantics. The rename target `explain-simply` was selected through a naming consultation that also surfaced the skill's design philosophy — 深入浅出 (deep-in, simple-out) — whose sources must land in the skill body with honest attribution. Renames in this repo are hard cuts governed by `openspec/specs/skill-naming/spec.md`: directory, frontmatter `name`, OpenSpec capability folder, and in-repo textual references all move in the same change; archive history is exempt. Verified quote sources this session: Wikiquote marks the circulating aphorism "If you can't explain it simply, you don't understand it well enough" as attributed to Einstein/Feynman without verified provenance; the documented Feynman version is the freshman-lecture anecdote in Goodstein & Goodstein, *Feynman's Lost Lecture* (1996, p. 52).

## Goals / Non-Goals

**Goals:**

- Hard rename `teach-me` → `explain-simply` across all active surfaces (skill dir, frontmatter, body, reference.md id refs, capability spec dir, AGENTS.md, docs) with zero old-id residue outside `openspec/changes/archive/`
- Add a **Design root** section to SKILL.md recording the philosophy sources with honest attribution (aphorism: unverified attribution labeled as such; Feynman/Goodstein anecdote: cited with book + page)
- Re-lead the frontmatter description to frame "simply" as Feynman-style (deep understanding in, accessible explanation out) while preserving ≤1024 chars and all Chinese triggers
- Port the capability's 5 requirements unchanged in behavior under the new id (delta specs already created and validated)

**Non-Goals:**

- Rewriting the worked examples in `reference.md` (name-agnostic; only id references update)
- Changing any dual-track answer behavior, output format, or routing triggers
- Touching archive history under `openspec/changes/archive/`

## Decisions

1. **Single change carries rename + philosophy + description re-lead** (over splitting into two changes) — the rename's rationale and the philosophy that justifies the name belong to one traceable artifact chain; splitting would touch the same file set twice and break the why-what link.
2. **Philosophy lands in SKILL.md body, not the description** — description is the routing contract (≤1024 chars, triggers only, per AGENTS.md 铁律 7); provenance documentation is body content. Name promises the product ("simply"); body guarantees the process (dual-track rigor).
3. **Dual-source attribution wording** — the aphorism is quoted with "attributed to Einstein/Feynman, no verified source" and paired with the documented Goodstein anecdote; never a bare "—Feynman" attribution (AI 铁律 1/8: no unverifiable assertions).
4. **Capability modeled as ADDED (`explain-simply`) + REMOVED (`teach-me`)** rather than MODIFIED — a rename retires one capability id and creates another under the repo's hard-cut rule; requirement behavior is ported verbatim (one normative-language fix on requirement 5, flagged by `openspec validate`).
5. **Old spec directory removal happens inside this change** — after archive-sync merges deltas, any residual empty `openspec/specs/teach-me/` is deleted so the zero-residue grep passes (archive exempt).

## Risks / Trade-offs

- [Missed textual reference leaves stale id] → zero-residue grep in verification: `grep -rn "teach-me"` over `skills/`, `commands/`, `AGENTS.md`, `openspec/specs/` must return nothing (archive excluded)
- [Description exceeds 1024 chars after re-lead] → `npm run lint:skill-description` runs in verification; re-lead keeps additions minimal
- [Archive sync leaves an empty `specs/teach-me/`] → explicit post-archive check + directory removal task; final `git status` diff reviewed in stage 8
- [External consumers reference the old id] → intentional hard cut per skill-naming spec; install script prunes stale copies; revert-release remains a rollback path

## Migration Plan

Branch `refactor/rename-teach-me-to-explain-simply` already created. Execute edits → regenerate skills index → run verification battery → archive change (sync deltas) → remove residual old spec dir → commit + PR. Rollback: `git revert` of the merge (two-way door).

## Open Questions

None — name locked (`explain-simply`), attribution verified, scope confirmed (方案 1).
